# Authentication Setup Guide

This document outlines the complete authentication system setup for your CRM application with Google OAuth and proper production URL handling.

## Features Implemented

### ✅ Google OAuth Integration
- Google Sign-In/Sign-Up buttons on both login and signup pages
- Proper OAuth callback handling with error management
- Automatic redirect to dashboard after successful authentication

### ✅ Production URL Handling
- Dynamic site URL detection using `getSiteUrl()` utility
- Proper redirect URLs for OAuth callbacks
- Support for Vercel deployment and custom domains
- Environment-based URL configuration

### ✅ Enhanced Authentication Routes
- Updated login/signup API routes with proper cookie handling
- OAuth initiation and callback routes
- Improved logout with redirect handling
- Consistent error handling across all auth endpoints

### ✅ Security Improvements
- HTTP-only cookies for session management
- Secure cookie settings for production
- Proper session token management
- CSRF protection through Supabase SSR

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (for production)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: For Vercel deployment
VERCEL_URL=your-vercel-app-url.vercel.app
```

## Supabase Configuration

### 1. Enable Google OAuth Provider

1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Set redirect URL to: `https://your-domain.com/api/auth/callback`

### 2. Configure Site URL

In Supabase dashboard:
1. Go to Authentication > URL Configuration
2. Set Site URL to your production domain
3. Add redirect URLs for development and production

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── callback/route.ts      # OAuth callback handler
│   │       ├── login/route.ts         # Email login
│   │       ├── logout/route.ts        # Logout with redirect
│   │       ├── oauth/route.ts         # OAuth initiation
│   │       └── signup/route.ts        # Email signup
│   ├── auth/
│   │   └── auth-code-error/page.tsx   # OAuth error page
│   ├── login/page.tsx                 # Login page with Google OAuth
│   └── signup/page.tsx                # Signup page with Google OAuth
├── lib/
│   ├── auth-utils.ts                  # Authentication utilities
│   ├── site-url.ts                    # URL handling utility
│   ├── supabase.ts                    # Client-side Supabase
│   └── supabase-server.ts             # Server-side Supabase
└── middleware.ts                       # Auth middleware
```

## Usage Examples

### Client-Side Authentication

```typescript
import { signInWithEmail, signInWithGoogle, signOut } from '@/lib/auth-utils'

// Email login
const result = await signInWithEmail(email, password)

// Google OAuth
const result = await signInWithGoogle('/dashboard')

// Logout
await signOut()
```

### Server-Side Authentication

```typescript
import { createClient } from '@/lib/supabase-server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

## Deployment Checklist

### Before Deploying to Production:

1. ✅ Set `NEXT_PUBLIC_SITE_URL` environment variable
2. ✅ Configure Google OAuth in Supabase dashboard
3. ✅ Update Supabase Site URL configuration
4. ✅ Test OAuth flow in staging environment
5. ✅ Verify redirect URLs work correctly

### Environment-Specific URLs:

- **Development**: `http://localhost:3000`
- **Staging**: `https://your-staging-domain.com`
- **Production**: `https://your-production-domain.com`

## Troubleshooting

### Common Issues:

1. **OAuth redirects to localhost in production**
   - Ensure `NEXT_PUBLIC_SITE_URL` is set correctly
   - Check Supabase redirect URL configuration

2. **Google OAuth not working**
   - Verify Google OAuth credentials in Supabase
   - Check if Google Console has correct redirect URIs

3. **Session not persisting**
   - Check cookie settings in auth routes
   - Verify middleware configuration

### Debug Mode:

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

- All authentication cookies are HTTP-only and secure in production
- OAuth state parameters are handled by Supabase
- CSRF protection through Supabase SSR middleware
- Session tokens are properly managed and refreshed

## Next Steps

Consider implementing:
- Password reset functionality
- Email verification
- Multi-factor authentication
- Role-based access control
- Session management dashboard
