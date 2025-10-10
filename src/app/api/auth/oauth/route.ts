import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (!provider || !['google', 'github', 'discord'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const origin = request.nextUrl.origin

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github' | 'discord',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: data.url })

  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
