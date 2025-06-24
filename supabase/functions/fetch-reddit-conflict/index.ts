import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

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

interface RedditPost {
  id: string
  title: string
  author: string
  selftext: string
  created_utc: number
  permalink: string
}

serve(async (req) => {
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
    console.log('🔍 Fetching daily Reddit conflict from r/AmItheAsshole...')

    // Fetch top posts from r/AmItheAsshole for today
    const redditResponse = await fetch(
      'https://www.reddit.com/r/AmItheAsshole/top.json?t=day&limit=25',
      {
        headers: {
          'User-Agent': 'SquashieApp/1.0 (Conflict Resolution Platform)'
        }
      }
    )

    if (!redditResponse.ok) {
      throw new Error(`Reddit API error: ${redditResponse.status}`)
    }

    const redditData = await redditResponse.json()
    const posts = redditData.data.children

    // Filter for valid posts
    const validPosts = posts
      .map((child: any) => child.data as RedditPost)
      .filter((post: RedditPost) => 
        post.selftext && 
        post.selftext.length > 100 &&
        !post.selftext.includes('[removed]') &&
        !post.selftext.includes('[deleted]') &&
        post.title &&
        post.author !== '[deleted]'
      )

    if (validPosts.length === 0) {
      throw new Error('No valid posts found')
    }

    // Select the top valid post
    const selectedPost = validPosts[0]
    console.log(`📝 Selected post: ${selectedPost.title}`)

    // Check if we already have this post
    const { data: existingPost } = await supabaseClient
      .from('reddit_conflicts')
      .select('id')
      .eq('reddit_post_id', selectedPost.id)
      .single()

    if (existingPost) {
      console.log('📋 Post already exists, skipping...')
      return new Response(
        JSON.stringify({ message: 'Post already exists', post_id: selectedPost.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate AI summary and suggestion using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const aiPrompt = `You are an AI conflict mediator. Take the following Reddit post from r/AmItheAsshole and:

1. Summarize the conflict clearly in 2-3 sentences (under 300 characters)
2. Suggest a neutral, fair resolution with a slight tone of sass or humor (under 400 characters)

Use accessible language and avoid quoting Reddit-specific slang. Be direct but fair.

Original post:
Title: ${selectedPost.title}
Content: ${selectedPost.selftext}

Respond in JSON format with "summary" and "suggestion" fields.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI that provides conflict resolution advice in JSON format.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const aiContent = openaiData.choices[0]?.message?.content || ''
    
    let aiSummary = 'AI summary unavailable'
    let aiSuggestion = 'AI suggestion unavailable'
    
    try {
      const aiResult = JSON.parse(aiContent)
      aiSummary = aiResult.summary || aiSummary
      aiSuggestion = aiResult.suggestion || aiSuggestion
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback')
    }

    console.log('🤖 AI processing complete')

    // Deactivate previous conflicts
    await supabaseClient
      .from('reddit_conflicts')
      .update({ is_active: false })
      .eq('is_active', true)

    // Insert new conflict
    const { data: newConflict, error } = await supabaseClient
      .from('reddit_conflicts')
      .insert({
        reddit_post_id: selectedPost.id,
        subreddit: 'AmItheAsshole',
        title: selectedPost.title,
        author: selectedPost.author,
        original_text: selectedPost.selftext,
        ai_summary: aiSummary,
        ai_suggestion: aiSuggestion,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log('✅ New Reddit conflict created successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        conflict_id: newConflict.id,
        title: selectedPost.title 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error fetching Reddit conflict:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})