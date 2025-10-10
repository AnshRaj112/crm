# NodoLeads CRM

A comprehensive Customer Relationship Management (CRM) system by Exsolvia, designed for lead generation, tracking, and conversion using QR codes and analytics.

## Features

### 🏠 Landing Page
- Professional landing page with NodoLeads branding
- Feature highlights and call-to-action
- Responsive design with modern UI

### 🔐 Authentication
- Secure user registration and login
- Google OAuth integration
- User profile management

### 📊 Dashboard
- Personalized welcome message with user's first name
- Real-time lead analytics (daily, weekly, monthly, yearly)
- Lead source tracking with pie chart visualization
- Recent leads overview
- Quick QR code generation

### 📱 QR Code Generation
- Create unique QR codes for lead capture
- Customizable titles and descriptions
- Direct links for easy sharing
- Each QR code generates leads specifically for the user

### 📝 Lead Management
- **Public Lead Capture Form**: Accessible via QR codes/links
  - Business name, contact person, email, phone
  - Lead source tracking (Facebook, Instagram, X, LinkedIn, YouTube, etc.)
  - Additional notes and information

- **Manual Lead Creation**: Add leads directly to the system
- **Lead Status Management**: 
  - New, Contacted, Interested, On Hold, Declined, Converted
  - Easy status updates with color-coded indicators

### 📈 Analytics & Reporting
- Comprehensive analytics dashboard
- Lead source distribution charts
- Lead status breakdown
- Conversion rate tracking
- Total leads and active sources metrics

### 🔍 Lead Filtering & Search
- Filter leads by source (QR code/link vs manual entry)
- Filter by lead status
- Sort by date (latest first)
- View lead details and interaction history

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **Icons**: Lucide React

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: Extended user profiles
- **leads**: Lead information and tracking
- **lead_sources**: Predefined lead sources
- **lead_statuses**: Lead status definitions
- **lead_capture_links**: QR code and link management
- **lead_interactions**: Lead contact history

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Run the SQL schema from `database_schema.sql` in your Supabase SQL editor
- This will create all necessary tables, indexes, and RLS policies

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For New Users
1. Visit the landing page
2. Click "Get Started" or "Sign In"
3. Create an account or sign in with Google
4. Start generating QR codes for lead capture

### For Existing Users
1. Sign in to access your dashboard
2. View your lead analytics and recent leads
3. Generate new QR codes for different campaigns
4. Manage leads through the "All Leads" tab
5. Create leads manually using the "Create Lead" tab
6. View detailed analytics in the "Analytics" tab

### QR Code Workflow
1. Click "Generate QR Code" on the dashboard
2. Enter a title and optional description
3. Download or copy the QR code/link
4. Share the QR code or link with potential customers
5. When scanned/clicked, customers fill out the lead form
6. Leads automatically appear in your dashboard

### Lead Management
- View all leads in the "All Leads" tab
- Filter by source type (QR code/link vs manual)
- Filter by lead status
- Update lead status by selecting from the dropdown
- View lead details and contact information

## API Endpoints

The application uses Supabase for backend functionality:

- **Authentication**: `/auth/*` (handled by Supabase)
- **Lead Capture**: `/capture/[linkId]` - Public form for lead submission
- **User Management**: Supabase Auth integration
- **Data Access**: Supabase client with Row Level Security (RLS)

## Security Features

- Row Level Security (RLS) enabled on all tables
- User-specific data isolation
- Secure authentication with Supabase
- Public lead capture forms with validation
- Protected admin routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software by Exsolvia.

## Support

For support and questions, please contact the Exsolvia development team.

---

**NodoLeads** - The ultimate CRM solution for modern businesses.
