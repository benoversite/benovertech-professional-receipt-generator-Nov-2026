# BENOVERTECH GADGETS - POS System

A complete production-ready Point of Sale system built with React, Node.js, Express, Prisma, and SQLite.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager
- Two terminal windows

---

## Backend Setup

### 1. Navigate to Server
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Initialize Database
```bash
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate
```

This creates `dev.db` (SQLite database) with all tables.

### 4. Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
✓ Server running on http://localhost:3000
✓ API Health: http://localhost:3000/api/health
```

Server runs on **port 3000**

---

## Frontend Setup (New Terminal)

### 1. Navigate to Client
```bash
cd client
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

Frontend runs on **port 5173**

---

## Access the Application

Open your browser and visit:
```
http://localhost:5173
```

🎉 **POS System is ready to use!**

---

## 📱 Pages Available

- **Dashboard** (default home) - Overview and key metrics
- **Sales** - Create transactions and process sales
- **Inventory** - Manage products
- **Analytics** - View business reports and trends

No login required - app opens immediately into the dashboard.

---

## 🔧 Development

### Backend Commands
```bash
cd server

# Development
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Frontend Commands
```bash
cd client

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 API Endpoints

Backend API base: `http://localhost:3000/api`

### Products
- `GET /products` - List all
- `POST /products` - Create
- `PUT /products/:id` - Update
- `DELETE /products/:id` - Delete
- `GET /products/barcode/:barcode` - Get by barcode
- `GET /products/categories/all` - List categories
- `GET /products/alerts/low-stock` - Low stock products

### Sales
- `GET /sales` - List all sales
- `POST /sales` - Create sale
- `GET /sales/:id` - Get sale details
- `GET /sales/stats/summary` - Sales summary
- `GET /sales/analytics/top-products` - Top products
- `GET /sales/analytics/daily` - Daily data

### Health
- `GET /health` - Health check

---

## 💾 Database

SQLite database stored at: `server/dev.db`

### Tables
1. **Product** - Inventory items
2. **Sale** - Transactions
3. **SaleItem** - Line items in sales

To view/edit database GUI:
```bash
cd server
npm run prisma:studio
```

---

## 🎨 Design System

### Colors
- **Primary**: Black (#000000)
- **Accent**: Gold (#D4A574)
- **Secondary**: Purple (#9333EA)
- **Surfaces**: Dark Gray

### Mobile Responsive
- Desktop: Sidebar navigation
- Mobile: Bottom navigation bar
- Breakpoint: 768px

---

## ✨ Features

### Dashboard
- Revenue and profit statistics
- Sales count and trends
- Low stock alerts
- Top-selling products
- Average transaction value
- Profit margin calculation

### Sales
- Product search
- Barcode scanning support
- Shopping cart
- Quantity management
- Customer information
- Payment method selection
- Real-time profit calculation
- Stock validation

### Inventory
- Product list with search/filter
- Add new products
- Edit products
- Delete products
- Stock tracking
- Low stock alerts
- Profit margin display
- Cost vs selling price

### Analytics
- 30-day revenue trends
- Profit tracking
- Daily sales volume
- Top products
- Payment method breakdown
- Transaction statistics
- Average transaction value

---

## 🔐 Security & Features

- ✅ No authentication (instant usability)
- ✅ Real-time stock management
- ✅ Automatic profit calculation
- ✅ Prevents overselling
- ✅ Error handling and validation
- ✅ Loading states and feedback
- ✅ Responsive design
- ✅ Data persistence (SQLite)

---

## 📝 Notes

- Profit = Selling Price - Cost Price
- Stock is decremented after each sale
- Sales cannot be completed with insufficient stock
- All data is stored locally in SQLite
- No external API dependencies
- Premium Apple-style UI design

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend not connecting to backend
- Ensure backend is running on port 3000
- Check Vite proxy in `client/vite.config.ts`
- Verify CORS is enabled in backend

### Database issues
```bash
cd server
rm dev.db
npm run prisma:migrate
```

### Clear Prisma cache
```bash
cd server
npm run prisma:generate
```

---

## 📦 Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- CORS

---

## 📧 Support

For issues or questions, refer to:
- Backend: `server/README.md`
- Frontend: `client/README.md`

---

**Ready to go! 🚀**
