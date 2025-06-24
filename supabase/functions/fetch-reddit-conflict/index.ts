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

// Reddit API credentials from environment variables
const REDDIT_CLIENT_ID = Deno.env.get('REDDIT_CLIENT_ID')
const REDDIT_CLIENT_SECRET = Deno.env.get('REDDIT_CLIENT_SECRET')
const REDDIT_USER_AGENT = Deno.env.get('REDDIT_USER_AGENT') ?? 'SquashieBot/1.0 (by u/HEXXIIN)'

interface RedditPost {
  id: string
  title: string
  author: string
  selftext: string
  created_utc: number
  permalink: string
}

interface RedditAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

async function getRedditAccessToken(): Promise<string> {
  console.log('🔑 Getting Reddit access token...')
  
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit API credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.')
  }
  
  const credentials = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`)
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'User-Agent': REDDIT_USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Reddit auth error:', response.status, errorText)
    throw new Error(`Reddit authentication failed: ${response.status}. Please verify your Reddit API credentials.`)
  }

  const data: RedditAccessTokenResponse = await response.json()
  console.log('✅ Reddit access token obtained')
  return data.access_token
}

Deno.serve(async (req) => {
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

    // Check if Reddit credentials are configured
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
      console.warn('Reddit API credentials not configured, using fallback approach')
      
      // Try to fetch without authentication (limited access)
      const redditResponse = await fetch(
        'https://www.reddit.com/r/AmItheAsshole/top.json?t=day&limit=25',
        {
          headers: {
            'User-Agent': REDDIT_USER_AGENT
          }
        }
      )

      if (!redditResponse.ok) {
        throw new Error('Reddit API access failed and no valid credentials configured. Please configure REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.')
      }

      const redditData = await redditResponse.json()
      const posts = redditData.data.children

      console.log(`📊 Found ${posts.length} posts from Reddit (unauthenticated)`)

      // Filter for valid posts
      const validPosts = posts
        .map((child: any) => child.data as RedditPost)
        .filter((post: RedditPost) => 
          post.selftext && 
          post.selftext.length > 100 &&
          post.selftext.length < 10000 &&
          !post.selftext.includes('[removed]') &&
          !post.selftext.includes('[deleted]') &&
          post.title &&
          post.author !== '[deleted]' &&
          !post.title.toLowerCase().includes('update') &&
          post.title.toLowerCase().includes('aita')
        )

      console.log(`✅ Found ${validPosts.length} valid posts after filtering`)

      if (validPosts.length === 0) {
        throw new Error('No valid posts found')
      }

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

      // Deactivate previous conflicts
      await supabaseClient
        .from('reddit_conflicts')
        .update({ is_active: false })
        .eq('is_active', true)

      // Insert new conflict with fallback AI content
      const { data: newConflict, error } = await supabaseClient
        .from('reddit_conflicts')
        .insert({
          reddit_post_id: selectedPost.id,
          subreddit: 'AmItheAsshole',
          title: selectedPost.title,
          author: selectedPost.author,
          original_text: selectedPost.selftext,
          ai_summary: 'AI summary temporarily unavailable - vote based on the original post!',
          ai_suggestion: 'AI suggestion temporarily unavailable - use your best judgment!',
          is_active: true
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('✅ New Reddit conflict created successfully (fallback mode)')

      return new Response(
        JSON.stringify({ 
          success: true, 
          conflict_id: newConflict.id,
          title: selectedPost.title 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Reddit access token
    const accessToken = await getRedditAccessToken()

    // Fetch top posts from r/AmItheAsshole for today using OAuth
    const redditResponse = await fetch(
      'https://oauth.reddit.com/r/AmItheAsshole/top?t=day&limit=25',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': REDDIT_USER_AGENT
        }
      }
    )

    if (!redditResponse.ok) {
      const errorText = await redditResponse.text()
      console.error('Reddit API error:', redditResponse.status, errorText)
      throw new Error(`Reddit API error: ${redditResponse.status}`)
    }

    const redditData = await redditResponse.json()
    const posts = redditData.data.children

    console.log(`📊 Found ${posts.length} posts from Reddit`)

    // Filter for valid posts
    const validPosts = posts
      .map((child: any) => child.data as RedditPost)
      .filter((post: RedditPost) => 
        post.selftext && 
        post.selftext.length > 100 &&
        post.selftext.length < 10000 && // Not too long
        !post.selftext.includes('[removed]') &&
        !post.selftext.includes('[deleted]') &&
        post.title &&
        post.author !== '[deleted]' &&
        !post.title.toLowerCase().includes('update') && // Skip update posts
        post.title.toLowerCase().includes('aita') // Must contain AITA
      )

    console.log(`✅ Found ${validPosts.length} valid posts after filtering`)

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
      console.warn('OpenAI API key not configured, using fallback content')
      
      // Deactivate previous conflicts
      await supabaseClient
        .from('reddit_conflicts')
        .update({ is_active: false })
        .eq('is_active', true)

      // Insert new conflict with fallback AI content
      const { data: newConflict, error } = await supabaseClient
        .from('reddit_conflicts')
        .insert({
          reddit_post_id: selectedPost.id,
          subreddit: 'AmItheAsshole',
          title: selectedPost.title,
          author: selectedPost.author,
          original_text: selectedPost.selftext,
          ai_summary: 'AI summary temporarily unavailable - vote based on the original post!',
          ai_suggestion: 'AI suggestion temporarily unavailable - use your best judgment!',
          is_active: true
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('✅ New Reddit conflict created successfully (with fallback AI content)')

      return new Response(
        JSON.stringify({ 
          success: true, 
          conflict_id: newConflict.id,
          title: selectedPost.title 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🤖 Generating AI summary and suggestion...')

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
      console.warn(`OpenAI API error: ${openaiResponse.status}, using fallback`)
    }

    let aiSummary = 'AI summary temporarily unavailable - vote based on the original post!'
    let aiSuggestion = 'AI suggestion temporarily unavailable - use your best judgment!'
    
    if (openaiResponse.ok) {
      try {
        const openaiData = await openaiResponse.json()
        const aiContent = openaiData.choices[0]?.message?.content || ''
        
        const aiResult = JSON.parse(aiContent)
        aiSummary = aiResult.summary || aiSummary
        aiSuggestion = aiResult.suggestion || aiSuggestion
        
        console.log('🤖 AI processing complete')
      } catch (error) {
        console.warn('Failed to parse AI response, using fallback')
      }
    }

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