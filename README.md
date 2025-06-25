# 🧃 Squashie

**Resolve drama. Earn achievements. Avoid total social collapse.**  
Squashie is a chaotic-good web app that helps users resolve conflicts with friends, roommates, coworkers, Reddit trolls, and themselves — using AI mediation, public voting, emotional archetypes, and just enough petty sarcasm to stay fun.

## 🚀 Features

- 🧠 **AI Conflict Mediation**  
  Translate angry messages into thoughtful ones (because "you always do this" never ends well).

- ⚖️ **Judge AI Final Rulings**  
  When resolution fails, the AI lays down the law. Publicly.

- 🎭 **Conflict Archetypes**  
  Discover your inner Chaos Diplomat or Rehasher and collect them all.

- 🏆 **Achievements & Leaderboards**  
  Be the most emotionally evolved… or the most problematic. Either way, you'll rank.

- 📬 **Conflict Invites**  
  Invite others to your beef via email — whether they asked for it or not.

- 💸 **Supporter Tips & Badges**  
  Show the world (and your profile) that you care — with flair.

- 🗞️ **Reddit Conflict of the Day**  
  Real posts. Real drama. Real public voting on who's the problem.

## 🧩 Tech Stack

- **Frontend:** React 18, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** OpenAI API (GPT-3.5/4), custom prompt workflows
- **Email:** SendGrid for transactional emails
- **Payments:** Stripe Checkout
- **UI Components:** Custom components with Lucide React icons
- **Deployment:** Netlify

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- SendGrid API key (for emails)
- Stripe account (for payments)

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/squashie.git
   cd squashie
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Set up storage buckets for avatars
4. Configure Edge Functions for email and payment processing

## 🏆 Achievement System

Squashie features an extensive achievement system with over 60 unique achievements to unlock, including:

- **Conflict Resolution Achievements** - Earn badges for resolving conflicts in different ways
- **Communication Style Achievements** - Unlock achievements based on how you communicate
- **Time-based Achievements** - Special badges for conflicts at specific times/days
- **Collection Achievements** - Collect archetypes and other achievements
- **Meta Achievements** - Rewards for using the platform in unique ways

## 🎭 Conflict Archetypes

Users are assigned archetypes based on their conflict resolution style:

- **The Fixer** 🛠️ - Resolves conflicts as the responder
- **The Drama Generator** 🎭 - Frequently initiates conflicts
- **The Chaos Goblin** 💣 - Leaves unresolved conflicts everywhere
- **The Swift Fixer** ⚡ - Lightning-fast conflict resolution
- **The Harmony Seeker** 🌈 - Achieves mutual satisfaction
- ...and many more!

## 💰 Monetization

Squashie uses a simple tip-based monetization model:
- **Band-Aid Buyer** 🩹 - $1 tip
- **I'm The Problem** 💅 - $5 tip
- **Chaos Patron** 🔥👑 - $10 tip

Supporters receive special badges and profile customizations.

## 📊 Leaderboard System

The leaderboard tracks:
- Total conflicts
- Resolved conflicts
- Resolution rate
- User archetypes and achievements

Users can view all-time or weekly stats.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Built with [Bolt.new](https://bolt.new)
- Powered by [Supabase](https://supabase.com)
- AI by [OpenAI](https://openai.com)