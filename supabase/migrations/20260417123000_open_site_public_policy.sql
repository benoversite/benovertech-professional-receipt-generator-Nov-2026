-- Open-site public flow policy updates
-- This migration enables anonymous receipt creation and file uploads under a dedicated open-site owner ID.
-- The app uses OPEN_SITE_USER_ID to save receipts and storage objects into a shared namespace.

ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_user_id_fkey;

CREATE POLICY "Open site can view public receipts"
  ON public.receipts FOR SELECT
  USING (user_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Open site can create public receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (NEW.user_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Anonymous open-site can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

CREATE POLICY "Anonymous open-site can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

CREATE POLICY "Anonymous open-site can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

CREATE POLICY "Anonymous open-site can upload receipt pdfs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipt-pdfs'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

CREATE POLICY "Anonymous open-site can update receipt pdfs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipt-pdfs'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  )
  WITH CHECK (
    bucket_id = 'receipt-pdfs'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

CREATE POLICY "Anonymous open-site can delete receipt pdfs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipt-pdfs'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );
