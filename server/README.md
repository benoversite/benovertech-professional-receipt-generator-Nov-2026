# BENOVERTECH GADGETS - POS System Backend

Express.js + Prisma + SQLite backend for the BENOVERTECH POS system.

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
# or with bun
bun install
```

### 2. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates dev.db)
npm run prisma:migrate
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Documentation

### Health Check
```
GET /api/health
```

### Products

#### Get All Products
```
GET /api/products
Query params:
  - category: filter by category
  - search: search by name
  - lowStock: true (shows products with stock < 10)
```

#### Get Product by ID
```
GET /api/products/:id
```

#### Get Product by Barcode
```
GET /api/products/barcode/:barcode
```

#### Create Product
```
POST /api/products
Body:
{
  "name": "iPhone 15 Pro",
  "category": "Smartphones",
  "costPrice": 120000,
  "sellingPrice": 150000,
  "stock": 10,
  "barcode": "8901012345678"
}
```

#### Update Product
```
PUT /api/products/:id
Body: (all fields optional)
{
  "name": "iPhone 15 Pro Max",
  "stock": 5
}
```

#### Delete Product
```
DELETE /api/products/:id
```

#### Get All Categories
```
GET /api/products/categories/all
```

#### Get Low Stock Alerts
```
GET /api/products/alerts/low-stock
Query params:
  - threshold: stock level (default: 10)
```

### Sales

#### Get All Sales
```
GET /api/sales
Query params:
  - startDate: ISO date (2024-01-01)
  - endDate: ISO date
  - limit: number of results
```

#### Get Sale by ID
```
GET /api/sales/:id
```

#### Create Sale
```
POST /api/sales
Body:
{
  "items": [
    {
      "productId": "product-id-123",
      "quantity": 2
    }
  ],
  "customerName": "John Doe",
  "customerPhone": "08107271610",
  "paymentMethod": "cash"
}
```

Returns:
- Sale ID
- Total amount
- Total profit
- Created sale items with product details

#### Get Sales Summary
```
GET /api/sales/stats/summary
Query params:
  - days: number of days to calculate (default: 30)
```

Returns:
- Total revenue
- Total profit
- Total sales count
- Average transaction value

#### Get Top Selling Products
```
GET /api/sales/analytics/top-products
Query params:
  - limit: number of products (default: 10)
```

#### Get Daily Sales Data
```
GET /api/sales/analytics/daily
Query params:
  - days: number of days (default: 30)
```

## Database Schema

### Product
- id: unique identifier
- name: product name
- category: product category
- costPrice: cost price (in Naira)
- sellingPrice: selling price (in Naira)
- stock: quantity in stock
- barcode: optional unique barcode
- createdAt, updatedAt: timestamps

### Sale
- id: unique identifier
- totalAmount: total sale amount
- totalProfit: total profit from sale
- customerName: customer name (default: "Walk-in Customer")
- customerPhone: customer phone number
- paymentMethod: cash, transfer, or card
- createdAt: timestamp

### SaleItem
- id: unique identifier
- saleId: reference to Sale
- productId: reference to Product
- quantity: quantity sold
- price: selling price at time of sale
- profit: profit per item (price - costPrice)

## Environment Variables

```
DATABASE_URL=file:./dev.db
PORT=3000
NODE_ENV=development
```

## Development Commands

```bash
# Start dev server
npm run dev

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (GUI database browser)
npm run prisma:studio

# Build for production
npm run build

# Start production build
npm start
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Notes

- Stock is automatically decremented when a sale is created
- Stock must be sufficient before creating a sale
- Profit is automatically calculated from costPrice and sellingPrice
- Barcode must be unique if provided
- Payment methods: cash, transfer, card
