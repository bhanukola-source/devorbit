// ============================================================
// DevOrbit — Sample Projects Data
// ============================================================

import type { Project } from '../types';

export const sampleProjects: Project[] = [
  {
    id: 'sample-proj-1',
    name: 'Personal Portfolio Website',
    description: 'A modern, responsive portfolio website to showcase your projects, skills, and experience. Built with React and styled with Tailwind CSS. Perfect for making a strong first impression during placements.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    status: 'Planning',
    startDate: '',
    githubUrl: '',
    liveDemoUrl: '',
    nextMilestone: 'Design wireframes and choose color scheme',
    progress: 0,
    isSample: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-proj-2',
    name: 'AI-Powered Study Assistant',
    description: 'A study assistant that uses local ML models or APIs to generate flashcards, quiz questions, and study summaries from your notes. Great for demonstrating full-stack and ML integration skills.',
    techStack: ['Python', 'FastAPI', 'React', 'SQLite'],
    status: 'Planning',
    startDate: '',
    githubUrl: '',
    liveDemoUrl: '',
    nextMilestone: 'Set up backend API skeleton',
    progress: 0,
    isSample: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-proj-3',
    name: 'Algorithm Visualizer',
    description: 'An interactive web app that visualizes sorting algorithms, graph traversals, pathfinding, and tree operations step by step. Excellent for deepening DSA understanding and impressing interviewers.',
    techStack: ['React', 'TypeScript', 'Canvas API', 'Tailwind CSS'],
    status: 'Planning',
    startDate: '',
    githubUrl: '',
    liveDemoUrl: '',
    nextMilestone: 'Implement sorting visualization (bubble, merge, quick)',
    progress: 0,
    isSample: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
