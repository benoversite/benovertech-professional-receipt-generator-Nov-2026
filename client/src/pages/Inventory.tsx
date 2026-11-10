import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle, Loader } from 'lucide-react';
import { MainLayout } from '../layout/MainLayout';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/api';

interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
}

interface FormData {
  name: string;
  category: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
  barcode: string;
}

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    barcode: '',
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter((p) => p.stock < 10).length;

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(['all', ...categoriesData]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('Inventory error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSaveError('Product name is required');
      return false;
    }
    if (!formData.category.trim()) {
      setSaveError('Category is required');
      return false;
    }
    const costPrice = parseFloat(formData.costPrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    if (isNaN(costPrice) || isNaN(sellingPrice)) {
      setSaveError('Cost price and selling price must be valid numbers');
      return false;
    }
    if (sellingPrice < costPrice) {
      setSaveError('Selling price must be greater than cost price');
      return false;
    }
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      setSaveError('Stock must be a valid number');
      return false;
    }
    setSaveError(null);
    return true;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      setSavingProduct(true);
      setSaveError(null);

      const productData = {
        name: formData.name,
        category: formData.category,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock),
        barcode: formData.barcode || undefined,
      };

      if (editingId) {
        // Update existing product
        const updatedProduct = await updateProduct(editingId, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updatedProduct : p))
        );
      } else {
        // Create new product
        const newProduct = await createProduct(productData);
        setProducts((prev) => [newProduct, ...prev]);
      }

      setShowAddProduct(false);
      setEditingId(null);
      setFormData({
        name: '',
        category: '',
        costPrice: '',
        sellingPrice: '',
        stock: '',
        barcode: '',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      setSaveError(errorMessage);
      console.error('Save product error:', err);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || '',
    });
    setShowAddProduct(true);
    setSaveError(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      alert(`Error: ${errorMessage}`);
      console.error('Delete product error:', err);
    }
  };

  const handleCloseModal = () => {
    setShowAddProduct(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      stock: '',
      barcode: '',
    });
    setSaveError(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text">Inventory Management</h1>
            <p className="text-textSecondary mt-1">Manage your product catalog</p>
          </div>
          <Button onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              category: '',
              costPrice: '',
              sellingPrice: '',
              stock: '',
              barcode: '',
            });
            setShowAddProduct(true);
            setSaveError(null);
          }}>
            <Plus size={20} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-400" size={24} />
              <div>
                <p className="font-semibold text-text">Error Loading Inventory</p>
                <p className="text-sm text-textSecondary">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-accent mr-3" size={32} />
            <p className="text-textSecondary">Loading products...</p>
          </Card>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-textSecondary text-sm font-semibold uppercase">Total Products</p>
                    <p className="text-3xl font-bold text-accent mt-2">{products.length}</p>
                  </div>
                  <Package className="text-accent/30" size={40} />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-textSecondary text-sm font-semibold uppercase">Total Stock Value</p>
                    <p className="text-3xl font-bold text-secondary mt-2">
                      ₦{products.reduce((sum, p) => sum + p.costPrice * p.stock, 0).toLocaleString()}
                    </p>
                  </div>
                  <Package className="text-secondary/30" size={40} />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-textSecondary text-sm font-semibold uppercase">Low Stock Alert</p>
                    <p className="text-3xl font-bold text-red-400 mt-2">{lowStockCount}</p>
                  </div>
                  <AlertCircle className="text-red-400/30" size={40} />
                </div>
              </Card>
            </div>

            {/* Filters & Search */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" size={20} />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  options={categories.map((cat) => ({
                    value: cat,
                    label: cat === 'all' ? 'All Categories' : cat,
                  }))}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="md:w-48"
                />
              </div>
            </Card>

            {/* Products Table */}
            <Card>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="text-textSecondary/30 mx-auto mb-3" size={40} />
                  <p className="text-textSecondary">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surfaceLight">
                        <th className="text-left py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Product
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Category
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Cost Price
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Selling Price
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Stock
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Margin
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const margin = (
                          ((product.sellingPrice - product.costPrice) / product.costPrice) *
                          100
                        ).toFixed(1);
                        const isLowStock = product.stock < 10;
                        const isOutOfStock = product.stock === 0;

                        return (
                          <tr
                            key={product.id}
                            className="border-b border-surfaceLight hover:bg-surfaceLight/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-text">{product.name}</p>
                                <p className="text-xs text-textSecondary mt-1">{product.barcode}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-text font-semibold">₦{product.costPrice.toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-accent font-semibold">₦{product.sellingPrice.toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center">
                                {isOutOfStock ? (
                                  <Badge variant="danger" className="text-xs">
                                    Out of Stock
                                  </Badge>
                                ) : isLowStock ? (
                                  <Badge variant="danger" className="text-xs">
                                    {product.stock} left
                                  </Badge>
                                ) : (
                                  <Badge variant="success" className="text-xs">
                                    {product.stock} in stock
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <p className="font-semibold text-green-400">{margin}%</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 hover:bg-surfaceLight rounded transition-colors"
                                >
                                  <Edit2 size={16} className="text-accent" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 hover:bg-surfaceLight rounded transition-colors"
                                >
                                  <Trash2 size={16} className="text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-textSecondary hover:text-text transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {saveError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{saveError}</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Product Name"
                  placeholder="e.g., iPhone 15 Pro"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  label="Category"
                  options={categories.slice(1).map((cat) => ({ value: cat, label: cat }))}
                  placeholder="Select category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Cost Price (₦)"
                  placeholder="100000"
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Selling Price (₦)"
                  placeholder="150000"
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Stock Quantity"
                  placeholder="10"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Barcode (Optional)"
                  placeholder="8901012345678"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSaveProduct}
                    disabled={savingProduct}
                  >
                    {savingProduct ? (
                      <Loader size={18} className="animate-spin mr-2" />
                    ) : (
                      <Plus size={18} className="mr-2" />
                    )}
                    {editingId ? 'Update Product' : 'Add Product'}
                  </Button>
                  <Button
                    variant="tertiary"
                    className="flex-1"
                    onClick={handleCloseModal}
                    disabled={savingProduct}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text">Inventory Management</h1>
            <p className="text-textSecondary mt-1">Manage your product catalog</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus size={20} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm font-semibold uppercase">Total Products</p>
                <p className="text-3xl font-bold text-accent mt-2">{products.length}</p>
              </div>
              <Package className="text-accent/30" size={40} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm font-semibold uppercase">Total Stock Value</p>
                <p className="text-3xl font-bold text-secondary mt-2">
                  ₦{products.reduce((sum, p) => sum + p.costPrice * p.stock, 0).toLocaleString()}
                </p>
              </div>
              <Package className="text-secondary/30" size={40} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm font-semibold uppercase">Low Stock Alert</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{lowStockCount}</p>
              </div>
              <AlertCircle className="text-red-400/30" size={40} />
            </div>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" size={20} />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={categories.map((cat) => ({
                value: cat,
                label: cat === 'all' ? 'All Categories' : cat,
              }))}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="md:w-48"
            />
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surfaceLight">
                  <th className="text-left py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Cost Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Selling Price
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Stock
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Margin
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-textSecondary uppercase text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const margin = (
                    ((product.sellingPrice - product.costPrice) / product.costPrice) *
                    100
                  ).toFixed(1);
                  const isLowStock = product.stock < 10;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-surfaceLight hover:bg-surfaceLight/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-text">{product.name}</p>
                          <p className="text-xs text-textSecondary mt-1">{product.barcode}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-text font-semibold">₦{product.costPrice.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-accent font-semibold">₦{product.sellingPrice.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isOutOfStock ? (
                            <Badge variant="danger" className="text-xs">
                              Out of Stock
                            </Badge>
                          ) : isLowStock ? (
                            <Badge variant="danger" className="text-xs">
                              {product.stock} left
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">
                              {product.stock} in stock
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="font-semibold text-green-400">{margin}%</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="p-2 hover:bg-surfaceLight rounded transition-colors">
                            <Edit2 size={16} className="text-accent" />
                          </button>
                          <button className="p-2 hover:bg-surfaceLight rounded transition-colors">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text">Add New Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-textSecondary hover:text-text transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <Input label="Product Name" placeholder="e.g., iPhone 15 Pro" required />
                <Select
                  label="Category"
                  options={categories.slice(1).map((cat) => ({ value: cat, label: cat }))}
                  placeholder="Select category"
                  required
                />
                <Input label="Cost Price (₦)" placeholder="100000" type="number" required />
                <Input label="Selling Price (₦)" placeholder="150000" type="number" required />
                <Input label="Stock Quantity" placeholder="10" type="number" required />
                <Input label="Barcode" placeholder="8901012345678" />

                <div className="flex space-x-3 pt-4">
                  <Button variant="primary" className="flex-1">
                    Add Product
                  </Button>
                  <Button
                    variant="tertiary"
                    className="flex-1"
                    onClick={() => setShowAddProduct(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
