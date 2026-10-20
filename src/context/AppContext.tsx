// ============================================================
// DevOrbit — Application Context & State Management
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type {
  AppState, RoadmapTopic, Problem, FocusSession, Project, Note,
  Achievement, DailyActivity, UserSettings, PageId,
} from '../types';
import { getStorageItem, setStorageItem, getTodayString } from '../utils/storage';
import { defaultRoadmapTopics } from '../data/roadmap';
import { sampleProblems } from '../data/sampleProblems';
import { sampleProjects } from '../data/sampleProjects';
import { defaultAchievements } from '../data/achievements';

// ---- Default State ----

const defaultSettings: UserSettings = {
  displayName: '',
  theme: 'dark',
  dailyProblemGoal: 3,
  dailyFocusGoal: 120,
  timerSettings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    dailyFocusTarget: 120,
  },
};

function getInitialState(): AppState {
  return {
    roadmapTopics: getStorageItem<RoadmapTopic[]>('roadmapTopics', defaultRoadmapTopics),
    problems: getStorageItem<Problem[]>('problems', sampleProblems),
    focusSessions: getStorageItem<FocusSession[]>('focusSessions', []),
    projects: getStorageItem<Project[]>('projects', sampleProjects),
    notes: getStorageItem<Note[]>('notes', []),
    achievements: getStorageItem<Achievement[]>('achievements', defaultAchievements),
    dailyActivity: getStorageItem<DailyActivity[]>('dailyActivity', []),
    settings: getStorageItem<UserSettings>('settings', defaultSettings),
    streak: getStorageItem<number>('streak', 0),
    longestStreak: getStorageItem<number>('longestStreak', 0),
    lastActiveDate: getStorageItem<string>('lastActiveDate', ''),
  };
}

// ---- Actions ----

