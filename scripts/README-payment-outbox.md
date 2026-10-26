# Payment Email Outbox

Manual UPI payment submissions, payment review actions, and confirmed orders queue emails in MongoDB. Run this command from the deployment scheduler/cron to process due jobs and retry transient SMTP failures:

```bash
npm run payments:process-email-outbox -- --limit=10
```

The worker uses MongoDB-backed locks and bounded retries. SMTP acceptance is treated as sent; inbox delivery is not claimed. Order-confirmation jobs are also attempted immediately after enqueueing, while the scheduled worker provides recovery if the request ends or SMTP is temporarily unavailable.
