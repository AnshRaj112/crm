"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft,
  Download,
  Copy,
  Link as LinkIcon,
  Check
} from "lucide-react";

export default function QRGeneratorPage() {
  const [user, setUser] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const generateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setCreating(true);

    try {
      // Create a new lead form
      const { data: formData, error: formError } = await supabase
        .from('lead_forms')
        .insert({
          user_id: user.id,
          name: formName,
        })
        .select()
        .single();

      if (formError) {
        console.error('Error creating form:', formError);
        // If table doesn't exist, show user-friendly message
        if (formError.code === 'PGRST116' || formError.message?.includes('relation "lead_forms" does not exist')) {
          alert('Database tables not set up yet. Please run the database setup SQL commands from the README file.');
        } else {
          alert('Error creating form. Please try again.');
        }
        return;
      }

      // Generate the URL for this form
      const baseUrl = window.location.origin;
      const formUrl = `${baseUrl}/form/${formData.id}`;
      setGeneratedUrl(formUrl);

    } catch (error) {
      console.error('Unexpected error creating form:', error);
      alert('Unexpected error creating form. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `${formName.replace(/\s+/g, '-')}-qr-code.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                NodoLeads
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Generate Lead Form QR Code</h1>
          <p className="text-gray-600 mt-2">
            Create a QR code and link for your lead capture form
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Creation */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Form</h2>
            
            <form onSubmit={generateQR} className="space-y-4">
              <div>
                <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-2">
                  Form Name
                </label>
                <input
                  type="text"
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Website Contact Form"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={creating || !formName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating Form..." : "Generate QR Code"}
              </button>
            </form>

            {generatedUrl && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-sm font-medium text-green-800 mb-2">Form Created Successfully!</h3>
                <p className="text-sm text-green-700">
                  Your lead capture form is now ready. Share the QR code or link below.
                </p>
              </div>
            )}
          </div>

          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code</h2>
            
            {generatedUrl ? (
              <div className="text-center">
                <div id="qr-code" className="flex justify-center mb-4">
                  <QRCodeSVG
                    value={generatedUrl}
                    size={200}
                    level="M"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form URL
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={generatedUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm text-black"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={downloadQR}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                    
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <LinkIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Create a form to generate your QR code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use Your QR Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-1">Download & Print</h4>
              <p className="text-sm text-blue-700">Download your QR code and add it to your marketing materials</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-1">Share Everywhere</h4>
              <p className="text-sm text-blue-700">Use the QR code on business cards, flyers, social media, and websites</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-1">Collect Leads</h4>
              <p className="text-sm text-blue-700">When people scan your QR code, they'll fill out your form and become leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}