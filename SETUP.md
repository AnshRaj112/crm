# NodoLeads Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Supabase Database Setup

You need to create the following tables in your Supabase database:

### 1. user_profiles table
```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. qr_codes table
```sql
CREATE TABLE qr_codes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code TEXT,
  form_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. leads table
```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id TEXT REFERENCES qr_codes(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Row Level Security (RLS) Policies

Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- qr_codes policies
CREATE POLICY "Users can view own qr codes" ON qr_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qr codes" ON qr_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own qr codes" ON qr_codes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own qr codes" ON qr_codes FOR DELETE USING (auth.uid() = user_id);

-- leads policies
CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON leads FOR DELETE USING (auth.uid() = user_id);

-- Allow public to insert leads (for the public lead form)
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Landing Page**: Welcome page with NodoLeads branding
- **Authentication**: Sign up and login with email/password or Google OAuth
- **Dashboard**: Overview of lead statistics and recent activity
- **QR Code Generator**: Create unique QR codes for lead capture
- **Lead Forms**: Public forms accessible via QR codes
- **Lead Management**: View, filter, and update lead statuses
- **Manual Lead Creation**: Add leads manually
- **Analytics**: Track lead sources and performance

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- React QR Code
- Recharts (for analytics)
