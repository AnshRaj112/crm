# Authentication Setup Guide

This guide explains how to set up authentication for your Next.js CRM application with Supabase.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site URL (for production)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# For development, use:
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Configuration

### 1. Database Setup

Create the following tables in your Supabase database:

```sql
-- User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR codes table
CREATE TABLE public.qr_codes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code TEXT,
  form_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id TEXT REFERENCES qr_codes(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- QR codes policies
CREATE POLICY "Users can view own QR codes" ON public.qr_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own QR codes" ON public.qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own QR codes" ON public.qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Authentication Providers

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure Google OAuth (if needed):
   - Enable Google provider
   - Add your OAuth credentials
   - Set redirect URL to: `https://yourdomain.com/auth/callback`

### 3. URL Configuration

In Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
- **Redirect URLs**: 
  - `https://yourdomain.com/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

## API Routes

The following API routes have been created:

- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/oauth` - OAuth provider login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user
- `GET /auth/callback` - OAuth callback handler

## Production Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Ensure `NEXT_PUBLIC_SITE_URL` is set to your production domain
3. Update Supabase redirect URLs to match your production domain

### Other Platforms

1. Set the same environment variables
2. Ensure your domain is properly configured in Supabase
3. Update redirect URLs accordingly

## Testing

### Development

1. Run `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Test email/password login
4. Test Google OAuth (if configured)

### Production

1. Deploy your application
2. Test authentication on your production domain
3. Verify OAuth callbacks work correctly

## Troubleshooting

### Common Issues

1. **OAuth not working**: Check redirect URLs in Supabase dashboard
2. **Session not persisting**: Verify middleware configuration
3. **CORS errors**: Ensure proper domain configuration

### Debug Mode

Add logging to API routes for debugging:

```typescript
console.log('Authentication attempt:', { email, provider });
```

## Security Notes

- Never expose Supabase service role key in client-side code
- Use environment variables for all sensitive configuration
- Enable Row Level Security on all database tables
- Regularly rotate API keys

## Next Steps

- Implement password reset functionality
- Add email verification
- Set up user profile management
- Configure additional OAuth providers as needed