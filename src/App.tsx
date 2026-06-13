import { useState, useEffect } from 'react';
import { 
  Droplet, 
  Sparkles, 
  BookOpen, 
  Settings, 
  Activity, 
  Code2, 
  Smartphone,
  Share2,
  Heart,
  HelpCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import PhoneEmulator from './components/PhoneEmulator';
import CodeViewer from './components/CodeViewer';
import { WaterLog, UserProfile, AppPreferences } from './types';

export default function App() {
  // Setup persistent User Profile state
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hydromind_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      weight: 70,
      weightUnit: 'kg',
      height: 175,
      heightUnit: 'cm',
      conditions: [],
      otherCondition: '',
      activityLevel: 'moderate',
      calculatedGoalMl: 2450, // 70 * 35 = 2450
      isCompletedOnboarding: false,
      agreedDisclaimer: false
    };
  });

  // Setup persistent Application Preferences state
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const saved = localStorage.getItem('hydromind_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      reminderStart: "08:00",
      reminderEnd: "22:00",
      intervalMinutes: 60,
      unitPreference: 'ml',
      isNotificationEnabled: true,
      manualGoalOverride: false,
      overriddenGoalMl: 2500
    };
  });

  // Setup persistent Water Intake Logs state
  const [logs, setLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('hydromind_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    // Seed sample drink entries on initial startup for a vibrant, informative dashboard
    const today = new Date();
    const time1 = new Date(today.setHours(8, 15, 0)).toISOString();
    const time2 = new Date(today.setHours(11, 40, 0)).toISOString();
    return [
      { id: 'seed-log-1', amountMl: 250, timestamp: time2 },
      { id: 'seed-log-2', amountMl: 350, timestamp: time1 }
    ];
  });

  // Persist state to localStorage on any updates
  useEffect(() => {
    localStorage.setItem('hydromind_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('hydromind_prefs', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('hydromind_logs', JSON.stringify(logs));
  }, [logs]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hydromind_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hydromind_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Log a water drink amount
  const handleDrinkLogged = (amountMl: number) => {
    const newLog: WaterLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amountMl,
      timestamp: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);
  };

  // Skip onboarding guide function
  const handleSkipOnboarding = () => {
    setProfile(prev => ({
      ...prev,
      isCompletedOnboarding: true,
      agreedDisclaimer: true
    }));
  };

  const activeGoal = preferences.manualGoalOverride 
    ? preferences.overriddenGoalMl 
    : profile.calculatedGoalMl;

  const todayTotal = logs.reduce((sum, log) => sum + log.amountMl, 0);
  const progressPercent = Math.min(100, Math.round((todayTotal / activeGoal) * 100));

  return (
    <div className="min-h-screen bg-[#EEF1F5] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-[#0381fe]/30 selection:text-[#1A1A1A]">
      
      {/* Decorative ambient visual background meshes */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#A5C9FD]/25 to-transparent rounded-full blur-3xl pointer-events-none -z-10 select-none"></div>
      <div className="absolute top-[40%] right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-[#D1FDFF]/35 to-transparent rounded-full blur-3xl pointer-events-none -z-10 select-none"></div>

      {/* Primary Dashboard Header Navigation Bar */}
      <header className="border-b border-[#F2F2F7] bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0381fe] to-sky-400 p-[1px] flex items-center justify-center shadow-md shadow-[#0381fe]/15">
              <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
                <Droplet className="w-5.5 h-5.5 text-[#0381fe] fill-[#0381fe]/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">HydroMind</h1>
                <span className="text-[10px] bg-[#0381fe]/10 text-[#0381fe] border border-[#0381fe]/20 px-2.2 py-0.5 rounded-full font-black uppercase">One UI 6</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Samsung Android Companion & Jetpack Compose Code Center</p>
            </div>
          </div>

          {/* Quick-action Header statistics items */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-xs">
            <div className="bg-white border border-[#F2F2F7] rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-sm">
              <span className="text-[#8E8E93] font-bold">Goal Target:</span>
              <span className="font-extrabold text-[#1A1A1A]">{activeGoal} ml</span>
            </div>
            
            <div className="bg-white border border-[#F2F2F7] rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-sm">
              <span className="text-[#8E8E93] font-bold">Active Intake:</span>
              <span className="font-extrabold text-[#0381fe]">{todayTotal} ml ({progressPercent}%)</span>
            </div>

            {!profile.isCompletedOnboarding && (
              <button
                id="btn-quick-skip-onboarding"
                onClick={handleSkipOnboarding}
                className="bg-[#0381fe] hover:bg-[#0270dd] active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#0381fe]/15"
              >
                Launch Simulator Directly
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Primary Dashboard Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
        
        {/* Intro Alert Box */}
        <div className="bg-white border border-[#F2F2F7] rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0381fe]/10 border border-[#0381fe]/20 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-5.5 h-5.5 text-[#0381fe]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">Interactive One UI Emulations Studio</h2>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl font-medium">
                Welcome to the HydroMind companion suite! On the left, test out the full Android application workflow including calculations onboarding, circular hydration graphs, logs logs with Undo functions, settings presets, lockscreen notifications, and the 4x1 Samsung horizontal home widget. On the right, browse and copy the exact production-ready Kotlin and Compose files.
              </p>
            </div>
          </div>
        </div>

        {/* Parallel Panels: Phone Emulator Left / Code Center Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PHONE EMULATION CONTAINER - lg:col-span-4 */}
          <section className="lg:col-span-4 flex flex-col items-center gap-4">
            <div className="text-center select-none">
              <h3 className="text-xs font-black uppercase text-[#8E8E93] tracking-wider font-mono">GALAXY S24 ONE UI SIMULATOR</h3>
            </div>
            <PhoneEmulator 
              profile={profile}
              setProfile={setProfile}
              preferences={preferences}
              setPreferences={setPreferences}
              logs={logs}
              setLogs={setLogs}
              onDrinkLogged={handleDrinkLogged}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          </section>

          {/* DEVELOPER CODE BASE EXPORTER - lg:col-span-8 */}
          <section className="lg:col-span-8 flex flex-col gap-4 h-[450px] md:h-[680px]">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs font-black uppercase text-[#8E8E93] tracking-wider font-mono">PRODUCTION SOURCE FILES ARCHIVE</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
                <span>Total compiled files: 14</span>
              </div>
            </div>
            <CodeViewer />
          </section>

        </div>

      </main>

      {/* Dashboard Status Footer bar */}
      <footer className="border-t border-[#F2F2F7] bg-white py-6 px-6 mt-auto text-xs text-zinc-500 select-none shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="font-medium">HydroMind Companion — Built according to Samsung guidelines with Jetpack Compose, Room SQLite databases, and WorkManager.</p>
          <p className="text-[11px] font-bold tracking-wide font-mono uppercase text-[#8E8E93]">© 2026 HydroMind Developer Studio</p>
        </div>
      </footer>

    </div>
  );
}
