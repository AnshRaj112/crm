'use client';

import { useState } from 'react';
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
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<LeadCaptureLink | null>(null);
  const [error, setError] = useState('');

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
        description: description.trim() || undefined,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Conference Lead Capture"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional description for your lead capture form"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
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
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={generatedLink.public_link}
                  size={200}
                  level="M"
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
                  onClick={() => navigator.clipboard.writeText(generatedLink.public_link)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setGeneratedLink(null);
                setTitle('');
                setDescription('');
              }}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Generate Another QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
