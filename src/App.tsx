// ============================================================
// DevOrbit — Main App Component
// ============================================================

import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { DSARoadmap } from './pages/DSARoadmap';
import { ProblemTracker } from './pages/ProblemTracker';
import { FocusRoom } from './pages/FocusRoom';
import { ProjectLab } from './pages/ProjectLab';
import { Notes } from './pages/Notes';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';

function PageRouter() {
  const { currentPage } = useApp();

  const pages = {
    overview: <Overview />,
    roadmap: <DSARoadmap />,
    problems: <ProblemTracker />,
    focus: <FocusRoom />,
    projects: <ProjectLab />,
    notes: <Notes />,
    statistics: <Statistics />,
    settings: <Settings />,
  };

  return pages[currentPage] || <Overview />;
}

function App() {
  return (
    <AppProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </AppProvider>
  );
}

export default App;
