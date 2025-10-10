# Custom Domain Setup for NodoLeads

## Complete Solution to Hide Supabase URLs

While the current implementation improves the user experience, the most effective way to completely hide Supabase URLs is to use a custom domain. Here's how to set it up:

## Option 1: Supabase Custom Domain (Recommended)

### 1. Set up Custom Domain in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Custom Domains**
3. Add your custom domain (e.g., `auth.yourdomain.com`)
4. Follow the DNS configuration instructions

### 2. Update Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Credentials** → **OAuth 2.0 Client ID**
3. Update authorized redirect URIs to:
   - `https://auth.yourdomain.com/auth/v1/callback` (production)
   - `http://localhost:3001/auth/callback` (development)

### 3. Update Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://auth.yourdomain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Option 2: Proxy Setup (Alternative)

If you can't use Supabase custom domains, you can set up a proxy:

### 1. Create a Proxy Endpoint

Create a new API route in your Next.js app:

```typescript
// pages/api/auth/[...supabase].ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to your app
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

## Option 3: Branded OAuth Flow (Current Implementation)

The current implementation already provides:

### ✅ **Improvements Made**

1. **Custom Callback Page**: Users see `localhost:3001/auth/callback` instead of Supabase URL
2. **Professional Loading Screen**: Branded loading experience with NodoLeads branding
3. **Status Indicators**: Clear feedback during authentication process
4. **Error Handling**: Graceful error handling with user-friendly messages
5. **Redirect Flexibility**: Support for custom redirect paths

### 🎯 **What Users See Now**

1. **Google OAuth Page**: Still shows "continue to aydegzohmktcrqodmhyp.supabase.co" (this is unavoidable without custom domain)
2. **Callback Page**: Shows branded NodoLeads loading screen at `localhost:3001/auth/callback`
3. **Dashboard**: Seamless redirect to dashboard after authentication

## Current Limitations

The Supabase URL visibility in the Google OAuth page is a limitation of how Google OAuth works with Supabase. The URL `aydegzohmktcrqodmhyp.supabase.co` will always be visible during the OAuth flow because:

1. **Google OAuth Security**: Google requires the redirect URI to match exactly what's configured
2. **Supabase Architecture**: Supabase handles the OAuth flow through their infrastructure
3. **Domain Validation**: Google validates the domain ownership and redirect URI

## Best Practices for Production

### 1. Use Custom Domain
- Set up `auth.yourdomain.com` in Supabase
- Update all OAuth configurations
- This completely hides Supabase branding

### 2. Branded Experience
- The current implementation provides a professional callback experience
- Users see your branding during the authentication process
- Clear status indicators and error handling

### 3. User Education
- Add a note in your app: "Sign in with Google - secure authentication powered by industry standards"
- Users understand this is a secure, standard authentication flow

## Testing the Current Implementation

1. **Try Google Sign In**: Click "Sign in with Google"
2. **Notice the Flow**:
   - Google OAuth page (shows Supabase URL briefly)
   - Custom callback page (shows NodoLeads branding)
   - Dashboard redirect (seamless experience)

3. **User Experience**: The Supabase URL is only visible for a few seconds during the OAuth flow

## Conclusion

While the Supabase URL is still visible in the Google OAuth page, the current implementation provides:

- ✅ Professional callback experience
- ✅ Branded loading screens
- ✅ Clear status indicators
- ✅ Error handling
- ✅ Seamless user flow

For complete URL hiding, implement Option 1 (Custom Domain) in production.
