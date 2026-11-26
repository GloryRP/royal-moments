# Royal Moments — Engagement Photo & Video Sharing Website

A luxurious, high-performance, mobile-first engagement photo and video sharing platform built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**. Designed to be shared effortlessly with family members and relatives through WhatsApp.

Visitors can explore high-resolution memories in an editorial masonry gallery, upload their own photographs and videos with live progress indicators, favourite their most cherished moments, and download individual files or the complete album as an organized ZIP archive.

---

## 1. Project Overview & Highlights

- **Luxury Royal Design System**: Champagne gold accents, ivory white backgrounds, warm beige tones, and classical serif typography (`Cormorant Garamond` & `Cinzel`).
- **Mobile-First Responsive Layout**: Optimized for mobile visitors arriving directly from WhatsApp group links.
- **Secure Serverless Upload Authorization**: Uses a Vercel Serverless Function (`/api/create-upload-url`) to generate short-lived signed upload URLs using the Supabase `service_role` key without ever exposing secrets to frontend client bundles.
- **Privacy-Conscious Favourites**: Instant heart/favourite functionality using a browser-generated visitor UUID stored locally and synced with Supabase PostgreSQL without requiring family members to register or create accounts.
- **Full Album ZIP Archiver**: Client-side JSZip packaging that organizes photos and videos into structured folders (`Photos/` and `Videos/`) with chunked batching to prevent mobile browser memory exhaustion.
- **Centralized Customization**: Easily edit the couple's names, event dates, venues, cover photos, and upload limits in a single configuration file (`src/config/siteConfig.js`).
- **Interactive Local Preview Mode**: Includes built-in sample memories so the UI can be previewed immediately even before connecting Supabase credentials.

---

## 2. Tech Stack

- **Frontend**: React 18 (pure JavaScript, no TypeScript), Vite 6
- **Styling**: Tailwind CSS 3 with custom royal color palette and typography
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase PostgreSQL (`media` and `favourites` tables)
- **Storage**: Supabase Storage (`media` bucket with RLS policies)
- **Archive System**: JSZip
- **Notifications**: React Hot Toast
- **Serverless Backend**: Vercel Serverless Functions (Node.js)

---

## 3. Directory Structure

