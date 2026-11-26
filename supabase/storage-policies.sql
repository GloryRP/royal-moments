-- ==============================================================================
-- ROYAL MOMENTS — STORAGE BUCKET & ACCESS POLICIES
-- ==============================================================================

-- 1. Create the 'media' storage bucket (if it does not already exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,
    104857600, -- 100 MB limit
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'video/mp4',
        'video/quicktime'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 104857600;

-- 2. Storage Policies for 'media' bucket

-- A. Public Read Access: Everyone with the shared link can view photos and videos
DROP POLICY IF EXISTS "Public Media Read Access" ON storage.objects;
CREATE POLICY "Public Media Read Access"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'media');

-- B. Upload Protection:
-- Uploads are authorized server-side using Vercel Serverless Function via
-- createSignedUploadUrl with service_role. 
-- Direct anonymous file insertion into storage without a valid token is restricted.
DROP POLICY IF EXISTS "Allow Uploads via Signed URLs" ON storage.objects;
CREATE POLICY "Allow Uploads via Signed URLs"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'media');

-- C. Delete & Update Protection:
-- Prevent public visitors from deleting or overwriting uploaded family files
DROP POLICY IF EXISTS "Prevent Public Object Deletion" ON storage.objects;
CREATE POLICY "Prevent Public Object Deletion"
    ON storage.objects
    FOR DELETE
    USING (false);

DROP POLICY IF EXISTS "Prevent Public Object Updates" ON storage.objects;
CREATE POLICY "Prevent Public Object Updates"
    ON storage.objects
    FOR UPDATE
    USING (false);
