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

    const { to_email, conflict_id, inviter_name } = await req.json()

    // Validate input
    if (!to_email || !conflict_id || !inviter_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to_email, conflict_id, or inviter_name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Sending conflict invite to ${to_email} for conflict ${conflict_id} from ${inviter_name}`)

    // Prepare email content
    const emailData = {
      personalizations: [
        {
          to: [{ email: to_email }]
        }
      ],
      from: {
        email: 'squashiehelp@gmail.com',
        name: 'Squash\'n\'Go'
      },
      subject: 'You\'ve been invited to squash a conflict 💥',
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #FF6B6B; text-align: center;">💥 Conflict Resolution Time!</h2>
              
              <p>Hey there,</p>
              
              <p><strong>${inviter_name}</strong> wants to squash a little drama with you on <strong>Squash'n'Go</strong>.</p>
              
              <p>To view or respond to the conflict, click here:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://squashie.online/conflict/${conflict_id}" 
                   style="background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Join the conflict
                </a>
              </div>
              
              <p>If you don't have an account yet, you'll be asked to create one first.</p>
              
              <p style="margin-top: 40px; color: #666; font-size: 14px;">
                — The Squashie Bot 💅
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                Squash'n'Go helps people resolve conflicts through AI-powered mediation.<br>
                Because not everyone can afford a couples therapist.
              </p>
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

    console.log(`Conflict invite sent successfully to ${to_email}`)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending conflict invite:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send invite email' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})