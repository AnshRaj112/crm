# NodoLeads CRM Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Example:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Copy and paste the contents of `database_schema.sql`
4. Execute the SQL to create all tables, indexes, and policies
5. Go to Settings > API to get your project URL and anon key
6. Add these to your `.env.local` file

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Add the client ID to Supabase Auth settings

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

1. Build the application: `npm run build`
2. Deploy to your preferred platform (Vercel, Netlify, etc.)
3. Update environment variables in your deployment platform
4. Ensure Supabase RLS policies are properly configured
5. Test all functionality in production environment

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your environment variables
2. **Authentication not working**: Verify Supabase Auth settings
3. **Database errors**: Ensure all SQL schema has been executed
4. **QR codes not generating**: Check if crypto.randomUUID() is available

### Support

For technical support, contact the Exsolvia development team.
