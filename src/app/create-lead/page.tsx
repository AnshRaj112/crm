'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

export default function CreateLead() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    contactNumber: '',
    source: 'Manual Entry',
    status: 'new',
    notes: '',
  });

  const statuses = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interested', label: 'Interested' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'declined', label: 'Declined' },
  ];

  const sources = [
    'Manual Entry',
    'Facebook',
    'Instagram',
    'X (Twitter)',
    'LinkedIn',
    'YouTube',
    'Google',
    'Referral',
    'Phone Call',
    'Email',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            user_id: user.id,
            business_name: formData.businessName,
            email: formData.email,
            contact_number: formData.contactNumber,
            source: formData.source,
            status: formData.status,
            notes: formData.notes || null,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error creating lead:', error);
        setError('Failed to create lead. Please try again.');
      } else {
        setSuccess(true);
        setFormData({
          businessName: '',
          email: '',
          contactNumber: '',
          source: 'Manual Entry',
          status: 'new',
          notes: '',
        });
        // Redirect to leads page after 2 seconds
        setTimeout(() => {
          router.push('/leads');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      setError('Failed to create lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    router.push('/login');
    return null;
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
              <span className="ml-2 text-sm text-gray-500">Create Lead</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/leads" className="nav-link">
                All Leads
              </Link>
              <Link href="/qr-generator" className="nav-link">
                QR Generator
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Lead
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new lead manually to your database
          </p>
        </div>

        {/* Form */}
        <div className="dashboard-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="Enter business name"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
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
                  placeholder="Enter email address"
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
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="source" className="form-label">
                  Lead Source *
                </label>
                <select
                  id="source"
                  name="source"
                  required
                  className="form-input"
                  value={formData.source}
                  onChange={handleInputChange}
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="form-label">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="form-input"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="form-input"
                placeholder="Add any additional notes about this lead..."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            {success && (
              <div className="success-message">
                Lead created successfully! Redirecting to leads page...
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                href="/leads"
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating Lead...' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lead Status Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="status-badge status-new mx-auto mb-2">New</div>
              <p className="text-sm text-gray-600">Recently added lead</p>
            </div>
            <div className="text-center">
              <div className="status-badge status-contacted mx-auto mb-2">Contacted</div>
              <p className="text-sm text-gray-600">Initial contact made</p>
            </div>
            <div className="text-center">
              <div className="status-badge status-interested mx-auto mb-2">Interested</div>
              <p className="text-sm text-gray-600">Lead is interested</p>
            </div>
            <div className="text-center">
              <div className="status-badge status-on-hold mx-auto mb-2">On Hold</div>
              <p className="text-sm text-gray-600">Follow up later</p>
            </div>
            <div className="text-center">
              <div className="status-badge status-declined mx-auto mb-2">Declined</div>
              <p className="text-sm text-gray-600">Lead declined</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
