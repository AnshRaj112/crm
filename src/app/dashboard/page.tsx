'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface LeadStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

interface LeadSource {
  source: string;
  count: number;
}

interface RecentLead {
  id: string;
  business_name: string;
  email: string;
  contact_number: string;
  source: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leadStats, setLeadStats] = useState<LeadStats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0
  });
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch lead statistics
      const { data: stats } = await supabase
        .from('leads')
        .select('created_at')
        .eq('user_id', user.id);

      if (stats) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

        const daily = stats.filter(lead => new Date(lead.created_at) >= today).length;
        const weekly = stats.filter(lead => new Date(lead.created_at) >= weekAgo).length;
        const monthly = stats.filter(lead => new Date(lead.created_at) >= monthAgo).length;
        const yearly = stats.filter(lead => new Date(lead.created_at) >= yearAgo).length;

        setLeadStats({ daily, weekly, monthly, yearly });
      }

      // Fetch lead sources
      const { data: sources } = await supabase
        .from('leads')
        .select('source')
        .eq('user_id', user.id);

      if (sources) {
        const sourceCounts: { [key: string]: number } = {};
        sources.forEach(lead => {
          sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
        });

        const sourceArray = Object.entries(sourceCounts).map(([source, count]) => ({
          source,
          count
        }));

        setLeadSources(sourceArray);
      }

      // Fetch recent leads
      const { data: recent } = await supabase
        .from('leads')
        .select('id, business_name, email, contact_number, source, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recent) {
        setRecentLeads(recent);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NodoLeads</h1>
              <span className="ml-2 text-sm text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/leads" className="nav-link">
                All Leads
              </Link>
              <Link href="/create-lead" className="nav-link">
                Create Lead
              </Link>
              <Link href="/qr-generator" className="nav-link">
                QR Generator
              </Link>
              <button
                onClick={handleSignOut}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s an overview of your lead performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="stat-number">{leadStats.daily}</div>
            <div className="stat-label">Leads Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{leadStats.weekly}</div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{leadStats.monthly}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{leadStats.yearly}</div>
            <div className="stat-label">This Year</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Sources Chart */}
          <div className="dashboard-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Lead Sources</h3>
            {leadSources.length > 0 ? (
              <div className="space-y-4">
                {leadSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: [
                            '#667eea', '#764ba2', '#f093fb', '#f5576c', 
                            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                          ][index % 8]
                        }}
                      ></div>
                      <span className="text-gray-700 capitalize">{source.source}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{source.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No leads yet. Create your first lead or generate a QR code!</p>
            )}
          </div>

          {/* Recent Leads */}
          <div className="dashboard-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Leads</h3>
            {recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{lead.business_name}</h4>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-sm text-gray-500">{lead.contact_number}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full capitalize">
                          {lead.source}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No leads yet. Create your first lead!</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/qr-generator" className="dashboard-card hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate QR Code</h3>
              <p className="text-gray-600 text-sm">Create a unique QR code for lead capture</p>
            </div>
          </Link>

          <Link href="/create-lead" className="dashboard-card hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Lead Manually</h3>
              <p className="text-gray-600 text-sm">Create a new lead entry manually</p>
            </div>
          </Link>

          <Link href="/leads" className="dashboard-card hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Leads</h3>
              <p className="text-gray-600 text-sm">Manage and track all your leads</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
