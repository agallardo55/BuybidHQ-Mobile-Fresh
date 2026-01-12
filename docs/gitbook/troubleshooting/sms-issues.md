# SMS Sending Issues

Troubleshoot SMS delivery problems and ensure buyers receive your bid requests.

---

## Overview

BuybidHQ sends bid requests via SMS to buyers' mobile phones. This guide helps resolve common SMS delivery issues.

**Normal Delivery Timeline:**
- Sent: Within 1-2 seconds of clicking "Send"
- Delivered: Within 5-30 seconds
- Viewed: Depends on buyer (typically within 5 minutes)

---

## Understanding SMS Delivery Status

### Status Meanings

**Sent** 📤
- SMS accepted by our system
- Transmitted to carrier (AT&T, Verizon, T-Mobile, etc.)
- Awaiting carrier delivery confirmation

**Delivered** ✅
- Carrier confirmed delivery to buyer's device
- SMS is in buyer's messages
- Buyer can now view and respond

**Failed** ❌
- SMS could not be delivered
- See reasons and solutions below

**Viewed** 👁️
- Buyer clicked the link in SMS
- Viewing vehicle details now

**Responded** 💬
- Buyer submitted an offer
- Response visible in dashboard

---

## Common SMS Delivery Problems

### Status Stuck on "Sent"

**Problem:** SMS shows "Sent" for more than 5 minutes, never changes to "Delivered"

**Common Causes:**
1. Buyer's phone is off
2. Buyer is in area with no signal
3. Carrier experiencing delays
4. Buyer's inbox is full

**Solutions:**
1. Wait 15-30 minutes (carrier delays)
2. Call buyer to verify phone is on
3. Ask buyer to check messages and signal
4. Try resending after 30 minutes
5. Contact buyer via alternate method (email, call)

---

### "Delivery Failed" Error

**Problem:** SMS shows "Failed" status

**Common Causes:**
1. Invalid phone number
2. Landline instead of mobile
3. Number disconnected
4. Carrier blocking BuybidHQ messages
5. International number (not supported)

**Solutions:**
1. Verify phone number is correct
2. Call the number - is it a mobile phone?
3. Ask buyer for alternate mobile number
4. Update buyer's contact info
5. Try sending to different buyer first (test if system works)

---

### Buyer Says They Didn't Receive SMS

**Problem:** Status shows "Delivered" but buyer claims no message

**Common Causes:**
1. Message in spam/junk folder (on Samsung, Google Messages)
2. Blocked number or filtered messages
3. Message delivery delay (carrier-side)
4. Wrong device (multiple phones on account)

**Solutions:**
1. Ask buyer to check spam/junk/filtered messages
2. Ask buyer to check blocked numbers list
3. Verify the mobile number they're checking
4. Ask buyer to add BuybidHQ to contacts
5. Resend the SMS
6. Have buyer whitelist our SMS shortcode/number

---

## Phone Number Issues

### Invalid Format

**Problem:** Phone number won't accept or SMS fails

**Correct Format:**
- US numbers only (currently)
- Must be exactly 10 digits
- Automatically formatted as: (XXX) XXX-XXXX

**Examples:**
```
✅ (555) 123-4567
✅ 5551234567 (auto-formatted on save)
❌ 555-123-4567 (invalid format)
❌ +1 (555) 123-4567 (remove +1 country code)
❌ 555.123.4567 (use correct format)
```

**Solution:**
1. Go to **Buyers** page
2. Click **Edit** on buyer
3. Update mobile number to 10 digits only
4. Save and retry sending

---

### Landline Numbers

**Problem:** Buyer's number is a landline, not mobile

**How to Identify:**
- SMS always fails
- Calling the number reaches office phone or fax
- Area code suggests business line

**Solution:**
1. Call buyer and request mobile number
2. Update buyer profile with mobile number
3. Explain SMS-based system requires mobile

---

### Disconnected or Invalid Numbers

**Problem:** Number no longer in service

**How to Identify:**
- SMS fails immediately
- Calling number gives "disconnected" message
- Carrier message: "Number no longer in service"

**Solution:**
1. Contact buyer via email
2. Request updated mobile number
3. Update buyer profile
4. Consider removing buyer if unreachable

---

## Carrier-Specific Issues

### AT&T, Verizon, T-Mobile, etc.

**Carrier Blocking/Filtering:**

Some carriers filter messages from unknown senders or short codes

**Symptoms:**
- SMS fails only for specific carrier
- Other buyers receive successfully
- Pattern: All AT&T users fail, Verizon works

**Solutions:**
1. Ask buyer to:
   - Disable spam filtering in messaging app
   - Add BuybidHQ to contacts
   - Whitelist shortcode/number
   - Contact carrier to unblock
2. Try resending after buyer whitelists
3. Contact support@buybidhq.com if widespread carrier issue

---

### International Numbers

**Problem:** SMS fails for international numbers

**Why:** BuybidHQ currently supports US numbers only

**Solution:**
1. Ask buyer if they have US mobile number
2. Use email as alternative contact method
3. International SMS support planned for future

---

## Message Content Issues

### Messages Marked as Spam

**Problem:** Carrier or phone marks BuybidHQ messages as spam

**Why This Happens:**
- Automated systems flag bulk SMS
- New phone number/shortcode not yet trusted
- Carrier spam filter settings

**Buyer Solutions:**
1. Mark message as "Not Spam"
2. Add sender to contacts
3. Disable aggressive spam filtering
4. Whitelist our sending number

