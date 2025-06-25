import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🕰️ Daily Reddit conflict scheduler triggered at 7 PM Pacific')

    // Get the Supabase URL for calling our existing edge function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Call the existing daily-reddit-fetch function
    const fetchUrl = `${supabaseUrl}/functions/v1/daily-reddit-fetch`
    
    console.log('📞 Calling daily-reddit-fetch function...')
    
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduled: true,
        trigger_time: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Daily fetch failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    console.log('✅ Daily Reddit conflict fetch completed:', result)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily Reddit conflict scheduler executed successfully',
        fetch_result: result,
        executed_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in daily Reddit scheduler:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        executed_at: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})