'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

interface QRCodeData {
  id: string;
  user_id: string;
  qr_code: string;
  form_url: string;
  created_at: string;
}

export default function LeadForm() {
  const params = useParams();
  const router = useRouter();
  const qrId = params.qrId as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    source: '',
    email: '',
    contactNumber: '',
  });

  const sources = [
    'Facebook',
    'Instagram',
    'X (Twitter)',
    'LinkedIn',
    'YouTube',
    'Google',
    'Referral',
    'Other'
  ];

  useEffect(() => {
    fetchQRData();
  }, [qrId]);

  const fetchQRData = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrId)
        .single();

      if (error) {
        console.error('Error fetching QR data:', error);
        setError('Invalid QR code');
      } else {
        setQrData(data);
      }
    } catch (error) {
      console.error('Error fetching QR data:', error);
      setError('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrData) return;

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            user_id: qrData.user_id,
            qr_code_id: qrId,
            business_name: formData.businessName,
            email: formData.email,
            contact_number: formData.contactNumber,
            source: formData.source,
            status: 'new',
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error submitting lead:', error);
        setError('Failed to submit lead. Please try again.');
      } else {
        setSuccess(true);
        setFormData({
          businessName: '',
          source: '',
          email: '',
          contactNumber: '',
        });
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setError('Failed to submit lead. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Invalid QR Code</h1>
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
          <p className="text-white/80 mb-6">
            Your information has been submitted successfully. We&apos;ll be in touch soon!
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Submit Another Lead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-6">
            <h1 className="text-2xl font-bold text-white">NodoLeads</h1>
            <span className="ml-2 text-sm text-white/80">Lead Capture Form</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="auth-card max-w-md w-full p-8">
          <div className="text-center mb-8">
            <h2 className="auth-title">
              Get in Touch
            </h2>
            <p className="auth-subtitle mt-2">
              Please fill out the form below and we&apos;ll get back to you soon.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="businessName" className="form-label">
                Business Name *
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="form-input"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="source" className="form-label">
                How did you hear about us? *
              </label>
              <select
                id="source"
                name="source"
                required
                className="form-input"
                value={formData.source}
                onChange={handleInputChange}
              >
                <option value="">Select an option</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="form-label">
                Contact Number *
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                required
                className="form-input"
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="auth-button w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Lead'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-purple-600">NodoLeads</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