```text
royal-moments/
├── api/
│   └── create-upload-url.js      # Vercel serverless upload authorization handler
├── public/
│   └── favicon.svg               # Royal monogram seal favicon
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Sticky royal navbar with mobile drawer
│   │   ├── Hero.jsx              # Impressive landing hero with cover photo & CTAs
│   │   ├── Gallery.jsx           # Responsive masonry gallery with filter pills & sort
│   │   ├── PhotoCard.jsx         # Card with skeleton loading, badges, & actions
│   │   ├── Lightbox.jsx          # Fullscreen viewer with touch swipe & keyboard nav
│   │   ├── UploadSection.jsx     # Drag-and-drop uploader with live progress
│   │   ├── DownloadModal.jsx     # Full album ZIP generator modal with progress
│   │   ├── DemoNotice.jsx        # Non-intrusive preview mode indicator
│   │   └── Footer.jsx            # Elegant couple footer with back-to-top action
│   ├── config/
│   │   └── siteConfig.js         # Central couple, date, venue, & limit configuration
│   ├── hooks/
│   │   ├── useFavourites.js      # Hook for device visitor likes & live counters
│   │   └── useGallery.js         # Hook for gallery fetching, sorting, & filtering
│   ├── lib/
│   │   └── supabase.js           # Supabase client & fallback sample memories
│   ├── services/
│   │   ├── downloadService.js    # Single file & batched JSZip album downloader
│   │   ├── favouriteService.js   # Supabase/Local favourite sync service
│   │   ├── mediaService.js       # Media metadata fetch & insertion service
│   │   └── uploadService.js      # Two-step signed upload service
│   ├── utils/
│   │   ├── fileValidation.js     # MIME type & size validators (20MB/100MB)
│   │   ├── formatDate.js         # Human-friendly relative and calendar dates
│   │   └── visitorId.js          # Privacy-friendly device UUID generator
│   ├── App.jsx                   # Application layout & state coordination
│   ├── index.css                 # Custom scrollbars, glassmorphism, & gold styles
│   └── main.jsx                  # React DOM root entry
├── supabase/
│   ├── schema.sql                # Complete PostgreSQL tables, indexes, & RLS
│   └── storage-policies.sql      # Supabase Storage bucket & security policies
├── .env.example                  # Environment variable reference template
├── .gitignore                    # Ignored files & environment configs
├── index.html                    # Luxury typography & HTML head configuration
├── package.json                  # Dependencies and build scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind theme colors, fonts, & shadows
├── vercel.json                   # Vercel SPA routing and serverless function rewrite
└── vite.config.js                # Vite build config with local dev API middleware
```

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **pnpm**
- A free **Supabase** account ([supabase.com](https://supabase.com))
- A free **Vercel** account for deployment ([vercel.com](https://vercel.com))

---

## 5. Local Setup & Quick Start

### Step 1: Clone or navigate to the workspace
```bash
cd c:\Projects\photostudio
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` in your editor and configure your Supabase keys (see Section 6 below).

### Step 4: Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: Even if you haven't set up Supabase yet, the website runs automatically in **Local Preview Mode** with high-resolution sample engagement memories so you can test all UI interactions immediately!

---

## 6. Supabase Setup Guide

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project**, choose an organization, name it `royal-moments`, set a secure database password, and select your preferred region.

### 2. Run Database Schema SQL
1. In your Supabase Dashboard, click on the **SQL Editor** tab on the left sidebar.
2. Open the file `supabase/schema.sql` from this repository.
3. Paste the contents into the SQL Editor and click **Run**.
   - This creates the `media` and `favourites` tables.
   - Configures performance indexes for `created_at` and `media_id`.
   - Enables Row Level Security (RLS) with read access for all visitors.

### 3. Setup Storage Bucket & Policies
1. In the **SQL Editor**, open the file `supabase/storage-policies.sql`.
2. Paste the contents and click **Run**.
   - Creates the public storage bucket named `media`.
   - Sets the file size limit to `100 MB`.
   - Allows public read access for guests to view media CDN links.
   - Restricts uploads to signed authorization tokens.
   - Disallows unauthorized file deletion or overwriting by guests.

### 4. Obtain Supabase API Credentials
Navigate to **Project Settings** -> **API**:
1. Copy **Project URL** -> `VITE_SUPABASE_URL` and `SUPABASE_URL`.
2. Copy **Project API Keys** -> `anon` (public) -> `VITE_SUPABASE_ANON_KEY`.
3. Copy **Project API Keys** -> `service_role` (secret) -> `SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Environment Variables Reference

Create a `.env` file in the project root:

```env
# -----------------------------------------------------------------------------
# CLIENT-SIDE ENVIRONMENT VARIABLES (Vite Frontend)
# -----------------------------------------------------------------------------
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# -----------------------------------------------------------------------------
# SERVER-SIDE ENVIRONMENT VARIABLES (Vercel Serverless Function)
# Used only by /api/create-upload-url (NEVER exposed to frontend clients)
# -----------------------------------------------------------------------------
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Family Passcode (Leave empty for open family uploads)
UPLOAD_ACCESS_SECRET=
```

---

## 8. Customizing Couple Information

Open `src/config/siteConfig.js` to change:

- **Couple's Names**: `partnerOne`, `partnerTwo`, and `monogram`
- **Engagement Date**: `engagementDate` (e.g., `"Saturday, November 28, 2026"`)
- **Venue & City**: `venue` and `city`
- **Cover Photograph**: `hero.coverImage`
- **Gallery & Upload Text**: Headings, subtitles, and welcome notes
- **Upload File Limits**: Max image size (default: 20 MB), max video size (default: 100 MB)

---

## 9. Vercel Deployment Guide

Deploying Royal Moments to Vercel takes under 2 minutes:

### Option A: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts, link your project, and set the environment variables.

### Option B: Deploy via GitHub / Vercel Dashboard
1. Push your repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/new).
3. Select your repository.
4. In the **Environment Variables** section, add the 5 variables from `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `UPLOAD_ACCESS_SECRET` (optional)
5. Click **Deploy**.

Vercel will automatically build the Vite SPA and deploy the `/api/create-upload-url` serverless function.

---

## 10. Security Architecture

1. **No Exposed Service Keys**: The privileged `SUPABASE_SERVICE_ROLE_KEY` is only used inside `api/create-upload-url.js` running on Vercel's serverless runtime.
2. **Short-Lived Signed Upload URLs**: The frontend receives a restricted 60-second signed URL for a specific auto-generated path (`photos/<timestamp>_<uuid>_<name>.<ext>`), preventing guests from overwriting other files.
3. **MIME & Size Enforcement**: File types and file sizes are strictly validated both client-side and server-side before an upload token is granted.
4. **Row Level Security (RLS)**: Public visitors can insert new media records but cannot update, modify, or delete existing family memories.
5. **No Mandatory Login Friction**: Relatives opening the website on WhatsApp can immediately view, favourite, and contribute without encountering login or password fatigue.

---

## 11. Troubleshooting Common Issues

### Issue: "Upload authorization failed: 503 / Missing credentials"
- **Cause**: `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is not defined in the server environment.
- **Solution**: Check that both variables are added in your `.env` (for local dev) or in the Vercel Dashboard under **Settings -> Environment Variables**.

### Issue: Photos uploaded but images fail to display in gallery
- **Cause**: Supabase Storage bucket is not marked as `public`.
- **Solution**: In Supabase Dashboard -> **Storage** -> Click the three dots next to `media` bucket -> select **Make Public**. Alternatively, re-run `supabase/storage-policies.sql`.

### Issue: "Memory warning on full album ZIP download"
- **Cause**: Albums with hundreds of video files can exceed mobile browser RAM when generating a ZIP archive.
- **Solution**: The download service uses concurrency batching (3 files at a time). For very large archives, family members can also download individual favourite photos directly from the Lightbox.

---

## 12. Verification & Build Commands

- **Local Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Production Preview**: `npm run preview`

Made with ❤️ for family and friends.