**For Android Users:**
- Open Messages app
- Go to Spam folder
- Find BuybidHQ message
- Tap "Not Spam"

**For iPhone Users:**
- Open Messages app
- Tap "Report Junk" (if shown)
- Select "Not Junk"

---

## Link and Content Issues

### Link Not Working in SMS

**Problem:** Buyer receives SMS but link doesn't open

**Solutions:**
1. Ask buyer to copy/paste full URL into browser
2. Ensure buyer has data or WiFi connection
3. Try different browser (Chrome recommended)
4. Check if buyer's work phone blocks external links
5. Resend SMS in case of corrupted link

---

### SMS Content Truncated

**Problem:** Message appears cut off or incomplete

**Cause:** Very long vehicle descriptions may truncate

**Solution:**
- SMS includes summary + link
- Full details available via link
- Buyer should click link for complete info

---

## Testing SMS Delivery

### Send Test to Yourself

**To Verify SMS System Works:**
1. Add yourself as a buyer (use your mobile number)
2. Create a test bid request
3. Send to yourself
4. Verify you receive SMS within 30 seconds
5. Click link to confirm it works
6. Delete test bid request afterward

**If You Receive It:**
- System is working correctly
- Issue is likely with specific buyer's number

**If You Don't Receive It:**
- Check your phone number in profile
- Ensure your carrier isn't blocking
- Contact support@buybidhq.com

---

## Bulk Sending Issues

### Some Buyers Receive, Others Don't

**Problem:** Mixed delivery success in same bid request

**Why:** Each buyer's phone/carrier handles SMS differently

**Solutions:**
1. Check delivery status for each buyer individually
2. Follow up with failed deliveries directly
3. Update phone numbers for buyers who consistently fail
4. Consider removing non-responsive buyers

---

### All SMS Failing

**Problem:** Every SMS shows "Failed", no one receives anything

**Cause:** Likely system-wide issue or account problem

**Immediate Actions:**
1. Check your internet connection
2. Verify account is in good standing (not suspended)
3. Check status.buybidhq.com (coming soon)
4. Email support@buybidhq.com immediately

---

## Timing and Delivery Best Practices

### Optimal Send Times

**Best Response Rates:**
- ✅ Weekdays: 8am - 5pm (business hours)
- ✅ Avoid: Early mornings (before 8am)
- ✅ Avoid: Late evenings (after 8pm)
- ✅ Avoid: Weekends (lower response rates)

**Why:**
- Buyers check messages during work hours
- After-hours messages may be ignored
- Business SMS expected during business hours

---

### Re-sending to Non-Responders

**If Buyer Doesn't Respond:**
1. Wait at least 1 hour before resending
2. Call buyer directly first
3. If still no response, resend after 24 hours
4. Don't spam - max 2 resends per vehicle

---

## Carrier-Specific Troubleshooting

### AT&T

**Common Issues:**
- Aggressive spam filtering
- May delay delivery 1-2 minutes

**Solutions:**
- Ask buyer to whitelist our number
- Disable AT&T Call Protect spam filtering

---

### Verizon

**Common Issues:**
- Blocks shortcodes from unknown senders
- May require buyer to enable messages from businesses

**Solutions:**
- Ask buyer to enable marketing messages
- Add to contacts before receiving first message

---

### T-Mobile / Metro

**Common Issues:**
- "Scam Likely" labels on new numbers
- May filter promotional messages

**Solutions:**
- Ask buyer to disable Scam Block
- Add sender to contacts

---

### Google Fi / MVNOs

**Common Issues:**
- May inherit filtering from host network
- Less predictable delivery

**Solutions:**
- Treat as primary carrier (AT&T, T-Mobile, etc.)
- Ask buyer to check spam settings

---

## FAQ

**Q: Why do some buyers never receive any messages?**
A: Usually incorrect number, landline, or carrier blocking. Verify number and ask buyer to whitelist.

**Q: How long should I wait before assuming SMS failed?**
A: If status is "Sent" for more than 5 minutes, likely delayed. Wait 30 minutes, then follow up directly.

**Q: Can I send SMS to Canadian numbers?**
A: Not currently. US numbers only. International support coming soon.

**Q: What number do SMS messages come from?**
A: We use a pool of shortcodes and long codes. Number varies, but all say "BuybidHQ".

**Q: Can buyers reply directly to the SMS?**
A: No. Buyers must click the link to view details and submit offer. SMS replies are not monitored.

**Q: Do SMS messages count against my plan?**
A: No. Unlimited SMS on all plans (Beta, Connect, Annual).

---

## When to Contact Support

**Email support@buybidhq.com if:**
- All SMS failing for extended period (30+ minutes)
- Consistent failures to specific carrier
- Buyer reports receiving duplicate messages
- SMS content appears corrupted
- Link in SMS leads to error page

**Include in Your Report:**
- Buyer's phone number (last 4 digits for privacy)
- Carrier (if known)
- Error message or status shown
- Screenshot of delivery status
- Time SMS was sent

---

## Related Articles

- [Creating Bid Requests](../web-app/creating-bid-requests.md)
- [Managing Buyers](../web-app/managing-buyers.md)
- [SMS Bidding Feature](../features/sms-bidding.md)
- [Common Issues](common-issues.md)

---

## Need Help?

**SMS still not working?**
- 📧 [Contact Support](mailto:support@buybidhq.com)
- 💬 [Feature Requests](../support/feature-requests.md)
- ❓ [View FAQ](../support/faq.md)

---

**SMS working now?** Excellent! Continue [managing your buyers](../web-app/managing-buyers.md).
