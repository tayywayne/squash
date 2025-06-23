import Stripe from 'npm:stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Updated Price ID mapping with your actual Stripe Price IDs
const PRICE_IDS = {
  'tip_1': 'price_1Rd2vLRAbTz5SOSffp100yKC', // $1 - Buy Us a Band-Aid 🩹
  'tip_2': 'price_1Rd2vkRAbTz5SOSfBSxQbd7n', // $5 - I'm the Problem 💅
  'tip_3': 'price_1Rd2w8RAbTz5SOSfQKkSD12o', // $10 - Chaos Patron 🔥👑
}

Deno.serve(async (req: Request) => {
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
    // Check if Stripe secret key is available
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

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
    
    // Provide more specific error information
    let errorMessage = 'Failed to create checkout session'
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      // Don't expose sensitive error details to client, but log them
      if (error.message.includes('No such price')) {
        errorMessage = 'Invalid price configuration'
      } else if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Payment service configuration error'
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})