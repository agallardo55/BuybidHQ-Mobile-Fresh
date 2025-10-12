import Stripe from 'stripe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = requireEnv('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY');
const STRIPE_CONNECT_PRICE_ID = requireEnv('STRIPE_CONNECT_PRICE_ID');
const STRIPE_ANNUAL_PRICE_ID = requireEnv('STRIPE_ANNUAL_PRICE_ID');
const TEST_EMAIL_DOMAIN = process.env.TEST_EMAIL_DOMAIN || 'example.com';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} -> ${text}`);
  }
  return data;
}

// No-op helpers previously declared are removed for clarity.

async function signupUser() {
  const email = `e2e_${Date.now()}@${TEST_EMAIL_DOMAIN}`;
  const password = 'Test1234!';
  const payload = {
    email,
    password,
    fullName: 'E2E Tester',
    mobileNumber: '+15555550100',
    dealershipAddress: '1 Test St',
    city: 'Testville',
    state: 'CA',
    zipCode: '94016',
    planType: 'free',
    smsConsent: false,
  };

  const data = await postJson(`${SUPABASE_URL}/functions/v1/handle-signup-or-restore`, payload, {
    apikey: SUPABASE_ANON_KEY,
  });

  if (!data?.session?.access_token) {
    throw new Error('No access token returned from signup');
  }

  return { email, password, userId: data.user.id, accessToken: data.session.access_token };
}

async function invokeCheckout(accessToken, currentPlan = 'free') {
  const body = { currentPlan, successUrl: 'https://example.com/success', cancelUrl: 'https://example.com/cancel' };
  const data = await postJson(`${SUPABASE_URL}/functions/v1/create-stripe-checkout`, body, {
    Authorization: `Bearer ${accessToken}`,
    apikey: SUPABASE_ANON_KEY,
  });
  if (!data?.url) {
    throw new Error('Checkout did not return url');
  }
  return data;
}

async function ensureCustomerForAccount(userId, accountId) {
  // Since our checkout function already ensures customer, we only need to find it via Stripe using metadata.
  const customers = await stripe.customers.list({ limit: 20, email: undefined });
  return customers.data.find((c) => c.metadata?.account_id === accountId) || null;
}

async function pollAccountPlan(supabaseAdminKey, accountId, expectPlan, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/accounts?id=eq.${accountId}&select=plan,billing_status`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${supabaseAdminKey}`,
        Prefer: 'return=representation',
      },
    });
    const rows = await res.json();
    const row = rows?.[0];
    if (row?.plan === expectPlan) return row;
    await sleep(2000);
  }
  throw new Error(`Timed out waiting for plan ${expectPlan} on account ${accountId}`);
}

async function main() {
  console.log('Starting Stripe E2E');
  const user = await signupUser();
  console.log('Signed up user', user.userId);

  // Step 1: Checkout invocation ensures Stripe customer exists
  await invokeCheckout(user.accessToken, 'free');

  // Fetch account_id for the user
  const resUser = await fetch(`${SUPABASE_URL}/rest/v1/buybidhq_users?id=eq.${user.userId}&select=account_id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const userRows = await resUser.json();
  const accountId = userRows?.[0]?.account_id;
  if (!accountId) throw new Error('No account_id for user');

  // Create subscription: Free -> Connect
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  let customer = customers.data[0];
  if (!customer) {
    // fallback by metadata search (not directly supported by list API), skip
    throw new Error('Stripe customer not found for user');
  }

  const sub1 = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: STRIPE_CONNECT_PRICE_ID }],
    trial_period_days: 14,
  });
  console.log('Created connect subscription', sub1.id);

  await pollAccountPlan(SUPABASE_SERVICE_ROLE_KEY, accountId, 'connect');
  console.log('Plan updated to connect');

  // Upgrade Connect -> Annual
  const updated = await stripe.subscriptions.update(sub1.id, {
    items: [{ id: sub1.items.data[0].id, price: STRIPE_ANNUAL_PRICE_ID }],
    proration_behavior: 'create_prorations',
  });
  console.log('Upgraded subscription to annual', updated.id);

  await pollAccountPlan(SUPABASE_SERVICE_ROLE_KEY, accountId, 'annual');
  console.log('Plan updated to annual');

  // Failed payment scenario
  // Attach a failing payment method for test failure scenario
  await stripe.paymentMethods.attach('pm_card_chargeDeclined', { customer: customer.id });
  await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: 'pm_card_chargeDeclined' } });
  const invoice = await stripe.invoices.create({ customer: customer.id, collection_method: 'charge_automatically' });
  try {
    await stripe.invoices.pay(invoice.id);
  } catch (e) {
    console.log('Expected payment failure encountered');
  }

  // Cancel subscription and verify downgrade
  await stripe.subscriptions.cancel(updated.id);
  const row = await pollAccountPlan(SUPABASE_SERVICE_ROLE_KEY, accountId, 'free');
  if (row.billing_status !== 'canceled') {
    throw new Error(`Expected billing_status canceled, got ${row.billing_status}`);
  }
  console.log('Downgraded to free with canceled status');

  console.log('E2E completed successfully');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


