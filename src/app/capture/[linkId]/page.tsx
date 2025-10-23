'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

interface LeadCaptureLink {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  is_active: boolean;
}

export default function LeadCapturePage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const [linkData, setLinkData] = useState<LeadCaptureLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    lead_source: '',
    notes: ''
  });

  const fetchLinkData = useCallback(async () => {
    if (!supabase) {
      setError('Service not available');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lead_capture_links')
        .select('*')
        .eq('id', linkId)
        .eq('is_active', true)
        .single();

      if (error) {
        setError('Invalid or inactive link');
      } else {
        setLinkData(data);
      }
    } catch {
      setError('Failed to load form');
    } finally {
      setLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    if (linkId) {
      fetchLinkData();
    }
  }, [linkId, fetchLinkData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!supabase || !linkData) {
      setError('Service not available');
      setSubmitting(false);
      return;
    }

    try {
      // First get the lead source ID
      let leadSourceId = null;
      if (formData.lead_source) {
        const { data: sourceData } = await supabase
          .from('lead_sources')
          .select('id')
          .eq('name', formData.lead_source)
          .single();
        
        leadSourceId = sourceData?.id;
      }

      const { error } = await supabase
        .from('leads')
        .insert({
          user_id: linkData.user_id,
          capture_link_id: linkData.id,
          business_name: formData.business_name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          lead_source_id: leadSourceId,
          source_type: 'qr_link',
          notes: formData.notes
        });

      if (error) {
        setError('Failed to submit form. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          {/* Animated Logo */}
          <div className="mb-8">
            <div className="relative">
              <div className="animate-pulse">
                <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>NodoLeads</h1>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>by Exsolvia</span>
              </div>
              {/* Floating particles animation */}
              <div className="absolute -top-4 -right-4 w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0s' }}></div>
              <div className="absolute -top-2 -right-8 w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--secondary)', animationDelay: '0.5s' }}></div>
              <div className="absolute -top-6 -right-2 w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--success)', animationDelay: '1s' }}></div>
            </div>
          </div>
          
          {/* Enhanced Loading Spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto relative">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 opacity-20" style={{ borderColor: 'var(--border)' }}></div>
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: 'var(--primary)', borderRightColor: 'var(--primary)' }}></div>
              {/* Inner pulsing dot */}
              <div className="absolute inset-2 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}></div>
            </div>
          </div>
          
          {/* Loading text with typewriter effect */}
          <div className="space-y-2">
            <p className="text-lg font-medium animate-pulse" style={{ color: 'var(--text-main)' }}>Loading form...</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0s' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
              <div className="h-full rounded-full animate-pulse" style={{ 
                background: 'linear-gradient(90deg, var(--primary), var(--primary-dark), var(--secondary))',
                width: '100%',
                animation: 'loading-progress 2s ease-in-out infinite'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="max-w-md w-full rounded-lg p-6 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Form Not Available</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="max-w-md w-full rounded-lg p-6 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Thank You!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your information has been submitted successfully. We&apos;ll be in touch soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-md mx-auto">
        <div className="rounded-lg p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>NodoLeads</h1>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>{linkData?.title}</h2>
            {linkData?.description && (
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{linkData.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-md" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)' }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="business_name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Contact Person
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="lead_source" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                How did you hear about us?
              </label>
              <select
                id="lead_source"
                name="lead_source"
                value={formData.lead_source}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="">Select an option</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="X (Twitter)">X (Twitter)</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="Google">Google Search</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Additional Information
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 resize-none"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
                placeholder="Tell us about your business or any specific needs..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ 
                background: submitting ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Information'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
