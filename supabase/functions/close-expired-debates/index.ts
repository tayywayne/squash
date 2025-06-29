import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🕰️ Checking for expired debates...')

    // Find expired debates that are still active
    const { data: expiredDebates, error: findError } = await supabaseClient
      .from('public_debates')
      .select('id, creator_id, opponent_id, creator_votes, opponent_votes')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())

    if (findError) {
      throw findError
    }

    console.log(`📊 Found ${expiredDebates?.length || 0} expired debates`)

    if (!expiredDebates || expiredDebates.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired debates found',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each expired debate
    let successCount = 0
    let errorCount = 0

    for (const debate of expiredDebates) {
      try {
        // Determine winner based on vote counts
        let winnerId = null
        
        if (debate.creator_votes > debate.opponent_votes) {
          winnerId = debate.creator_id
        } else if (debate.opponent_votes > debate.creator_votes) {
          winnerId = debate.opponent_id
        }
        // If tied, winner remains null

        // Update debate status to complete and set winner
        const { error: updateError } = await supabaseClient
          .from('public_debates')
          .update({
            status: 'complete',
            winner_id: winnerId
          })
          .eq('id', debate.id)

        if (updateError) {
          throw updateError
        }

        // If there's a winner, update their debate win count
        if (winnerId) {
          // Award SquashCred to the winner
          try {
            await supabaseClient.rpc('award_squashcred', {
              p_user_id: winnerId,
              p_amount: 25,
              p_reason: 'Won a public debate'
            })
            
            // Increment debate win count in user achievements
            // This could be implemented with a separate function or table
          } catch (credError) {
            console.error(`Error awarding SquashCred to winner ${winnerId}:`, credError)
            // Continue processing even if SquashCred award fails
          }
        }

        successCount++
      } catch (debateError) {
        console.error(`Error processing debate ${debate.id}:`, debateError)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${successCount} expired debates`,
        total: expiredDebates.length,
        successful: successCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in close-expired-debates function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})