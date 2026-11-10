export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  totalAmount: number;
  totalProfit: number;
  customerName: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'transfer' | 'card';
  createdAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  profit: number;
  product?: Product;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}
