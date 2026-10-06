# Payment Email Outbox

Manual UPI payment submissions queue admin notification emails in MongoDB. Run this command from the deployment scheduler/cron to process due jobs:

```bash
npm run payments:process-email-outbox -- --limit=10
```

The worker uses MongoDB-backed locks, bounded retries, and records `payment.email_sent` or `payment.email_failed` events. SMTP acceptance is treated as sent; inbox delivery is not claimed.
