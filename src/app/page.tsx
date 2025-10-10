'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../contexts/LeadsContext';
import Link from 'next/link';
import QRCodeGenerator from '../components/QRCodeGenerator';
import LeadSourceChart from '../components/LeadSourceChart';

export default function Home() {
  const { user, signOut, loading } = useAuth();
  const { leads, stats, sourceStats, loading: leadsLoading, createLead, updateLeadStatus } = useLeads();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'create' | 'analytics'>('dashboard');
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [createLeadForm, setCreateLeadForm] = useState({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    lead_source: '',
    notes: ''
  });
  const [creatingLead, setCreatingLead] = useState(false);

  const getDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email || 'User';
  };

  const getFirstName = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.full_name || '';
    return fullName.split(' ')[0] || 'User';
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreatingLead(true);
    try {
      const { error } = await createLead({
        user_id: user.id,
        business_name: createLeadForm.business_name,
        contact_person: createLeadForm.contact_person || undefined,
        email: createLeadForm.email || undefined,
        phone: createLeadForm.phone || undefined,
        lead_source_id: createLeadForm.lead_source ? parseInt(createLeadForm.lead_source) : undefined,
        source_type: 'manual',
        notes: createLeadForm.notes || undefined
      });

      if (!error) {
        setCreateLeadForm({
          business_name: '',
          contact_person: '',
          email: '',
          phone: '',
          lead_source: '',
          notes: ''
        });
        setActiveTab('leads');
      }
    } catch (err) {
      console.error('Error creating lead:', err);
    } finally {
      setCreatingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NodoLeads...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">NodoLeads</h1>
                <span className="ml-2 text-sm text-gray-500">by Exsolvia</span>
          </div>
              <div className="flex space-x-4">
            <Link
              href="/login"
                  className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
                  Get Started
            </Link>
          </div>
        </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-indigo-600">NodoLeads</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate CRM solution by <strong>Exsolvia</strong>. Generate, track, and convert leads 
              with powerful QR codes, analytics, and automated workflows.
            </p>
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">QR Code Generation</h3>
                <p className="text-gray-600">Create unique QR codes and links for instant lead capture</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Track daily, weekly, monthly, and yearly lead performance</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Lead Management</h3>
                <p className="text-gray-600">Organize leads by status, source, and engagement level</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 font-semibold text-lg inline-block"
              >
                Start Your Free Trial
              </Link>
              <p className="text-sm text-gray-500">No credit card required • 14-day free trial</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">NodoLeads</h1>
              <span className="ml-2 text-sm text-gray-500">by Exsolvia</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {getFirstName()}</span>
              <button
                onClick={() => signOut()}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

            {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Leads
            </button>
                  <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Lead
                  </button>
                  <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome, {getFirstName()}! 👋
                  </h2>
                  <p className="text-gray-600">
                    Here's your lead generation overview for today.
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Daily Leads</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.daily}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Weekly Leads</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.weekly}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Monthly Leads</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.monthly}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Yearly Leads</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.yearly}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Sources and Recent Leads */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Sources Chart */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Lead Sources</h3>
                    <LeadSourceChart data={sourceStats} />
                  </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Latest Leads</h3>
                    {leadsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="mt-2">No leads yet</p>
                          <p className="text-sm">Your recent leads will appear here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{lead.business_name}</h4>
                                {lead.contact_person && (
                                  <p className="text-sm text-gray-600">{lead.contact_person}</p>
                                )}
                                {lead.email && (
                                  <p className="text-sm text-gray-500">{lead.email}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  lead.status?.name === 'New' ? 'bg-green-100 text-green-800' :
                                  lead.status?.name === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                                  lead.status?.name === 'Interested' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lead.status?.name || 'New'}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* QR Code Generation */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Generate Lead Form QR Code</h3>
                  <p className="text-gray-600 mb-4">
                    Create a unique QR code and link for lead capture. Each QR code will generate leads specifically for you.
                  </p>
                  <button 
                    onClick={() => setShowQRGenerator(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Generate QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">All Leads</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                      <option value="">All Sources</option>
                      <option value="qr_link">QR Code/Link</option>
                      <option value="manual">Manual Entry</option>
                    </select>
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="on_hold">On Hold</option>
                      <option value="declined">Declined</option>
                      <option value="converted">Converted</option>
                    </select>
                  </div>
                </div>

                {leadsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No leads found</p>
                    <p className="text-sm text-gray-400">Start by creating your first QR code or adding a lead manually</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{lead.business_name}</div>
                                {lead.capture_link && (
                                  <div className="text-xs text-gray-500">via {lead.capture_link.title}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                {lead.contact_person && (
                                  <div className="text-sm text-gray-900">{lead.contact_person}</div>
                                )}
                                {lead.email && (
                                  <div className="text-sm text-gray-500">{lead.email}</div>
                                )}
                                {lead.phone && (
                                  <div className="text-sm text-gray-500">{lead.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                lead.source_type === 'qr_link' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {lead.lead_source?.name || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={lead.status_id || 1}
                                onChange={(e) => updateLeadStatus(lead.id, parseInt(e.target.value))}
                                className={`text-xs font-medium rounded-full border-0 ${
                                  lead.status?.name === 'New' ? 'bg-green-100 text-green-800' :
                                  lead.status?.name === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                                  lead.status?.name === 'Interested' ? 'bg-yellow-100 text-yellow-800' :
                                  lead.status?.name === 'On Hold' ? 'bg-red-100 text-red-800' :
                                  lead.status?.name === 'Declined' ? 'bg-gray-100 text-gray-800' :
                                  lead.status?.name === 'Converted' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <option value={1}>New</option>
                                <option value={2}>Contacted</option>
                                <option value={3}>Interested</option>
                                <option value={4}>On Hold</option>
                                <option value={5}>Declined</option>
                                <option value={6}>Converted</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Lead</h3>
                <form onSubmit={handleCreateLead} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                    <input 
                      type="text" 
                      required
                      value={createLeadForm.business_name}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, business_name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <input 
                      type="text" 
                      value={createLeadForm.contact_person}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, contact_person: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      value={createLeadForm.email}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input 
                      type="tel" 
                      value={createLeadForm.phone}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                    <select 
                      value={createLeadForm.lead_source}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, lead_source: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select source</option>
                      <option value="1">Facebook</option>
                      <option value="2">Instagram</option>
                      <option value="3">X (Twitter)</option>
                      <option value="4">LinkedIn</option>
                      <option value="5">YouTube</option>
                      <option value="6">Google</option>
                      <option value="7">Referral</option>
                      <option value="8">Website</option>
                      <option value="9">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea 
                      rows={3} 
                      value={createLeadForm.notes}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={creatingLead}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                  >
                    {creatingLead ? 'Creating...' : 'Create Lead'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Analytics Overview</h3>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Total Leads</p>
                          <p className="text-lg font-semibold text-gray-900">{leads.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {leads.length > 0 ? ((leads.filter(l => l.status?.name === 'Converted').length / leads.length) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                          <p className="text-lg font-semibold text-gray-900">2.4 hrs</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Active Sources</p>
                          <p className="text-lg font-semibold text-gray-900">{sourceStats.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Sources Chart */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Lead Sources Distribution</h3>
                  <LeadSourceChart data={sourceStats} />
                </div>
              </div>

              {/* Lead Status Breakdown */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Lead Status Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      { name: 'New', color: 'bg-green-100 text-green-800', count: leads.filter(l => l.status?.name === 'New' || !l.status).length },
                      { name: 'Contacted', color: 'bg-blue-100 text-blue-800', count: leads.filter(l => l.status?.name === 'Contacted').length },
                      { name: 'Interested', color: 'bg-yellow-100 text-yellow-800', count: leads.filter(l => l.status?.name === 'Interested').length },
                      { name: 'On Hold', color: 'bg-red-100 text-red-800', count: leads.filter(l => l.status?.name === 'On Hold').length },
                      { name: 'Declined', color: 'bg-gray-100 text-gray-800', count: leads.filter(l => l.status?.name === 'Declined').length },
                      { name: 'Converted', color: 'bg-purple-100 text-purple-800', count: leads.filter(l => l.status?.name === 'Converted').length }
                    ].map((status) => (
                      <div key={status.name} className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          {status.name}
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{status.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <QRCodeGenerator onClose={() => setShowQRGenerator(false)} />
      )}
    </div>
  );
}
