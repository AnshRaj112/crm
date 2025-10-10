import { createClient } from '@/lib/supabase'

export interface AuthError {
  message: string
  status?: number
}

export interface AuthResponse {
  user?: any
  session?: any
  error?: AuthError
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: { message: data.error || 'Authentication failed', status: response.status } }
    }

    return {
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return { error: { message: 'Internal server error', status: 500 } }
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: { message: data.error || 'Signup failed', status: response.status } }
    }

    return {
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return { error: { message: 'Internal server error', status: 500 } }
  }
}

export async function signInWithGoogle(next?: string): Promise<{ url?: string; error?: AuthError }> {
  try {
    const response = await fetch('/api/auth/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        next: next || '/dashboard',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: { message: data.error || 'OAuth failed', status: response.status } }
    }

    return { url: data.url }
  } catch (error) {
    console.error('Google sign in error:', error)
    return { error: { message: 'Internal server error', status: 500 } }
  }
}

export async function signOut(): Promise<{ error?: AuthError }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: error.message, status: 400 } }
    }

    return {}
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: { message: 'Internal server error', status: 500 } }
  }
}
