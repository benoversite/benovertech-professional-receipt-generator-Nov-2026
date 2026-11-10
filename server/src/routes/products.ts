import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Get products with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { category, search, lowStock } = req.query;

    interface WhereClause {
      category?: string;
      name?: {
        contains: string;
        mode: 'insensitive';
      };
      stock?: {
        lt: number;
      };
    }

    const where: WhereClause = {};

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    if (lowStock === 'true') {
      where.stock = { lt: 10 }; // Products with stock less than 10
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product by barcode
router.get('/barcode/:barcode', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { barcode } = req.params;

    const product = await prisma.product.findUnique({
      where: { barcode },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { name, category, costPrice, sellingPrice, stock, barcode } = req.body;

    if (!name || !category || costPrice === undefined || sellingPrice === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (sellingPrice < costPrice) {
      return res.status(400).json({ error: 'Selling price must be greater than cost price' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock),
        barcode: barcode || undefined,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Barcode already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { id } = req.params;
    const { name, category, costPrice, sellingPrice, stock, barcode } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate data if provided
    if (costPrice !== undefined && sellingPrice !== undefined) {
      if (sellingPrice < costPrice) {
        return res.status(400).json({ error: 'Selling price must be greater than cost price' });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
        sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        barcode: barcode !== undefined ? (barcode === '' ? null : barcode) : undefined,
      },
    });

    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Barcode already exists' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted', id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get categories
router.get('/categories/all', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;

    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    const categoryList = categories.map((c) => c.category).sort();

    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get low stock products
router.get('/alerts/low-stock', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const threshold = parseInt(req.query.threshold as string) || 10;

    const products = await prisma.product.findMany({
      where: {
        stock: {
          lt: threshold,
        },
      },
      orderBy: { stock: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

export default router;
