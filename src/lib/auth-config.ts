export function getAuthConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  }
  
  // Production
  return {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  }
}
