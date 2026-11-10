import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export const NavItem = ({ item }: { item: (typeof navItems)[0] }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
        ${isActive
          ? 'bg-accent text-primary font-semibold'
          : 'text-textSecondary hover:text-text hover:bg-surfaceLight'
        }
      `}
    >
      <Icon size={20} />
      <span className="hidden sm:inline">{item.label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-surface border-r border-surfaceLight p-6 space-y-8 fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <span className="text-primary font-bold text-lg">B</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-accent">BENOVERTECH</h1>
          <p className="text-xs text-textSecondary">Gadgets POS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Business Info */}
      <div className="border-t border-surfaceLight pt-6 space-y-3 text-sm">
        <div>
          <p className="text-textSecondary text-xs uppercase font-semibold">Phone</p>
          <p className="text-accent font-semibold">08107271610</p>
        </div>
        <div>
          <p className="text-textSecondary text-xs uppercase font-semibold">Email</p>
          <p className="text-accent font-semibold truncate">benovertech@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export const BottomNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surfaceLight z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
};

export { navItems };
