DROP POLICY IF EXISTS "Open site can view public receipts" ON public.receipts;
CREATE POLICY "Open site can view public receipts"
  ON public.receipts FOR SELECT
  USING (user_id = '11111111-1111-1111-1111-111111111111');

DROP POLICY IF EXISTS "Open site can create public receipts" ON public.receipts;
CREATE POLICY "Open site can create public receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (user_id = '11111111-1111-1111-1111-111111111111');

DROP POLICY IF EXISTS "Open site can update public receipts" ON public.receipts;
CREATE POLICY "Open site can update public receipts"
  ON public.receipts FOR UPDATE
  USING (user_id = '11111111-1111-1111-1111-111111111111')
  WITH CHECK (user_id = '11111111-1111-1111-1111-111111111111');

GRANT SELECT, INSERT ON public.receipts TO anon, authenticated;
GRANT UPDATE ON public.receipts TO authenticated;
REVOKE UPDATE ON public.receipts FROM PUBLIC, anon;
GRANT UPDATE (pdf_url) ON public.receipts TO anon;
GRANT EXECUTE ON FUNCTION public.generate_receipt_number(UUID) TO anon, authenticated;

GRANT INSERT, SELECT, UPDATE ON storage.objects TO anon, authenticated;

DROP POLICY IF EXISTS "Open site can view product images" ON storage.objects;
CREATE POLICY "Open site can view product images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'product-images'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

DROP POLICY IF EXISTS "Open site can view receipt pdfs" ON storage.objects;
CREATE POLICY "Open site can view receipt pdfs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipt-pdfs'
    AND split_part(name, '/', 1) = '11111111-1111-1111-1111-111111111111'
  );

CREATE OR REPLACE FUNCTION public.generate_receipt_number(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _year TEXT := to_char(now(), 'YYYY');
  _month TEXT := to_char(now(), 'MM');
  _prefix TEXT;
  _count INT;
BEGIN
  _prefix := 'BNV-' || _year || '-' || _month || '-';
  PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text || _prefix, 0));
  SELECT COUNT(*) INTO _count
    FROM public.receipts
    WHERE user_id = _user_id
      AND receipt_number LIKE _prefix || '%';
  RETURN _prefix || lpad((_count + 1)::TEXT, 4, '0');
END;
$$;
