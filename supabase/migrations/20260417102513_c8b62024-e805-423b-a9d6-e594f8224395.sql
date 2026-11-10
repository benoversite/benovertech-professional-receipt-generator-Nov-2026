
-- Receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  product_name TEXT NOT NULL,
  product_color TEXT,
  serial_number TEXT,
  part_number TEXT,
  price NUMERIC(12,2) NOT NULL,
  product_image_url TEXT,
  pdf_url TEXT,
  warranty_note TEXT NOT NULL DEFAULT '7-day service warranty',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_receipts_customer_name ON public.receipts(customer_name);
CREATE INDEX idx_receipts_created_at ON public.receipts(created_at DESC);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own receipts
CREATE POLICY "Users can view their own receipts"
  ON public.receipts FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update their own receipts"
  ON public.receipts FOR UPDATE
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete their own receipts"
  ON public.receipts FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- Public can read receipts via direct ID lookup (so WhatsApp recipients can view)
-- We keep this conservative: only allow if the request includes the full UUID (it always does via .eq('id', ...))
-- Note: RLS already restricts SELECT to owner. For public sharing we use the public PDF URL instead.

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Receipt number generator: BNV-YYYY-MM-XXXX (resets monthly per user)
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
  _next TEXT;
BEGIN
  _prefix := 'BNV-' || _year || '-' || _month || '-';
  SELECT COUNT(*) INTO _count
    FROM public.receipts
    WHERE user_id = _user_id
      AND receipt_number LIKE _prefix || '%';
  _next := _prefix || lpad((_count + 1)::TEXT, 4, '0');
  RETURN _next;
END;
$$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('receipt-pdfs', 'receipt-pdfs', true);

-- Public read for both buckets (so WhatsApp links work)
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Public can view receipt pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipt-pdfs');

-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Authenticated users can update their product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Authenticated users can delete their product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Authenticated users can upload receipt pdfs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipt-pdfs' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Authenticated users can update their receipt pdfs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'receipt-pdfs' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Authenticated users can delete their receipt pdfs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipt-pdfs' AND auth.uid()::text = split_part(name, '/', 1));
