import { useMemo } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  ArrowRight, 
  Quote, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, ProgressBar } from '../components/ui';
import { getDailyQuote } from '../data/quotes';

export function Overview() {
  const { state, setCurrentPage } = useApp();
  const quote = useMemo(() => getDailyQuote(), []);

  // 1. Stats calculation
  const solvedProblems = useMemo(
    () => state.problems.filter(p => p.status === 'Solved'),
    [state.problems]
  );
  const totalSolved = solvedProblems.length;

  const totalFocusSeconds = useMemo(
    () => state.focusSessions
      .filter(s => s.completed && s.mode === 'focus')
      .reduce((acc, curr) => acc + curr.duration, 0),
    [state.focusSessions]
  );
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);

  const completedTopics = useMemo(
    () => state.roadmapTopics.filter(t => t.status === 'Completed'),
    [state.roadmapTopics]
  );
  const roadmapProgress = state.roadmapTopics.length > 0
    ? Math.round((completedTopics.length / state.roadmapTopics.length) * 100)
    : 0;

  // 2. Next / Continue Learning topic
  const continueTopic = useMemo(() => {
    const inProgress = state.roadmapTopics.find(t => t.status === 'In Progress');
    if (inProgress) return inProgress;
    return state.roadmapTopics.find(t => t.status === 'Not Started') || null;
  }, [state.roadmapTopics]);

  // Current milestone calculation based on continue topic
  const currentPhase = continueTopic ? continueTopic.phase : 4;
  const phaseTopics = state.roadmapTopics.filter(t => t.phase === currentPhase);
  const phaseCompleted = phaseTopics.filter(t => t.status === 'Completed').length;
  const phasePercent = phaseTopics.length > 0 ? Math.round((phaseCompleted / phaseTopics.length) * 100) : 100;

  // 3. Weekly focus study-time data (Last 7 days)
  const weeklyData = useMemo(() => {
    const days: { day: string; dateStr: string; minutes: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Calculate minutes for this day
      const daySeconds = state.focusSessions
        .filter(s => s.completed && s.mode === 'focus' && s.startTime && s.startTime.startsWith(dateStr))
        .reduce((sum, s) => sum + s.duration, 0);

      days.push({
        day: dayName,
        dateStr,
        minutes: Math.round(daySeconds / 60),
      });
    }
    return days;
  }, [state.focusSessions]);

  // 4. Daily Goals
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySolvedCount = useMemo(() => {
    return state.problems.filter(p => p.status === 'Solved' && p.dateSolved === todayStr).length;
  }, [state.problems, todayStr]);

  const todayFocusMinutes = useMemo(() => {
    const daySec = state.focusSessions
      .filter(s => s.completed && s.mode === 'focus' && s.startTime && s.startTime.startsWith(todayStr))
      .reduce((sum, s) => sum + s.duration, 0);
    return Math.round(daySec / 60);
  }, [state.focusSessions, todayStr]);

  const problemGoal = state.settings.dailyProblemGoal || 3;
  const focusGoal = state.settings.dailyFocusGoal || 120;

  // 5. Recently solved problems (latest 5)
  const recentlySolved = useMemo(() => {
    return [...solvedProblems]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5);
  }, [solvedProblems]);

  // 6. GitHub-style Activity Heatmap (Last 140 days = 20 weeks)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    // Normalize to midnight
    today.setHours(0, 0, 0, 0);

    // Look back 139 days + today = 140 days (exactly 20 weeks)
    for (let i = 139; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const activityRecord = state.dailyActivity.find(a => a.date === dateStr);
      const problemsCount = state.problems.filter(p => p.status === 'Solved' && p.dateSolved === dateStr).length;
      const focusMins = state.focusSessions
        .filter(s => s.completed && s.mode === 'focus' && s.startTime && s.startTime.startsWith(dateStr))
        .reduce((sum, s) => sum + s.duration, 0) / 60;

      const score = (activityRecord?.problemsSolved || problemsCount) * 2 + Math.floor(focusMins / 25);
      days.push({
        date: dateStr,
        score,
        problems: activityRecord?.problemsSolved || problemsCount,
        focusMinutes: Math.round(focusMins),
      });
    }
    return days;
  }, [state.dailyActivity, state.problems, state.focusSessions]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome & Tagline Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-black/40 border border-white/5 p-6 lg:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 mb-3">
            <Sparkles size={14} className="text-purple-400" />
            <span>DevOrbit Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Welcome back{state.settings.displayName ? `, ${state.settings.displayName}` : ''}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-medium bg-gradient-to-r from-purple-200 via-blue-200 to-gray-400 bg-clip-text text-transparent">
            "Small steps. Strong fundamentals. Extraordinary results."
          </p>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 border-l-2 border-l-emerald-500">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Problems Solved</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white">{totalSolved}</span>
              <span className="text-xs text-gray-500">problems</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-2 border-l-amber-500">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Current Streak</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white">{state.streak}</span>
              <span className="text-xs text-gray-500">days active</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-2 border-l-blue-500">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Focus Time</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white">{totalFocusHours}</span>
              <span className="text-xs text-gray-500">hours</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-2 border-l-purple-500">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
            <Target size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Roadmap Complete</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white">{roadmapProgress}%</span>
              <span className="text-xs text-gray-500">of 24 topics</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Continue Learning & Milestone Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#12141A] to-[#161922]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="purple">Continue Learning</Badge>
                {continueTopic && (
                  <Badge variant="default">Phase {continueTopic.phase}</Badge>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {continueTopic ? continueTopic.title : 'All Topics Mastered!'}
              </h2>
              <p className="text-sm text-gray-400 line-clamp-2 max-w-xl">
                {continueTopic 
                  ? continueTopic.description 
                  : 'Congratulations, you have completed all sections of the DSA Roadmap!'}
              </p>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setCurrentPage('roadmap')}
              className="shrink-0 mt-1"
            >
              Resume Roadmap <ArrowRight size={14} />
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Difficulty: <strong className="text-gray-200">{continueTopic?.difficulty || 'N/A'}</strong></span>
              <span>Est. Duration: <strong className="text-gray-200">{continueTopic?.estimatedHours || 0} hrs</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Milestone Phase {currentPhase} Progress:</span>
              <span className="text-xs font-bold text-purple-400">{phasePercent}%</span>
            </div>
          </div>
        </Card>

        {/* Daily Motivational Quote */}
        <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-[#12141A] to-[#181622] border-purple-500/10">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-3">
              <Quote size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Daily Wisdom</span>
            </div>
            <p className="text-sm italic text-gray-300 leading-relaxed mb-4">
              "{quote.text}"
            </p>
          </div>
          <div className="text-xs font-medium text-gray-500 text-right">
            — {quote.author}
          </div>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Study Activity Heatmap</h3>
            <p className="text-xs text-gray-400">Activity record over the last 20 weeks</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-white/5 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-purple-900/60 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-purple-700/80 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-purple-400 inline-block" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
            {heatmapDays.map((d) => {
              let bg = 'bg-white/5';
              if (d.score > 6) bg = 'bg-purple-400';
              else if (d.score > 3) bg = 'bg-purple-600';
              else if (d.score > 1) bg = 'bg-purple-800/80';
              else if (d.score > 0) bg = 'bg-purple-950';

              return (
                <div
                  key={d.date}
                  className={`w-3.5 h-3.5 rounded-sm ${bg} transition-colors hover:ring-1 hover:ring-purple-400 cursor-pointer`}
                  title={`${d.date}: ${d.problems} problems solved, ${d.focusMinutes}m focus`}
                />
              );
            })}
          </div>
        </div>
      </Card>

      {/* Two columns: Weekly Study Chart & Daily Goals + Recent Problems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Time Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Weekly Focus Time</h3>
              <p className="text-xs text-gray-400">Focus minutes per day (Past 7 days)</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage('focus')}>
              Focus Room <ChevronRight size={14} />
            </Button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12141A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#c084fc' }}
                  formatter={(val: any) => [`${val} mins`, 'Focus Time']}
                />
                <Bar dataKey="minutes" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Goals & Quick View */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">Daily Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-medium">Coding Problems Target</span>
                  <span className="text-gray-400">
                    <strong className="text-white">{todaySolvedCount}</strong> / {problemGoal} solved
                  </span>
                </div>
                <ProgressBar 
                  value={(todaySolvedCount / problemGoal) * 100} 
                  color="bg-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-medium">Study Focus Target</span>
                  <span className="text-gray-400">
                    <strong className="text-white">{todayFocusMinutes}</strong> / {focusGoal} mins
                  </span>
                </div>
                <ProgressBar 
                  value={(todayFocusMinutes / focusGoal) * 100} 
                  color="bg-purple-500"
                />
              </div>
            </div>
          </Card>

          {/* Recently Solved Problems */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recently Solved</h3>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('problems')}>
                View all <ChevronRight size={14} />
              </Button>
            </div>

            {recentlySolved.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                No problems solved yet. Dive into the Problem Tracker!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentlySolved.map(prob => (
                  <div key={prob.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{prob.title}</p>
                      <span className="text-xs text-gray-500">{prob.platform} · {prob.topic}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={prob.difficulty === 'Easy' ? 'success' : prob.difficulty === 'Medium' ? 'warning' : 'danger'}>
                        {prob.difficulty}
                      </Badge>
                      {prob.url && (
                        <a 
                          href={prob.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-gray-500 hover:text-white transition-colors"
                          aria-label="Open Problem"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
