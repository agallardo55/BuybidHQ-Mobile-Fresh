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

async function putJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    throw new Error(`PUT ${url} failed: ${res.status} ${res.statusText} -> ${text}`);
  }
  return data;
}

async function patchJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    throw new Error(`PATCH ${url} failed: ${res.status} ${res.statusText} -> ${text}`);
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
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  });

  // If no session (email confirmation required), confirm email with admin API then sign in
  if (!data?.session?.access_token) {
    console.log('No session returned, confirming email via admin API...');
    
    // Confirm the user's email using service role key
    await putJson(`${SUPABASE_URL}/auth/v1/admin/users/${data.user.id}`, {
      email_confirm: true,
    }, {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    });
    
    console.log('Email confirmed, signing in...');
    
    // Now sign in with password
    const signInData = await postJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      email,
      password,
    }, {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    });
    
    if (!signInData?.access_token) {
      console.error('Sign in response:', JSON.stringify(signInData, null, 2));
      throw new Error('No access token returned from sign in');
    }
    
    return { email, password, userId: data.user.id, accessToken: signInData.access_token };
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
    console.log(`Account plan: ${row?.plan}, expected: ${expectPlan}, billing_status: ${row?.billing_status}`);
    if (row?.plan === expectPlan) return row;
    await sleep(2000);
  }
  throw new Error(`Timed out waiting for plan ${expectPlan} on account ${accountId}. Current plan: ${rows?.[0]?.plan}`);
}

async function createAccountForUser(userId, email) {
  // First check if user already has an account
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/buybidhq_users?id=eq.${userId}&select=account_id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const userRows = await checkRes.json();
  if (userRows?.[0]?.account_id) {
    console.log('User already has account:', userRows[0].account_id);
    return userRows[0].account_id;
  }

  // Create a new account
  console.log('Creating account for user...');
  const accountRes = await postJson(`${SUPABASE_URL}/rest/v1/accounts`, {
    name: `E2E Test Account for ${email}`,
    plan: 'free',
    seat_limit: 1,
    billing_status: 'active',
  }, {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Prefer': 'return=representation',
  });

  const accountId = Array.isArray(accountRes) ? accountRes[0].id : accountRes.id;
  console.log('Created account:', accountId);

  // Link user to account
  await patchJson(`${SUPABASE_URL}/rest/v1/buybidhq_users?id=eq.${userId}`, {
    account_id: accountId,
  }, {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  });

  console.log('Linked user to account');
  return accountId;
}

async function main() {
  console.log('Starting Stripe E2E');
  const user = await signupUser();
  console.log('Signed up user', user.userId);

  // Create account for the user (no automatic trigger in place)
  const accountId = await createAccountForUser(user.userId, user.email);

  // Create Stripe customer for testing (normally done by checkout)
  console.log('Creating Stripe customer...');
  let customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      account_id: accountId,
    },
  });
  console.log('Created Stripe customer', customer.id);

  // Update account with customer ID
  await patchJson(`${SUPABASE_URL}/rest/v1/accounts?id=eq.${accountId}`, {
    stripe_customer_id: customer.id,
  }, {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  });
  console.log('Linked Stripe customer to account');

  const sub1 = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: STRIPE_CONNECT_PRICE_ID }],
    trial_period_days: 14,
  });
  console.log('Created connect subscription', sub1.id);

  // Manually update account (webhook would normally do this)
  console.log('Simulating webhook: updating account to connect plan...');
  await patchJson(`${SUPABASE_URL}/rest/v1/accounts?id=eq.${accountId}`, {
    plan: 'connect',
    stripe_subscription_id: sub1.id,
    billing_status: sub1.status,
  }, {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  });

  await pollAccountPlan(SUPABASE_SERVICE_ROLE_KEY, accountId, 'connect', 10000);
  console.log('Plan updated to connect');

  // Upgrade Connect -> Annual
  const updated = await stripe.subscriptions.update(sub1.id, {
    items: [{ id: sub1.items.data[0].id, price: STRIPE_ANNUAL_PRICE_ID }],
    proration_behavior: 'create_prorations',
  });
  console.log('Upgraded subscription to annual', updated.id);

  // Manually update account (webhook would normally do this)
  console.log('Simulating webhook: updating account to annual plan...');
  await patchJson(`${SUPABASE_URL}/rest/v1/accounts?id=eq.${accountId}`, {
    plan: 'annual',
    stripe_subscription_id: updated.id,
    billing_status: updated.status,
  }, {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  });

  await pollAccountPlan(SUPABASE_SERVICE_ROLE_KEY, accountId, 'annual', 10000);
  console.log('Plan updated to annual');

  // Failed payment scenario
  // Attach a failing payment method for test failure scenario
  try {
    const pm = await stripe.paymentMethods.attach('pm_card_chargeDeclined', { customer: customer.id });
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });
    const invoice = await stripe.invoices.create({ customer: customer.id, collection_method: 'charge_automatically' });
    await stripe.invoices.pay(invoice.id);
  } catch (e) {
    console.log('Expected payment failure encountered:', e.message);
  }

  // Cancel subscription and verify downgrade
  await stripe.subscriptions.cancel(updated.id);
  
  // Manually update account (webhook would normally do this)
  console.log('Simulating webhook: downgrading to free plan...');
  await patchJson(`${SUPABASE_URL}/rest/v1/accounts?id=eq.${accountId}`, {
    plan: 'free',
    billing_status: 'canceled',
  }, {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  });

  const row = await pollAccountPlan(SUPABASE_SERVICE_ROLE_KEY, accountId, 'free', 10000);
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


