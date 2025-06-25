/*
  # Enable HTTP extension for cron job

  1. Extensions
    - Enable http extension for making HTTP requests from PostgreSQL
    - Enable pg_net extension as alternative for HTTP requests

  2. Security
    - Grant necessary permissions for HTTP requests
*/

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Enable pg_net extension as alternative (Supabase's preferred method)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a more robust function using pg_net if available
CREATE OR REPLACE FUNCTION public.trigger_daily_reddit_fetch_with_pg_net()
RETURNS void AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
  request_id bigint;
BEGIN
  -- Get Supabase URL from environment
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Use the current project URL if not set
  IF supabase_url IS NULL THEN
    -- This will be replaced with actual project URL in production
    supabase_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co';
  END IF;
  
  function_url := supabase_url || '/functions/v1/schedule-daily-reddit';
  
  -- Log the attempt
  RAISE NOTICE 'Triggering daily Reddit fetch at % using pg_net', now();
  
  -- Use pg_net for HTTP request (Supabase's preferred method)
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || COALESCE(service_role_key, ''),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'scheduled', true,
      'trigger_time', now()
    )
  ) INTO request_id;
  
  RAISE NOTICE 'Daily Reddit fetch request submitted with ID: %', request_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error triggering daily Reddit fetch with pg_net: %', SQLERRM;
    -- Fallback to the original function
    PERFORM public.trigger_daily_reddit_fetch();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the cron job to use the new function
SELECT cron.unschedule('daily-reddit-conflict-fetch');

-- Schedule using the pg_net version
SELECT cron.schedule(
  'daily-reddit-conflict-fetch',
  '0 3 * * *',  -- Every day at 3 AM UTC (7 PM PST)
  'SELECT public.trigger_daily_reddit_fetch_with_pg_net();'
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.trigger_daily_reddit_fetch_with_pg_net() TO postgres;