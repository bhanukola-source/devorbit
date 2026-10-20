import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  GitBranch, 
  Trash2, 
  ChevronRight, 
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  Card, 
  Button, 
  Badge, 
  ProgressBar, 
  Modal, 
  ConfirmDialog, 
  Input, 
  Textarea, 
  Select, 
  Toast 
} from '../components/ui';
import { generateId } from '../utils/storage';
import type { Project, ProjectStatus } from '../types';

export function ProjectLab() {
  const { state, dispatch, recordActivity } = useApp();

  // Filters & Search
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    techStackInput: '',
    status: 'Planning' as ProjectStatus,
    startDate: '',
    githubUrl: '',
    liveDemoUrl: '',
    nextMilestone: '',
    progress: 0,
  });

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return state.projects.filter(proj => {
      if (selectedStatus !== 'all' && proj.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          proj.name.toLowerCase().includes(q) ||
          proj.description.toLowerCase().includes(q) ||
          proj.techStack.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [state.projects, selectedStatus, searchQuery]);

  // Counts
  const totalCount = state.projects.length;
  const planningCount = state.projects.filter(p => p.status === 'Planning').length;
  const buildingCount = state.projects.filter(p => p.status === 'Building').length;
  const completedCount = state.projects.filter(p => p.status === 'Completed').length;

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      description: '',
      techStackInput: '',
      status: 'Planning',
      startDate: new Date().toISOString().split('T')[0],
      githubUrl: '',
      liveDemoUrl: '',
      nextMilestone: '',
      progress: 0,
    });
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      techStackInput: project.techStack.join(', '),
      status: project.status,
      startDate: project.startDate || '',
      githubUrl: project.githubUrl,
      liveDemoUrl: project.liveDemoUrl,
      nextMilestone: project.nextMilestone,
      progress: project.progress,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Parse tech stack
    const techStack = formData.techStackInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        name: formData.name.trim(),
        description: formData.description.trim(),
        techStack,
        status: formData.status,
        startDate: formData.startDate,
        githubUrl: formData.githubUrl.trim(),
        liveDemoUrl: formData.liveDemoUrl.trim(),
        nextMilestone: formData.nextMilestone.trim(),
        progress: Number(formData.progress),
        isSample: false, // Customized by user
        updatedAt: now,
      };
      dispatch({ type: 'UPDATE_PROJECT', payload: updated });
      setToastMessage('Project updated successfully!');
    } else {
      const newProject: Project = {
        id: generateId(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        techStack,
        status: formData.status,
        startDate: formData.startDate,
        githubUrl: formData.githubUrl.trim(),
        liveDemoUrl: formData.liveDemoUrl.trim(),
        nextMilestone: formData.nextMilestone.trim(),
        progress: Number(formData.progress),
        isSample: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      setToastMessage('New project created!');
    }

    recordActivity();
    setIsModalOpen(false);
  };

  const handleDeleteProject = () => {
    if (!deletingProjectId) return;
    dispatch({ type: 'DELETE_PROJECT', payload: deletingProjectId });
    setToastMessage('Project deleted.');
    setDeletingProjectId(null);
  };

  // Quick toggle next milestone completion
  const handleQuickAdvanceProgress = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newProgress = Math.min(100, project.progress + 25);
    const newStatus: ProjectStatus = newProgress === 100 ? 'Completed' : (project.status === 'Planning' ? 'Building' : project.status);
    
    const updated: Project = {
      ...project,
      progress: newProgress,
      status: newStatus,
      isSample: false,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_PROJECT', payload: updated });
    recordActivity();
    setToastMessage(`Project progress updated to ${newProgress}%!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Lab</h1>
          <p className="text-sm text-gray-400 mt-1">
            Build, document, and showcase your placement-ready software engineering projects.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0 self-start sm:self-auto">
          <Plus size={16} /> New Project
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card 
          hover 
          onClick={() => setSelectedStatus('all')}
          className={`p-4 transition-all ${selectedStatus === 'all' ? 'border-purple-500/40 bg-[#161922]' : 'bg-[#12141A]'}`}
        >
          <p className="text-xs font-medium text-gray-400 uppercase">Total Projects</p>
          <p className="text-xl font-bold text-white mt-1">{totalCount}</p>
        </Card>
        <Card 
          hover 
          onClick={() => setSelectedStatus('Planning')}
          className={`p-4 border-l-2 border-l-blue-500 transition-all ${selectedStatus === 'Planning' ? 'border-purple-500/40 bg-[#161922]' : 'bg-[#12141A]'}`}
        >
          <p className="text-xs font-medium text-gray-400 uppercase">Planning</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{planningCount}</p>
        </Card>
        <Card 
          hover 
          onClick={() => setSelectedStatus('Building')}
          className={`p-4 border-l-2 border-l-amber-500 transition-all ${selectedStatus === 'Building' ? 'border-purple-500/40 bg-[#161922]' : 'bg-[#12141A]'}`}
        >
          <p className="text-xs font-medium text-gray-400 uppercase">Building</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{buildingCount}</p>
        </Card>
        <Card 
          hover 
          onClick={() => setSelectedStatus('Completed')}
          className={`p-4 border-l-2 border-l-emerald-500 transition-all ${selectedStatus === 'Completed' ? 'border-purple-500/40 bg-[#161922]' : 'bg-[#12141A]'}`}
        >
          <p className="text-xs font-medium text-gray-400 uppercase">Completed</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{completedCount}</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search projects by name, description, or tech stack..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              {(['all', 'Planning', 'Building', 'Completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedStatus(tab)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedStatus === tab
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 text-sm">
          No projects found. Click "New Project" to start building your portfolio!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(project => (
            <Card
              key={project.id}
              hover
              onClick={() => handleOpenEditModal(project)}
              className="p-6 flex flex-col justify-between relative group border-white/5 hover:border-purple-500/30 transition-all"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={
                    project.status === 'Completed' ? 'success' :
                    project.status === 'Building' ? 'warning' : 'info'
                  }>
                    {project.status}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    {project.isSample && (
                      <span className="text-[10px] bg-white/5 border border-white/10 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                        Template
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProjectId(project.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Project title */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech stack badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.map(tech => (
                    <span
                      key={tech}
                      className="text-[11px] bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                {/* Next milestone */}
                {project.nextMilestone && (
                  <div className="flex items-start gap-2 text-xs">
                    <Target size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-gray-500 text-[10px] uppercase font-semibold block">Next Milestone</span>
                      <span className="text-gray-300 line-clamp-1">{project.nextMilestone}</span>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 text-gray-400">
                    <span>Progress</span>
                    <span className="font-semibold text-white">{project.progress}%</span>
                  </div>
                  <ProgressBar
                    value={project.progress}
                    color={project.status === 'Completed' ? 'bg-emerald-500' : 'bg-purple-500'}
                  />
                </div>

                {/* Links and quick action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                        title="GitHub Repository"
                      >
                        <GitBranch size={15} /> Repo
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs flex items-center gap-1">
                        <GitBranch size={15} /> No repo
                      </span>
                    )}

                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-xs"
                        title="Live Demo"
                      >
                        <ExternalLink size={14} /> Demo
                      </a>
                    )}
                  </div>

                  {project.progress < 100 && (
                    <button
                      onClick={(e) => handleQuickAdvanceProgress(project, e)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20"
                      title="Advance progress by +25%"
                    >
                      +25% <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Project Name *"
            required
            placeholder="e.g. Distributed Cache Engine"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <Textarea
            label="Project Description"
            placeholder="What problem does this project solve? What architecture did you use?"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <Input
            label="Tech Stack (Comma-separated)"
            placeholder="e.g. React, TypeScript, Go, Redis, Docker"
            value={formData.techStackInput}
            onChange={e => setFormData({ ...formData, techStackInput: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Current Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              options={[
                { value: 'Planning', label: 'Planning' },
                { value: 'Building', label: 'Building' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              type="url"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
            />
            <Input
              label="Live Demo URL"
              type="url"
              placeholder="https://myproject.app"
              value={formData.liveDemoUrl}
              onChange={e => setFormData({ ...formData, liveDemoUrl: e.target.value })}
            />
          </div>

          <Input
            label="Next Key Milestone"
            placeholder="e.g. Implement WebSocket synchronization"
            value={formData.nextMilestone}
            onChange={e => setFormData({ ...formData, nextMilestone: e.target.value })}
          />

          <div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-400 mb-1.5">
              <span>Overall Progress Percentage</span>
              <span className="text-white font-bold">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })}
              className="w-full accent-purple-600 bg-white/10 rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingProjectId}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will permanently remove its record from your portfolio."
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
