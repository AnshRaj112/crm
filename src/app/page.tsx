'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads, Lead } from '../contexts/LeadsContext';
import Link from 'next/link';
import QRCodeGenerator from '../components/QRCodeGenerator';
import LeadSourceChart from '../components/LeadSourceChart';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const { user, signOut, loading } = useAuth();
  const { leads, stats, sourceStats, captureLinks, loading: leadsLoading, createLead, updateLeadStatus } = useLeads();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'create' | 'analytics' | 'qr-codes'>('dashboard');
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQRLeads, setShowQRLeads] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; title: string; leads: Lead[] } | null>(null);
  const [createLeadForm, setCreateLeadForm] = useState({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    lead_source: '',
    notes: ''
  });
  const [creatingLead, setCreatingLead] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');


  const getFirstName = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.full_name || '';
    return fullName.split(' ')[0] || 'User';
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  // Filter leads based on selected filters
  const filteredLeads = leads.filter(lead => {
    const matchesSource = !sourceFilter || 
      (sourceFilter === 'qr_link' && lead.source_type === 'qr_link') ||
      (sourceFilter === 'manual' && lead.source_type === 'manual') ||
      (lead.lead_source?.name?.toLowerCase().includes(sourceFilter.toLowerCase()));
    
    const matchesStatus = !statusFilter || 
      lead.status?.name?.toLowerCase() === statusFilter.toLowerCase() ||
      (!lead.status && statusFilter === 'new');
    
    return matchesSource && matchesStatus;
  });

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
            <p className="text-lg font-medium animate-pulse" style={{ color: 'var(--text-main)' }}>Loading NodoLeads...</p>
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

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <header className="shadow-sm" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--primary)' }}>NodoLeads</h1>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>by Exsolvia</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    color: 'var(--text-secondary)',
                    background: 'var(--border-light)',
                    border: '1px solid var(--border)'
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: 'white',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight" style={{ color: 'var(--text-main)' }}>
              Welcome to{' '}
              <span style={{ color: 'var(--primary)' }}>NodoLeads</span>
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
              The ultimate CRM solution by <strong>Exsolvia</strong>. Generate, track, and convert leads 
              with powerful QR codes, analytics, and automated workflows.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-4">
              <div className="p-4 sm:p-6 rounded-xl" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: 'var(--border-light)' }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>QR Code Generation</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Create unique QR codes and links for instant lead capture</p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-xl" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: 'var(--border-light)' }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Analytics Dashboard</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Track daily, weekly, monthly, and yearly lead performance</p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-xl sm:col-span-2 lg:col-span-1" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: 'var(--border-light)' }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Lead Management</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Organize leads by status, source, and engagement level</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 px-4">
              <Link
                href="/signup"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg inline-block transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                Start Your Free Trial
              </Link>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>No credit card required • 14-day free trial</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--primary)' }}>NodoLeads</h1>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>by Exsolvia</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm sm:text-base hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>Welcome, {getFirstName()}</span>
              <button
                onClick={() => signOut()}
                className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                style={{ 
                  color: 'var(--text-secondary)',
                  background: 'var(--border-light)',
                  border: '1px solid var(--border)'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="border-b overflow-x-auto" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent'
              }`}
              style={{ 
                color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'leads'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent'
              }`}
              style={{ 
                color: activeTab === 'leads' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              All Leads
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent'
              }`}
              style={{ 
                color: activeTab === 'create' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              Create Lead
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent'
              }`}
              style={{ 
                color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('qr-codes')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'qr-codes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent'
              }`}
              style={{ 
                color: activeTab === 'qr-codes' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              QR Codes
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="overflow-hidden rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                    Welcome, {getFirstName()}! 👋
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Here&apos;s your lead generation overview for today.
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg transition-transform duration-200 " style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>Daily Leads</dt>
                          <dd className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{stats.daily}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg transition-transform duration-200 " style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--info), #1d4ed8)' }}>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>Weekly Leads</dt>
                          <dd className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{stats.weekly}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg transition-transform duration-200 " style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>Monthly Leads</dt>
                          <dd className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{stats.monthly}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg transition-transform duration-200 " style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--secondary), #d97706)' }}>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>Yearly Leads</dt>
                          <dd className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{stats.yearly}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Sources and Recent Leads */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Sources Chart */}
                <div className="overflow-hidden rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium mb-4" style={{ color: 'var(--text-main)' }}>Lead Sources</h3>
                    <LeadSourceChart data={sourceStats} />
                  </div>
                </div>

                {/* Recent Leads */}
                <div className="overflow-hidden rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium mb-4" style={{ color: 'var(--text-main)' }}>Latest Leads</h3>
                    {leadsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="mt-2">No leads yet</p>
                          <p className="text-sm">Your recent leads will appear here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="border rounded-lg p-3 transition-colors duration-200" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium" style={{ color: 'var(--text-main)' }}>{lead.business_name}</h4>
                                {lead.contact_person && (
                                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{lead.contact_person}</p>
                                )}
                                {lead.email && (
                                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{lead.email}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  lead.status?.name === 'New' ? 'bg-green-100 text-green-800' :
                                  lead.status?.name === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                                  lead.status?.name === 'Interested' ? 'bg-yellow-100 text-yellow-800' :
                                  lead.status?.name === 'Declined' ? 'bg-red-100 text-red-800' :
                                  lead.status?.name === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                                  lead.status?.name === 'Converted' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lead.status?.name || 'New'}
                                </span>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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
              <div className="overflow-hidden rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium mb-4" style={{ color: 'var(--text-main)' }}>Generate Lead Form QR Code</h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Create a unique QR code and link for lead capture. Each QR code will generate leads specifically for you.
                  </p>
                  <button 
                    onClick={() => setShowQRGenerator(true)}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 "
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                      color: 'white',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    Generate QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col gap-4 mb-6">
                  <h3 className="text-lg leading-6 font-medium" style={{ color: 'var(--text-main)' }}>All Leads</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Filter by Source</label>
                      <select 
                        className="border rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        style={{ 
                          borderColor: 'var(--border)', 
                          background: 'var(--card-bg)',
                          color: 'var(--text-main)'
                        }}
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                      >
                        <option value="">All Sources</option>
                        <option value="qr_link">QR Code/Link</option>
                        <option value="manual">Manual Entry</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="google">Google</option>
                        <option value="referral">Referral</option>
                        <option value="website">Website</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Filter by Status</label>
                      <select 
                        className="border rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        style={{ 
                          borderColor: 'var(--border)', 
                          background: 'var(--card-bg)',
                          color: 'var(--text-main)'
                        }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="on_hold">On Hold</option>
                        <option value="declined">Declined</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end">
                      <button
                        onClick={() => {
                          setSourceFilter('');
                          setStatusFilter('');
                        }}
                        className="px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200"
                        style={{
                          background: 'var(--border-light)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)'
                        }}
                        disabled={!sourceFilter && !statusFilter}
                      >
                        Clear Filters
                      </button>
                    </div>
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
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No leads match your filters</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filter criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                      <thead style={{ background: 'var(--border-light)' }}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="transition-colors duration-200" style={{ background: 'var(--card-bg)' }}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{lead.business_name}</div>
                                {lead.capture_link && (
                                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>via {lead.capture_link.title}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                {lead.contact_person && (
                                  <div className="text-sm" style={{ color: 'var(--text-main)' }}>{lead.contact_person}</div>
                                )}
                                {lead.email && (
                                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{lead.email}</div>
                                )}
                                {lead.phone && (
                                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{lead.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                {lead.source_type === 'qr_link' ? (
                                  <div>
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-1">
                                      QR Code
                                    </span>
                                    {lead.capture_link && (
                                      <div className="text-xs text-gray-500">
                                        via {lead.capture_link.title}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                    {lead.lead_source?.name || 'Manual Entry'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={lead.status_id || 1}
                                onChange={(e) => updateLeadStatus(lead.id, parseInt(e.target.value))}
                                className={`text-xs font-medium rounded-full border-0 transition-colors duration-200 ${
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-muted)' }}>
                              {new Date(lead.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleViewLead(lead)}
                                className="font-medium transition-colors duration-200"
                                style={{ color: 'var(--primary)' }}
                              >
                                View
                              </button>
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
            <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium mb-4" style={{ color: 'var(--text-main)' }}>Create New Lead</h3>
                <form onSubmit={handleCreateLead} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Business Name *</label>
                    <input 
                      type="text" 
                      required
                      value={createLeadForm.business_name}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, business_name: e.target.value }))}
                      className="mt-1 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Contact Person</label>
                    <input 
                      type="text" 
                      value={createLeadForm.contact_person}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, contact_person: e.target.value }))}
                      className="mt-1 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <input 
                      type="email" 
                      value={createLeadForm.email}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                    <input 
                      type="tel" 
                      value={createLeadForm.phone}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Lead Source</label>
                    <select 
                      value={createLeadForm.lead_source}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, lead_source: e.target.value }))}
                      className="mt-1 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                      }}
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
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                    <textarea 
                      rows={3} 
                      value={createLeadForm.notes}
                      onChange={(e) => setCreateLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 resize-none"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                      }}
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={creatingLead}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      background: creatingLead ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                      color: 'white',
                      boxShadow: 'var(--shadow-lg)'
                    }}
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
              <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium mb-6" style={{ color: 'var(--text-main)' }}>Analytics Overview</h3>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="p-4 rounded-lg transition-transform duration-200 " style={{ background: 'var(--border-light)' }}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Leads</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{leads.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg transition-transform duration-200 " style={{ background: 'var(--border-light)' }}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--info), #1d4ed8)' }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Conversion Rate</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                            {leads.length > 0 ? ((leads.filter(l => l.status?.name === 'Converted').length / leads.length) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg transition-transform duration-200 " style={{ background: 'var(--border-light)' }}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)' }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Avg. Response Time</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>2.4 hrs</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg transition-transform duration-200 " style={{ background: 'var(--border-light)' }}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Active Sources</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{sourceStats.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Sources Chart */}
              <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium mb-4" style={{ color: 'var(--text-main)' }}>Lead Sources Distribution</h3>
                  <LeadSourceChart data={sourceStats} />
                </div>
              </div>

              {/* Lead Status Breakdown */}
              <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium mb-4" style={{ color: 'var(--text-main)' }}>Lead Status Breakdown</h3>
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
                        <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{status.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr-codes' && (
            <div className="space-y-6">
              {/* QR Codes Header */}
              <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg leading-6 font-medium mb-2" style={{ color: 'var(--text-main)' }}>Your QR Codes</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Manage and view all your created QR codes for lead capture</p>
                    </div>
                    <button 
                      onClick={() => setShowQRGenerator(true)}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200 "
                      style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        color: 'white',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      Create New QR Code
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Codes List */}
              <div className="rounded-lg" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="px-4 py-5 sm:p-6">
                  {leadsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : captureLinks.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No QR codes created yet</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first QR code to start capturing leads</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {captureLinks.map((link) => (
                        <div key={link.id} className="border rounded-lg p-4 transition-all duration-200 " style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium" style={{ color: 'var(--text-main)' }}>{link.title}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {link.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="mb-4 flex justify-center">
                            <div className="bg-white p-3 rounded-lg shadow-md">
                              <QRCodeSVG
                                value={link.public_link}
                                size={120}
                                level="M"
                                includeMargin={true}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>QR Code Link</label>
                              <div className="flex">
                                <input
                                  type="text"
                                  value={link.public_link}
                                  readOnly
                                  className="flex-1 px-2 py-1 border rounded-l-md text-xs"
                                  style={{ 
                                    borderColor: 'var(--border)', 
                                    background: 'var(--border-light)',
                                    color: 'var(--text-main)'
                                  }}
                                />
                                <button
                                  onClick={async () => {
                                    try {
                                      if (navigator.clipboard && window.isSecureContext) {
                                        await navigator.clipboard.writeText(link.public_link);
                                      } else {
                                        const textArea = document.createElement('textarea');
                                        textArea.value = link.public_link;
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
                                  className="px-2 py-1 text-xs rounded-r-md transition-colors duration-200"
                                  style={{ 
                                    background: 'var(--primary)',
                                    color: 'white'
                                  }}
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Created</label>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {new Date(link.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={() => window.open(link.public_link, '_blank')}
                                className="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200"
                                style={{ 
                                  background: 'var(--border-light)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border)'
                                }}
                              >
                                View Link
                              </button>
                              <button
                                onClick={() => {
                                  // Filter leads that came from this QR code
                                  const qrCodeLeads = leads.filter(lead => lead.capture_link?.id === link.id);
                                  setSelectedQRCode({
                                    id: link.id,
                                    title: link.title,
                                    leads: qrCodeLeads
                                  });
                                  setShowQRLeads(true);
                                }}
                                className="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200"
                                style={{ 
                                  background: 'var(--primary)',
                                  color: 'white'
                                }}
                              >
                                View Leads ({leads.filter(lead => lead.capture_link?.id === link.id).length})
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Lead Details</h3>
              <button
                onClick={() => setShowLeadDetails(false)}
                className="text-gray-400 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <p className="text-gray-900 font-medium">{selectedLead.business_name}</p>
              </div>

              {selectedLead.contact_person && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <p className="text-gray-900">{selectedLead.contact_person}</p>
                </div>
              )}

              {selectedLead.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">
                    <a href={`mailto:${selectedLead.email}`} className="text-indigo-600">
                      {selectedLead.email}
                    </a>
                  </p>
                </div>
              )}

              {selectedLead.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">
                    <a href={`tel:${selectedLead.phone}`} className="text-indigo-600">
                      {selectedLead.phone}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedLead.source_type === 'qr_link' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedLead.lead_source?.name || 'Unknown'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedLead.status?.name === 'New' ? 'bg-green-100 text-green-800' :
                  selectedLead.status?.name === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                  selectedLead.status?.name === 'Interested' ? 'bg-yellow-100 text-yellow-800' :
                  selectedLead.status?.name === 'On Hold' ? 'bg-red-100 text-red-800' :
                  selectedLead.status?.name === 'Declined' ? 'bg-gray-100 text-gray-800' :
                  selectedLead.status?.name === 'Converted' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedLead.status?.name || 'New'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="text-gray-900">{new Date(selectedLead.created_at).toLocaleDateString()}</p>
              </div>

              {selectedLead.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-gray-900">{new Date(selectedLead.updated_at).toLocaleDateString()}</p>
                </div>
              )}

              {selectedLead.capture_link && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capture Link</label>
                  <p className="text-gray-900">via {selectedLead.capture_link.title}</p>
                </div>
              )}

              {selectedLead.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowLeadDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Here you could add edit functionality
                  setShowLeadDetails(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md transition-colors duration-200"
              >
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <QRCodeGenerator onClose={() => setShowQRGenerator(false)} />
      )}

      {/* QR Code Leads Modal */}
      {showQRLeads && selectedQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Leads from "{selectedQRCode.title}"</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedQRCode.leads.length} lead{selectedQRCode.leads.length !== 1 ? 's' : ''} captured</p>
              </div>
              <button
                onClick={() => setShowQRLeads(false)}
                className="text-gray-400 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedQRCode.leads.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-2 text-gray-500">No leads captured yet</p>
                <p className="text-sm text-gray-400">Leads will appear here when people submit the form via this QR code</p>
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
                    {selectedQRCode.leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.business_name}</div>
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
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            QR Code
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={lead.status_id || 1}
                            onChange={(e) => updateLeadStatus(lead.id, parseInt(e.target.value))}
                            className={`text-xs font-medium rounded-full border-0 transition-colors duration-200 ${
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
                          <button 
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowQRLeads(false);
                              setShowLeadDetails(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowQRLeads(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
