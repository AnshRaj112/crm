'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface Lead {
  id: string;
  business_name: string;
  email: string;
  contact_number: string;
  source: string;
  status: string;
  notes?: string;
  created_at: string;
  qr_code_id?: string;
}

export default function LeadsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: '',
    leadType: '', // 'qr' or 'manual'
  });

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interested', label: 'Interested' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'declined', label: 'Declined' },
  ];

  const sources = [
    'All Sources',
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

  const leadTypes = [
    { value: '', label: 'All Leads' },
    { value: 'qr', label: 'From QR Code' },
    { value: 'manual', label: 'Manual Entry' },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchLeads();
  }, [user, router]);

  useEffect(() => {
    filterLeads();
  }, [leads, filters]);

  const fetchLeads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Filter by source
    if (filters.source && filters.source !== 'All Sources') {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    // Filter by lead type
    if (filters.leadType) {
      if (filters.leadType === 'qr') {
        filtered = filtered.filter(lead => lead.qr_code_id);
      } else if (filters.leadType === 'manual') {
        filtered = filtered.filter(lead => !lead.qr_code_id);
      }
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.business_name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.contact_number.includes(searchLower)
      );
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId);
    
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
      } else {
        setLeads(prev => prev.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'status-badge status-new';
      case 'contacted':
        return 'status-badge status-contacted';
      case 'interested':
        return 'status-badge status-interested';
      case 'on-hold':
        return 'status-badge status-on-hold';
      case 'declined':
        return 'status-badge status-declined';
      default:
        return 'status-badge status-new';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
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
              <span className="ml-2 text-sm text-gray-500">All Leads</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/create-lead" className="nav-link">
                Create Lead
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              All Leads ({filteredLeads.length})
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all your leads
            </p>
          </div>
          <Link href="/create-lead" className="btn-primary">
            Add New Lead
          </Link>
        </div>

        {/* Filters */}
        <div className="dashboard-card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Source</label>
              <select
                className="form-input"
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Lead Type</label>
              <select
                className="form-input"
                value={filters.leadType}
                onChange={(e) => handleFilterChange('leadType', e.target.value)}
              >
                {leadTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', source: '', search: '', leadType: '' })}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
          </div>
          
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No leads found
              </h3>
              <p className="text-gray-600 mb-6">
                {leads.length === 0 
                  ? "You don't have any leads yet. Create your first lead or generate a QR code!"
                  : "Try adjusting your filters to see more leads."
                }
              </p>
              {leads.length === 0 && (
                <div className="flex justify-center space-x-4">
                  <Link href="/create-lead" className="btn-primary">
                    Create Lead
                  </Link>
                  <Link href="/qr-generator" className="btn-secondary">
                    Generate QR Code
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Contact</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.business_name}
                          </div>
                          {lead.notes && (
                            <div className="text-sm text-gray-500 mt-1">
                              {lead.notes.length > 50 
                                ? `${lead.notes.substring(0, 50)}...` 
                                : lead.notes
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="text-gray-900">{lead.email}</div>
                          <div className="text-sm text-gray-500">{lead.contact_number}</div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {lead.source}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`${getStatusBadgeClass(lead.status)} text-xs cursor-pointer`}
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          disabled={updatingStatus === lead.id}
                        >
                          {statuses.filter(s => s.value).map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          lead.qr_code_id 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {lead.qr_code_id ? 'QR Code' : 'Manual'}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Email
                          </a>
                          <a
                            href={`tel:${lead.contact_number}`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Call
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
