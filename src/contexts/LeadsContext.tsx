'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export interface Lead {
  id: string;
  user_id: string;
  capture_link_id?: string;
  business_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  lead_source_id?: number;
  status_id?: number;
  source_type: 'qr_link' | 'manual';
  notes?: string;
  created_at: string;
  updated_at: string;
  lead_source?: {
    id: number;
    name: string;
  };
  status?: {
    id: number;
    name: string;
    color: string;
  };
  capture_link?: {
    id: string;
    title: string;
  };
}

export interface LeadCaptureLink {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  qr_code_url?: string;
  public_link: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface LeadSourceStats {
  name: string;
  count: number;
  percentage: number;
}

interface LeadsContextType {
  leads: Lead[];
  captureLinks: LeadCaptureLink[];
  stats: LeadStats;
  sourceStats: LeadSourceStats[];
  loading: boolean;
  refreshLeads: () => Promise<void>;
  refreshCaptureLinks: () => Promise<void>;
  refreshStats: () => Promise<void>;
  createLead: (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: unknown }>;
  createCaptureLink: (linkData: Omit<LeadCaptureLink, 'id' | 'created_at' | 'updated_at' | 'public_link'>) => Promise<{ error: unknown; data?: LeadCaptureLink }>;
  updateLeadStatus: (leadId: string, statusId: number) => Promise<{ error: unknown }>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [captureLinks, setCaptureLinks] = useState<LeadCaptureLink[]>([]);
  const [stats, setStats] = useState<LeadStats>({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [sourceStats, setSourceStats] = useState<LeadSourceStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_source:lead_sources(id, name),
          status:lead_statuses(id, name, color),
          capture_link:lead_capture_links(id, title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchCaptureLinks = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('lead_capture_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching capture links:', error);
        return;
      }

      setCaptureLinks(data || []);
    } catch (error) {
      console.error('Error fetching capture links:', error);
    }
  };

  const fetchStats = async () => {
    if (!supabase) return;

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Get daily leads
      const { count: daily } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get weekly leads
      const { count: weekly } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Get monthly leads
      const { count: monthly } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      // Get yearly leads
      const { count: yearly } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yearAgo.toISOString());

      setStats({
        daily: daily || 0,
        weekly: weekly || 0,
        monthly: monthly || 0,
        yearly: yearly || 0
      });

      // Get source statistics
      const { data: sourceData } = await supabase
        .from('leads')
        .select('lead_source_id, lead_sources(name)')
        .not('lead_source_id', 'is', null);

      if (sourceData) {
        const sourceCounts: { [key: string]: number } = {};
        sourceData.forEach(lead => {
          const sourceName = (lead.lead_sources as any)?.name || 'Unknown';
          sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1;
        });

        const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
        const sourceStatsArray = Object.entries(sourceCounts).map(([name, count]) => ({
          name,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }));

        setSourceStats(sourceStatsArray);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const refreshLeads = async () => {
    await fetchLeads();
  };

  const refreshCaptureLinks = async () => {
    await fetchCaptureLinks();
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('leads')
        .insert(leadData);

      if (!error) {
        await fetchLeads();
        await fetchStats();
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const createCaptureLink = async (linkData: Omit<LeadCaptureLink, 'id' | 'created_at' | 'updated_at' | 'public_link'>) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      // Generate a temporary UUID for the public link
      const tempId = crypto.randomUUID();
      const publicLink = `${window.location.origin}/capture/${tempId}`;
      
      // Insert the record with the public link
      const { data, error } = await supabase
        .from('lead_capture_links')
        .insert({
          ...linkData,
          public_link: publicLink
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      // Now update the record with the actual generated ID
      const actualPublicLink = `${window.location.origin}/capture/${data.id}`;
      
      const { data: updatedData, error: updateError } = await supabase
        .from('lead_capture_links')
        .update({ public_link: actualPublicLink })
        .eq('id', data.id)
        .select()
        .single();

      if (!updateError) {
        await fetchCaptureLinks();
      }

      return { error: updateError, data: updatedData };
    } catch (error) {
      return { error };
    }
  };

  const updateLeadStatus = async (leadId: string, statusId: number) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status_id: statusId })
        .eq('id', leadId);

      if (!error) {
        await fetchLeads();
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeads(),
        fetchCaptureLinks(),
        fetchStats()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  const value = {
    leads,
    captureLinks,
    stats,
    sourceStats,
    loading,
    refreshLeads,
    refreshCaptureLinks,
    refreshStats,
    createLead,
    createCaptureLink,
    updateLeadStatus
  };

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
