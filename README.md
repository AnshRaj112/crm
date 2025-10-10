# NodoLeads - Lead Generation CRM

A powerful CRM platform for lead generation, built with Next.js and Supabase.

## Features

- **Landing Page**: Beautiful welcome page with NodoLeads branding
- **Authentication**: Secure signup/login with password visibility toggle and Google OAuth
- **Dashboard**: Comprehensive analytics with charts and lead statistics
- **QR Code Generation**: Create QR codes and links for lead capture forms
- **Lead Capture Forms**: Public forms that can be accessed via QR codes or links
- **Manual Lead Entry**: Add leads manually with detailed information
- **Lead Management**: View, filter, and update lead statuses
- **Analytics**: Track lead sources, conversion rates, and performance metrics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure Google OAuth (Optional)

To enable Google authentication:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3001/dashboard` (for development)

### 5. Set up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'on_hold', 'declined', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_id UUID,
  is_manual BOOLEAN DEFAULT false
);

-- Create lead_forms table
CREATE TABLE lead_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for lead_forms table
CREATE POLICY "Users can view their own forms" ON lead_forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forms" ON lead_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" ON lead_forms
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public access to forms for lead submission
CREATE POLICY "Public can view forms for lead submission" ON lead_forms
  FOR SELECT USING (true);
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser (or the port shown in your terminal).

### 7. Test Your Application

After setting up your Supabase database, try creating a QR code or adding a manual lead to verify everything is working correctly.

## Usage

### 1. Sign Up
- Visit the landing page and click "Get Started"
- Fill out the signup form with your details
- You'll be redirected to the dashboard after successful registration

### 2. Generate QR Codes
- Go to "Generate QR Code" from the dashboard
- Create a new form with a descriptive name
- Download the QR code or copy the link to share

### 3. Capture Leads
- Share your QR code or link on marketing materials
- When people scan/click, they'll fill out your lead form
- Leads will automatically appear in your dashboard

### 4. Manage Leads
- View all leads in the "All Leads" section
- Filter by status, source, or type
- Update lead status as you progress through your sales funnel
- Add leads manually when needed

## Lead Statuses

- **New**: Just received the lead
- **Contacted**: Initial contact made
- **Interested**: Lead shows interest
- **On Hold**: Lead is considering
- **Declined**: Lead is not interested
- **Converted**: Lead became a customer

## Lead Sources

The system tracks leads from various sources:
- Facebook
- Instagram
- X (Twitter)
- LinkedIn
- YouTube
- Google Search
- Referral
- Manual Entry
- Other

## Features Overview

### Dashboard
- Daily, weekly, monthly, and yearly lead statistics
- Lead source pie chart
- Weekly leads bar chart
- Latest leads overview
- Quick action buttons

### QR Code Generator
- Create unique QR codes for each form
- Download QR codes as PNG images
- Copy shareable links
- Instructions for usage

### Lead Capture Forms
- Mobile-responsive design
- Clean, professional appearance
- Required field validation
- Success confirmation

### Lead Management
- Advanced filtering and search
- Status updates with dropdown
- Detailed lead information
- Sortable by date

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the Exsolvia team.

---

**NodoLeads** - Product of Exsolvia