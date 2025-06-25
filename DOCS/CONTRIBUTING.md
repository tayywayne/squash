# Contributing to Squashie

Thank you for your interest in contributing to Squashie! This document outlines the process for contributing to the project and the standards we expect.

## Currently, help is not welcomed on the app

As noted in the project requirements, Squashie is not currently accepting external contributions. This document is provided for future reference when the project opens for community involvement.

## Code of Conduct

When interacting with this project, please maintain a respectful and constructive attitude. We aim to create a positive environment for all contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/squashie.git
   cd squashie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Project Structure

- `/src`: Frontend React code
  - `/components`: Reusable UI components
  - `/pages`: Page components
  - `/hooks`: Custom React hooks
  - `/utils`: Utility functions and services
  - `/types`: TypeScript type definitions
- `/supabase`: Supabase configuration
  - `/migrations`: Database migrations
  - `/functions`: Edge Functions
- `/public`: Static assets
- `/DOCS`: Documentation files

## Coding Standards

### General Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Write self-documenting code with clear variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single responsibility

### React Components

- Use functional components with hooks
- Keep components focused on a single responsibility
- Use TypeScript interfaces for props
- Follow the existing component structure

### CSS/Styling

- Use Tailwind CSS classes for styling
- Follow the existing design system
- Use the color variables defined in `tailwind.config.js`
- Ensure responsive design for all screen sizes

## Pull Request Process

1. **Create a new branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them with clear, descriptive commit messages
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

3. **Push your branch** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** against the main branch
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

5. **Address review feedback** if requested

## Issue Guidelines

When creating issues, please:

- Check if a similar issue already exists
- Provide a clear description of the bug or feature request
- Include steps to reproduce for bugs
- Add screenshots if relevant
- Label the issue appropriately

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test your changes across different browsers and screen sizes

## Documentation

- Update documentation for any changed functionality
- Document new features or components
- Keep code comments up to date

## Database Changes

- Create new migration files for database changes
- Never modify existing migrations
- Test migrations thoroughly
- Document schema changes in `DATABASE_SCHEMA.md`

## Edge Functions

- Follow the existing pattern for new Edge Functions
- Include proper error handling
- Document the function's purpose and parameters
- Test thoroughly before submitting

## License

By contributing to Squashie, you agree that your contributions will be licensed under the project's license.

## Questions?

If you have questions about contributing, please reach out to the project maintainers.