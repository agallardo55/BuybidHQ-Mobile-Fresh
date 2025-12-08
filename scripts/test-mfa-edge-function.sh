#!/bin/bash

# Test MFA Edge Function Manually
# Usage: ./scripts/test-mfa-edge-function.sh YOUR_SESSION_TOKEN

if [ -z "$1" ]; then
  echo "Usage: ./scripts/test-mfa-edge-function.sh YOUR_SESSION_TOKEN"
  echo ""
  echo "To get your session token, run this in browser console:"
  echo "const { data: { session } } = await supabase.auth.getSession();"
  echo "console.log('Token:', session.access_token);"
  exit 1
fi

TOKEN=$1
SUPABASE_URL="https://fdcfdbjputcitgxosnyk.supabase.co"

echo "Testing send-mfa-code Edge Function..."
echo "======================================"
echo ""

curl -X POST "${SUPABASE_URL}/functions/v1/send-mfa-code" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo ""
echo "Check Supabase Dashboard → Edge Functions → send-mfa-code → Logs for detailed output"
