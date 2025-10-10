"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('authenticating');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('authenticating');
        
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setTimeout(() => {
            router.push('/login?error=auth_failed');
          }, 2000);
          return;
        }

        if (data.session) {
          setStatus('success');
          // Get redirect path from URL params
          const redirectPath = searchParams.get('redirect') || '/dashboard';
          
          // Small delay to show success state
          setTimeout(() => {
            router.push(redirectPath);
          }, 1500);
        } else {
          setStatus('error');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Unexpected auth error:', error);
        setStatus('error');
        setTimeout(() => {
          router.push('/login?error=unexpected');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  const getStatusMessage = () => {
    switch (status) {
      case 'authenticating':
        return 'Authenticating with Google...';
      case 'success':
        return 'Successfully signed in! Redirecting...';
      case 'error':
        return 'Authentication failed. Redirecting to login...';
      default:
        return 'Processing...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'authenticating':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">NodoLeads</h2>
        <p className="text-gray-600">{getStatusMessage()}</p>
        {status === 'authenticating' && (
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we complete your sign in...
          </p>
        )}
      </div>
    </div>
  );
}
