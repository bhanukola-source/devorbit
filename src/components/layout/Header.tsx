// ============================================================
// DevOrbit — Header Component
// ============================================================

import { Search, Bell, Menu, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const pageNames: Record<string, string> = {
  overview: 'Overview',
  roadmap: 'DSA Roadmap',
  problems: 'Problem Tracker',
  focus: 'Focus Room',
  projects: 'Project Lab',
  notes: 'Notes',
  statistics: 'Statistics',
  settings: 'Settings',
};

export function Header() {
  const { currentPage, sidebarOpen, setSidebarOpen, setSearchOpen, state } = useApp();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const displayName = state.settings.displayName;

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#0B0D12]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-6">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">{pageNames[currentPage] || 'DevOrbit'}</h1>
          {displayName && (
            <p className="text-xs text-gray-500 hidden sm:block">Welcome back, {displayName}</p>
          )}
        </div>
      </div>

      {/* Right: search, date, notifications, profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          aria-label="Search"
        >
          <Search size={15} />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden md:inline text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-600">⌘K</kbd>
        </button>

        {/* Date */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={14} />
          <span>{today}</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {displayName ? displayName.charAt(0).toUpperCase() : 'D'}
        </div>
      </div>
    </header>
  );
}
