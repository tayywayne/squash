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
const REDDIT_USER_AGENT = Deno.env.get('REDDIT_USER_AGENT') ?? 'web:conflict-resolver:v1.0.0 (by /u/conflictresolver)'

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

// Fallback conflicts for when Reddit API is unavailable
const FALLBACK_CONFLICTS = [
  {
    id: 'fallback_1',
    title: 'AITA for refusing to attend my sister\'s wedding because she didn\'t invite my partner?',
    author: 'ThrowawayUser123',
    selftext: 'My sister is getting married next month and sent me an invitation that was addressed only to me, not including my partner of 3 years. When I asked her about it, she said she wanted to keep the wedding "family only" and didn\'t consider my partner family yet since we\'re not married. I told her that if my partner isn\'t welcome, then I won\'t be attending either. She\'s now calling me selfish and saying I\'m ruining her special day. My parents are taking her side and saying I should just go alone to keep the peace. AITA for standing my ground?'
  },
  {
    id: 'fallback_2', 
    title: 'AITA for not letting my roommate use my car after they crashed it last time?',
    author: 'CarOwnerDilemma',
    selftext: 'Six months ago, my roommate asked to borrow my car for a job interview. I said yes because I wanted to help them out. They ended up rear-ending someone at a red light and caused $2,000 in damage. They paid for the repairs, but it took weeks and I had to use rideshares. Now they\'re asking to borrow my car again for another job interview, and I said no. They\'re saying I\'m being petty and holding a grudge, and that accidents happen. They promise to be more careful this time. My other friends are split - some say I should give them another chance, others say I\'m smart to protect my property. AITA?'
  },
  {
    id: 'fallback_3',
    title: 'AITA for telling my neighbor their music is too loud even though it\'s during the day?',
    author: 'QuietNeighbor',
    selftext: 'I work night shifts and sleep during the day. My neighbor plays loud music from about 10 AM to 4 PM almost every day. I\'ve politely asked them twice to turn it down, explaining my work schedule. They said they have the right to play music during normal hours and I should get better curtains or earplugs. Yesterday I called the non-emergency police line about the noise. The officer talked to them and they had to turn it down. Now they\'re furious with me and saying I\'m trying to control what they do in their own home during reasonable hours. They argue that most people are awake during the day and I\'m the one with the unusual schedule. AITA for involving the police?'
  },
  {
    id: 'fallback_4',
    title: 'AITA for not sharing my lottery winnings with my family?',
    author: 'LuckyWinner2024',
    selftext: 'I won $50,000 in a scratch-off lottery ticket last month. I bought the ticket with my own money during my lunch break. When my family found out, they all started asking for money - my brother wants help with his student loans, my sister needs money for her wedding, and my parents think I should help with their mortgage. They\'re saying that family should share good fortune and that I\'m being selfish. I told them I\'m keeping the money for my own future and maybe taking a nice vacation. Now they\'re all mad at me and saying I\'ve changed. AITA for not sharing my winnings?'
  },
  {
    id: 'fallback_5',
    title: 'AITA for refusing to switch airplane seats with a family?',
    author: 'WindowSeatTraveler',
    selftext: 'I was on a 6-hour flight and had specifically paid extra for a window seat because I love looking out during flights and it helps with my anxiety. A family of four got on and realized they weren\'t seated together. The mother asked if I would switch to a middle seat in the back so their family could sit together. I politely declined, explaining that I had paid extra for this specific seat. She got upset and said I was being inconsiderate to their children. The flight attendant came over and asked if I would consider switching "to help the family out." I stood my ground and said no. The family spent the whole flight giving me dirty looks and making comments about selfish people. AITA?'
  }
]

async function getRedditAccessToken(): Promise<string> {
  console.log('🔑 Getting Reddit access token...')
  
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit API credentials not configured')
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
    throw new Error(`Reddit authentication failed: ${response.status}`)
  }

  const data: RedditAccessTokenResponse = await response.json()
  console.log('✅ Reddit access token obtained')
  return data.access_token
}

