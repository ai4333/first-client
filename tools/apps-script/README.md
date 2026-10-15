# Lead capture setup (about three minutes)

Everything lives in the client's own Google account. No third party holds
their leads, and there is nothing to pay.

1. Create a Google Sheet. Name it something like **Geetha Constructions — Leads**.
   Create it under the **client's** Google account, not a personal one, and add
   yourself as an editor. If the engagement ever ends, access is handed over
   rather than untangled.

2. In that Sheet: **Extensions → Apps Script**. Delete whatever is there and
   paste the contents of `Code.gs` from this folder.

3. Optional but worth it: set `NOTIFY_EMAIL` at the top of the script to the
   address that should be alerted on every enquiry. Leads go cold in minutes.

4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**

   Google will ask you to authorise it once. Copy the **/exec** URL it gives.

5. Paste that URL into `ENDPOINT` at the top of
   `assets/js/lead-capture.js`, then redeploy the site.

## Until step 5 is done

The form does not pretend to work. It tells the visitor it could not send
automatically and hands them a WhatsApp link with their details already
written out, so enquiries still reach the business.

## Checking it

Submit the form on the live site. A row should appear in the Sheet within a
second or two. If it does not, open **Executions** in the Apps Script editor
to see what the script received.
