# BENOVERTECH GADGETS - POS System Frontend

A premium Apple-style Point of Sale (POS) system built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager

### Installation

```bash
cd client
npm install
# or with bun
bun install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Sidebar & bottom nav
│   └── UI.tsx           # Card, Button, Input, etc.
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Sales.tsx        # Sales/Receipt page
│   ├── Inventory.tsx    # Product management
│   └── Analytics.tsx    # Reports & charts
├── layout/
│   └── MainLayout.tsx   # Main layout wrapper
├── hooks/
│   └── useIsMobile.ts   # Mobile detection
├── types/
│   └── index.ts         # TypeScript types
├── styles/
│   └── globals.css      # Global styles & Tailwind
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## 🎨 Design System

### Colors
- **Primary**: Black (`#000000`)
- **Accent**: Gold (`#D4A574`)
- **Accent Light**: Orange (`#F5A623`)
- **Secondary**: Purple (`#9333EA`)
- **Surface**: Dark Gray (`#1A1A1A`, `#2D2D2D`)

### Components
- **Card**: Premium rounded cards with soft shadows
- **Button**: Multiple variants (primary, secondary, tertiary)
- **Input**: Form inputs with validation states
- **StatCard**: Dashboard statistics display
- **Badge**: Status indicators

## 📱 Responsive Design

- **Desktop**: Sidebar navigation (left)
- **Mobile**: Bottom navigation bar
- Mobile-first approach with Tailwind breakpoints
- Automatic layout switching via `useIsMobile` hook

## 🔄 Routing

All pages start with `/` (Dashboard) as the default:

- `/` - Dashboard (default home)
- `/sales` - Create sales/receipts
- `/inventory` - Manage products
- `/analytics` - View reports & charts

## 🔗 API Integration (Ready for Backend)

The app is configured to proxy API calls to backend at `http://localhost:3000`:

```typescript
// Example API call
fetch('/api/products')
  .then(res => res.json())
  .then(data => console.log(data))
```

Backend should be running on port 3000.

## 📦 Dependencies

- **React 18**: UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **jsPDF & html2canvas**: PDF generation (for receipts)

## 🎯 Pages Overview

### Dashboard
- Revenue, profit, and sales statistics
- Top-selling products
- Low stock alerts
- Quick overview cards

### Sales
- Product search and barcode scanning
- Shopping cart with quantity control
- Customer information form
- Payment method selection
- Sale summary and totals

### Inventory
- Product listing with search/filter
- Add, edit, delete products
- Stock level management
- Category filtering
- Low stock alerts

### Analytics
- Revenue and profit trends
- Daily sales volume charts
- Top products by revenue
- Payment method distribution
- Performance summary metrics

## 🚀 Next Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Start backend** (in separate terminal):
   ```bash
   cd ../server
   npm run dev
   ```

4. **Connect API endpoints** in services layer

## ⚙️ Configuration

### Tailwind Config
- Custom color palette in `tailwind.config.ts`
- Custom spacing and shadows
- Responsive breakpoints (768px mobile)

### Vite Config
- API proxy to backend
- React plugin enabled
- Development port: 5173

### PostCSS
- Tailwind CSS integration
- Autoprefixer for vendor prefixes

## 📝 Notes

- No authentication required - app opens directly to dashboard
- Static UI only - API integration ready
- Responsive design works on all screen sizes
- Premium Apple-inspired design aesthetic