async function fetchRedditPosts(): Promise<RedditPost[]> {
  const attempts = [
    // Attempt 1: Authenticated OAuth
    async () => {
      if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
        throw new Error('No credentials available')
      }
      
      console.log('🔑 Attempting authenticated Reddit access...')
      const accessToken = await getRedditAccessToken()
      
      const response = await fetch(
        'https://oauth.reddit.com/r/AmItheAsshole/top?t=day&limit=25',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': REDDIT_USER_AGENT
          }
        }
      )

      if (!response.ok) {
        throw new Error(`OAuth API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📊 Found ${data.data.children.length} posts (authenticated)`)
      return data.data.children.map((child: any) => child.data as RedditPost)
    },

    // Attempt 2: Unauthenticated JSON
    async () => {
      console.log('🌐 Attempting unauthenticated Reddit access...')
      const response = await fetch(
        'https://www.reddit.com/r/AmItheAsshole/top.json?t=day&limit=25',
        {
          headers: {
            'User-Agent': REDDIT_USER_AGENT,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Unauthenticated API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📊 Found ${data.data.children.length} posts (unauthenticated)`)
      return data.data.children.map((child: any) => child.data as RedditPost)
    },

    // Attempt 3: Alternative endpoint
    async () => {
      console.log('🔄 Trying alternative Reddit endpoint...')
      const response = await fetch(
        'https://www.reddit.com/r/AmItheAsshole/hot.json?limit=25',
        {
          headers: {
            'User-Agent': REDDIT_USER_AGENT,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Alternative endpoint error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📊 Found ${data.data.children.length} posts (alternative)`)
      return data.data.children.map((child: any) => child.data as RedditPost)
    }
  ]

  // Try each method in sequence
  for (let i = 0; i < attempts.length; i++) {
    try {
      const posts = await attempts[i]()
      if (posts && posts.length > 0) {
        return posts
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error.message)
      if (i === attempts.length - 1) {
        // All attempts failed, throw the last error
        throw error
      }
    }
  }

  throw new Error('All Reddit access methods failed')
}

function selectFallbackConflict(): any {
  // Use date-based selection to ensure same conflict for the whole day
  const today = new Date().toDateString()
  const hash = today.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const index = Math.abs(hash) % FALLBACK_CONFLICTS.length
  const conflict = FALLBACK_CONFLICTS[index]
  
  console.log(`📋 Using fallback conflict: ${conflict.title}`)
  
  return {
    id: `${conflict.id}_${today.replace(/\s/g, '_')}`,
    title: conflict.title,
    author: conflict.author,
    selftext: conflict.selftext,
    created_utc: Math.floor(Date.now() / 1000),
    permalink: `/r/AmItheAsshole/comments/${conflict.id}/`
  }
}

async function checkIfTodaysConflictExists(): Promise<boolean> {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  const { data, error } = await supabaseClient
    .from('reddit_conflicts')
    .select('id')
    .gte('created_at', startOfDay.toISOString())
    .eq('is_active', true)
    .limit(1)

  if (error) {
    console.error('Error checking for today\'s conflict:', error)
    return false
  }

  return data && data.length > 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Daily Reddit conflict fetch triggered...')

    // Check if we already have a conflict for today
    const hasToday = await checkIfTodaysConflictExists()
    if (hasToday) {
      console.log('📋 Today\'s conflict already exists, skipping fetch')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Today\'s conflict already exists',
          skipped: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let selectedPost: RedditPost
    let usedFallback = false

    try {
      // Try to fetch from Reddit
      const posts = await fetchRedditPosts()
      
      // Filter for valid posts
      const validPosts = posts.filter((post: RedditPost) => 
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
        throw new Error('No valid posts found after filtering')
      }

      selectedPost = validPosts[0]
      
      // Check if we already have this specific post
      const { data: existingPost } = await supabaseClient
        .from('reddit_conflicts')
        .select('id')
        .eq('reddit_post_id', selectedPost.id)
        .single()

      if (existingPost) {
        console.log('📋 Post already exists, using fallback instead...')
        throw new Error('Post already exists')
      }
      
    } catch (redditError) {
      console.warn('🔄 Reddit access failed, using fallback conflict:', redditError.message)
      selectedPost = selectFallbackConflict()
      usedFallback = true
    }

    console.log(`📝 Selected post: ${selectedPost.title}`)

    // Generate AI summary and suggestion
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    let aiSummary = 'AI summary temporarily unavailable - vote based on the original post!'
    let aiSuggestion = 'AI suggestion temporarily unavailable - use your best judgment!'
    
    if (openaiApiKey) {
      try {
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

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json()
          const aiContent = openaiData.choices[0]?.message?.content || ''
          
          try {
            const aiResult = JSON.parse(aiContent)
            aiSummary = aiResult.summary || aiSummary
            aiSuggestion = aiResult.suggestion || aiSuggestion
            console.log('🤖 AI processing complete')
          } catch (parseError) {
            console.warn('Failed to parse AI response, using fallback')
          }
        } else {
          console.warn(`OpenAI API error: ${openaiResponse.status}, using fallback`)
        }
      } catch (error) {
        console.warn('Failed to process AI response, using fallback:', error.message)
      }
    } else {
      console.warn('OpenAI API key not configured, using fallback content')
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

    console.log(`✅ New daily Reddit conflict created successfully ${usedFallback ? '(using fallback)' : ''}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        conflict_id: newConflict.id,
        title: selectedPost.title,
        used_fallback: usedFallback,
        message: 'Daily conflict created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in daily Reddit conflict fetch:', error)
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