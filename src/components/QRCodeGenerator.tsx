'use client';

import { useState, useEffect } from 'react';
import { useLeads, LeadCaptureLink } from '../contexts/LeadsContext';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  onClose: () => void;
}

export default function QRCodeGenerator({ onClose }: QRCodeGeneratorProps) {
  const { createCaptureLink } = useLeads();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<LeadCaptureLink | null>(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for your QR code');
      return;
    }

    if (!user) {
      setError('You must be logged in to generate QR codes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error, data } = await createCaptureLink({
        user_id: user.id,
        title: title.trim(),
        is_active: true
      });

      if (error) {
        setError('Failed to generate QR code. Please try again.');
      } else if (data) {
        setGeneratedLink(data);
      }
    } catch {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-4 sm:p-6 w-full mx-4 ${isMobile ? 'max-w-sm' : 'max-w-md'} max-h-[90vh] overflow-y-auto`} style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-xl)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Generate QR Code</h3>
          <button
            onClick={onClose}
            className="transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none text-base transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
                placeholder="e.g., Conference Lead Capture"
                required
                autoComplete="off"
              />
            </div>


            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border rounded-md touch-manipulation text-base transition-all duration-200"
                style={{ 
                  borderColor: 'var(--border)', 
                  color: 'var(--text-secondary)',
                  background: 'var(--card-bg)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                    className="flex-1 px-4 py-3 rounded-md disabled:opacity-50 touch-manipulation text-base transition-all duration-200"
                style={{ 
                  background: loading ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{generatedLink.title}</h4>
              <p className="text-sm text-gray-600">Scan this QR code to access the lead capture form</p>
            </div>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={generatedLink.public_link}
                  size={isMobile ? 150 : 200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direct Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={generatedLink.public_link}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                />
                <button
                  onClick={async () => {
                    try {
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(generatedLink.public_link);
                      } else {
                        // Fallback for older browsers or non-secure contexts
                        const textArea = document.createElement('textarea');
                        textArea.value = generatedLink.public_link;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                      }
                    } catch (err) {
                      console.error('Failed to copy: ', err);
                    }
                  }}
                       className="px-3 py-2 bg-indigo-600 text-white rounded-r-md text-sm touch-manipulation"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setGeneratedLink(null);
                setTitle('');
              }}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md touch-manipulation text-base"
            >
              Generate Another QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
