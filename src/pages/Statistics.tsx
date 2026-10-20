import { useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Medal, 
  Crown, 
  Rocket, 
  Timer, 
  GraduationCap, 
  BookOpen, 
  Shield, 
  Lock 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  LineChart, 
  Line 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, Badge, ProgressBar } from '../components/ui';
import { formatDate } from '../utils/storage';

// Icon map for achievements
const achievementIcons: Record<string, React.ReactNode> = {
  Zap: <Zap size={20} />,
  Flame: <Flame size={20} />,
  Trophy: <Trophy size={20} />,
  Medal: <Medal size={20} />,
  Crown: <Crown size={20} />,
  Rocket: <Rocket size={20} />,
  Timer: <Timer size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  BookOpen: <BookOpen size={20} />,
  Shield: <Shield size={20} />,
};

const DIFFICULTY_COLORS = {
  Easy: '#10b981',    // emerald
  Medium: '#f59e0b',  // amber
  Hard: '#ef4444',    // red
};

export function Statistics() {
  const { state } = useApp();

  // 1. Overall stats
  const solvedProblems = useMemo(() => state.problems.filter(p => p.status === 'Solved'), [state.problems]);
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

  // 2. Breakdown by Difficulty (Pie / Donut)
  const difficultyData = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    solvedProblems.forEach(p => {
      if (counts[p.difficulty] !== undefined) {
        counts[p.difficulty]++;
      }
    });

    const data = [
      { name: 'Easy', value: counts.Easy, color: DIFFICULTY_COLORS.Easy },
      { name: 'Medium', value: counts.Medium, color: DIFFICULTY_COLORS.Medium },
      { name: 'Hard', value: counts.Hard, color: DIFFICULTY_COLORS.Hard },
    ];
    return data;
  }, [solvedProblems]);

  // 3. Progress by DSA Topic (Bar Chart)
  const topicData = useMemo(() => {
    const topicMap: Record<string, { total: number; solved: number }> = {};

    state.problems.forEach(p => {
      const top = p.topic || 'Other';
      if (!topicMap[top]) topicMap[top] = { total: 0, solved: 0 };
      topicMap[top].total++;
      if (p.status === 'Solved') topicMap[top].solved++;
    });

    return Object.entries(topicMap)
      .map(([topic, stats]) => ({
        topic,
        solved: stats.solved,
        total: stats.total,
      }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 8); // Top 8 topics
  }, [state.problems]);

  // 4. Focus Time History (Area Chart - Last 30 Days)
  const focusTimeHistory = useMemo(() => {
    const days: { date: string; displayDate: string; minutes: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const daySec = state.focusSessions
        .filter(s => s.completed && s.mode === 'focus' && s.startTime && s.startTime.startsWith(dateStr))
        .reduce((sum, s) => sum + s.duration, 0);

      days.push({
        date: dateStr,
        displayDate,
        minutes: Math.round(daySec / 60),
      });
    }
    return days;
  }, [state.focusSessions]);

  // 5. Problems Solved Over Time (Line Chart - Last 4 Weeks)
  const weeklySolvedTrends = useMemo(() => {
    const weeks: { weekLabel: string; solved: number }[] = [];
    const now = new Date();

    for (let w = 3; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (w * 7 + 6));
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setDate(end.getDate() - (w * 7));
      end.setHours(23, 59, 59, 999);

      const count = solvedProblems.filter(p => {
        if (!p.dateSolved) return false;
        const d = new Date(p.dateSolved);
        return d >= start && d <= end;
      }).length;

      weeks.push({
        weekLabel: `W-${w === 0 ? 'Now' : w}`,
        solved: count,
      });
    }
    return weeks;
  }, [solvedProblems]);

  // 6. Roadmap Phase breakdown
  const phaseBreakdowns = useMemo(() => {
    return [1, 2, 3, 4].map(phase => {
      const topics = state.roadmapTopics.filter(t => t.phase === phase);
      const done = topics.filter(t => t.status === 'Completed').length;
      return {
        phase,
        total: topics.length,
        done,
        percent: topics.length > 0 ? Math.round((done / topics.length) * 100) : 0,
      };
    });
  }, [state.roadmapTopics]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Achievements</h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time performance metrics, problem velocity, and milestones unlocked across your journey.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-2 border-l-emerald-500 bg-[#12141A]">
          <p className="text-xs font-medium text-gray-400 uppercase">Solved Problems</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-white">{totalSolved}</span>
            <span className="text-xs text-gray-500">/ {state.problems.length}</span>
          </div>
        </Card>

        <Card className="p-4 border-l-2 border-l-amber-500 bg-[#12141A]">
          <p className="text-xs font-medium text-gray-400 uppercase">Current / Max Streak</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">{state.streak}</span>
            <span className="text-xs text-gray-500">days (Peak: {state.longestStreak})</span>
          </div>
        </Card>

        <Card className="p-4 border-l-2 border-l-blue-500 bg-[#12141A]">
          <p className="text-xs font-medium text-gray-400 uppercase">Total Focus Time</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-white">{totalFocusHours}</span>
            <span className="text-xs text-gray-500">hours</span>
          </div>
        </Card>

        <Card className="p-4 border-l-2 border-l-purple-500 bg-[#12141A]">
          <p className="text-xs font-medium text-gray-400 uppercase">Roadmap Progress</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-purple-400">{roadmapProgress}%</span>
            <span className="text-xs text-gray-500">completed</span>
          </div>
        </Card>
      </div>

      {/* Row 1 Charts: Problems by Difficulty & Problems by DSA Topic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Pie Chart */}
        <Card className="p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Problems by Difficulty</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ratio of completed coding questions</p>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            {totalSolved === 0 ? (
              <div className="text-center text-xs text-gray-500">
                No solved problems logged yet to chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {difficultyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#12141A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val: any, name: any) => [`${val} Solved`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-around text-xs pt-3 border-t border-white/5">
            <div className="text-center">
              <span className="text-emerald-400 font-bold block text-sm">
                {difficultyData.find(d => d.name === 'Easy')?.value || 0}
              </span>
              <span className="text-gray-400">Easy</span>
            </div>
            <div className="text-center">
              <span className="text-amber-400 font-bold block text-sm">
                {difficultyData.find(d => d.name === 'Medium')?.value || 0}
              </span>
              <span className="text-gray-400">Medium</span>
            </div>
            <div className="text-center">
              <span className="text-red-400 font-bold block text-sm">
                {difficultyData.find(d => d.name === 'Hard')?.value || 0}
              </span>
              <span className="text-gray-400">Hard</span>
            </div>
          </div>
        </Card>

        {/* Topic Bar Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">DSA Topic Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Problems solved vs total logged per topic</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {topicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No problem categories available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="topic" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#12141A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    formatter={(val: any, name: any) => [val, name === 'solved' ? 'Solved' : 'Total Added']}
                  />
                  <Bar dataKey="total" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2 Charts: Focus Time Over Time & Velocity Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Time Area Chart (30 Days) */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Focus Time (Last 30 Days)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily deep study minutes over time</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTimeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" stroke="#6b7280" fontSize={10} tickLine={false} interval={5} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12141A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => [`${val} mins`, 'Focus']}
                />
                <Area type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#focusGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Solved Velocity */}
        <Card className="p-6 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Problem Velocity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Weekly volume of completed problems</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklySolvedTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="weekLabel" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12141A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => [`${val} solved`, 'Velocity']}
                />
                <Line type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Roadmap Phase Progression Strip */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-white mb-4">Roadmap Curriculum Completion</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {phaseBreakdowns.map(pb => (
            <div key={pb.phase} className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-300 font-medium">Phase {pb.phase}</span>
                <span className="text-gray-400">{pb.done}/{pb.total}</span>
              </div>
              <ProgressBar value={pb.percent} color="bg-purple-500" />
            </div>
          ))}
        </div>
      </Card>

      {/* Gamified Achievements Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Trophies & Milestone Badges</h3>
            <p className="text-xs text-gray-400 mt-0.5">Earn badges by hitting study targets and coding milestones</p>
          </div>
          <Badge variant="purple">
            {state.achievements.filter(a => a.unlockedAt).length} / {state.achievements.length} Unlocked
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {state.achievements.map(ach => {
            const isUnlocked = !!ach.unlockedAt;
            const IconComponent = achievementIcons[ach.icon] || <Trophy size={20} />;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-transparent border-amber-500/30 ring-1 ring-amber-500/20'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${
                      isUnlocked 
                        ? 'bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20' 
                        : 'bg-white/5 text-gray-500'
                    }`}>
                      {IconComponent}
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        UNLOCKED
                      </span>
                    ) : (
                      <Lock size={14} className="text-gray-600" />
                    )}
                  </div>

                  <h4 className={`text-sm font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 text-[10px] text-gray-500">
                  {isUnlocked && ach.unlockedAt ? (
                    <span className="text-amber-300/80">Earned {formatDate(ach.unlockedAt)}</span>
                  ) : (
                    <span>Requirement: {ach.condition}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
