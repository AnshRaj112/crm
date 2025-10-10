import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = getSiteUrl(request)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      if (data.session) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
