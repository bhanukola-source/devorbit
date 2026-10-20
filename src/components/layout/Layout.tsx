// ============================================================
// DevOrbit — Layout Component
// ============================================================

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SearchModal } from '../shared/SearchModal';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[68px]'}`}>
        <Header />
        <main className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
      <SearchModal />
    </div>
  );
}
