import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Tag 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  Card, 
  Button, 
  Badge, 
  Modal, 
  ConfirmDialog, 
  Input, 
  Textarea, 
  Toast 
} from '../components/ui';
import { generateId, formatDate } from '../utils/storage';
import type { Note } from '../types';

export function Notes() {
  const { state, dispatch, recordActivity } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [revisionOnly, setRevisionOnly] = useState(false);

  // Modals & State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Data Structures',
    tagsInput: '',
    isPinned: false,
    needsRevision: false,
  });

  // Extract all categories and tags
  const { categories, tags } = useMemo(() => {
    const catSet = new Set<string>();
    const tagSet = new Set<string>();

    state.notes.forEach(note => {
      if (note.category) catSet.add(note.category);
      if (note.tags) note.tags.forEach(t => tagSet.add(t));
    });

    return {
      categories: Array.from(catSet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [state.notes]);

  // Filtered & Sorted notes: Pinned first, then newest updated
  const filteredNotes = useMemo(() => {
    return state.notes
      .filter(note => {
        if (selectedCategory !== 'all' && note.category !== selectedCategory) return false;
        if (selectedTag !== 'all' && !note.tags.includes(selectedTag)) return false;
        if (pinnedOnly && !note.isPinned) return false;
        if (revisionOnly && !note.needsRevision) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            note.title.toLowerCase().includes(q) ||
            note.content.toLowerCase().includes(q) ||
            note.category.toLowerCase().includes(q) ||
            note.tags.some(t => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes always on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [state.notes, selectedCategory, selectedTag, pinnedOnly, revisionOnly, searchQuery]);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Data Structures',
      tagsInput: '',
      isPinned: false,
      needsRevision: false,
    });
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tagsInput: note.tags.join(', '),
      isPinned: note.isPinned,
      needsRevision: note.needsRevision,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tags = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    if (editingNote) {
      const updated: Note = {
        ...editingNote,
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category.trim() || 'General',
        tags,
        isPinned: formData.isPinned,
        needsRevision: formData.needsRevision,
        updatedAt: now,
      };
      dispatch({ type: 'UPDATE_NOTE', payload: updated });
      setToastMessage('Note updated.');
    } else {
      const newNote: Note = {
        id: generateId(),
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category.trim() || 'General',
        tags,
        isPinned: formData.isPinned,
        needsRevision: formData.needsRevision,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_NOTE', payload: newNote });
      setToastMessage('New study note created!');
    }

    recordActivity();
    setIsModalOpen(false);
  };

  const handleDeleteNote = () => {
    if (!deletingNoteId) return;
    dispatch({ type: 'DELETE_NOTE', payload: deletingNoteId });
    setToastMessage('Note deleted.');
    setDeletingNoteId(null);
    if (viewingNote?.id === deletingNoteId) setViewingNote(null);
  };

  const handleTogglePin = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Note = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_NOTE', payload: updated });
    recordActivity();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Study Notes & Insights</h1>
          <p className="text-sm text-gray-400 mt-1">
            Capture algorithm design patterns, interview tips, code snippets, and concepts.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0 self-start sm:self-auto">
          <Plus size={16} /> New Note
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search notes by title, markdown content, tags, or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-2 px-3 focus:outline-none"
            >
              <option value="all" className="bg-[#12141A]">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#12141A]">{c}</option>
              ))}
            </select>

            {/* Tag Dropdown */}
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-2 px-3 focus:outline-none"
            >
              <option value="all" className="bg-[#12141A]">All Tags</option>
              {tags.map(t => (
                <option key={t} value={t} className="bg-[#12141A]">#{t}</option>
              ))}
            </select>

            {/* Pinned filter toggle */}
            <button
              onClick={() => setPinnedOnly(!pinnedOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                pinnedOnly 
                  ? 'bg-purple-600 text-white border-purple-500' 
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              <Pin size={13} className={pinnedOnly ? 'fill-current' : ''} /> Pinned
            </button>

            {/* Needs revision toggle */}
            <button
              onClick={() => setRevisionOnly(!revisionOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                revisionOnly 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              <RotateCcw size={13} /> Needs Revision
            </button>
          </div>
        </div>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 text-sm">
          No study notes found. Click "New Note" above to write down key interview concepts and tips!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map(note => (
            <Card
              key={note.id}
              hover
              onClick={() => setViewingNote(note)}
              className={`p-5 flex flex-col justify-between relative group transition-all ${
                note.isPinned 
                  ? 'border-purple-500/30 bg-[#141620]' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                {/* Top flags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="purple">{note.category}</Badge>
                  <div className="flex items-center gap-1">
                    {note.needsRevision && (
                      <span title="Needs Revision" className="text-amber-400 p-1">
                        <RotateCcw size={13} />
                      </span>
                    )}
                    <button
                      onClick={(e) => handleTogglePin(note, e)}
                      className={`p-1 rounded transition-colors ${
                        note.isPinned 
                          ? 'text-purple-400 hover:text-purple-300' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin to top'}
                    >
                      <Pin size={14} className={note.isPinned ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {note.title}
                </h3>

                {/* Content preview snippet */}
                <p className="text-xs text-gray-400 line-clamp-4 whitespace-pre-wrap font-sans leading-relaxed mb-4">
                  {note.content}
                </p>
              </div>

              <div>
                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map(t => (
                      <span key={t} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer date & actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-gray-500">
                  <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(note);
                      }}
                      className="p-1 hover:text-white transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingNoteId(note.id);
                      }}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Study Note' : 'Create Study Note'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Note Title *"
            required
            placeholder="e.g. Kadane's Algorithm Intuition & Pitfalls"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Topic / Category"
              placeholder="e.g. Dynamic Programming, Trees, System Design"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Tags (Comma-separated)"
              placeholder="e.g. greedy, sliding-window, revision"
              value={formData.tagsInput}
              onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
            />
          </div>

          <Textarea
            label="Note Content (Markdown / Code formatted)"
            placeholder="Write explanations, recurrence relations, code templates, or key takeaway insights..."
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            className="font-mono text-xs leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                className="rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500"
              />
              Pin this note to the top
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.needsRevision}
                onChange={e => setFormData({ ...formData, needsRevision: e.target.checked })}
                className="rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500"
              />
              Mark for active revision
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingNote ? 'Save Changes' : 'Create Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Note Reader Modal */}
      {viewingNote && (
        <Modal
          open={!!viewingNote}
          onClose={() => setViewingNote(null)}
          title={viewingNote.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Badge variant="purple">{viewingNote.category}</Badge>
                {viewingNote.isPinned && <Badge variant="default">Pinned</Badge>}
                {viewingNote.needsRevision && <Badge variant="warning">Revision Due</Badge>}
              </div>
              <span className="text-xs text-gray-500">
                Updated {formatDate(viewingNote.updatedAt || viewingNote.createdAt)}
              </span>
            </div>

            <div className="bg-[#0B0D12] p-4 rounded-xl border border-white/5 text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-[50vh]">
              {viewingNote.content || 'No content written in this note.'}
            </div>

            {viewingNote.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <Tag size={13} className="text-gray-500" />
                {viewingNote.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => setDeletingNoteId(viewingNote.id)}
              >
                Delete Note
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  const n = viewingNote;
                  setViewingNote(null);
                  handleOpenEditModal(n);
                }}
              >
                Edit Note
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleDeleteNote}
        title="Delete Study Note"
        message="Are you sure you want to delete this note? This action cannot be reversed."
        confirmText="Delete"
        variant="danger"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
