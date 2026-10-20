// ============================================================
// DevOrbit — Global Search Modal
// ============================================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Map, ListChecks, FolderKanban, StickyNote, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PageId } from '../../types';

interface SearchResult {
  id: string;
  type: 'topic' | 'problem' | 'project' | 'note';
  title: string;
  subtitle: string;
  page: PageId;
  icon: React.ReactNode;
}

export function SearchModal() {
  const { state, searchOpen, setSearchOpen, setCurrentPage } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleClose = () => {
    setQuery('');
    setSearchOpen(false);
  };

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const items: SearchResult[] = [];

    // Search roadmap topics
    state.roadmapTopics.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        items.push({
          id: t.id,
          type: 'topic',
          title: t.title,
          subtitle: `Phase ${t.phase} · ${t.status}`,
          page: 'roadmap',
          icon: <Map size={16} className="text-purple-400" />,
        });
      }
    });

    // Search problems
    state.problems.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q) || p.platform.toLowerCase().includes(q)) {
        items.push({
          id: p.id,
          type: 'problem',
          title: p.title,
          subtitle: `${p.platform} · ${p.difficulty} · ${p.status}`,
          page: 'problems',
          icon: <ListChecks size={16} className="text-blue-400" />,
        });
      }
    });

    // Search projects
    state.projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        items.push({
          id: p.id,
          type: 'project',
          title: p.name,
          subtitle: `${p.status} · ${p.progress}%`,
          page: 'projects',
          icon: <FolderKanban size={16} className="text-emerald-400" />,
        });
      }
    });

    // Search notes
    state.notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q))) {
        items.push({
          id: n.id,
          type: 'note',
          title: n.title,
          subtitle: n.category || 'Uncategorized',
          page: 'notes',
          icon: <StickyNote size={16} className="text-amber-400" />,
        });
      }
    });

    return items.slice(0, 20);
  }, [query, state]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#12141A] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={18} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search topics, problems, projects, notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
            aria-label="Search"
          />
          <kbd className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-600">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          )}
          {results.map(r => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => {
                setCurrentPage(r.page);
                handleClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
            >
              {r.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{r.title}</p>
                <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
              </div>
              <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 shrink-0" />
            </button>
          ))}
        </div>

        {!query.trim() && (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            Start typing to search across your workspace
          </div>
        )}
      </div>
    </div>
  );
}
