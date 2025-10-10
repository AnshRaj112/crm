-- NodoLeads CRM Database Schema
-- Created for Exsolvia's NodoLeads product

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead sources table
CREATE TABLE IF NOT EXISTS public.lead_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default lead sources
INSERT INTO public.lead_sources (name) VALUES 
('Facebook'),
('Instagram'),
('X (Twitter)'),
('LinkedIn'),
('YouTube'),
('Google'),
('Referral'),
('Website'),
('Other')
ON CONFLICT (name) DO NOTHING;

-- Lead statuses table
CREATE TABLE IF NOT EXISTS public.lead_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default lead statuses
INSERT INTO public.lead_statuses (name, color) VALUES 
('New', '#10B981'),
('Contacted', '#3B82F6'),
('Interested', '#F59E0B'),
('On Hold', '#EF4444'),
('Declined', '#6B7280'),
('Converted', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- QR codes and links table
CREATE TABLE IF NOT EXISTS public.lead_capture_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  qr_code_url TEXT,
  public_link TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  capture_link_id UUID REFERENCES public.lead_capture_links(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  lead_source_id INTEGER REFERENCES public.lead_sources(id) ON DELETE SET NULL,
  status_id INTEGER REFERENCES public.lead_statuses(id) ON DELETE SET NULL DEFAULT 1,
  source_type TEXT CHECK (source_type IN ('qr_link', 'manual')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead interactions table (for tracking contact attempts)
CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('call', 'email', 'meeting', 'note')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_capture_link_id ON public.leads(capture_link_id);
CREATE INDEX IF NOT EXISTS idx_leads_status_id ON public.leads(status_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_capture_links_user_id ON public.lead_capture_links(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_capture_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own leads
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own capture links
CREATE POLICY "Users can view own capture links" ON public.lead_capture_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own capture links" ON public.lead_capture_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own capture links" ON public.lead_capture_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own capture links" ON public.lead_capture_links
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see interactions for their leads
CREATE POLICY "Users can view own lead interactions" ON public.lead_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_interactions.lead_id 
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own lead interactions" ON public.lead_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_interactions.lead_id 
      AND leads.user_id = auth.uid()
    )
  );

-- Allow public access to lead capture links for form submissions
CREATE POLICY "Public can view active capture links" ON public.lead_capture_links
  FOR SELECT USING (is_active = true);

-- Allow public to insert leads via capture links
CREATE POLICY "Public can insert leads via capture links" ON public.leads
  FOR INSERT WITH CHECK (
    capture_link_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.lead_capture_links 
      WHERE lead_capture_links.id = leads.capture_link_id 
      AND lead_capture_links.is_active = true
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_capture_links_updated_at BEFORE UPDATE ON public.lead_capture_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