type Action =
  | { type: 'SET_ROADMAP_TOPICS'; payload: RoadmapTopic[] }
  | { type: 'UPDATE_ROADMAP_TOPIC'; payload: RoadmapTopic }
  | { type: 'SET_PROBLEMS'; payload: Problem[] }
  | { type: 'ADD_PROBLEM'; payload: Problem }
  | { type: 'UPDATE_PROBLEM'; payload: Problem }
  | { type: 'DELETE_PROBLEM'; payload: string }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'SET_FOCUS_SESSIONS'; payload: FocusSession[] }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_DAILY_ACTIVITY'; payload: DailyActivity }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'UPDATE_STREAK'; payload: { streak: number; longestStreak: number; lastActiveDate: string } }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_STATE'; payload: AppState };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROADMAP_TOPICS':
      return { ...state, roadmapTopics: action.payload };
    case 'UPDATE_ROADMAP_TOPIC':
      return {
        ...state,
        roadmapTopics: state.roadmapTopics.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'SET_PROBLEMS':
      return { ...state, problems: action.payload };
    case 'ADD_PROBLEM':
      return { ...state, problems: [...state.problems, action.payload] };
    case 'UPDATE_PROBLEM':
      return {
        ...state,
        problems: state.problems.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROBLEM':
      return {
        ...state,
        problems: state.problems.filter(p => p.id !== action.payload),
      };
    case 'ADD_FOCUS_SESSION':
      return { ...state, focusSessions: [...state.focusSessions, action.payload] };
    case 'SET_FOCUS_SESSIONS':
      return { ...state, focusSessions: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
      };
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.payload
            ? { ...a, unlockedAt: a.unlockedAt || new Date().toISOString() }
            : a
        ),
      };
    case 'UPDATE_DAILY_ACTIVITY': {
      const existing = state.dailyActivity.findIndex(d => d.date === action.payload.date);
      if (existing >= 0) {
        const updated = [...state.dailyActivity];
        updated[existing] = action.payload;
        return { ...state, dailyActivity: updated };
      }
      return { ...state, dailyActivity: [...state.dailyActivity, action.payload] };
    }
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_STREAK':
      return {
        ...state,
        streak: action.payload.streak,
        longestStreak: action.payload.longestStreak,
        lastActiveDate: action.payload.lastActiveDate,
      };
    case 'RESET_STATE':
      return {
        roadmapTopics: defaultRoadmapTopics,
        problems: sampleProblems,
        focusSessions: [],
        projects: sampleProjects,
        notes: [],
        achievements: defaultAchievements,
        dailyActivity: [],
        settings: defaultSettings,
        streak: 0,
        longestStreak: 0,
        lastActiveDate: '',
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

// ---- Context ----

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  recordActivity: (stats?: { problemsDelta?: number; focusMinutesDelta?: number; topicsDelta?: number }) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ---- Provider ----

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const [currentPage, setCurrentPage] = React.useState<PageId>(
    () => (getStorageItem<PageId>('currentPage', 'overview'))
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Persist state changes to localStorage
  useEffect(() => {
    setStorageItem('roadmapTopics', state.roadmapTopics);
  }, [state.roadmapTopics]);

  useEffect(() => {
    setStorageItem('problems', state.problems);
  }, [state.problems]);

  useEffect(() => {
    setStorageItem('focusSessions', state.focusSessions);
  }, [state.focusSessions]);

  useEffect(() => {
    setStorageItem('projects', state.projects);
  }, [state.projects]);

  useEffect(() => {
    setStorageItem('notes', state.notes);
  }, [state.notes]);

  useEffect(() => {
    setStorageItem('achievements', state.achievements);
  }, [state.achievements]);

  useEffect(() => {
    setStorageItem('dailyActivity', state.dailyActivity);
  }, [state.dailyActivity]);

  useEffect(() => {
    setStorageItem('settings', state.settings);
  }, [state.settings]);

  useEffect(() => {
    setStorageItem('streak', state.streak);
    setStorageItem('longestStreak', state.longestStreak);
    setStorageItem('lastActiveDate', state.lastActiveDate);
  }, [state.streak, state.longestStreak, state.lastActiveDate]);

  useEffect(() => {
    setStorageItem('currentPage', currentPage);
  }, [currentPage]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light', state.settings.theme === 'light');
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark');
  }, [state.settings.theme]);

  // Record daily activity and update streak
  const recordActivity = useCallback((stats?: { problemsDelta?: number; focusMinutesDelta?: number; topicsDelta?: number }) => {
    const today = getTodayString();
    const existing = state.dailyActivity.find(d => d.date === today);
    if (!existing) {
      dispatch({
        type: 'UPDATE_DAILY_ACTIVITY',
        payload: { 
          date: today, 
          problemsSolved: stats?.problemsDelta || 0, 
          focusMinutes: stats?.focusMinutesDelta || 0, 
          topicsCompleted: stats?.topicsDelta || 0 
        },
      });
    } else if (stats) {
      dispatch({
        type: 'UPDATE_DAILY_ACTIVITY',
        payload: {
          ...existing,
          problemsSolved: existing.problemsSolved + (stats.problemsDelta || 0),
          focusMinutes: existing.focusMinutes + (stats.focusMinutesDelta || 0),
          topicsCompleted: existing.topicsCompleted + (stats.topicsDelta || 0),
        },
      });
    }

    // Update streak
    if (state.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (state.lastActiveDate === yesterdayStr) {
        newStreak = state.streak + 1;
      }
      const newLongest = Math.max(state.longestStreak, newStreak);

      dispatch({
        type: 'UPDATE_STREAK',
        payload: { streak: newStreak, longestStreak: newLongest, lastActiveDate: today },
      });
    }
  }, [state.dailyActivity, state.lastActiveDate, state.streak, state.longestStreak]);

  // Record activity on mount
  useEffect(() => {
    recordActivity();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check achievements
  useEffect(() => {
    const solvedCount = state.problems.filter(p => p.status === 'Solved').length;
    const completedProjects = state.projects.filter(p => p.status === 'Completed' && !p.isSample).length;
    const totalFocusMinutes = state.focusSessions
      .filter(s => s.completed && s.mode === 'focus')
      .reduce((sum, s) => sum + s.duration / 60, 0);
    const phase1Topics = state.roadmapTopics.filter(t => t.phase === 1);
    const phase1Complete = phase1Topics.length > 0 && phase1Topics.every(t => t.status === 'Completed');
    const noteCount = state.notes.length;

    const checks: [string, boolean][] = [
      ['first-problem', solvedCount >= 1],
      ['seven-day-streak', state.streak >= 7 || state.longestStreak >= 7],
      ['twenty-five-problems', solvedCount >= 25],
      ['fifty-problems', solvedCount >= 50],
      ['hundred-problems', solvedCount >= 100],
      ['first-project', completedProjects >= 1],
      ['ten-hours-focus', totalFocusMinutes >= 600],
      ['phase-one-complete', phase1Complete],
      ['first-note', noteCount >= 1],
      ['thirty-day-streak', state.streak >= 30 || state.longestStreak >= 30],
    ];

    for (const [id, met] of checks) {
      const achievement = state.achievements.find(a => a.id === id);
      if (achievement && !achievement.unlockedAt && met) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: id });
      }
    }
  }, [state.problems, state.projects, state.focusSessions, state.roadmapTopics, state.streak, state.longestStreak, state.notes, state.achievements]);

  return (
    <AppContext.Provider value={{
      state, dispatch, currentPage, setCurrentPage,
      sidebarOpen, setSidebarOpen,
      searchOpen, setSearchOpen,
      recordActivity,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
