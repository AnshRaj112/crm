import { supabase } from './supabase'

export const handleGoogleAuth = async (redirectPath: string = '/dashboard') => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('OAuth error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

export const handleAuthCallback = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Callback error:', error)
    throw error
  }
}
