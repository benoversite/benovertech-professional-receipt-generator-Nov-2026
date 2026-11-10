const API_BASE_URL = 'http://localhost:3000/api';

// ============ PRODUCTS ============

export async function getProducts(params?: { category?: string; search?: string; lowStock?: boolean }) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.lowStock) searchParams.append('lowStock', 'true');

    const response = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`);
    if (!response.ok) throw new Error('Product not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    throw error;
  }
}

export async function createProduct(data: {
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    category?: string;
    costPrice?: number;
    sellingPrice?: number;
    stock?: number;
    barcode?: string;
  }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories/all`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getLowStockProducts(threshold: number = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/alerts/low-stock?threshold=${threshold}`);
    if (!response.ok) throw new Error('Failed to fetch low stock products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
}

// ============ SALES ============

export async function getSales(params?: { startDate?: string; endDate?: string; limit?: number }) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/sales?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch sales');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
}

export async function getSaleById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`);
    if (!response.ok) throw new Error('Failed to fetch sale');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sale:', error);
    throw error;
  }
}

export async function createSale(data: {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'transfer' | 'card';
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create sale');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
}

// ============ ANALYTICS ============

export async function getSalesSummary(days: number = 30) {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/stats/summary?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch sales summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
}

export async function getTopProducts(limit: number = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/analytics/top-products?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch top products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
}

export async function getDailySalesData(days: number = 30) {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/analytics/daily?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch daily sales data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily sales data:', error);
    throw error;
  }
}

export async function getAnalytics(days: number = 30) {
  try {
    const [summary, topProducts, dailyData] = await Promise.all([
      getSalesSummary(days),
      getTopProducts(10),
      getDailySalesData(days),
    ]);

    return { summary, topProducts, dailyData };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}
