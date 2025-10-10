import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { provider, next } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github' | 'facebook' | 'twitter' | 'discord' | 'twitch' | 'spotify' | 'linkedin',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/auth/callback?next=${encodeURIComponent(next || '/dashboard')}`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      url: data.url,
    })
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
