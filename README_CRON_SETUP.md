# Daily Reddit Conflict Cron Job Setup

This document explains how to set up the daily Reddit conflict fetching that runs automatically at 7 PM Pacific Time.

## Overview

The system consists of:
1. **schedule-daily-reddit** - Edge function that orchestrates the daily fetch
2. **daily-reddit-fetch** - Edge function that actually fetches and processes Reddit conflicts
3. **PostgreSQL cron job** - Scheduled task that triggers the process daily

## Automatic Setup

The cron job is automatically configured when you run the migrations. It will:
- Run every day at 3 AM UTC (which is 7 PM Pacific Standard Time)
- Call the `schedule-daily-reddit` edge function
- That function then calls `daily-reddit-fetch` to get the new conflict

## Manual Configuration (if needed)

If you need to manually configure the cron job in your Supabase project:

### 1. Enable Required Extensions

In your Supabase SQL Editor, run:

```sql
-- Enable cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable HTTP requests (choose one)
CREATE EXTENSION IF NOT EXISTS http;
-- OR (Supabase's preferred method)
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Set Environment Variables

In your Supabase project settings, you may need to set these custom settings:

```sql
-- Set your project configuration
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project-ref.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
ALTER DATABASE postgres SET app.settings.project_ref = 'your-project-ref';
```

### 3. Schedule the Cron Job

```sql
-- Schedule daily Reddit conflict fetch
SELECT cron.schedule(
  'daily-reddit-conflict-fetch',
  '0 3 * * *',  -- 3 AM UTC = 7 PM PST
  'SELECT public.trigger_daily_reddit_fetch_with_pg_net();'
);
```

## Timezone Considerations

- **Pacific Standard Time (PST)**: UTC-8, so 7 PM PST = 3 AM UTC next day
- **Pacific Daylight Time (PDT)**: UTC-7, so 7 PM PDT = 2 AM UTC next day

The cron job is set for 3 AM UTC to align with PST. During PDT (daylight saving time), the function will run at 8 PM Pacific instead of 7 PM.

If you want to adjust for daylight saving time, you can:

1. **Option A**: Update the cron schedule twice a year
2. **Option B**: Use a more complex cron expression
3. **Option C**: Handle timezone logic within the function

## Monitoring

To check if the cron job is working:

```sql
-- View scheduled cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details 
WHERE jobname = 'daily-reddit-conflict-fetch' 
ORDER BY start_time DESC 
LIMIT 10;
```

## Manual Trigger

To manually trigger the daily Reddit fetch:

```sql
-- Trigger immediately
SELECT public.trigger_daily_reddit_fetch_with_pg_net();
```

Or call the edge function directly via HTTP:
```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/schedule-daily-reddit' \
  -H 'Authorization: Bearer your-service-role-key' \
  -H 'Content-Type: application/json' \
  -d '{"manual_trigger": true}'
```

## Troubleshooting

1. **Cron job not running**: Check that pg_cron extension is enabled
2. **HTTP requests failing**: Ensure http or pg_net extension is enabled
3. **Permission errors**: Verify service role key is correctly set
4. **Function not found**: Ensure edge functions are deployed

## Security Notes

- The service role key is used for internal function-to-function communication
- All HTTP requests are made server-side within Supabase infrastructure
- The cron job runs with database-level permissions