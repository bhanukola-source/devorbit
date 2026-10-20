// ============================================================
// DevOrbit — Sidebar Component
// ============================================================

import {
  LayoutDashboard, Map, ListChecks, Timer, FolderKanban,
  StickyNote, BarChart3, Settings, ChevronLeft, ChevronRight, Orbit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PageId } from '../../types';

const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'roadmap', label: 'DSA Roadmap', icon: <Map size={20} /> },
  { id: 'problems', label: 'Problem Tracker', icon: <ListChecks size={20} /> },
  { id: 'focus', label: 'Focus Room', icon: <Timer size={20} /> },
  { id: 'projects', label: 'Project Lab', icon: <FolderKanban size={20} /> },
  { id: 'notes', label: 'Notes', icon: <StickyNote size={20} /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-[#0E1017] border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-[68px]'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
          <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg shrink-0">
            <Orbit size={20} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-white tracking-tight">DevOrbit</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={!sidebarOpen ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`shrink-0 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block p-3 border-t border-white/5 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-sm"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
