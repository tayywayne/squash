# Integrations

Squashie integrates with several third-party services to provide its functionality. This document outlines the integrations, their purposes, and implementation details.

## OpenAI

Used for AI-powered conflict mediation, message translation, and final judgments.

### Configuration
- **API Key**: Stored in environment variable `VITE_OPENAI_API_KEY`
- **Model**: GPT-3.5-turbo (with fallback to GPT-4 for complex judgments)
- **Implementation**: Direct API calls from both frontend and Supabase Edge Functions

### Usage
- Message translation (raw to constructive)
- Conflict summaries and suggestions
- Rehashed perspectives when initial mediation fails
- Core issue reflections
- Final theatrical judgments
- Reddit conflict analysis

### Fallback Mechanism
The system includes robust fallbacks for when the OpenAI API is unavailable:
```javascript
// Enhanced fallback for message translation
let translatedMessage = rawMessage;
      
// Replace harsh language with softer alternatives
translatedMessage = translatedMessage
  .replace(/\b(stupid|dumb|idiot|moron)\b/gi, 'frustrating')
  .replace(/\b(hate|despise)\b/gi, 'really dislike')
  // Additional replacements...
```

## Supabase

Core backend infrastructure for database, authentication, storage, and serverless functions.

### Configuration
- **URL**: Stored in environment variable `VITE_SUPABASE_URL`
- **Anon Key**: Stored in environment variable `VITE_SUPABASE_ANON_KEY`
- **Service Role Key**: Used in Edge Functions via environment variable `SUPABASE_SERVICE_ROLE_KEY`

### Components Used
- **Database**: PostgreSQL with RLS policies
- **Auth**: Email/password authentication
- **Storage**: Avatar image storage
- **Edge Functions**: Serverless functions for background processing
- **Realtime**: Not currently used but available for future features

## Stripe

Payment processing for supporter tips.

### Configuration
- **Public Key**: Stored in environment variable `VITE_STRIPE_PUBLIC_KEY`
- **Secret Key**: Stored in Supabase Edge Function environment as `STRIPE_SECRET_KEY`
- **Webhook Secret**: Stored in Supabase Edge Function environment as `STRIPE_WEBHOOK_SECRET`

### Price IDs
- **Band-Aid Buyer** (🩹 $1): `price_1Rd2vLRAbTz5SOSffp100yKC`
- **I'm The Problem** (💅 $5): `price_1Rd2vkRAbTz5SOSfBSxQbd7n`
- **Chaos Patron** (🔥👑 $10): `price_1Rd2w8RAbTz5SOSfQKkSD12o`

### Integration Points
- Checkout session creation via Edge Function
- Webhook handling for payment confirmation
- Profile updates to reflect supporter status

## SendGrid

Email delivery for conflict invitations and notifications.

### Configuration
- **API Key**: Stored in Supabase Edge Function environment as `SENDGRID_API_KEY`
- **From Email**: `squashiehelp@gmail.com`

### Email Templates
- Conflict invitation emails
- Welcome emails
- Notification emails

### Implementation
```javascript
// Send email via SendGrid
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sendGridApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(emailData),
});
```

## Reddit API

Used to fetch daily AITA (Am I The Asshole) posts for community voting.

### Configuration
- **Client ID**: Stored in Supabase Edge Function environment as `REDDIT_CLIENT_ID`
- **Client Secret**: Stored in Supabase Edge Function environment as `REDDIT_CLIENT_SECRET`
- **User Agent**: Stored in Supabase Edge Function environment as `REDDIT_USER_AGENT`

### Authentication
Uses OAuth2 client credentials flow:
```javascript
const credentials = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);
  
const response = await fetch('https://www.reddit.com/api/v1/access_token', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'User-Agent': REDDIT_USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'grant_type=client_credentials'
});
```

### Endpoints Used
- `/r/AmItheAsshole/top.json?t=day&limit=25` - Get top posts of the day
- `/r/AmItheAsshole/hot.json?limit=25` - Fallback endpoint

### Fallback Mechanism
The system includes predefined fallback conflicts for when the Reddit API is unavailable.

## PostgreSQL Cron

Used for scheduling the daily Reddit conflict fetch.

### Configuration
- Enabled via `pg_cron` extension
- Scheduled to run at 3 AM UTC (7 PM Pacific Time)

### Implementation
```sql
-- Schedule daily Reddit conflict fetch
SELECT cron.schedule(
  'daily-reddit-conflict-fetch',
  '0 3 * * *',  -- 3 AM UTC = 7 PM PST
  'SELECT public.trigger_daily_reddit_fetch_with_pg_net();'
);
```

## Security Considerations

### API Keys
- All API keys are stored in environment variables
- Service role keys are only used in Edge Functions
- Client-side code only uses public/anon keys

### Data Protection
- Sensitive operations are performed in Edge Functions
- Row Level Security (RLS) policies restrict data access
- User authentication is required for most operations

### Error Handling
- All integrations include robust error handling
- Fallback mechanisms for critical features
- Logging for debugging and monitoring