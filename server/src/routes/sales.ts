import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Get all sales with items
router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { startDate, endDate, limit } = req.query;

    interface WhereClause {
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const where: WhereClause = {};

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate as string),
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate as string),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : undefined,
    });

    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get single sale
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// Create new sale
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { items, customerName, customerPhone, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Validate payment method
    const validMethods = ['cash', 'transfer', 'card'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Check stock availability and calculate totals
    let totalAmount = 0;
    let totalProfit = 0;

    const processedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }

      // Fetch product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Product ${productId} not found` });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
        });
      }

      const itemTotal = product.sellingPrice * quantity;
      const itemProfit = (product.sellingPrice - product.costPrice) * quantity;

      totalAmount += itemTotal;
      totalProfit += itemProfit;

      processedItems.push({
        productId,
        quantity,
        price: product.sellingPrice,
        profit: product.sellingPrice - product.costPrice,
      });
    }

    // Create sale in transaction
    const sale = await prisma.sale.create({
      data: {
        totalAmount,
        totalProfit,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || '',
        paymentMethod,
        items: {
          create: processedItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Reduce stock for each product
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Get sales summary stats
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { days } = req.query;
    const dayCount = days ? parseInt(days as string) : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayCount);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalSales = sales.length;

    res.json({
      totalRevenue,
      totalProfit,
      totalSales,
      averageTransactionValue: sales.length > 0 ? totalRevenue / sales.length : 0,
      period: `Last ${dayCount} days`,
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
});

// Get top selling products
router.get('/analytics/top-products', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { limit } = req.query;
    const itemLimit = limit ? parseInt(limit as string) : 10;

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: itemLimit,
    });

    // Fetch product details
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          product,
          totalQuantitySold: item._sum.quantity || 0,
          transactionCount: item._count,
        };
      })
    );

    res.json(productsWithDetails);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Get daily sales data
router.get('/analytics/daily', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma as PrismaClient;
    const { days } = req.query;
    const dayCount = days ? parseInt(days as string) : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayCount);
    startDate.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Group by date
    const dailyData: { [key: string]: { revenue: number; profit: number; count: number } } = {};

    sales.forEach((sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, profit: 0, count: 0 };
      }
      dailyData[date].revenue += sale.totalAmount;
      dailyData[date].profit += sale.totalProfit;
      dailyData[date].count += 1;
    });

    const result = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        profit: data.profit,
        sales: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
});

export default router;
