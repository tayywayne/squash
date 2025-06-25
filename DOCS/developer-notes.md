# Developer Notes

## Project Overview

Squashie is a web application built with React, TypeScript, and Supabase that helps users resolve interpersonal conflicts through AI-assisted mediation. The application features a gamified approach to conflict resolution with achievements, points, and public voting.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: OpenAI API (GPT-3.5/4)
- **Email**: SendGrid for transactional emails
- **Payments**: Stripe Checkout
- **UI Components**: Custom components with Lucide React icons
- **Deployment**: Netlify

## Key Architecture Decisions

### Frontend Architecture

1. **Component Structure**
   - Reusable UI components in `/src/components`
   - Page components in `/src/pages`
   - Custom hooks in `/src/hooks`
   - Utility functions and services in `/src/utils`

2. **State Management**
   - React hooks for local state
   - Custom hooks for shared state (e.g., `useAuth`, `useArchetypeAchievements`)
   - Supabase for data persistence

3. **Routing**
   - React Router for navigation
   - Protected routes for authenticated content
   - Public routes for landing page and authentication

### Backend Architecture

1. **Database Design**
   - Normalized schema with proper relationships
   - Row Level Security (RLS) for data protection
   - Database functions for complex operations

2. **Authentication**
   - Supabase Auth for user management
   - Email/password authentication
   - Profile extension with custom fields

3. **Edge Functions**
   - Serverless functions for background processing
   - API integrations (OpenAI, SendGrid, Reddit)
   - Scheduled tasks (daily Reddit fetch)

## Development Workflow

1. **Local Development**
   - Run `npm run dev` to start the development server
   - Supabase local development with `supabase start`
   - Environment variables in `.env` file

2. **Database Migrations**
   - Create new migration files in `/supabase/migrations`
   - Never modify existing migrations
   - Apply migrations with `supabase db push`

3. **Deployment**
   - Frontend deployed to Netlify
   - Supabase deployed to Supabase Cloud
   - Environment variables set in deployment platforms

## Code Conventions

1. **TypeScript**
   - Use TypeScript for all new code
   - Define interfaces for all data structures
   - Use proper type annotations for functions

2. **React Components**
   - Functional components with hooks
   - Props interfaces for all components
   - Consistent naming conventions

3. **CSS/Styling**
   - Tailwind CSS for all styling
   - Custom utility classes in `index.css`
   - Consistent color scheme from `tailwind.config.js`

4. **File Structure**
   - One component per file
   - Related utilities grouped in modules
   - Clear separation of concerns

## Performance Considerations

1. **Database Queries**
   - Proper indexing for frequently queried columns
   - Efficient joins and aggregations
   - Pagination for large result sets

2. **React Optimizations**
   - Memoization with `useMemo` and `useCallback`
   - Lazy loading for routes
   - Efficient re-rendering with proper dependency arrays

3. **API Usage**
   - Rate limiting for external APIs
   - Caching where appropriate
   - Fallback mechanisms for API failures

## Security Practices

1. **Authentication**
   - Secure password handling
   - Protected routes
   - Session management

2. **Data Access**
   - Row Level Security (RLS) policies
   - Principle of least privilege
   - Input validation

3. **API Security**
   - Environment variables for API keys
   - Server-side API calls for sensitive operations
   - CORS configuration

## Known Issues and Limitations

1. **OpenAI API**
   - Rate limits can affect availability
   - Costs scale with usage
   - Occasional unexpected responses

2. **Supabase Limitations**
   - Limited support for complex transactions
   - Edge Function cold starts
   - Storage bucket permissions complexity

3. **Browser Compatibility**
   - Primarily tested on Chrome and Firefox
   - Some CSS features may not work in older browsers

## Future Improvements

1. **Technical Enhancements**
   - Real-time updates with Supabase Realtime
   - Improved error handling and recovery
   - Enhanced caching strategies
   - Comprehensive test coverage

2. **Feature Ideas**
   - Mobile app version
   - Voice message support
   - Conflict templates for common scenarios
   - Advanced analytics dashboard

3. **Performance Optimizations**
   - Code splitting for faster initial load
   - Image optimization
   - Database query optimization
   - Service worker for offline support

## Troubleshooting Common Issues

1. **Authentication Issues**
   - Check browser console for errors
   - Verify Supabase configuration
   - Clear browser cache and cookies

2. **Database Errors**
   - Check RLS policies
   - Verify schema migrations
   - Check for constraint violations

3. **API Integration Problems**
   - Verify API keys and endpoints
   - Check rate limits
   - Implement proper error handling

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Stripe Documentation](https://stripe.com/docs)