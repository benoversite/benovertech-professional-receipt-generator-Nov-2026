import { ReactNode } from 'react';
import { Sidebar, BottomNav } from '../components/Navigation';
import { useIsMobile } from '../hooks/useIsMobile';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar - Desktop */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!isMobile ? 'md:ml-64' : ''}`}>
        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20' : 'p-6'}`}>
          {children}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      {isMobile && <BottomNav />}
    </div>
  );
};
