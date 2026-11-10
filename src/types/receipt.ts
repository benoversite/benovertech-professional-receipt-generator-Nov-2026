export type Receipt = {
  id: string;
  user_id: string;
  receipt_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  product_name: string;
  product_color: string | null;
  serial_number: string | null;
  part_number: string | null;
  price: number;
  product_image_url: string | null;
  pdf_url: string | null;
  warranty_note: string;
  created_at: string;
  updated_at: string;
};
