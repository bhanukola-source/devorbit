import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Search, 
  Filter, 
  Check 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, ProgressBar, Modal, Textarea, Toast } from '../components/ui';
import type { RoadmapTopic } from '../types';

const phaseDetails = [
  { phase: 1, name: 'Foundations', desc: 'Python, Big O, Arrays, Strings, Math, Recursion' },
  { phase: 2, name: 'Core Data Structures', desc: 'Searching, Sorting, Linked Lists, Stacks, Queues, Binary Search' },
  { phase: 3, name: 'Trees & Graphs', desc: 'Binary Trees, BST, Heaps, BFS/DFS, Shortest Paths' },
  { phase: 4, name: 'Advanced Algorithms', desc: 'Greedy, Backtracking, Dynamic Programming, Tries, Bit Manipulation' },
];

export function DSARoadmap() {
  const { state, dispatch, recordActivity } = useApp();
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<RoadmapTopic | null>(null);
  const [topicNotes, setTopicNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return state.roadmapTopics.filter(topic => {
      if (selectedPhase !== 'all' && topic.phase !== selectedPhase) return false;
      if (selectedStatus !== 'all' && topic.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          topic.title.toLowerCase().includes(q) ||
          topic.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.roadmapTopics, selectedPhase, selectedStatus, searchQuery]);

  // Phase stats
  const phaseStats = useMemo(() => {
    return phaseDetails.map(p => {
      const topics = state.roadmapTopics.filter(t => t.phase === p.phase);
      const completed = topics.filter(t => t.status === 'Completed').length;
      const progress = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
      return {
        ...p,
        total: topics.length,
        completed,
        progress,
      };
    });
  }, [state.roadmapTopics]);

  // Open modal
  const handleOpenTopic = (topic: RoadmapTopic) => {
    setActiveTopic(topic);
    setTopicNotes(topic.notes || '');
  };

  // Toggle milestone checkbox
  const handleToggleMilestone = (milestoneId: string) => {
    if (!activeTopic) return;
    const updatedMilestones = activeTopic.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    let newStatus = activeTopic.status;

    if (completedCount === updatedMilestones.length && updatedMilestones.length > 0) {
      newStatus = 'Completed';
      setToastMessage(`Topic "${activeTopic.title}" marked as Completed! `);
    } else if (completedCount > 0 && activeTopic.status === 'Not Started') {
      newStatus = 'In Progress';
    } else if (completedCount === 0 && activeTopic.status === 'Completed') {
      newStatus = 'In Progress';
    }

    const updatedTopic: RoadmapTopic = {
      ...activeTopic,
      milestones: updatedMilestones,
      status: newStatus,
      notes: topicNotes,
    };

    setActiveTopic(updatedTopic);
    dispatch({ type: 'UPDATE_ROADMAP_TOPIC', payload: updatedTopic });
    recordActivity({ topicsDelta: newStatus === 'Completed' ? 1 : 0 });
  };

  // Manual status change
  const handleChangeStatus = (status: 'Not Started' | 'In Progress' | 'Completed') => {
    if (!activeTopic) return;
    const updatedTopic: RoadmapTopic = {
      ...activeTopic,
      status,
      notes: topicNotes,
    };
    if (status === 'Completed') {
      // Also check all milestones
      updatedTopic.milestones = updatedTopic.milestones.map(m => ({ ...m, completed: true }));
      setToastMessage(`Topic "${activeTopic.title}" marked as Completed!`);
    }
    setActiveTopic(updatedTopic);
    dispatch({ type: 'UPDATE_ROADMAP_TOPIC', payload: updatedTopic });
    recordActivity();
  };

  // Save notes
  const handleSaveNotes = () => {
    if (!activeTopic) return;
    const updatedTopic: RoadmapTopic = {
      ...activeTopic,
      notes: topicNotes,
    };
    setActiveTopic(updatedTopic);
    dispatch({ type: 'UPDATE_ROADMAP_TOPIC', payload: updatedTopic });
    setToastMessage('Topic notes updated successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">DSA Learning Roadmap</h1>
        <p className="text-sm text-gray-400 mt-1">
          Structured 4-phase curriculum from foundations to advanced algorithms.
        </p>
      </div>

      {/* 4 Phases Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {phaseStats.map(phase => {
          const isSelected = selectedPhase === phase.phase;
          return (
            <Card
              key={phase.phase}
              hover
              onClick={() => setSelectedPhase(isSelected ? 'all' : phase.phase)}
              className={`p-4 transition-all duration-200 ${
                isSelected 
                  ? 'border-purple-500/50 bg-[#161922] ring-1 ring-purple-500/30' 
                  : 'bg-[#12141A]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant={phase.phase === 1 ? 'purple' : phase.phase === 2 ? 'info' : phase.phase === 3 ? 'success' : 'warning'}>
                  Phase {phase.phase}
                </Badge>
                <span className="text-xs font-semibold text-gray-400">
                  {phase.completed}/{phase.total} Done
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{phase.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mb-3">{phase.desc}</p>
              <ProgressBar value={phase.progress} showLabel />
            </Card>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search topics (e.g. Recursion, Dynamic Programming)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Filter size={12} /> Status:
              </span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all" className="bg-[#12141A]">All Statuses</option>
                <option value="Not Started" className="bg-[#12141A]">Not Started</option>
                <option value="In Progress" className="bg-[#12141A]">In Progress</option>
                <option value="Completed" className="bg-[#12141A]">Completed</option>
              </select>
            </div>

            {selectedPhase !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedPhase('all')}>
                Show All Phases
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 text-sm">
            No topics matched your filter or search query.
          </div>
        ) : (
          filteredTopics.map(topic => {
            const completedCount = topic.milestones.filter(m => m.completed).length;
            const progress = topic.milestones.length > 0
              ? Math.round((completedCount / topic.milestones.length) * 100)
              : (topic.status === 'Completed' ? 100 : 0);

            return (
              <Card
                key={topic.id}
                hover
                onClick={() => handleOpenTopic(topic)}
                className={`p-5 flex flex-col justify-between border-t-2 ${
                  topic.status === 'Completed'
                    ? 'border-t-emerald-500 bg-[#12161A]'
                    : topic.status === 'In Progress'
                    ? 'border-t-purple-500'
                    : 'border-t-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={topic.phase === 1 ? 'purple' : topic.phase === 2 ? 'info' : topic.phase === 3 ? 'success' : 'warning'}>
                      Phase {topic.phase}
                    </Badge>
                    <Badge variant={topic.difficulty === 'Beginner' ? 'success' : topic.difficulty === 'Intermediate' ? 'warning' : 'danger'}>
                      {topic.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1.5 flex items-center justify-between">
                    <span>{topic.title}</span>
                    {topic.status === 'Completed' && (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-1" />
                    )}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                    {topic.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {topic.estimatedHours}h
                    </span>
                    <span className={`font-medium ${
                      topic.status === 'Completed' ? 'text-emerald-400' : topic.status === 'In Progress' ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {topic.status}
                    </span>
                  </div>

                  <ProgressBar 
                    value={progress} 
                    color={topic.status === 'Completed' ? 'bg-emerald-500' : 'bg-purple-500'} 
                  />
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Topic Detail Modal */}
      {activeTopic && (
        <Modal
          open={!!activeTopic}
          onClose={() => setActiveTopic(null)}
          title={activeTopic.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Badge variant={activeTopic.difficulty === 'Beginner' ? 'success' : activeTopic.difficulty === 'Intermediate' ? 'warning' : 'danger'}>
                  {activeTopic.difficulty}
                </Badge>
                <Badge variant="default">Phase {activeTopic.phase}</Badge>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {activeTopic.estimatedHours} Estimated Hours
                </span>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Status:</span>
                <select
                  value={activeTopic.status}
                  onChange={e => handleChangeStatus(e.target.value as any)}
                  className="bg-white/10 border border-white/10 rounded-lg text-xs text-white py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Not Started" className="bg-[#12141A]">Not Started</option>
                  <option value="In Progress" className="bg-[#12141A]">In Progress</option>
                  <option value="Completed" className="bg-[#12141A]">Completed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Overview</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{activeTopic.description}</p>
            </div>

            {/* Prerequisites */}
            {activeTopic.prerequisites.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Prerequisites</h4>
                <div className="flex flex-wrap gap-2">
                  {activeTopic.prerequisites.map(prereqId => {
                    const prereq = state.roadmapTopics.find(t => t.id === prereqId);
                    return (
                      <span
                        key={prereqId}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5"
                      >
                        {prereq?.status === 'Completed' ? (
                          <CheckCircle2 size={12} className="text-emerald-400" />
                        ) : (
                          <Circle size={12} className="text-gray-500" />
                        )}
                        {prereq?.title || prereqId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Milestones Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Milestones Checklist</h4>
                <span className="text-xs text-gray-500">
                  {activeTopic.milestones.filter(m => m.completed).length} of {activeTopic.milestones.length} Done
                </span>
              </div>
              <div className="space-y-2">
                {activeTopic.milestones.map(milestone => (
                  <div
                    key={milestone.id}
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      milestone.completed 
                        ? 'bg-purple-600 border-purple-500 text-white' 
                        : 'border-white/20 bg-white/5 text-transparent'
                    }`}>
                      <Check size={12} className={milestone.completed ? 'block' : 'hidden'} />
                    </div>
                    <span className={`text-sm ${
                      milestone.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                    }`}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Topic Notes</h4>
                <Button size="sm" variant="secondary" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
              <Textarea
                placeholder="Write your study notes, formulas, or tricky edge cases for this topic here..."
                value={topicNotes}
                onChange={e => setTopicNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
