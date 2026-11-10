import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, ChevronDown, Loader, AlertCircle, Search } from 'lucide-react';
import { MainLayout } from '../layout/MainLayout';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { getProducts, getProductByBarcode, createSale } from '../services/api';

interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
}

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface FormData {
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'transfer' | 'card';
}

export const Sales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [completingSale, setCompletingSale] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(errorMessage);
        console.error('Sales page error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (p) => p.name.toLowerCase().includes(query) || p.barcode?.includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;

    try {
      setSaleError(null);
      const product = await getProductByBarcode(barcodeInput);
      addToCart(product);
      setBarcodeInput('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Product not found';
      setSaleError(errorMessage);
      console.error('Barcode search error:', err);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      setSaleError(`${product.name} is out of stock`);
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          setSaleError(`Insufficient stock for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.sellingPrice,
          quantity: 1,
        },
      ];
    });
    setSaleError(null);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    if (newQuantity > product.stock) {
      setSaleError(`Only ${product.stock} units available for ${product.name}`);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    setSaleError(null);
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
    setSaleError(null);
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalProfit = 0;

    cartItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const itemTotal = item.price * item.quantity;
        const itemProfit = (item.price - product.costPrice) * item.quantity;
        totalAmount += itemTotal;
        totalProfit += itemProfit;
      }
    });

    return { totalAmount, totalProfit };
  };

  const { totalAmount, totalProfit } = calculateTotals();

  const validateForm = (): boolean => {
    if (cartItems.length === 0) {
      setSaleError('Cart is empty. Add products before completing sale.');
      return false;
    }
    if (!formData.paymentMethod) {
      setSaleError('Please select a payment method.');
      return false;
    }
    setSaleError(null);
    return true;
  };

  const handleCompleteSale = async () => {
    if (!validateForm()) return;

    try {
      setCompletingSale(true);
      setSaleError(null);

      const saleData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerName: formData.customerName || 'Walk-in Customer',
        customerPhone: formData.customerPhone,
        paymentMethod: formData.paymentMethod,
      };

      const result = await createSale(saleData);

      // Clear cart and form
      setCartItems([]);
      setFormData({
        customerName: '',
        customerPhone: '',
        paymentMethod: 'cash',
      });

      // Show success message
      alert(`Sale completed successfully! Sale ID: ${result.id}\nTotal: ₦${result.totalAmount.toLocaleString()}`);

      // Refresh products (stock updated)
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete sale';
      setSaleError(errorMessage);
      console.error('Complete sale error:', err);
    } finally {
      setCompletingSale(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Create Sale</h1>
            <p className="text-textSecondary mt-1">Process a new customer transaction</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-400" size={24} />
              <div>
                <p className="font-semibold text-text">Error Loading Products</p>
                <p className="text-sm text-textSecondary">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Sale Error Message */}
        {saleError && (
          <Card className="bg-red-500/10 border-red-500/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-400" size={24} />
              <p className="text-red-400 text-sm">{saleError}</p>
            </div>
          </Card>
        )}

        {loading ? (
          <Card className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-accent mr-3" size={32} />
            <p className="text-textSecondary">Loading products...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection & Cart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Search */}
              <Card>
                <h2 className="text-lg font-bold text-text mb-4">Search Products</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" size={20} />
                    <Input
                      placeholder="Search by product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Or scan barcode..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleBarcodeSearch();
                      }}
                    />
                    <Button variant="secondary" onClick={handleBarcodeSearch}>
                      Scan
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Product List to Add */}
              <Card>
                <h2 className="text-lg font-bold text-text mb-4">Available Products</h2>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="text-textSecondary/30 mx-auto mb-2" size={32} />
                    <p className="text-textSecondary">
                      {searchQuery ? 'No products match your search' : 'No products available'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 bg-primary rounded-lg border border-surfaceLight hover:border-accent/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-text text-sm">{product.name}</p>
                            <p className="text-accent font-bold mt-1">₦{product.sellingPrice.toLocaleString()}</p>
                          </div>
                          <Badge
                            variant={product.stock === 0 ? 'danger' : product.stock < 10 ? 'danger' : 'secondary'}
                            className="text-xs"
                          >
                            {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="tertiary"
                          className="w-full opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                        >
                          <Plus size={16} className="mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Cart Summary & Checkout */}
            <div className="space-y-6">
              {/* Cart Items */}
              <Card>
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingCart className="text-accent" size={24} />
                  <h2 className="text-lg font-bold text-text">Shopping Cart</h2>
                  <Badge variant="accent" className="ml-auto">
                    {cartItems.length}
                  </Badge>
                </div>

                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="p-3 bg-primary rounded-lg border border-surfaceLight">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-text text-sm">{item.productName}</p>
                            <p className="text-accent text-sm font-semibold">
                              ₦{item.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="px-2 py-1 bg-surfaceLight rounded hover:bg-accent hover:text-primary transition-all"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.productId, parseInt(e.target.value) || 1)
                            }
                            className="w-12 text-center bg-surface border border-surfaceLight rounded px-2 py-1 text-text"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="px-2 py-1 bg-surfaceLight rounded hover:bg-accent hover:text-primary transition-all"
                          >
                            +
                          </button>
                          <span className="text-textSecondary text-xs ml-auto">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ShoppingCart className="text-textSecondary/30 mx-auto mb-2" size={32} />
                    <p className="text-textSecondary text-sm">No items in cart</p>
                  </div>
                )}
              </Card>

              {/* Totals */}
              {cartItems.length > 0 && (
                <Card className="bg-surfaceLight">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-textSecondary">Subtotal:</span>
                      <span className="text-text">₦{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-surface pt-2">
                      <span className="text-textSecondary">Profit:</span>
                      <span className="text-green-400 font-semibold">₦{totalProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-surface pt-2 mt-2">
                      <span className="text-text">Total:</span>
                      <span className="text-accent">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Customer Info */}
              <Card>
                <h2 className="text-lg font-bold text-text mb-4">Customer Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Customer Name"
                    placeholder="John Doe (optional)"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="08107271610 (optional)"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                  <Select
                    label="Payment Method"
                    options={[
                      { value: 'cash', label: '💵 Cash' },
                      { value: 'transfer', label: '🏦 Bank Transfer' },
                      { value: 'card', label: '💳 Card' },
                    ]}
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as 'cash' | 'transfer' | 'card',
                      })
                    }
                    required
                  />
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCompleteSale}
                  disabled={completingSale || cartItems.length === 0}
                >
                  {completingSale ? (
                    <Loader size={18} className="animate-spin mr-2" />
                  ) : (
                    <Plus size={18} className="mr-2" />
                  )}
                  {completingSale ? 'Processing...' : 'Complete Sale'}
                </Button>
                <Button
                  variant="tertiary"
                  className="w-full"
                  onClick={() => {
                    setCartItems([]);
                    setFormData({ customerName: '', customerPhone: '', paymentMethod: 'cash' });
                    setSaleError(null);
                  }}
                  disabled={completingSale}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Create Sale</h1>
            <p className="text-textSecondary mt-1">Process a new customer transaction</p>
          </div>
          <Button>
            <Plus size={20} className="mr-2" />
            New Sale
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Search */}
            <Card>
              <h2 className="text-lg font-bold text-text mb-4">Search Products</h2>
              <div className="space-y-4">
                <Input placeholder="Search by product name..." />
                <div className="flex space-x-3">
                  <Input placeholder="Or scan barcode..." />
                  <Button variant="secondary">Scan</Button>
                </div>
              </div>
            </Card>

            {/* Product List to Add */}
            <Card>
              <h2 className="text-lg font-bold text-text mb-4">Available Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {[
                  { id: '3', name: 'iPad Air M1', price: 180000, stock: 5 },
                  { id: '4', name: 'AirPods Pro', price: 45000, stock: 12 },
                  { id: '5', name: 'Apple Watch Ultra', price: 180000, stock: 3 },
                  { id: '6', name: 'USB-C Cable', price: 2500, stock: 50 },
                ].map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-primary rounded-lg border border-surfaceLight hover:border-accent/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-text text-sm">{product.name}</p>
                        <p className="text-accent font-bold mt-1">₦{product.price.toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.stock} left
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="tertiary"
                      className="w-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Plus size={16} className="mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cart Summary & Checkout */}
          <div className="space-y-6">
            {/* Cart Items */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="text-accent" size={24} />
                <h2 className="text-lg font-bold text-text">Shopping Cart</h2>
                <Badge variant="accent" className="ml-auto">
                  {cartItems.length}
                </Badge>
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-3 bg-primary rounded-lg border border-surfaceLight">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-text text-sm">{item.name}</p>
                          <p className="text-accent text-sm font-semibold">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-surfaceLight rounded hover:bg-accent hover:text-primary transition-all"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          className="w-12 text-center bg-surface border border-surfaceLight rounded px-2 py-1 text-text"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-surfaceLight rounded hover:bg-accent hover:text-primary transition-all"
                        >
                          +
                        </button>
                        <span className="text-textSecondary text-xs ml-auto">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ShoppingCart className="text-textSecondary/30 mx-auto mb-2" size={32} />
                  <p className="text-textSecondary text-sm">No items in cart</p>
                </div>
              )}
            </Card>

            {/* Totals */}
            {cartItems.length > 0 && (
              <Card className="bg-surfaceLight">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-textSecondary">Subtotal:</span>
                    <span className="text-text">₦{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-surface pt-2">
                    <span className="text-textSecondary">Profit:</span>
                    <span className="text-green-400 font-semibold">₦{totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-surface pt-2 mt-2">
                    <span className="text-text">Total:</span>
                    <span className="text-accent">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Customer Info */}
            <Card>
              <h2 className="text-lg font-bold text-text mb-4">Customer Information</h2>
              <div className="space-y-4">
                <Input
                  label="Customer Name"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="08107271610"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
                <Select
                  label="Payment Method"
                  options={[
                    { value: 'cash', label: '💵 Cash' },
                    { value: 'transfer', label: '🏦 Bank Transfer' },
                    { value: 'card', label: '💳 Card' },
                  ]}
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="primary" className="w-full">
                Complete Sale
              </Button>
              <Button variant="tertiary" className="w-full">
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
