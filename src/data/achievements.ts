// ============================================================
// DevOrbit — Default Achievements
// ============================================================

import type { Achievement } from '../types';

export const defaultAchievements: Achievement[] = [
  {
    id: 'first-problem',
    title: 'First Problem Solved',
    description: 'Solved your first coding problem',
    icon: 'Zap',
    condition: 'Solve 1 problem',
    unlockedAt: null,
  },
  {
    id: 'seven-day-streak',
    title: 'Seven-Day Streak',
    description: 'Maintained a 7-day learning streak',
    icon: 'Flame',
    condition: 'Achieve a 7-day streak',
    unlockedAt: null,
  },
  {
    id: 'twenty-five-problems',
    title: '25 Problems Solved',
    description: 'Solved 25 coding problems',
    icon: 'Trophy',
    condition: 'Solve 25 problems',
    unlockedAt: null,
  },
  {
    id: 'fifty-problems',
    title: '50 Problems Solved',
    description: 'Solved 50 coding problems — halfway to mastery!',
    icon: 'Medal',
    condition: 'Solve 50 problems',
    unlockedAt: null,
  },
  {
    id: 'hundred-problems',
    title: '100 Problems Solved',
    description: 'Solved 100 coding problems — you\'re a coding machine!',
    icon: 'Crown',
    condition: 'Solve 100 problems',
    unlockedAt: null,
  },
  {
    id: 'first-project',
    title: 'First Project Completed',
    description: 'Completed your first project',
    icon: 'Rocket',
    condition: 'Complete 1 project',
    unlockedAt: null,
  },
  {
    id: 'ten-hours-focus',
    title: '10 Hours of Focus',
    description: 'Accumulated 10 hours of focused study time',
    icon: 'Timer',
    condition: 'Reach 10 hours of focus time',
    unlockedAt: null,
  },
  {
    id: 'phase-one-complete',
    title: 'Foundation Builder',
    description: 'Completed all Phase 1 roadmap topics',
    icon: 'GraduationCap',
    condition: 'Complete all Phase 1 topics',
    unlockedAt: null,
  },
  {
    id: 'first-note',
    title: 'Note Taker',
    description: 'Created your first study note',
    icon: 'BookOpen',
    condition: 'Create 1 note',
    unlockedAt: null,
  },
  {
    id: 'thirty-day-streak',
    title: 'Monthly Warrior',
    description: 'Maintained a 30-day learning streak',
    icon: 'Shield',
    condition: 'Achieve a 30-day streak',
    unlockedAt: null,
  },
];
