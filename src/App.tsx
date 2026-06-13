import { useState, useEffect } from 'react';
import { 
  Droplet, 
  Sparkles, 
  BookOpen, 
  Settings, 
  Trash2, 
  Plus, 
  FileDown, 
  Info, 
  Check, 
  Undo, 
  Home as HomeIcon, 
  ClipboardList, 
  Bell, 
  Smartphone, 
  ShieldAlert, 
  Flame, 
  Terminal,
  CircleAlert
} from 'lucide-react';
import { WaterLog, UserProfile, AppPreferences, DrinkUnit } from './types';
import CodeViewer from './components/CodeViewer';

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
    // Seed initial logs
    const today = new Date();
    const time1 = new Date(today.setHours(8, 15, 0)).toISOString();
    const time2 = new Date(today.setHours(11, 40, 0)).toISOString();
    return [
      { id: 'seed-log-1', amountMl: 250, timestamp: time2 },
      { id: 'seed-log-2', amountMl: 350, timestamp: time1 }
    ];
  });

  // Dark mode trigger
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hydromind_dark_mode') === 'true';
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('hydromind_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('hydromind_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('hydromind_prefs', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('hydromind_logs', JSON.stringify(logs));
  }, [logs]);

  // Main navigation tab control
  const [activeTab, setActiveTab] = useState<'home' | 'log' | 'settings' | 'blueprints'>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customInputMl, setCustomInputMl] = useState<string>('');
  const [undoLog, setUndoLog] = useState<WaterLog | null>(null);

  // Settings modification temporary states
  const [tempWeight, setTempWeight] = useState(profile.weight.toString());
  const [tempHeight, setTempHeight] = useState(profile.height.toString());
  const [tempConditions, setTempConditions] = useState<string[]>(profile.conditions);
  const [tempActivity, setTempActivity] = useState(profile.activityLevel);

  // Advanced simulations sandbox variables 
  const [activeDemo, setActiveDemo] = useState<'widget' | 'notification'>('widget');

  // Load temp states when profile is updated
  useEffect(() => {
    setTempWeight(profile.weight.toString());
    setTempHeight(profile.height.toString());
    setTempConditions(profile.conditions);
    setTempActivity(profile.activityLevel);
  }, [profile]);

  // Toast notifier triggers
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fast add and precise log execution
  const handleDrinkLogged = (amountMl: number) => {
    const newLog: WaterLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amountMl,
      timestamp: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);
    const converted = formatAmount(amountMl);
    triggerToast(`Logged ${converted}! 💧`);
  };

  const handleCustomLog = () => {
    const val = parseInt(customInputMl, 10);
    if (isNaN(val) || val <= 0 || val > 2000) {
      triggerToast("Please enter a valid amount (1 - 2000 ml)");
      return;
    }
    handleDrinkLogged(val);
    setCustomInputMl('');
  };

  // Delete and local restore Undo mechanism
  const handleDeleteLog = (logItem: WaterLog) => {
    setUndoLog(logItem);
    setLogs(logs.filter(l => l.id !== logItem.id));
    triggerToast(`Removed entry of ${formatAmount(logItem.amountMl)}`);
  };

  const handleUndoDelete = () => {
    if (undoLog) {
      setLogs([undoLog, ...logs]);
      triggerToast(`Restored hydration element!`);
      setUndoLog(null);
    }
  };

  const handleResetLogs = () => {
    setLogs([]);
    triggerToast("Today's water intake has been reset.");
  };

  // Unit converter preference matching
  const formatAmount = (ml: number): string => {
    if (preferences.unitPreference === 'oz') {
      const oz = Math.round(ml * 0.033814);
      return `${oz} fl oz`;
    }
    return `${ml} ml`;
  };

  const activeGoal = preferences.manualGoalOverride 
    ? preferences.overriddenGoalMl 
    : profile.calculatedGoalMl;

  const todayTotal = logs.reduce((sum, log) => sum + log.amountMl, 0);
  const progressPercent = Math.min(100, Math.round((todayTotal / activeGoal) * 100));

  const getMotivationalMessage = () => {
    if (progressPercent === 0) return "Let's get started! 💧";
    if (progressPercent < 25) return "Good start! Drinking water is self-care.";
    if (progressPercent < 50) return "Keep going, your body is loving this! 👍";
    if (progressPercent < 75) return "Halfway there, you're doing great! ✨";
    if (progressPercent < 100) return "Almost at your goal! Just a bit more.";
    return "Goal reached! 🎉 Stay consistent.";
  };

  const calculateGoalMl = (
    w: number, wUnit: 'kg' | 'lbs',
    h: number, hUnit: 'cm' | 'in',
    conds: string[], act: string
  ): number => {
    const weightInKg = wUnit === 'lbs' ? (w * 0.453592) : w;
    let baseline = weightInKg * 35;

    switch (act) {
      case 'light': baseline += 200; break;
      case 'moderate': baseline += 500; break;
      case 'active': baseline += 850; break;
    }

    conds.forEach(c => {
      if (c === 'kidney') baseline = baseline * 0.70;
      if (c === 'heart') baseline = baseline * 0.75;
      if (c === 'diabetes') baseline += 400;
      if (c === 'pregnant') baseline += 300;
      if (c === 'breastfeeding') baseline += 750;
      if (c === 'hot_climate') baseline += 500;
    });

    return Math.floor(Math.max(1500, Math.min(4000, baseline)));
  };

  const handleFinishOnboarding = (agreed: boolean, w: string, h: string, act: string, conds: string[]) => {
    const wNum = parseFloat(w);
    const hNum = parseFloat(h);
    if (isNaN(wNum) || wNum <= 0 || isNaN(hNum) || hNum <= 0) {
      triggerToast("Please input real physical measurements.");
      return;
    }

    const calculatedGoal = calculateGoalMl(wNum, profile.weightUnit, hNum, profile.heightUnit, conds, act);

    setProfile({
      ...profile,
      weight: wNum,
      height: hNum,
      activityLevel: act as any,
      conditions: conds,
      calculatedGoalMl: calculatedGoal,
      isCompletedOnboarding: true,
      agreedDisclaimer: agreed
    });

    triggerToast(`Profile configured! Daily target: ${calculatedGoal}ml.`);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Timestamp,LoggedAmount_ML\n"
      + logs.map(l => `${l.id},${new Date(l.timestamp).toISOString()},${l.amountMl}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hydromind_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Backup CSV downloaded!");
  };

  const handleSkipOnboarding = () => {
    setProfile(prev => ({
      ...prev,
      isCompletedOnboarding: true,
      agreedDisclaimer: true
    }));
  };

  // Weekly History Custom Graph
  const drawWeeklyHistoryGraph = () => {
    const midGoal = activeGoal;
    const weekdayValues = [
      { day: "Mon", amount: Math.floor(midGoal * 0.4) },
      { day: "Tue", amount: Math.floor(midGoal * 0.8) },
      { day: "Wed", amount: todayTotal },
      { day: "Thu", amount: 0 },
      { day: "Fri", amount: 0 },
      { day: "Sat", amount: 0 },
      { day: "Sun", amount: 0 }
    ];

    const chartHeight = 100;
    const barWidth = 24;
    const spacing = 14;

    return (
      <div className="flex flex-col py-2 w-full">
        <svg viewBox="0 0 300 130" className="w-full h-32 overflow-visible">
          <line 
            x1="0" 
            y1={chartHeight * 0.2} 
            x2="280" 
            y2={chartHeight * 0.2} 
            stroke="#2196F3" 
            strokeDasharray="4,4" 
            strokeWidth="1"
            opacity="0.6"
          />
          <text x="235" y={chartHeight * 0.2 - 4} className="fill-[#1e88e5] text-[8px] font-bold">Goal Line</text>

          {weekdayValues.map((item, idx) => {
            const fraction = Math.min(1.2, item.amount / midGoal);
            const customBarHeight = Math.max(4, fraction * chartHeight * 0.8);
            const x = idx * (barWidth + spacing) + 12;
            const y = chartHeight - customBarHeight;
            const isCompleted = item.amount >= midGoal;

            return (
              <g key={item.day} className="cursor-pointer group">
                <text 
                  x={x + barWidth/2} 
                  y={y - 6} 
                  textAnchor="middle" 
                  className={`text-[8px] font-semibold transition-colors duration-200 ${isDarkMode ? 'fill-zinc-400 group-hover:fill-zinc-200' : 'fill-zinc-400 group-hover:fill-zinc-800'}`}
                >
                  {formatAmount(item.amount)}
                </text>
                
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={customBarHeight}
                  rx="6"
                  ry="6"
                  fill={isCompleted ? "#4CAF55" : "#0381fe"}
                  className="transition-all duration-500 ease-out fill-cyan-400 saturate-125 hover:opacity-90"
                />

                <text 
                  x={x + barWidth/2} 
                  y={chartHeight + 14} 
                  textAnchor="middle" 
                  className={`text-[10px] font-medium ${isDarkMode ? 'fill-zinc-400' : 'fill-zinc-500'}`}
                >
                  {item.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-300 flex flex-col font-sans antialiased select-none ${isDarkMode ? 'bg-[#18181b] text-zinc-100' : 'bg-[#eef1f5] text-zinc-850'}`}>
      
      {/* Decorative ambient background mesh blobs */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-gradient-to-br from-[#A5C9FD]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10 select-none"></div>
      <div className="absolute bottom-[20%] right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-[#D1FDFF]/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10 select-none"></div>

      {/* Main Container: Centered responsive mobile web layout */}
      <div className={`mx-auto w-full max-w-lg min-h-screen flex flex-col justify-between shadow-2xl relative transition-all duration-300 ${isDarkMode ? 'bg-zinc-900 border-x border-zinc-800 text-white' : 'bg-white border-x border-[#f2f2f7] text-zinc-800'}`}>
        
        {/* Fullscreen Mobile web app Header */}
        <header className={`px-5 py-4 border-b flex justify-between items-center transition-all ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-zinc-100'} sticky top-0 z-40 backdrop-blur-md`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0381fe] to-sky-400 p-[1px] flex items-center justify-center shadow-md">
              <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}`}>
                <Droplet className="w-5 h-5 text-[#0381fe] fill-[#0381fe]/15 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight">HydroMind</span>
                <span className="text-[8px] bg-[#0381fe]/10 text-[#0381fe] border border-[#0381fe]/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">PWA</span>
              </div>
              <p className={`text-[10px] font-semibold leading-none ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Clinical Hydration Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick display stats */}
            {profile.isCompletedOnboarding && (
              <div className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60 text-emerald-400' : 'bg-sky-50 border-[#0381fe]/10 text-[#0381fe]'}`}>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>{progressPercent}% Today</span>
              </div>
            )}
            
            {/* Direct skip onboarding element */}
            {!profile.isCompletedOnboarding && (
              <button
                id="btn-onboarding-skip-header"
                onClick={handleSkipOnboarding}
                className="text-[10px] font-extrabold bg-[#0381fe] text-white px-3 py-1.5 rounded-xl hover:bg-[#0270dd] transition-all"
              >
                Skip Setup
              </button>
            )}
          </div>
        </header>

        {/* Dynamic content rendering zone */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto w-full no-scrollbar">

          {!profile.isCompletedOnboarding ? (
            /* STEPPED ONBOARDING FLOW SCREEN */
            <div className={`p-6 flex flex-col justify-between flex-1 transition-all ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
              <div className="flex flex-col gap-4">
                <div className="mt-2">
                  <span className="text-xs font-bold text-sky-500 uppercase tracking-widest font-mono">Biometrics Calculator</span>
                  <h2 className={`text-2xl font-black tracking-tight leading-none mt-1 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    HydroMind Setup
                  </h2>
                  <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-zinc-450' : 'text-zinc-500'}`}>
                    Configure biometric parameters and health parameters dynamically designed for health-oriented hydration volume calculation.
                  </p>
                </div>

                <div className={`border-t my-1 pt-4 flex flex-col gap-4 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  {/* Weight biometrics */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      My Body Weight
                    </label>
                    <div className="flex gap-2.5">
                      <input 
                        type="number"
                        id="weight-input"
                        value={tempWeight}
                        onChange={(e) => setTempWeight(e.target.value)}
                        className={`outline-none border rounded-xl px-3 py-2 text-xs font-bold w-full transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/60 text-white focus:border-[#0381fe]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#0381fe]'}`}
                        placeholder="70"
                      />
                      <div className={`flex rounded-xl p-0.5 border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/60' : 'bg-zinc-50 border-zinc-200'}`}>
                        {['kg', 'lbs'].map((unit) => (
                          <button
                            key={unit}
                            id={`btn-weight-${unit}`}
                            onClick={() => setProfile({...profile, weightUnit: unit as any})}
                            className={`text-[10px] font-extrabold uppercase py-1 px-3.5 rounded-lg transition-all ${profile.weightUnit === unit ? 'bg-[#0381fe] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Height biometrics */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      My Physical Height
                    </label>
                    <div className="flex gap-2.5">
                      <input 
                        type="number"
                        id="height-input"
                        value={tempHeight}
                        onChange={(e) => setTempHeight(e.target.value)}
                        className={`outline-none border rounded-xl px-3 py-2 text-xs font-bold w-full transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/60 text-white focus:border-[#0381fe]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#0381fe]'}`}
                        placeholder="175"
                      />
                      <div className={`flex rounded-xl p-0.5 border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/60' : 'bg-zinc-50 border-zinc-200'}`}>
                        {['cm', 'in'].map((unit) => (
                          <button
                            key={unit}
                            id={`btn-height-${unit}`}
                            onClick={() => setProfile({...profile, heightUnit: unit as any})}
                            className={`text-[10px] font-extrabold uppercase py-1 px-3.5 rounded-lg transition-all ${profile.heightUnit === unit ? 'bg-[#0381fe] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Activity Level Selection */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Sports & Exercise Intensity
                    </label>
                    <select 
                      id="activity-select"
                      value={tempActivity}
                      onChange={(e) => setTempActivity(e.target.value)}
                      className={`border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                    >
                      <option value="sedentary">Sedentary (Office tasks, minimal walking)</option>
                      <option value="light">Lightly Active (1-2 walks/workouts weekly)</option>
                      <option value="moderate">Moderately Active (Daily sweaty workout sessions)</option>
                      <option value="active">Heavy/Athletic Trainer (Sports / intense gym sweat)</option>
                    </select>
                  </div>

                  {/* Clinical Safeguard Checklist Multi-select */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Clinical Conditions & Environmental factors
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-0.5">
                      {[
                        { id: 'kidney', val: 'Renal condition (reduce)' },
                        { id: 'heart', val: 'Cardiovascular (reduce)' },
                        { id: 'diabetes', val: 'Diabetes check (add)' },
                        { id: 'pregnant', val: 'Gestation (+300 ml)' },
                        { id: 'breastfeeding', val: 'Lactation (+750 ml)' },
                        { id: 'hot_climate', val: 'Hot / Sweaty climate (+500)' }
                      ].map(item => {
                        const active = tempConditions.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            id={`btn-cond-${item.id}`}
                            onClick={() => {
                              if (active) {
                                setTempConditions(tempConditions.filter(c => c !== item.id));
                              } else {
                                setTempConditions([...tempConditions, item.id]);
                              }
                            }}
                            className={`text-[10px] font-bold text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${active ? (isDarkMode ? 'bg-[#0381fe]/15 border-[#0381fe] text-white' : 'bg-sky-50 border-[#0381fe] text-[#0381fe]') : (isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400' : 'bg-zinc-50 border-zinc-200/80 text-zinc-600')}`}
                          >
                            <span>{item.val}</span>
                            {active && <Check className="w-3.5 h-3.5 shrink-0 text-[#0381fe]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety Medical Disclaimer Safeguard Clause */}
                  <div className={`border rounded-2xl p-4 flex flex-col gap-1.5 mt-1 ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-amber-50/40 border-amber-200/50'}`}>
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <ShieldAlert className="w-4.5 h-4.5 shrink-0 animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Required Safety Clause</span>
                    </div>
                    <p className={`text-[10px] leading-relaxed font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      This digital companion provides customized baselines, not medical diagnosis statement. Personal fluid intake restrictions must always adhere strictly to your primary clinical professional's guideline advice.
                    </p>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        id="disclaimer-checkbox"
                        checked={profile.agreedDisclaimer}
                        onChange={(e) => setProfile({...profile, agreedDisclaimer: e.target.checked})}
                        className="accent-[#0381fe] shrink-0 w-3.5 h-3.5 rounded"
                      />
                      <span className={`text-[10px] font-bold text-amber-600 hover:opacity-80`}>
                        I accept these clinical safeguards
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                id="btn-onboarding-complete"
                disabled={!profile.agreedDisclaimer}
                onClick={() => handleFinishOnboarding(profile.agreedDisclaimer, tempWeight, tempHeight, tempActivity, tempConditions)}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all mt-6 shadow-md ${profile.agreedDisclaimer ? 'bg-[#0381fe] hover:bg-[#0270dd] text-white active:scale-98 cursor-pointer' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-650'}`}
              >
                Calculate Daily Target
              </button>
            </div>
          ) : (
            /* ACTIVE MULTI-TAB FULLSCREEN WATER COMPANION APP */
            <div className="flex-1 flex flex-col justify-between p-4 min-h-[500px]">
              
              {/* HOME MAIN SCREEN TAB */}
              {activeTab === 'home' && (
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div>
                    {/* Welcome Streak header bar */}
                    <div className="flex justify-between items-center mt-2.5">
                      <div>
                        <p className="text-[10px] font-black text-[#0381fe] tracking-wider uppercase">Active Hydration status</p>
                        <h3 className="text-xl font-black tracking-tight leading-none">Dashboard</h3>
                      </div>
                      <div className={`flex items-center border rounded-full px-3 py-1 text-orange-650 gap-1.5 shadow-sm ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-orange-50 border-orange-200/50'}`}>
                        <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
                        <span className="text-[11px] font-extrabold">3 Days streak</span>
                      </div>
                    </div>

                    {/* Progress Circle Visual Ring display */}
                    <div className="flex flex-col items-center justify-center my-6 relative">
                      <div className="absolute inset-0 bg-[#0381fe]/3 rounded-full blur-3xl pointer-events-none"></div>
                      <svg className="w-52 h-52 transform -rotate-90 select-none overflow-visible" viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="41" 
                          fill="transparent" 
                          stroke={isDarkMode ? '#27272a' : '#f1f5f9'} 
                          strokeWidth="7"
                        />
                        {/* Interactive dynamic foreground sweeper trail */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="41" 
                          fill="transparent" 
                          stroke="#0381fe" 
                          strokeWidth="8"
                          strokeDasharray="257.6"
                          strokeDashoffset={257.6 - (257.6 * progressPercent) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out saturate-125"
                        />
                      </svg>

                      {/* Floating progress percentage details */}
                      <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
                        <Droplet className="w-10 h-10 text-[#0381fe] fill-[#0381fe]/15 animate-bounce" />
                        <span className="text-xl font-black mt-2 leading-none">
                          {formatAmount(todayTotal)}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          of {formatAmount(activeGoal)}
                        </span>
                        <span className="text-sm font-black text-[#0381fe] tracking-tight mt-1.5 bg-[#0381fe]/10 px-2.5 py-0.5 rounded-full">{progressPercent}%</span>
                      </div>
                    </div>

                    {/* Dynamic health clinical guidance box */}
                    <div className={`border rounded-2xl p-3.5 text-center mt-2 group shadow-sm transition-all ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-sky-50/50 border-[#0381fe]/10'}`}>
                      <span className="text-[11px] font-bold text-[#0381fe] flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>{getMotivationalMessage()}</span>
                      </span>
                    </div>

                    {/* Quick Drink addition buttons array */}
                    <div className="flex flex-col gap-2 mt-5">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Quick Addition Water Presets
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[150, 250, 350, 500].map(amt => (
                          <button
                            key={amt}
                            id={`btn-add-${amt}`}
                            onClick={() => handleDrinkLogged(amt)}
                            className={`border rounded-xl font-black text-xs py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-750 border-zinc-700/60 text-sky-400' : 'bg-white hover:bg-sky-50 border-zinc-200 hover:border-[#0381fe] text-[#0381fe]'}`}
                          >
                            <span className="text-[10px]">💧</span>
                            <span>+{preferences.unitPreference === 'oz' ? `${Math.round(amt * 0.033814)} oz` : `${amt} ml`}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual precision logger entries input */}
                    <div className={`flex gap-2.5 mt-4 border-t pt-3.5 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
                      <input 
                        type="number"
                        id="custom-log-input"
                        value={customInputMl}
                        onChange={(e) => setCustomInputMl(e.target.value)}
                        className={`outline-none border text-xs font-bold rounded-xl px-3 py-2.5 flex-1 min-w-0 transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/60 text-white focus:border-[#0381fe]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#0381fe]'}`}
                        placeholder="Log personalized volume amount (ml)..."
                      />
                      <button
                        id="btn-custom-add"
                        onClick={handleCustomLog}
                        className="bg-[#0381fe] hover:bg-[#0270dd] active:scale-95 font-bold text-white text-xs uppercase px-5 rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add volume</span>
                      </button>
                    </div>
                  </div>

                  {/* ADVANCED ANDROID OS INTEGRATIONS SIMULATIONS SANDBOX */}
                  <div className={`rounded-3xl border p-4.5 mt-5 flex flex-col gap-3 relative shadow-md transition-all ${isDarkMode ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-zinc-50/50 border-zinc-200/80'}`}>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0381fe]/10 flex items-center justify-center text-[#0381fe]">
                          <Smartphone className="w-4 h-4 animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider">Android OS Sandbox</h4>
                          <p className={`text-[10px] leading-none font-medium ${isDarkMode ? 'text-zinc-550' : 'text-zinc-400'}`}>
                            Live simulation of native phone system modules
                          </p>
                        </div>
                      </div>

                      {/* Mini Simulation views selectors */}
                      <div className={`flex rounded-xl p-0.5 border text-[9px] font-bold uppercase ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                        <button
                          onClick={() => setActiveDemo('widget')}
                          className={`px-2 py-1 rounded-lg transition-all ${activeDemo === 'widget' ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-450 hover:text-zinc-200'}`}
                        >
                          Smart Widget
                        </button>
                        <button
                          onClick={() => setActiveDemo('notification')}
                          className={`px-2 py-1 rounded-lg transition-all ${activeDemo === 'notification' ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-450 hover:text-zinc-200'}`}
                        >
                          Push Alert
                        </button>
                      </div>
                    </div>

                    {activeDemo === 'widget' ? (
                      /* SIMULATED SAMSUNG HOME SCREEN 4X1 SMART WIDGET */
                      <div className="bg-zinc-950 text-white rounded-2xl p-4 shadow-xl border border-white/10 flex flex-col gap-2.5 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#0381fe] to-sky-400 animate-pulse"></div>

                        <div className="flex justify-between items-center select-none">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400/30">
                              <Droplet className="w-3 h-3 text-sky-400 fill-sky-400/30" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white">HydroTracker Widget</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-[#0381fe] bg-[#0381fe]/10 border border-[#0381fe]/20 px-2 py-0.5 rounded-full">{progressPercent}% Achieved</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                            <div 
                              className="bg-[#0381fe] h-full transition-all duration-700"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-extrabold text-white/60">
                            <span>{formatAmount(todayTotal)} / {formatAmount(activeGoal)}</span>
                            <span>Target Goal</span>
                          </div>
                        </div>

                        <button
                          id="btn-widget-quick-drank"
                          onClick={() => {
                            handleDrinkLogged(250);
                            triggerToast("Widget simulated: +250ml logged via Android BroadcastReceiver! 💧");
                          }}
                          className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 rounded-xl py-1.5 px-3 text-[10px] font-black transition-all shadow-md self-end flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✓ Quick log 250 ml</span>
                        </button>
                      </div>
                    ) : (
                      /* SIMULATED SYSTEM LOCKSCREEN PUSH NOTIFICATION ALERT */
                      <div className="bg-zinc-950 text-white rounded-2xl p-4 shadow-xl border border-[#0381fe]/10 flex flex-col gap-2 relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-sky-400 fill-sky-400/10" />
                            <span className="text-[9px] font-black tracking-wider uppercase text-sky-400">HydroMind Push notification</span>
                          </div>
                          <span className="text-[8px] text-zinc-500 font-bold">Just now</span>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-white">Time to drink your fluids! 💧</p>
                          <p className="text-[10px] text-zinc-400 font-semibold leading-normal mt-0.5">
                            You have cleared {formatAmount(todayTotal)} of your {formatAmount(activeGoal)} target today.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1.5 border-t border-white/5 pt-2">
                          <button
                            id="btn-notif-action-drank"
                            onClick={() => {
                              handleDrinkLogged(250);
                              triggerToast("Notification simulated: +250ml logged via PendingIntent action! 💧");
                            }}
                            className="bg-[#0381fe] hover:bg-[#0270dd] active:scale-95 text-white rounded-xl py-1.5 text-[9px] font-black uppercase text-center cursor-pointer transition-all"
                          >
                            Drank 250 ml ✔
                          </button>
                          <button
                            id="btn-notif-action-remind"
                            onClick={() => {
                              triggerToast("Snoozed alert! Scheduled WorkManager retry alarm for 30 minutes.");
                            }}
                            className="bg-white/10 hover:bg-white/15 active:scale-95 text-zinc-350 rounded-xl py-1.5 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Remind in 30m
                          </button>
                        </div>
                      </div>
                    )}
                    
                  </div>

                </div>
              )}

              {/* LOGS HISTORY CHARTS TAB */}
              {activeTab === 'log' && (
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col">
                    
                    {/* Header items */}
                    <div className="pt-2.5 pb-1">
                      <p className="text-[10px] font-black text-[#0381fe] tracking-wider uppercase">My Hydration History</p>
                      <h3 className="text-xl font-black tracking-tight leading-none mt-0.5">Analytic Logs</h3>
                    </div>

                    {/* PAST 7 DAYS CUSTOM VISUALIZATION GRAPH */}
                    <div className={`rounded-3xl p-4.5 border shadow-sm mt-3.5 flex flex-col items-center ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-white border-zinc-100'}`}>
                      <h4 className={`text-[10px] font-black uppercase tracking-widest self-start ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Past 7 days volume totals
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-semibold self-start mt-0.5 mb-2 leading-none">
                        Tap and hover details based on calculated daily biometrics target
                      </p>
                      {drawWeeklyHistoryGraph()}
                    </div>

                    {/* ACTIVE ENTRIES DATABASE LIST */}
                    <div className="flex flex-col mt-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Logged entry data lines today
                        </span>
                        
                        {logs.length > 0 && (
                          <button 
                            id="btn-reset-logs"
                            onClick={handleResetLogs}
                            className="text-[10px] font-extrabold text-red-500 hover:text-red-700 uppercase cursor-pointer"
                          >
                            Clear today's logs
                          </button>
                        )}
                      </div>

                      <div className="max-h-[220px] overflow-y-auto no-scrollbar flex flex-col gap-2">
                        {logs.length === 0 ? (
                          <div className={`text-center py-8 border border-dashed rounded-2xl flex flex-col items-center gap-1.5 ${isDarkMode ? 'bg-zinc-800/45 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                            <CircleAlert className="w-5 h-5 text-zinc-400" />
                            <p className="text-xs text-zinc-400 font-bold">No fluid entries logged for today yet.</p>
                          </div>
                        ) : (
                          logs.map(log => (
                            <div 
                              key={log.id} 
                              className={`flex justify-between items-center px-4 py-3 rounded-2xl border shadow-sm transition-all ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800' : 'bg-white border-zinc-100 hover:bg-zinc-50'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 bg-[#0381fe] rounded-full animate-ping"></div>
                                <span className="text-xs font-black">{formatAmount(log.amountMl)}</span>
                                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-450' : 'text-zinc-400'}`}>
                                  logged at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button 
                                id={`btn-delete-log-${log.id}`}
                                onClick={() => handleDeleteLog(log)}
                                className={`transition-all p-1.5 rounded-xl hover:bg-red-500/10 cursor-pointer ${isDarkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-300 hover:text-red-600'}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Summary telemetry data info box */}
                  <div className={`rounded-2xl p-4.5 shadow-md flex justify-between items-center mt-4 transition-all ${isDarkMode ? 'bg-zinc-850/80' : 'bg-zinc-900 text-white'}`}>
                    <div>
                      <p className="text-[8px] font-black uppercase text-sky-400 tracking-widest leading-none">Total Consumed</p>
                      <p className="text-base font-black leading-none mt-1.5">{formatAmount(todayTotal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest leading-none">Goal Remaining</p>
                      <p className="text-base font-black leading-none mt-1.5 text-zinc-200">
                        {formatAmount(Math.max(0, activeGoal - todayTotal))}
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* PROFILE/SETTINGS PREFERENCES TAB */}
              {activeTab === 'settings' && (
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3.5 py-1">
                  
                  {/* Header title */}
                  <div className="pt-2.5">
                    <p className="text-[10px] font-black text-[#0381fe] tracking-wider uppercase">Configurations</p>
                    <h3 className="text-xl font-black tracking-tight leading-none mt-0.5">Preferences</h3>
                  </div>

                  {/* Medical profile recalculator */}
                  <div className={`rounded-3xl p-4 border shadow-sm flex flex-col gap-3 ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-white border-zinc-100'}`}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#0381fe] shrink-0" />
                      <span>Physical Bio-Data</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-550'}`}>Weight</label>
                        <input 
                          type="number"
                          id="settings-weight"
                          value={tempWeight}
                          onChange={(e) => setTempWeight(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-white focus:border-[#0381fe]' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#0381fe]'}`}
                        />
                      </div>
                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-550'}`}>Height</label>
                        <input 
                          type="number"
                          id="settings-height"
                          value={tempHeight}
                          onChange={(e) => setTempHeight(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-white focus:border-[#0381fe]' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-[#0381fe]'}`}
                        />
                      </div>
                    </div>

                    <button
                      id="btn-settings-recalc"
                      onClick={() => {
                        const wNum = parseFloat(tempWeight);
                        const hNum = parseFloat(tempHeight);
                        if (isNaN(wNum) || isNaN(hNum)) {
                          triggerToast("Please input valid physical metrics.");
                          return;
                        }
                        const dynamicGoal = calculateGoalMl(wNum, profile.weightUnit, hNum, profile.heightUnit, profile.conditions, profile.activityLevel);
                        setProfile({
                          ...profile,
                          weight: wNum,
                          height: hNum,
                          calculatedGoalMl: dynamicGoal
                        });
                        triggerToast(`Goal updated: ${dynamicGoal}ml.`);
                      }}
                      className="bg-[#0381fe] text-white hover:bg-[#0270dd] py-2 px-4 rounded-xl text-xs font-extrabold uppercase mt-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Update & Recalculate Daily Goal
                    </button>
                  </div>

                  {/* Manual Target Override metrics */}
                  <div className={`rounded-3xl p-4 border shadow-sm flex flex-col gap-2.5 ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-white border-zinc-100'}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Manual Cap overriding</h4>
                      <input 
                        type="checkbox"
                        id="manual-goal-override-toggle"
                        checked={preferences.manualGoalOverride}
                        onChange={(e) => setPreferences({...preferences, manualGoalOverride: e.target.checked})}
                        className="accent-[#0381fe] w-4 h-4 rounded cursor-pointer"
                      />
                    </div>

                    {preferences.manualGoalOverride && (
                      <div className="flex gap-2.5 items-center mt-1 border-t pt-2.5 border-zinc-150/40 animate-fade-in">
                        <input 
                          type="number"
                          id="manual-goal-input"
                          value={preferences.overriddenGoalMl}
                          onChange={(e) => setPreferences({...preferences, overriddenGoalMl: Math.max(1000, parseInt(e.target.value, 10))})}
                          className={`border rounded-xl px-3 py-2 text-xs font-bold w-full ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                          placeholder="2000"
                        />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>ML</span>
                      </div>
                    )}
                  </div>

                  {/* Metric measurements choices */}
                  <div className={`rounded-3xl p-4 border shadow-sm flex justify-between items-center ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-white border-zinc-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider">Metrics unit choice</span>
                    <div className={`flex rounded-xl p-0.5 border ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                      {(['ml', 'oz'] as DrinkUnit[]).map(unit => (
                        <button
                          key={unit}
                          id={`btn-unit-${unit}`}
                          onClick={() => setPreferences({...preferences, unitPreference: unit})}
                          className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-lg transition-all cursor-pointer ${preferences.unitPreference === unit ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-500'}`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dark Mode Theme Active configuration toggle */}
                  <div className={`rounded-3xl p-4 border shadow-sm flex justify-between items-center ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-white border-zinc-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider">Dark Mode Active</span>
                    <button
                      id="btn-toggle-dark-mode"
                      onClick={() => {
                        setIsDarkMode(!isDarkMode);
                        triggerToast(`Dark Mode toggled ${!isDarkMode ? 'ON' : 'OFF'}! 🌙`);
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${isDarkMode ? 'bg-[#0381fe] justify-end' : 'bg-zinc-350 justify-start'}`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                    </button>
                  </div>

                  {/* Export CSV Data element backup */}
                  <button
                    id="btn-export-csv"
                    onClick={handleExportCSV}
                    className={`rounded-2xl py-3 px-4 shadow-md flex items-center justify-center gap-2 text-xs font-black uppercase transition-all mt-4 cursor-pointer ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-750 text-white' : 'bg-zinc-900 hover:bg-black text-white'}`}
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Export backup spreadsheet (CSV)</span>
                  </button>
                </div>
              )}

              {/* SOURCE BLUEPRINTS GALAXY CODE EXPLORER TAB */}
              {activeTab === 'blueprints' && (
                <div className="flex-1 flex flex-col gap-3 py-1 h-[620px]">
                  
                  {/* Header text */}
                  <div className="pt-2.5 select-none">
                    <p className="text-[10px] font-black text-[#0381fe] tracking-wider uppercase text-sky-500">Kotlin & Jetpack codebase</p>
                    <h3 className="text-xl font-black tracking-tight leading-none mt-0.5 text-zinc-900 dark:text-white">Android Blueprints</h3>
                  </div>

                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 select-none pb-1.5 leading-none">
                    Observe and compile the production Kotlin source code files directly below.
                  </p>

                  <div className="flex-1 min-h-[500px]">
                    <CodeViewer />
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

        {/* Global Floating Toast Alert notifications */}
        <div className="absolute inset-x-6 bottom-20 z-50 pointer-events-none select-none">
          {toastMessage && (
            <div className="bg-zinc-950/90 text-white text-[11px] font-bold py-3.5 px-4.5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex justify-between items-center gap-3 pointer-events-auto animate-fade-in-up">
              <span>{toastMessage}</span>
              {undoLog && (
                <button
                  id="btn-toast-undo"
                  onClick={handleUndoDelete}
                  className="text-sky-400 hover:text-sky-350 text-[11px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  Undo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Fullscreen bottom-sticked Navigation bar */}
        {profile.isCompletedOnboarding && (
          <nav id="app-nav-bar" className={`flex justify-around items-center py-2.5 border-t sticky bottom-0 z-40 transition-all ${isDarkMode ? 'bg-zinc-900/95 border-zinc-850' : 'bg-white/95 border-zinc-150/80'} backdrop-blur-md`}>
            
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 cursor-pointer ${activeTab === 'home' ? 'text-[#0381fe] font-black' : 'text-zinc-400 font-medium hover:text-zinc-300'}`}
            >
              <HomeIcon className="w-5.5 h-5.5" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Home</span>
            </button>

            <button
              id="nav-tab-log"
              onClick={() => setActiveTab('log')}
              className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 cursor-pointer ${activeTab === 'log' ? 'text-[#0381fe] font-black' : 'text-zinc-400 font-medium hover:text-zinc-300'}`}
            >
              <ClipboardList className="w-5.5 h-5.5" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Logs</span>
            </button>

            <button
              id="nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 cursor-pointer ${activeTab === 'settings' ? 'text-[#0381fe] font-black' : 'text-zinc-400 font-medium hover:text-zinc-300'}`}
            >
              <Settings className="w-5.5 h-5.5" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Settings</span>
            </button>

            <button
              id="nav-tab-blueprints"
              onClick={() => setActiveTab('blueprints')}
              className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 cursor-pointer ${activeTab === 'blueprints' ? 'text-[#0381fe] font-black animate-pulse' : 'text-zinc-400 font-medium hover:text-zinc-300'}`}
            >
              <Terminal className="w-5.5 h-5.5" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Blueprints</span>
            </button>

          </nav>
        )}

      </div>

      {/* Global generic footer overlay */}
      <footer className="py-6 px-4 text-center text-xs text-zinc-450 z-10 select-none">
        <div className="max-w-md mx-auto flex flex-col gap-1">
          <p className="font-semibold leading-relaxed">
            HydroMind Hybrid Web-to-Kotlin Client Companion — Designed in accordance with health-oriented parameters.
          </p>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E93] font-mono mt-0.5">
            © 2026 HydroMind Development Laboratories
          </span>
        </div>
      </footer>

    </div>
  );
}
