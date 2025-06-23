import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Stripe configuration
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

// Updated Price ID mapping with your actual Stripe Price IDs
const PRICE_IDS = {
  'tip_1': 'price_1Rd2vLRAbTz5SOSffp100yKC', // $1 - Buy Us a Band-Aid 🩹
  'tip_2': 'price_1Rd2vkRAbTz5SOSfBSxQbd7n', // $5 - I'm the Problem 💅
  'tip_3': 'price_1Rd2w8RAbTz5SOSfQKkSD12o', // $10 - Chaos Patron 🔥👑
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const { user_id, tip_level } = await req.json()

    // Validate input
    if (!user_id || !tip_level) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or tip_level' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get price ID for tip level
    const priceId = PRICE_IDS[tip_level as keyof typeof PRICE_IDS]
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid tip_level' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Creating checkout session for user ${user_id}, tip level ${tip_level}, price ID ${priceId}`)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/support-success`,
      cancel_url: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/support-us`,
      metadata: {
        user_id: user_id,
        tip_level: tip_level,
      },
    })

    console.log(`Checkout session created successfully: ${session.id}`)

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})