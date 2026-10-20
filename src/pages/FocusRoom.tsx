import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Clock, 
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, ProgressBar, Toast } from '../components/ui';
import { generateId, getTodayString, formatDuration } from '../utils/storage';
import type { TimerMode, FocusSession } from '../types';

export function FocusRoom() {
  const { state, dispatch, recordActivity } = useApp();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [taskInput, setTaskInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ambient sound dummy toggle
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'whitenoise'>('off');

  // Custom durations in minutes
  const timerSettings = state.settings.timerSettings || {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    dailyFocusTarget: 120,
  };

  const getDurationForMode = (m: TimerMode) => {
    if (m === 'focus') return timerSettings.focusDuration * 60;
    if (m === 'shortBreak') return timerSettings.shortBreakDuration * 60;
    return timerSettings.longBreakDuration * 60;
  };

  const [totalSeconds, setTotalSeconds] = useState(() => getDurationForMode('focus'));
  const [secondsRemaining, setSecondsRemaining] = useState(() => getDurationForMode('focus'));

  // Accurate drift-proof timer refs
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const sessionStartTimeRef = useRef<string | null>(null);

  // Switch mode helper
  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const secs = getDurationForMode(newMode);
    setMode(newMode);
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    endTimeRef.current = null;
  };

  // Start timer
  const handleStart = () => {
    if (secondsRemaining <= 0) {
      const secs = getDurationForMode(mode);
      setSecondsRemaining(secs);
      setTotalSeconds(secs);
    }
    const now = Date.now();
    endTimeRef.current = now + (secondsRemaining > 0 ? secondsRemaining : getDurationForMode(mode)) * 1000;
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date().toISOString();
    }
    setIsRunning(true);
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const secs = getDurationForMode(mode);
    setSecondsRemaining(secs);
    setTotalSeconds(secs);
    endTimeRef.current = null;
    sessionStartTimeRef.current = null;
  };

  // Finish session
  const handleCompleteSession = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    endTimeRef.current = null;

    const completedSeconds = totalSeconds;
    const nowIso = new Date().toISOString();
    const startIso = sessionStartTimeRef.current || nowIso;

    const session: FocusSession = {
      id: generateId(),
      startTime: startIso,
      endTime: nowIso,
      duration: completedSeconds,
      mode,
      task: taskInput.trim() || (mode === 'focus' ? 'Deep Work Session' : 'Mindful Break'),
      completed: true,
    };

    dispatch({ type: 'ADD_FOCUS_SESSION', payload: session });
    const minutesAdded = Math.round(completedSeconds / 60);
    recordActivity({ focusMinutesDelta: mode === 'focus' ? minutesAdded : 0 });

    // Reset for next
    sessionStartTimeRef.current = null;
    setToastMessage(
      mode === 'focus' 
        ? 'Great focus session! Take a well-deserved break.' 
        : 'Break finished! Ready to lock back in?'
    );

    // Switch mode naturally
    if (mode === 'focus') {
      handleSwitchMode('shortBreak');
    } else {
      handleSwitchMode('focus');
    }
  }, [totalSeconds, mode, taskInput, dispatch, recordActivity]);

  // Main tick effect
  useEffect(() => {
    if (isRunning && endTimeRef.current) {
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - Date.now()) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          handleCompleteSession();
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleCompleteSession]);

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (100 -> 0)
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  // Today's focus sessions
  const todayStr = getTodayString();
  const todaySessions = useMemo(() => {
    return state.focusSessions
      .filter(s => s.completed && s.startTime && s.startTime.startsWith(todayStr))
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
  }, [state.focusSessions, todayStr]);

  const todayFocusMinutes = useMemo(() => {
    const secs = todaySessions
      .filter(s => s.mode === 'focus')
      .reduce((sum, s) => sum + s.duration, 0);
    return Math.round(secs / 60);
  }, [todaySessions]);

  const dailyTargetMinutes = timerSettings.dailyFocusTarget || 120;
  const targetPercent = Math.min(100, Math.round((todayFocusMinutes / dailyTargetMinutes) * 100));

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Focus Room</h1>
        <p className="text-sm text-gray-400">
          Eliminate distractions, track deep work intervals, and enter flow state.
        </p>
      </div>

      {/* Main Focus Card with Pomodoro Timer */}
      <Card className="p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[#12141A] border-white/10 shadow-2xl">
        {/* Glow backdrop during active focus */}
        {isRunning && mode === 'focus' && (
          <div className="absolute inset-0 bg-purple-600/5 blur-3xl pointer-events-none" />
        )}

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 mb-6 z-10">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'focus'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Deep Focus ({timerSettings.focusDuration}m)
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'shortBreak'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Short Break ({timerSettings.shortBreakDuration}m)
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'longBreak'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Long Break ({timerSettings.longBreakDuration}m)
          </button>
        </div>

        {/* Task Input */}
        <div className="w-full max-w-md mb-8 z-10">
          <input
            type="text"
            placeholder={mode === 'focus' ? "What specific task are you working on right now?" : "Take a deep breath or grab some water..."}
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
          />
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative flex items-center justify-center my-2 z-10">
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="70"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="70"
              stroke={mode === 'focus' ? '#9333ea' : mode === 'shortBreak' ? '#2563eb' : '#10b981'}
              strokeWidth="8"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>

          {/* Time in center */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tracking-tight text-white">
              {timeFormatted}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500 mt-1 font-semibold">
              {mode === 'focus' ? 'Focus Session' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8 z-10">
          <Button
            variant="secondary"
            size="md"
            onClick={handleReset}
            className="rounded-xl px-4 py-2.5"
            aria-label="Reset Timer"
          >
            <RotateCcw size={18} />
          </Button>

          {isRunning ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePause}
              className="rounded-xl px-8 py-3 text-base font-semibold border-purple-500/30"
            >
              <Pause size={20} className="fill-current" /> Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              className="rounded-xl px-8 py-3 text-base font-semibold shadow-purple-600/40"
            >
              <Play size={20} className="fill-current" /> Start Focus
            </Button>
          )}

          {/* Ambient sound toggle */}
          <button
            onClick={() => {
              const next = ambientSound === 'off' ? 'rain' : ambientSound === 'rain' ? 'whitenoise' : 'off';
              setAmbientSound(next);
            }}
            className={`p-3 rounded-xl border transition-colors ${
              ambientSound !== 'off' 
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
            title={`Ambient Sound: ${ambientSound.toUpperCase()}`}
          >
            {ambientSound !== 'off' ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Ambient note */}
        {ambientSound !== 'off' && (
          <p className="text-[11px] text-gray-500 mt-3 z-10">
            Playing simulated {ambientSound === 'rain' ? 'soft rain' : 'white noise'} atmosphere (client-side toggle)
          </p>
        )}
      </Card>

      {/* Daily Progress & History Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Target Progress */}
        <Card className="p-6 md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Today's Focus</h3>
            <Clock size={18} className="text-purple-400" />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold text-white">{todayFocusMinutes}m</span>
              <span className="text-xs text-gray-400">Target: {dailyTargetMinutes}m</span>
            </div>
            <ProgressBar value={targetPercent} color="bg-purple-500" />
          </div>

          <div className="text-xs text-gray-400 space-y-2 pt-2 border-t border-white/5">
            <div className="flex justify-between">
              <span>Completed Sessions:</span>
              <strong className="text-white">{todaySessions.filter(s => s.mode === 'focus').length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Current Streak:</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Flame size={12} /> {state.streak} days
              </span>
            </div>
          </div>
        </Card>

        {/* Today's Completed Sessions Log */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Session History (Today)</h3>
            <span className="text-xs text-gray-400">{todaySessions.length} total logged</span>
          </div>

          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No focus sessions logged today yet. Click "Start Focus" above to begin your first interval!
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pr-1">
              {todaySessions.map(session => (
                <div key={session.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={14} className={session.mode === 'focus' ? 'text-purple-400 shrink-0' : 'text-blue-400 shrink-0'} />
                    <span className="text-gray-200 font-medium truncate">{session.task}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-gray-400">
                    <Badge variant={session.mode === 'focus' ? 'purple' : 'info'}>
                      {session.mode === 'focus' ? 'Focus' : 'Break'}
                    </Badge>
                    <span>{formatDuration(Math.round(session.duration / 60))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
