/*
  # Setup Reddit Conflict Scheduler Functions

  1. Extensions
    - Enable http extension for making HTTP requests
    - Enable pg_net extension as Supabase's preferred method

  2. Functions
    - Create function to trigger daily Reddit fetch using pg_net
    - Create fallback function using http extension
    - Create simple trigger function for manual execution

  3. Note
    - Supabase doesn't support pg_cron in hosted environment
    - This sets up the infrastructure for external scheduling
    - Can be triggered via GitHub Actions, external cron, or manual execution
*/

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Enable pg_net extension as alternative (Supabase's preferred method)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to trigger daily Reddit fetch using pg_net
CREATE OR REPLACE FUNCTION public.trigger_daily_reddit_fetch_with_pg_net()
RETURNS jsonb AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
  request_id bigint;
  result jsonb;
BEGIN
  -- Get Supabase URL from environment or use default
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Use the current project URL if not set
  IF supabase_url IS NULL THEN
    -- Default to localhost for development
    supabase_url := 'http://localhost:54321';
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
  
  result := jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Daily Reddit fetch request submitted successfully',
    'timestamp', now()
  );
  
  RAISE NOTICE 'Daily Reddit fetch request submitted with ID: %', request_id;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error triggering daily Reddit fetch with pg_net: %', SQLERRM;
    
    -- Return error result
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to trigger daily Reddit fetch',
      'timestamp', now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a fallback function using http extension
CREATE OR REPLACE FUNCTION public.trigger_daily_reddit_fetch_with_http()
RETURNS jsonb AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
  response http_response;
  result jsonb;
BEGIN
  -- Get Supabase URL from environment or use default
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Use the current project URL if not set
  IF supabase_url IS NULL THEN
    -- Default to localhost for development
    supabase_url := 'http://localhost:54321';
  END IF;
  
  function_url := supabase_url || '/functions/v1/schedule-daily-reddit';
  
  -- Log the attempt
  RAISE NOTICE 'Triggering daily Reddit fetch at % using http', now();
  
  -- Use http extension for HTTP request
  SELECT * FROM http_post(
    function_url,
    jsonb_build_object(
      'scheduled', true,
      'trigger_time', now()
    )::text,
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer ' || COALESCE(service_role_key, '')),
      http_header('Content-Type', 'application/json')
    ]
  ) INTO response;
  
  result := jsonb_build_object(
    'success', true,
    'status_code', response.status,
    'response', response.content,
    'message', 'Daily Reddit fetch request completed',
    'timestamp', now()
  );
  
  RAISE NOTICE 'Daily Reddit fetch completed with status: %', response.status;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error triggering daily Reddit fetch with http: %', SQLERRM;
    
    -- Return error result
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to trigger daily Reddit fetch',
      'timestamp', now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple trigger function that tries both methods
CREATE OR REPLACE FUNCTION public.trigger_daily_reddit_fetch()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Try pg_net first (Supabase's preferred method)
  BEGIN
    result := public.trigger_daily_reddit_fetch_with_pg_net();
    
    -- If successful, return the result
    IF (result->>'success')::boolean THEN
      RETURN result;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'pg_net method failed, trying http extension: %', SQLERRM;
  END;
  
  -- Fallback to http extension
  BEGIN
    result := public.trigger_daily_reddit_fetch_with_http();
    RETURN result;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Both methods failed: %', SQLERRM;
      
      -- Return final error result
      result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'All trigger methods failed',
        'timestamp', now()
      );
      
      RETURN result;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to manually trigger the daily fetch (for testing)
CREATE OR REPLACE FUNCTION public.manual_trigger_daily_reddit()
RETURNS jsonb AS $$
BEGIN
  RAISE NOTICE 'Manual trigger initiated at %', now();
  RETURN public.trigger_daily_reddit_fetch();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users for manual trigger
GRANT EXECUTE ON FUNCTION public.manual_trigger_daily_reddit() TO authenticated;

-- Grant permissions to postgres role for automated triggers
GRANT EXECUTE ON FUNCTION public.trigger_daily_reddit_fetch() TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_daily_reddit_fetch_with_pg_net() TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_daily_reddit_fetch_with_http() TO postgres;

-- Create a table to track scheduler runs (optional)
CREATE TABLE IF NOT EXISTS reddit_scheduler_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_method text NOT NULL,
  success boolean NOT NULL,
  result jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on scheduler logs
ALTER TABLE reddit_scheduler_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading scheduler logs
CREATE POLICY "Anyone can read scheduler logs"
  ON reddit_scheduler_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to log scheduler runs
CREATE OR REPLACE FUNCTION public.log_scheduler_run(
  p_trigger_method text,
  p_success boolean,
  p_result jsonb DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO reddit_scheduler_logs (trigger_method, success, result, error_message)
  VALUES (p_trigger_method, p_success, p_result, p_error_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to log scheduler runs
GRANT EXECUTE ON FUNCTION public.log_scheduler_run(text, boolean, jsonb, text) TO postgres, authenticated;