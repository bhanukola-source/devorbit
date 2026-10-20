import { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  User, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, ConfirmDialog, Toast } from '../components/ui';
import { exportAllData, importData, clearAllStorage } from '../utils/storage';
import type { UserSettings } from '../types';

export function Settings() {
  const { state, dispatch } = useApp();

  const [settings, setSettings] = useState<UserSettings>(() => ({
    ...state.settings,
  }));

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local form field updates & dispatch
  const handleUpdate = (patch: Partial<UserSettings>) => {
    const updated: UserSettings = {
      ...settings,
      ...patch,
    };
    setSettings(updated);
    dispatch({ type: 'SET_SETTINGS', payload: updated });
    setToastType('success');
    setToastMessage('Preferences saved!');
  };

  const handleUpdateTimerSettings = (patch: Partial<UserSettings['timerSettings']>) => {
    const updated: UserSettings = {
      ...settings,
      timerSettings: {
        ...settings.timerSettings,
        ...patch,
      },
    };
    setSettings(updated);
    dispatch({ type: 'SET_SETTINGS', payload: updated });
    setToastType('success');
    setToastMessage('Timer settings updated!');
  };

  // Export all application data as JSON
  const handleExportData = () => {
    try {
      const jsonString = exportAllData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `devorbit-backup-${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToastType('success');
      setToastMessage('Backup JSON downloaded successfully!');
    } catch {
      setToastType('error');
      setToastMessage('Failed to generate export file.');
    }
  };

  // Trigger file picker for import
  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Import JSON with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = importData(text);

        if (res.success) {
          setToastType('success');
          setToastMessage('Data imported successfully! Reloading workspace...');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setToastType('error');
          setToastMessage(res.error || 'Invalid backup file format.');
        }
      } catch {
        setToastType('error');
        setToastMessage('Failed to read backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Reset all application data
  const handleConfirmReset = () => {
    clearAllStorage();
    dispatch({ type: 'RESET_STATE' });
    setToastType('info');
    setToastMessage('DevOrbit workspace has been reset to defaults.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Workspace</h1>
        <p className="text-sm text-gray-400 mt-1">
          Customize your study targets, timer parameters, appearance, and data backups.
        </p>
      </div>

      {/* Profile & Identity Section */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <User size={18} className="text-purple-400" /> Developer Profile
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-600/20 shrink-0">
            {settings.displayName ? settings.displayName.charAt(0).toUpperCase() : 'D'}
          </div>

          <div className="flex-1 w-full space-y-1">
            <Input
              label="Display Name"
              placeholder="e.g. Alex Chen"
              value={settings.displayName}
              onChange={e => handleUpdate({ displayName: e.target.value })}
            />
            <p className="text-[11px] text-gray-500">
              Your name is displayed on the dashboard welcome banner and headers.
            </p>
          </div>
        </div>
      </Card>

      {/* Appearance Theme */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Moon size={18} className="text-purple-400" /> Interface Appearance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleUpdate({ theme: 'dark' })}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              settings.theme === 'dark'
                ? 'border-purple-500 bg-purple-600/10 ring-1 ring-purple-500/30'
                : 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-400'
            }`}
          >
            <div className="p-2 rounded-lg bg-black/40 text-purple-400">
              <Moon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Dark Universe (Recommended)</p>
              <p className="text-xs text-gray-400 mt-0.5">High-contrast near-black (#0B0D12) developer aesthetic.</p>
            </div>
          </button>

          <button
            onClick={() => handleUpdate({ theme: 'light' })}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              settings.theme === 'light'
                ? 'border-purple-500 bg-purple-600/10 ring-1 ring-purple-500/30'
                : 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-400'
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 text-amber-400">
              <Sun size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Light Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Clean daylight surface for high-ambient lighting.</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Daily Coding Targets */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Target size={18} className="text-purple-400" /> Daily Learning Targets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Input
              label="Daily Problem Goal (Questions)"
              type="number"
              min={1}
              max={30}
              value={settings.dailyProblemGoal}
              onChange={e => handleUpdate({ dailyProblemGoal: Math.max(1, Number(e.target.value)) })}
            />
            <p className="text-[11px] text-gray-500">
              Target number of algorithmic problems to solve each day.
            </p>
          </div>

          <div className="space-y-1">
            <Input
              label="Daily Focus Target (Minutes)"
              type="number"
              min={15}
              max={600}
              step={15}
              value={settings.dailyFocusGoal}
              onChange={e => handleUpdate({ dailyFocusGoal: Math.max(15, Number(e.target.value)) })}
            />
            <p className="text-[11px] text-gray-500">
              Recommended: 120 minutes of uninterrupted study per day.
            </p>
          </div>
        </div>
      </Card>

      {/* Pomodoro Timer Preferences */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Clock size={18} className="text-purple-400" /> Focus Room Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Focus Interval (Minutes)"
            type="number"
            min={5}
            max={120}
            value={settings.timerSettings.focusDuration}
            onChange={e => handleUpdateTimerSettings({ focusDuration: Math.max(5, Number(e.target.value)) })}
          />
          <Input
            label="Short Break (Minutes)"
            type="number"
            min={1}
            max={30}
            value={settings.timerSettings.shortBreakDuration}
            onChange={e => handleUpdateTimerSettings({ shortBreakDuration: Math.max(1, Number(e.target.value)) })}
          />
          <Input
            label="Long Break (Minutes)"
            type="number"
            min={5}
            max={60}
            value={settings.timerSettings.longBreakDuration}
            onChange={e => handleUpdateTimerSettings({ longBreakDuration: Math.max(5, Number(e.target.value)) })}
          />
        </div>
      </Card>

      {/* Data Management, Backup & Reset */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-400" /> Data Backup & Security
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Your DevOrbit progress and records are stored exclusively inside your browser's local storage. Export backups to prevent accidental data loss.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="secondary" onClick={handleExportData} className="gap-2">
            <Download size={16} /> Export Backup (JSON)
          </Button>

          <Button variant="secondary" onClick={handleTriggerImport} className="gap-2">
            <Upload size={16} /> Restore Backup (JSON)
          </Button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button 
            variant="danger" 
            onClick={() => setIsResetConfirmOpen(true)}
            className="gap-2 ml-auto"
          >
            <Trash2 size={16} /> Reset All Data
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Note on data persistence:</strong> Data is saved per browser profile. If you clear your browser site cookies/storage or switch computers, your records will not be preserved unless you restore from a downloaded JSON backup.
          </span>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Application Data?"
        message="This will permanently delete all your problem tracker entries, completed focus sessions, roadmap milestone progress, study notes, and custom preferences. This action CANNOT be undone."
        confirmText="Yes, Delete Everything"
        variant="danger"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
}
