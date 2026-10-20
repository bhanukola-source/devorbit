# DevOrbit — Your Personal Coding Universe 🚀

DevOrbit is a personal command center designed for computer science students and engineers preparing for software engineering placements. It pairs the sleek, high-contrast design of Linear with structured DSA roadmaps, algorithmic problem tracking, deep-work Pomodoro intervals, project showcase portfolios, and study notes.

---

## 🛠️ Technology Stack

- **Framework**: React 19 with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS v4 with custom dark mode theme (`#0B0D12`)
- **Iconography**: Lucide React
- **Analytics & Visualizations**: Recharts
- **Storage**: Client-side `localStorage` with JSON import & export validation

---

## ✨ Features & Architecture

### 1. Overview Dashboard
- **Tagline & Welcome**: *"Small steps. Strong fundamentals. Extraordinary results."*
- **Stats Counter**: Solved problems count, active daily learning streak, cumulative focus hours, and roadmap percentage.
- **GitHub-Style Heatmap**: 20-week (140-day) interactive activity grid reflecting daily problem completions and focus intervals.
- **Weekly Study Time Chart**: Recharts bar chart tracking daily focus minutes over the trailing 7 days.
- **Daily Coding Targets**: Real-time progress bars for daily problem goals and focus time goals.
- **Continue Learning**: Automatically detects and presents the next incomplete roadmap topic with one-click resumption.
- **Motivational Wisdom**: Rotates 31 developer quotes based on the day of the year.

### 2. DSA Roadmap
- **Structured 4-Phase Curriculum**:
  - Phase 1: Foundations (Python, Big O, Arrays, Strings, Math, Recursion)
  - Phase 2: Core Data Structures (Searching/Sorting, Hashing, Linked Lists, Stacks/Queues, Binary Search, Two Pointers)
  - Phase 3: Trees & Graphs (Binary Trees, BST, Heaps, BFS/DFS, Shortest Paths)
  - Phase 4: Advanced Algorithms (Greedy, Backtracking, DP, Tries, Advanced Graphs, Bit Manipulation)
- **Interactive Checklists**: Checking off milestone items automatically updates the topic status between *Not Started*, *In Progress*, and *Completed*.
- **Topic Notes**: Store custom algorithmic patterns, recurrences, or edge cases per topic.

### 3. Problem Tracker
- **Comprehensive Logging**: Title, platform (LeetCode, Codeforces, HackerRank, etc.), topic, pattern, difficulty, status, time & space complexity, and revision flags.
- **Filtering & Search**: Dynamic topic filters, difficulty filters, status filters, "Needs Revision" toggle, and multi-field keyword search.
- **Sorting**: Order by date added, difficulty rank, or status.
- **Full CRUD & Modals**: Create, edit, inspect, and delete problems with confirmation dialogs.

### 4. Focus Room (Pomodoro Timer)
- **Accurate Countdown**: Drift-proof timer logic based on absolute timestamps (`endTimeRef - Date.now()`), unaffected by browser tab switching or background throttling.
- **Modes**: Deep Focus (25m), Short Break (5m), and Long Break (15m) with configurable durations.
- **Session History**: Persists completed focus sessions with task names and duration tags.
- **Daily Target Tracking**: Progress bar monitoring minutes spent versus the daily goal.

### 5. Project Lab
- **Portfolio Showcase**: Manage portfolio projects with tech stack badges, GitHub repo links, live demo URLs, and next milestone targets.
- **Milestone Progress**: Range slider (0–100%) and quick +25% progress advance buttons.
- **Status Filter**: Toggle between *Planning*, *Building*, and *Completed*.
- **Starter Templates**: Includes 3 starter templates (*Personal Portfolio*, *AI-Powered Study Assistant*, *Algorithm Visualizer*).

### 6. Study Notes
- **Categorization & Tags**: Organize notes by DSA topic, project, or custom category with multi-tagging.
- **Pinned Notes & Revision Flag**: Pin vital notes to the top and flag concepts that need spaced repetition.
- **Markdown / Code Editor**: Monospace code-friendly writing area for templates and algorithms.

### 7. Statistics & Achievements
- **Difficulty Breakdown**: Recharts donut chart detailing Easy, Medium, and Hard solved ratios.
- **DSA Topic Distribution**: Bar chart comparing solved vs. total problems per topic.
- **Focus Time Velocity**: Area chart plotting daily focus minutes over the last 30 days.
- **Problem Velocity**: Line chart showing weekly problem completion rates.
- **Trophies & Badges**: 10 condition-verified achievement badges (e.g., *First Problem Solved*, *7-Day Streak*, *100 Problems Solved*, *Foundation Builder*).

### 8. Global Search & Settings
- **⌘K / Ctrl+K Global Search**: Instantly searches across roadmap topics, problems, projects, and notes.
- **Data Management**:
  - **Export JSON**: Download a complete snapshot of all progress, problems, notes, and preferences.
  - **Import JSON**: Validates incoming backup structure before updating storage, preventing corrupted data from breaking the app.
  - **Reset All Data**: Clean slate reset with confirmation modal.
- **Customization**: Name, dark/light theme, daily targets, and Pomodoro duration preferences.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone or navigate to the directory
cd devorbit

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

The production output will be generated inside the `dist/` directory.

---

## 💾 Data Persistence & Backup Instructions

1. **Storage Location**: DevOrbit stores all user data inside your current browser's `localStorage` under the `devorbit_` namespace.
2. **Backing Up**: Go to **Settings > Data Backup & Security** and click **Export Backup (JSON)** to download a `.json` backup file.
3. **Restoring**: Click **Restore Backup (JSON)**, select your previously exported `.json` file. DevOrbit validates the backup keys and refreshes the application with your restored records.
4. **Data Isolation Notice**: Because data lives in browser storage, opening DevOrbit in private/incognito mode or clearing website cache will clear the local database unless backed up.
