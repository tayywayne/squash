# Routes

Squashie's application is organized into the following routes, each serving a specific purpose in the conflict resolution journey.

## Public Routes

These routes are accessible to all users, including those who are not logged in:

### `/` - Home Page
- Landing page with app introduction
- Features overview and statistics
- Call-to-action for signup/login
- Animated elements showcasing the app's personality

### `/login` - Authentication Page
- User login with email/password
- New account registration
- Form validation and error handling

### `/public-shame` - AI Judgment Feed
- Public display of conflicts that reached final judgment
- Community voting on who was wrong
- No login required to view, login required to vote
- Sorted by recency

### `/reddit-conflict` - Reddit Conflict of the Day
- Daily featured conflict from r/AmItheAsshole
- AI analysis and suggestion
- Community voting (login required to vote)
- Historical archive access

### `/support-success` - Support Confirmation
- Confirmation page after successful supporter tip
- Updates user's supporter status
- Displays new supporter badge

## Authenticated Routes

These routes require user authentication:

### `/dashboard` - User Dashboard
- Overview of active and resolved conflicts
- Quick stats (total conflicts, resolution rate)
- "Start New Conflict" button
- Tabs for active conflicts and history

### `/new-conflict` - Conflict Creation
- Form to start a new conflict
- Mood selection
- Message input with AI translation
- Email invitation to other party

### `/conflict/:conflictId` - Conflict Detail
- Full conflict thread with messages
- AI mediation content
- Satisfaction voting
- Core issue clarification
- Final judgment display (if applicable)

### `/profile` - User Profile
- Personal information and settings
- Achievement collection display
- Archetype information
- SquashCred history
- Profile customization options

### `/user-profile/:userId` - Other User Profile
- View another user's profile
- See their achievements and archetypes
- View shared conflict history
- Cannot edit their information

### `/leaderboard` - Leaderboard
- Ranking of users by resolution metrics
- Filtering options (all-time, weekly)
- Category selection (least/most problematic)
- Links to user profiles

### `/support-us` - Support Page
- Supporter tier options
- Stripe checkout integration
- Benefits explanation
- Current supporter status

### `/quests` - Quests List
- Available conflict confidence quests
- Progress tracking
- Difficulty levels and rewards
- Quest categories

### `/quest/:questId` - Quest Detail
- Interactive quest steps
- Progress tracking
- Step submission and feedback
- Completion rewards

## Route Structure and Navigation

The application uses React Router for navigation with the following structure:

```jsx
<Router>
  <Routes>
    {/* Public routes - accessible to everyone */}
    <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
    <Route path="/support-success" element={<SupportSuccessPage />} />
    
    {user ? (
      // Authenticated routes
      <>
        <Route 
          path="/login" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route
          path="/*"
          element={
            <Layout>
              <OnboardingFlow />
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/new-conflict" element={<NewConflictPage />} />
                <Route path="/conflicts" element={<DashboardPage />} />
                <Route path="/history" element={<DashboardPage />} />
                <Route path="/conflict/:conflictId" element={<ConflictPage />} />
                <Route path="/resolution/:resolutionId" element={<ConflictPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/quests" element={<QuestsPage />} />
                <Route path="/quest/:questId" element={<QuestDetailPage />} />
                <Route path="/user-profile/:userId" element={<OtherUserProfilePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/support-us" element={<SupportUsPage />} />
                <Route path="/public-shame" element={<AIJudgmentFeedPage />} />
                <Route path="/reddit-conflict" element={<RedditConflictPage />} />
              </Routes>
            </Layout>
          }
        />
      </>
    ) : (
      // Unauthenticated routes
      <>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/public-shame" element={<AIJudgmentFeedPage />} />
        <Route path="/reddit-conflict" element={<RedditConflictPage />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </>
    )}
  </Routes>
</Router>
```

## Navigation Components

- **Desktop Sidebar**: Full navigation menu on larger screens
- **Mobile Bottom Bar**: Compact navigation for mobile devices
- **Header**: Contains user info, SquashCred display, and logout button
- **Back Buttons**: Context-aware navigation to previous screens

## Route Guards and Redirects

- Unauthenticated users attempting to access protected routes are redirected to the login page
- Authenticated users attempting to access the login page are redirected to the dashboard
- Invalid routes redirect to the home page or dashboard based on authentication status