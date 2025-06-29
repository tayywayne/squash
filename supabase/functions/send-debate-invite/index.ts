import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
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
    // Check if SendGrid API key is available
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'Email service configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { to_email, debate_id, inviter_name, debate_title } = await req.json()

    // Validate input
    if (!to_email || !debate_id || !inviter_name || !debate_title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to_email, debate_id, inviter_name, or debate_title' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Sending debate invite to ${to_email} for debate ${debate_id} from ${inviter_name}`)

    // Prepare email content
    const emailData = {
      personalizations: [
        {
          to: [{ email: to_email }]
        }
      ],
      from: {
        email: 'squashiehelp@gmail.com',
        name: 'Squashie'
      },
      subject: `${inviter_name} has challenged you to a debate: "${debate_title}" 🎭`,
      content: [
        {
          type: "text/html",
          value: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <!-- Header -->
              <div style="background-color: #00475A; padding: 20px; border: 3px solid #000; box-shadow: 4px 4px 0px 0px #000; margin-bottom: 20px;">
                <div style="font-size: 36px; text-align: center; margin-bottom: 10px;">🎭</div>
                <h1 style="color: white; text-align: center; font-weight: 900; margin: 0; font-size: 24px;">SQUASHIE</h1>
                <p style="color: #C3DC30; text-align: center; font-weight: bold; margin-top: 5px;">DEBATE CHALLENGE</p>
              </div>
              
              <!-- Main Content -->
              <div style="background-color: white; padding: 20px; border: 3px solid #000; box-shadow: 4px 4px 0px 0px #000; margin-bottom: 20px;">
                <h2 style="color: #00475A; font-weight: 900; text-align: center; margin-bottom: 20px; font-size: 22px;">
                  YOU'VE BEEN CHALLENGED TO A DEBATE!
                </h2>
                
                <div style="background-color: #C3DC30; padding: 15px; border: 3px solid #000; margin-bottom: 20px;">
                  <p style="color: #00475A; font-weight: bold; margin: 0; text-align: center; font-size: 16px;">
                    <strong>${inviter_name}</strong> has challenged you to debate: <strong>"${debate_title}"</strong>
                  </p>
                </div>
                
                <p style="color: #00475A; font-weight: bold; text-align: center; margin-bottom: 30px;">
                  Join the debate, make your case, and let the community vote on who made the better argument!
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://squashie.online/debates/respond/${debate_id}" 
                     style="background-color: #FC7600; color: white; padding: 15px 30px; text-decoration: none; font-weight: 900; border: 3px solid #000; box-shadow: 4px 4px 0px 0px #000; display: inline-block; font-size: 16px;">
                    ACCEPT THE CHALLENGE
                  </a>
                </div>
                
                <p style="color: #00475A; font-size: 14px; text-align: center; margin-top: 20px;">
                  If you don't have an account yet, you'll be asked to create one first.
                </p>
              </div>
              
              <!-- Features -->
              <div style="background-color: #FC7600; padding: 15px; border: 3px solid #000; box-shadow: 4px 4px 0px 0px #000; margin-bottom: 20px;">
                <h3 style="color: white; font-weight: 900; text-align: center; margin-bottom: 15px; font-size: 18px;">
                  HOW IT WORKS
                </h3>
                <ul style="color: white; font-weight: bold; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 10px;">Write your argument for your side of the debate</li>
                  <li style="margin-bottom: 10px;">The community votes on who made the better case</li>
                  <li style="margin-bottom: 10px;">After 7 days, a winner is declared</li>
                  <li style="margin-bottom: 10px;">Winners earn SquashCred points and bragging rights</li>
                </ul>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center;">
                <p style="color: #00475A; font-size: 14px; font-weight: bold;">
                  — The Squashie Team 💣
                </p>
                <p style="color: #00475A; font-size: 12px;">
                  Because not everyone can afford a couples therapist.
                </p>
              </div>
            </div>
          `
        }
      ]
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Debate invite sent successfully to ${to_email}`)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending debate invite:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send invite email' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})