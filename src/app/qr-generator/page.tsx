'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface QRCodeData {
  id: string;
  user_id: string;
  qr_code: string;
  form_url: string;
  created_at: string;
}

export default function QRGenerator() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchQRCodes();
  }, [user, router]);

  const fetchQRCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching QR codes:', error);
      } else {
        setQrCodes(data || []);
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      // Generate a unique QR code ID
      const qrCodeId = `qr_${user.id}_${Date.now()}`;
      const formUrl = `${window.location.origin}/lead-form/${qrCodeId}`;

      // Save QR code to database
      const { data, error } = await supabase
        .from('qr_codes')
        .insert([
          {
            id: qrCodeId,
            user_id: user.id,
            qr_code: formUrl,
            form_url: formUrl,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating QR code:', error);
      } else {
        setQrCodes([data, ...qrCodes]);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQRCode = (qrCodeUrl: string, filename: string) => {
    const canvas = document.querySelector(`canvas[data-qr="${qrCodeUrl}"]`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                NodoLeads
              </Link>
              <span className="ml-2 text-sm text-gray-500">QR Generator</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/leads" className="nav-link">
                All Leads
              </Link>
              <Link href="/create-lead" className="nav-link">
                Create Lead
              </Link>
              <button
                onClick={() => signOut().then(() => router.push('/'))}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Generate unique QR codes for lead capture forms
          </p>
        </div>

        {/* Generate New QR Code */}
        <div className="dashboard-card mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Generate New QR Code
            </h3>
            <p className="text-gray-600 mb-6">
              Create a unique QR code that links to your lead capture form
            </p>
            <button
              onClick={generateQRCode}
              disabled={generating}
              className="btn-primary"
            >
              {generating ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </div>

        {/* QR Codes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="qr-container">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                QR Code #
                {qrCode.id.split('_').pop()}
              </h4>
              
              {/* QR Code Display */}
              <div className="qr-code">
                <QRCode
                  value={qrCode.form_url}
                  size={200}
                  data-qr={qrCode.form_url}
                />
              </div>

              {/* QR Code Info */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="form-label">Form URL:</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={qrCode.form_url}
                      readOnly
                      className="form-input text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(qrCode.form_url)}
                      className="ml-2 btn-secondary text-xs px-3 py-2"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadQRCode(qrCode.form_url, `qr-code-${qrCode.id}.png`)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={() => window.open(qrCode.form_url, '_blank')}
                    className="btn-primary flex-1 text-sm"
                  >
                    Preview Form
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Created: {new Date(qrCode.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {qrCodes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No QR codes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first QR code to start capturing leads
            </p>
            <button
              onClick={generateQRCode}
              disabled={generating}
              className="btn-primary"
            >
              {generating ? 'Generating...' : 'Generate Your First QR Code'}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 dashboard-card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How to Use Your QR Codes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Generate QR Code</h4>
              <p className="text-gray-600 text-sm">
                Click the generate button to create a unique QR code for your lead form
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Share QR Code</h4>
              <p className="text-gray-600 text-sm">
                Download and share your QR code on social media, business cards, or flyers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Capture Leads</h4>
              <p className="text-gray-600 text-sm">
                When someone scans your QR code, they&apos;ll fill out a form and you&apos;ll receive the lead
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
