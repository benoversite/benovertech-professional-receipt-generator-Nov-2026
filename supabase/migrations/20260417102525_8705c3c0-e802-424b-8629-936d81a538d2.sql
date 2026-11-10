
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view receipt pdfs" ON storage.objects;
-- Public buckets still serve files via direct URL even without an explicit SELECT policy on storage.objects,
-- because the storage proxy honors bucket.public = true. Removing the broad SELECT policy prevents listing
-- while keeping direct file URLs accessible.
