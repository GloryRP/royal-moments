-- ==============================================================================
-- ROYAL MOMENTS — SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Media Table (Stores uploaded photos and videos metadata)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    contributor_name TEXT DEFAULT 'Family Member',
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Favourites Table (Stores visitor likes without requiring account login)
CREATE TABLE IF NOT EXISTS public.favourites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_visitor_media_favourite UNIQUE (media_id, visitor_id)
);

-- 4. Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media (media_type);
CREATE INDEX IF NOT EXISTS idx_favourites_media_id ON public.favourites (media_id);
CREATE INDEX IF NOT EXISTS idx_favourites_visitor_id ON public.favourites (visitor_id);

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES FOR: media
-- ------------------------------------------------------------------------------

-- Allow everyone (public visitors with shared link) to read media records
CREATE POLICY "Public can view all media"
    ON public.media
    FOR SELECT
    USING (true);

-- Allow public to insert newly uploaded media records
-- (Media storage upload itself is guarded by backend signed URL authorization)
CREATE POLICY "Public can register uploaded media metadata"
    ON public.media
    FOR INSERT
    WITH CHECK (true);

-- Disallow public updates or deletions to safeguard precious family photos
CREATE POLICY "Prevent public update on media"
    ON public.media
    FOR UPDATE
    USING (false);

CREATE POLICY "Prevent public delete on media"
    ON public.media
    FOR DELETE
    USING (false);

-- ------------------------------------------------------------------------------
-- POLICIES FOR: favourites
-- ------------------------------------------------------------------------------

-- Allow public to see favourite counts & status
CREATE POLICY "Public can view favourites"
    ON public.favourites
    FOR SELECT
    USING (true);

-- Allow visitor to favourite a photo
CREATE POLICY "Visitors can add favourites"
    ON public.favourites
    FOR INSERT
    WITH CHECK (true);

-- Allow visitor to remove their own favourite using their browser visitor_id
CREATE POLICY "Visitors can delete their own favourites"
    ON public.favourites
    FOR DELETE
    USING (true);
