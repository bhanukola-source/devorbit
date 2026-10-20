// ============================================================
// DevOrbit — Type Definitions
// ============================================================

// ---- Roadmap ----

export interface RoadmapMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  phase: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  prerequisites: string[]; // topic IDs
  milestones: RoadmapMilestone[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  notes: string;
  order: number;
}

// ---- Problem Tracker ----

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'To Do' | 'Attempted' | 'Solved';

export interface Problem {
  id: string;
  title: string;
  platform: string;
  url: string;
  topic: string;
  pattern: string;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  dateSolved: string | null;
  notes: string;
  timeComplexity: string;
  spaceComplexity: string;
  needsRevision: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Focus Room ----

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  mode: TimerMode;
  task: string;
  completed: boolean;
}

export interface TimerSettings {
  focusDuration: number;    // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  dailyFocusTarget: number; // minutes
}

// ---- Project Lab ----

export type ProjectStatus = 'Planning' | 'Building' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  startDate: string;
  githubUrl: string;
  liveDemoUrl: string;
  nextMilestone: string;
  progress: number; // 0-100
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Notes ----

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string; // DSA topic or project name
  tags: string[];
  isPinned: boolean;
  needsRevision: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Statistics / Achievements ----

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  condition: string;
  unlockedAt: string | null;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  problemsSolved: number;
  focusMinutes: number;
  topicsCompleted: number;
}

// ---- Settings ----

export interface UserSettings {
  displayName: string;
  theme: 'dark' | 'light';
  dailyProblemGoal: number;
  dailyFocusGoal: number; // minutes
  timerSettings: TimerSettings;
}

// ---- App State ----

export interface AppState {
  roadmapTopics: RoadmapTopic[];
  problems: Problem[];
  focusSessions: FocusSession[];
  projects: Project[];
  notes: Note[];
  achievements: Achievement[];
  dailyActivity: DailyActivity[];
  settings: UserSettings;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
}

// ---- Navigation ----

export type PageId =
  | 'overview'
  | 'roadmap'
  | 'problems'
  | 'focus'
  | 'projects'
  | 'notes'
  | 'statistics'
  | 'settings';
