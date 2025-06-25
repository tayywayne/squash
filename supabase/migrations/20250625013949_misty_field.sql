/*
  # Create daily Reddit conflict cron job

  1. Cron Job Setup
    - Schedule daily Reddit conflict fetch at 7 PM Pacific (3 AM UTC next day)
    - Uses pg_cron extension to schedule the job
    - Calls the schedule-daily-reddit edge function

  2. Function
    - Create function to call the edge function via HTTP request
    - Handle timezone conversion for Pacific Time

  3. Security
    - Function runs with SECURITY DEFINER for proper permissions
*/

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to call the daily Reddit scheduler edge function
CREATE OR REPLACE FUNCTION public.trigger_daily_reddit_fetch()
RETURNS void AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
  response_status int;
BEGIN
  -- Get configuration from environment (these would be set in Supabase dashboard)
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Fallback to hardcoded URL if settings not available
  IF supabase_url IS NULL THEN
    supabase_url := 'https://your-project-ref.supabase.co';
  END IF;
  
  function_url := supabase_url || '/functions/v1/schedule-daily-reddit';
  
  -- Log the attempt
  RAISE NOTICE 'Triggering daily Reddit fetch at %', now();
  
  -- Make HTTP request to the edge function
  SELECT status INTO response_status
  FROM http((
    'POST',
    function_url,
    ARRAY[
      http_header('Authorization', 'Bearer ' || COALESCE(service_role_key, '')),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{"scheduled": true, "trigger_time": "' || now()::text || '"}'
  )::http_request);
  
  -- Log the result
  IF response_status = 200 THEN
    RAISE NOTICE 'Daily Reddit fetch triggered successfully';
  ELSE
    RAISE WARNING 'Daily Reddit fetch failed with status: %', response_status;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error triggering daily Reddit fetch: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the cron job to run daily at 7 PM Pacific Time
-- Pacific Time is UTC-8 (PST) or UTC-7 (PDT)
-- To handle both, we'll schedule for 3 AM UTC (7 PM PST) and 2 AM UTC (7 PM PDT)
-- We'll use 3 AM UTC as the standard time (7 PM PST)

-- Remove any existing cron job for this function
SELECT cron.unschedule('daily-reddit-conflict-fetch');

-- Schedule new cron job for 3 AM UTC daily (7 PM Pacific Standard Time)
SELECT cron.schedule(
  'daily-reddit-conflict-fetch',
  '0 3 * * *',  -- Every day at 3 AM UTC (7 PM PST)
  'SELECT public.trigger_daily_reddit_fetch();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.trigger_daily_reddit_fetch() TO postgres;