import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RotateCcw
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
  Select, 
  Toast 
} from '../components/ui';
import { generateId, getTodayString } from '../utils/storage';
import type { Problem, ProblemDifficulty, ProblemStatus } from '../types';

export function ProblemTracker() {
  const { state, dispatch, recordActivity } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [needsRevisionOnly, setNeedsRevisionOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date' | 'difficulty' | 'status'>('date');

  // Modals & Active state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null);
  const [viewingProblem, setViewingProblem] = useState<Problem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    platform: 'LeetCode',
    url: '',
    topic: 'Arrays',
    pattern: '',
    difficulty: 'Easy' as ProblemDifficulty,
    status: 'To Do' as ProblemStatus,
    dateSolved: '',
    notes: '',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsRevision: false,
  });

  // Extract unique topics from problems
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    state.problems.forEach(p => {
      if (p.topic) set.add(p.topic);
    });
    return Array.from(set).sort();
  }, [state.problems]);

  // Filtered & Sorted list
  const filteredProblems = useMemo(() => {
    return state.problems
      .filter(problem => {
        if (selectedDifficulty !== 'all' && problem.difficulty !== selectedDifficulty) return false;
        if (selectedStatus !== 'all' && problem.status !== selectedStatus) return false;
        if (selectedTopic !== 'all' && problem.topic !== selectedTopic) return false;
        if (needsRevisionOnly && !problem.needsRevision) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            problem.title.toLowerCase().includes(q) ||
            problem.platform.toLowerCase().includes(q) ||
            problem.topic.toLowerCase().includes(q) ||
            problem.pattern.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'difficulty') {
          const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
          return diffWeight[b.difficulty] - diffWeight[a.difficulty];
        }
        if (sortBy === 'status') {
          const statusWeight = { 'Solved': 1, 'Attempted': 2, 'To Do': 3 };
          return statusWeight[a.status] - statusWeight[b.status];
        }
        // Date sort
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [state.problems, selectedDifficulty, selectedStatus, selectedTopic, needsRevisionOnly, searchQuery, sortBy]);

  // Problem counts summary
  const totalCount = state.problems.length;
  const solvedCount = state.problems.filter(p => p.status === 'Solved').length;
  const attemptedCount = state.problems.filter(p => p.status === 'Attempted').length;
  const todoCount = state.problems.filter(p => p.status === 'To Do').length;

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      platform: 'LeetCode',
      url: '',
      topic: 'Arrays',
      pattern: '',
      difficulty: 'Easy',
      status: 'To Do',
      dateSolved: '',
      notes: '',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      needsRevision: false,
    });
    setEditingProblem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (problem: Problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      platform: problem.platform,
      url: problem.url,
      topic: problem.topic,
      pattern: problem.pattern,
      difficulty: problem.difficulty,
      status: problem.status,
      dateSolved: problem.dateSolved || '',
      notes: problem.notes,
      timeComplexity: problem.timeComplexity,
      spaceComplexity: problem.spaceComplexity,
      needsRevision: problem.needsRevision,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const now = new Date().toISOString();
    const today = getTodayString();
    const isSolved = formData.status === 'Solved';
    const dateSolved = isSolved ? (formData.dateSolved || today) : null;

    if (editingProblem) {
      const updated: Problem = {
        ...editingProblem,
        ...formData,
        dateSolved,
        isSample: false, // Customized by user
        updatedAt: now,
      };
      dispatch({ type: 'UPDATE_PROBLEM', payload: updated });
      setToastMessage('Problem updated successfully!');
    } else {
      const newProblem: Problem = {
        id: generateId(),
        ...formData,
        dateSolved,
        isSample: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_PROBLEM', payload: newProblem });
      setToastMessage('New problem added to your tracker!');
    }

    recordActivity({ problemsDelta: isSolved ? 1 : 0 });
    setIsAddModalOpen(false);
  };

  const handleDeleteProblem = () => {
    if (!deletingProblemId) return;
    dispatch({ type: 'DELETE_PROBLEM', payload: deletingProblemId });
    setToastMessage('Problem deleted.');
    setDeletingProblemId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Problem Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">
            Log, classify, and track your practice problems across all coding platforms.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0 self-start sm:self-auto">
          <Plus size={16} /> Add Problem
        </Button>
      </div>

      {/* Stats summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#12141A]">
          <p className="text-xs font-medium text-gray-400 uppercase">Total Problems</p>
          <p className="text-xl font-bold text-white mt-1">{totalCount}</p>
        </Card>
        <Card className="p-4 bg-[#12141A] border-l-2 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-400 uppercase">Solved</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{solvedCount}</p>
        </Card>
        <Card className="p-4 bg-[#12141A] border-l-2 border-l-blue-500">
          <p className="text-xs font-medium text-gray-400 uppercase">Attempted</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{attemptedCount}</p>
        </Card>
        <Card className="p-4 bg-[#12141A] border-l-2 border-l-gray-600">
          <p className="text-xs font-medium text-gray-400 uppercase">To Do</p>
          <p className="text-xl font-bold text-gray-400 mt-1">{todoCount}</p>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by title, platform, topic, or pattern..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-2 px-3 focus:outline-none"
            >
              <option value="all" className="bg-[#12141A]">All Topics</option>
              {availableTopics.map(t => (
                <option key={t} value={t} className="bg-[#12141A]">{t}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-2 px-3 focus:outline-none"
            >
              <option value="all" className="bg-[#12141A]">All Difficulties</option>
              <option value="Easy" className="bg-[#12141A]">Easy</option>
              <option value="Medium" className="bg-[#12141A]">Medium</option>
              <option value="Hard" className="bg-[#12141A]">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-2 px-3 focus:outline-none"
            >
              <option value="all" className="bg-[#12141A]">All Statuses</option>
              <option value="To Do" className="bg-[#12141A]">To Do</option>
              <option value="Attempted" className="bg-[#12141A]">Attempted</option>
              <option value="Solved" className="bg-[#12141A]">Solved</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-2 px-3 focus:outline-none"
            >
              <option value="date" className="bg-[#12141A]">Sort by: Date Added</option>
              <option value="difficulty" className="bg-[#12141A]">Sort by: Difficulty</option>
              <option value="status" className="bg-[#12141A]">Sort by: Status</option>
            </select>

            {/* Revision Toggle */}
            <button
              onClick={() => setNeedsRevisionOnly(!needsRevisionOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                needsRevisionOnly
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              <RotateCcw size={13} /> Needs Revision
            </button>
          </div>
        </div>
      </Card>

      {/* Problems Display: Desktop Table / Mobile Cards */}
      {filteredProblems.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 text-sm">
          No problems found matching your selected criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/5 bg-[#12141A]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 font-semibold">Problem Title</th>
                  <th className="py-3 px-4 font-semibold">Platform</th>
                  <th className="py-3 px-4 font-semibold">Topic & Pattern</th>
                  <th className="py-3 px-4 font-semibold">Difficulty</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Complexity</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProblems.map(problem => (
                  <tr key={problem.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingProblem(problem)}
                          className="hover:text-purple-400 font-medium text-left truncate transition-colors"
                        >
                          {problem.title}
                        </button>
                        {problem.isSample && (
                          <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded shrink-0">
                            Sample
                          </span>
                        )}
                        {problem.needsRevision && (
                          <span title="Needs Revision" className="text-amber-400">
                            <RotateCcw size={13} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {problem.url ? (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-purple-400 inline-flex items-center gap-1 transition-colors"
                        >
                          {problem.platform} <ExternalLink size={11} />
                        </a>
                      ) : (
                        problem.platform
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="default">{problem.topic}</Badge>
                        {problem.pattern && (
                          <span className="text-xs text-gray-500 font-mono">
                            {problem.pattern}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'danger'}>
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        problem.status === 'Solved' ? 'text-emerald-400' : problem.status === 'Attempted' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {problem.status === 'Solved' && <CheckCircle2 size={13} />}
                        {problem.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-500">
                      {problem.timeComplexity} / {problem.spaceComplexity}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(problem)}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingProblemId(problem.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">
            {filteredProblems.map(problem => (
              <Card key={problem.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 
                      onClick={() => setViewingProblem(problem)}
                      className="font-semibold text-white text-base hover:text-purple-400 cursor-pointer"
                    >
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{problem.platform}</span>
                      <span>·</span>
                      <span>{problem.topic}</span>
                    </div>
                  </div>
                  <Badge variant={problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'danger'}>
                    {problem.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className={`font-medium ${
                    problem.status === 'Solved' ? 'text-emerald-400' : problem.status === 'Attempted' ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {problem.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(problem)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setDeletingProblemId(problem.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Problem Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProblem ? 'Edit Problem' : 'Add New Problem'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Problem Title *"
            required
            placeholder="e.g. Subarray Sum Equals K"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Name"
              placeholder="e.g. LeetCode, Codeforces"
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value })}
            />
            <Input
              label="Problem URL"
              type="url"
              placeholder="https://..."
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Topic"
              placeholder="e.g. Dynamic Programming, Graphs"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
            />
            <Input
              label="Pattern / Technique"
              placeholder="e.g. Sliding Window, Prefix Sum"
              value={formData.pattern}
              onChange={e => setFormData({ ...formData, pattern: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={e => setFormData({ ...formData, difficulty: e.target.value as ProblemDifficulty })}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ProblemStatus })}
              options={[
                { value: 'To Do', label: 'To Do' },
                { value: 'Attempted', label: 'Attempted' },
                { value: 'Solved', label: 'Solved' },
              ]}
            />
            {formData.status === 'Solved' && (
              <Input
                label="Date Solved"
                type="date"
                value={formData.dateSolved}
                onChange={e => setFormData({ ...formData, dateSolved: e.target.value })}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Time Complexity"
              placeholder="e.g. O(n log n)"
              value={formData.timeComplexity}
              onChange={e => setFormData({ ...formData, timeComplexity: e.target.value })}
            />
            <Input
              label="Space Complexity"
              placeholder="e.g. O(1)"
              value={formData.spaceComplexity}
              onChange={e => setFormData({ ...formData, spaceComplexity: e.target.value })}
            />
          </div>

          <Textarea
            label="Personal Notes & Approaches"
            placeholder="Key observations, corner cases, intuition..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="needsRevisionCheckbox"
              checked={formData.needsRevision}
              onChange={e => setFormData({ ...formData, needsRevision: e.target.checked })}
              className="rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="needsRevisionCheckbox" className="text-sm text-gray-300 cursor-pointer">
              Mark this problem for future revision
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProblem ? 'Save Changes' : 'Create Problem'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {viewingProblem && (
        <Modal
          open={!!viewingProblem}
          onClose={() => setViewingProblem(null)}
          title={viewingProblem.title}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={viewingProblem.difficulty === 'Easy' ? 'success' : viewingProblem.difficulty === 'Medium' ? 'warning' : 'danger'}>
                {viewingProblem.difficulty}
              </Badge>
              <Badge variant="purple">{viewingProblem.topic}</Badge>
              {viewingProblem.pattern && <Badge variant="default">{viewingProblem.pattern}</Badge>}
              <span className="text-xs text-gray-400">Platform: {viewingProblem.platform}</span>
            </div>

            {viewingProblem.url && (
              <div>
                <a
                  href={viewingProblem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 underline"
                >
                  Open problem link <ExternalLink size={12} />
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded-lg border border-white/5 text-xs">
              <div>
                <span className="text-gray-500 block">Time Complexity:</span>
                <span className="font-mono text-gray-200">{viewingProblem.timeComplexity || 'O(n)'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Space Complexity:</span>
                <span className="font-mono text-gray-200">{viewingProblem.spaceComplexity || 'O(1)'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</h4>
              <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                {viewingProblem.notes || 'No personal notes saved for this problem yet.'}
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-gray-500">
              <span>Status: <strong className="text-white">{viewingProblem.status}</strong></span>
              <Button size="sm" variant="secondary" onClick={() => {
                const prob = viewingProblem;
                setViewingProblem(null);
                handleOpenEditModal(prob);
              }}>
                Edit Problem
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        open={!!deletingProblemId}
        onClose={() => setDeletingProblemId(null)}
        onConfirm={handleDeleteProblem}
        title="Delete Problem"
        message="Are you sure you want to delete this problem record? This action cannot be undone."
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
