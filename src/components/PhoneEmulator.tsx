import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplet,
  Flame,
  Trash2,
  Settings,
  ClipboardList,
  RotateCcw,
  FileDown,
  Info,
  AlertTriangle,
  Smartphone,
  Home,
  Bell,
  Check,
  Undo,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Plus
} from 'lucide-react';
import { WaterLog, UserProfile, AppPreferences, DrinkUnit } from '../types';

interface PhoneEmulatorProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  preferences: AppPreferences;
  setPreferences: (p: AppPreferences) => void;
  logs: WaterLog[];
  setLogs: (l: WaterLog[]) => void;
  onDrinkLogged: (amount: number) => void;
}

export default function PhoneEmulator({
  profile,
  setProfile,
  preferences,
  setPreferences,
  logs,
  setLogs,
  onDrinkLogged
}: PhoneEmulatorProps) {
  // Emulator environment states
  const [phoneScreen, setPhoneScreen] = useState<'app' | 'launcher' | 'lockscreen'>('app');
  const [activeTab, setActiveTab] = useState<'home' | 'log' | 'settings'>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customInputMl, setCustomInputMl] = useState<string>('');
  const [undoLog, setUndoLog] = useState<WaterLog | null>(null);
  
  // Settings edit mode states
  const [tempWeight, setTempWeight] = useState(profile.weight.toString());
  const [tempHeight, setTempHeight] = useState(profile.height.toString());
  const [tempConditions, setTempConditions] = useState<string[]>(profile.conditions);
  const [tempActivity, setTempActivity] = useState(profile.activityLevel);

  // Sync temp settings edit values when profile changes
  useEffect(() => {
    setTempWeight(profile.weight.toString());
    setTempHeight(profile.height.toString());
    setTempConditions(profile.conditions);
    setTempActivity(profile.activityLevel);
  }, [profile]);

  // System Toast helper
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick logging helpers
  const handleLogAmount = (amountMl: number) => {
    onDrinkLogged(amountMl);
    const converted = formatAmount(amountMl);
    triggerToast(`Logged ${converted}! 💧`);
  };

  const handleCustomLog = () => {
    const val = parseInt(customInputMl, 10);
    if (isNaN(val) || val <= 0 || val > 2000) {
      triggerToast("Please enter a valid amount (1 - 2000 ml)");
      return;
    }
    handleLogAmount(val);
    setCustomInputMl('');
  };

  // Delete log with native undo popup
  const handleDeleteLog = (logItem: WaterLog) => {
    setUndoLog(logItem);
    setLogs(logs.filter(l => l.id !== logItem.id));
    triggerToast(`Removed entry of ${formatAmount(logItem.amountMl)}`);
  };

  const handleUndoDelete = () => {
    if (undoLog) {
      setLogs([undoLog, ...logs]);
      triggerToast(`Restored logging element!`);
      setUndoLog(null);
    }
  };

  const handleResetLogs = () => {
    setLogs([]);
    triggerToast("Today's water intake has been reset.");
  };

  // Convert and format amounts appropriately matching Preferences
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

  // Motivational Messages (One UI Pattern)
  const getMotivationalMessage = () => {
    if (progressPercent === 0) return "Let's get started! 💧";
    if (progressPercent < 25) return "Good start! Drinking water is self-care.";
    if (progressPercent < 50) return "Keep going, your body is loving this! 👍";
    if (progressPercent < 75) return "Halfway there, you're doing great! ✨";
    if (progressPercent < 100) return "Almost at your goal! Just a bit more.";
    return "Goal reached! 🎉 Stay consistent.";
  };

  // Dynamic Goal Recalculator Formula
  const calculateGoalMl = (
    w: number, wUnit: 'kg' | 'lbs',
    h: number, hUnit: 'cm' | 'in',
    conds: string[], act: string
  ): number => {
    // 35ml per kg body mass standard weight baseline calculator
    const weightInKg = wUnit === 'lbs' ? (w * 0.453592) : w;
    let baseline = weightInKg * 35;

    // Sports offsets
    switch (act) {
      case 'light': baseline += 200; break;
      case 'moderate': baseline += 500; break;
      case 'active': baseline += 850; break;
    }

    // Clinical factors adjustments
    conds.forEach(c => {
      if (c === 'kidney') baseline = baseline * 0.70; // Restrict fluids
      if (c === 'heart') baseline = baseline * 0.75; // Cardiopulmonary restriction
      if (c === 'diabetes') baseline += 400; // Raised clear threshold
      if (c === 'pregnant') baseline += 300; // Gestation clearance offset
      if (c === 'breastfeeding') baseline += 750; // Lactation clearing allowance
      if (c === 'hot_climate') baseline += 500; // Transpiration buffer
    });

    // Clinically bounded safety restriction thresholds (Material 3 One UI specifications)
    return Math.floor(Math.max(1500, Math.min(4000, baseline)));
  };

  const handleFinishOnboarding = (agreed: boolean, w: string, h: string, act: string, conds: string[]) => {
    const wNum = parseFloat(w);
    const hNum = parseFloat(h);
    if (isNaN(wNum) || wNum <= 0 || isNaN(hNum) || hNum <= 0) {
      triggerToast("Please input real physical measurements statistics.");
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

    triggerToast(`Profile configured! Daily limit: ${calculatedGoal}ml.`);
  };

  // Mock Export CSV format
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
    triggerToast("CSV downloaded successfully!");
  };

  // Render weekly totals inside standard customized inline SVG elements (Canvas style representation)
  const drawWeeklyHistoryGraph = () => {
    // Generate simulated week factors relative to dynamic progress
    const midGoal = activeGoal;
    const weekdayValues = [
      { day: "Mon", amount: Math.floor(midGoal * 0.4) },
      { day: "Tue", amount: Math.floor(midGoal * 0.8) },
      { day: "Wed", amount: todayTotal }, // Today is Wednesday in simulation
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
          {/* Target limit dash line */}
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
            // Draw bar scaled down inside SVG view portal space with bottom baseline offset
            const customBarHeight = Math.max(4, fraction * chartHeight * 0.8);
            const x = idx * (barWidth + spacing) + 12;
            const y = chartHeight - customBarHeight;
            const isCompleted = item.amount >= midGoal;

            return (
              <g key={item.day} className="cursor-pointer group">
                {/* Floating amount on hover */}
                <text 
                  x={x + barWidth/2} 
                  y={y - 6} 
                  textAnchor="middle" 
                  className="fill-zinc-400 group-hover:fill-zinc-800 text-[8px] font-semibold transition-colors duration-200"
                >
                  {formatAmount(item.amount)}
                </text>
                
                {/* Rounded Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={customBarHeight}
                  rx="6"
                  ry="6"
                  fill={isCompleted ? "#4CAF50" : "#2196F3"}
                  className="transition-all duration-500 ease-out fill-cyan-400 saturate-125"
                />

                {/* Day label */}
                <text 
                  x={x + barWidth/2} 
                  y={chartHeight + 14} 
                  textAnchor="middle" 
                  className="fill-zinc-500 text-[10px] font-medium"
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
    <div className="flex flex-col items-center w-full max-w-[360px]">
      
      {/* Emulator Hardware Shell Framework */}
      <div className="relative w-full aspect-[9/19] rounded-[48px] bg-[#1A1A1A] p-[10px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] ring-4 ring-zinc-800/60 overflow-hidden flex flex-col justify-between">
        
        {/* Device Camera Punch hole */}
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[16px] h-[16px] bg-black rounded-full z-50 ring-1 ring-zinc-800 flex items-center justify-center">
          <div className="w-[4px] h-[4px] bg-emerald-950 rounded-full"></div>
        </div>

        {/* Dynamic iOS/Android OS Status Bar Container */}
        <div id="status-bar" className="flex justify-between items-center px-6 pt-2 pb-1 text-white text-[10px] font-bold tracking-wide z-40 select-none bg-zinc-950/40 backdrop-blur-md rounded-t-[38px]">
          <span>09:41 AM</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            {/* Status alerts */}
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>LTE</span>
            <span>98%</span>
          </div>
        </div>

        {/* Primary Screen Display Frame */}
        <div className="relative w-full flex-1 bg-zinc-50 rounded-[34px] overflow-hidden flex flex-col justify-between select-none">
          
          <AnimatePresence mode="wait">
            {!profile.isCompletedOnboarding ? (
              // STEPPED ONBOARDING FLOW SIMULATOR
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white p-5 flex flex-col justify-between overflow-y-auto no-scrollbar"
              >
                <div className="flex flex-col gap-3">
                  <div className="pt-6">
                    <span className="text-sm font-semibold tracking-wide uppercase text-[#0381fe]">Clinical Hydration</span>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mt-1">HydroMind Setup</h2>
                  </div>

                  <p className="text-[12px] text-zinc-500 font-medium">Configure biometric variables and health restrictions dynamically under Samsung One UI guidelines.</p>

                  <div className="border-t border-zinc-100 my-1 pt-3">
                    <div className="flex flex-col gap-3">
                      {/* Weight biometrics */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Weight Profile</label>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            id="weight-input"
                            value={tempWeight}
                            onChange={(e) => setTempWeight(e.target.value)}
                            className="bg-zinc-100 outline-none border border-zinc-200 focus:border-[#0381fe] rounded-xl px-3 py-1.5 text-zinc-900 text-xs font-semibold w-full"
                            placeholder="70"
                          />
                          <div className="flex bg-zinc-100 rounded-xl p-0.5 border border-zinc-200">
                            {['kg', 'lbs'].map((unit) => (
                              <button
                                key={unit}
                                id={`btn-weight-${unit}`}
                                onClick={() => setProfile({...profile, weightUnit: unit as any})}
                                className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded-lg transition-all duration-200 ${profile.weightUnit === unit ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-600'}`}
                              >
                                {unit}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Height biometrics */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Height Profile</label>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            id="height-input"
                            value={tempHeight}
                            onChange={(e) => setTempHeight(e.target.value)}
                            className="bg-zinc-100 outline-none border border-zinc-200 focus:border-[#0381fe] rounded-xl px-3 py-1.5 text-zinc-900 text-xs font-semibold w-full"
                            placeholder="175"
                          />
                          <div className="flex bg-zinc-100 rounded-xl p-0.5 border border-zinc-200">
                            {['cm', 'in'].map((unit) => (
                              <button
                                key={unit}
                                id={`btn-height-${unit}`}
                                onClick={() => setProfile({...profile, heightUnit: unit as any})}
                                className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded-lg transition-all duration-200 ${profile.heightUnit === unit ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-600'}`}
                              >
                                {unit}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Activity Selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Activity Index</label>
                        <select 
                          id="activity-select"
                          value={tempActivity}
                          onChange={(e) => setTempActivity(e.target.value)}
                          className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800"
                        >
                          <option value="sedentary">Sedentary (No workouts / Office desk)</option>
                          <option value="light">Lightly Active (1-2 walks/week)</option>
                          <option value="moderate">Moderately Active (Daily exercising/cardio)</option>
                          <option value="active">Very Active (Heavy sports/sweat labor)</option>
                        </select>
                      </div>

                      {/* Multiselect clinical conditions */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Clinical Factors Check</label>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {[
                            { id: 'kidney', val: 'Renal (reduce)' },
                            { id: 'heart', val: 'Heart congestion (reduce)' },
                            { id: 'diabetes', val: 'Diabetes (add)' },
                            { id: 'pregnant', val: 'Pregnancy (+300)' },
                            { id: 'breastfeeding', val: 'Lactation (+750)' },
                            { id: 'hot_climate', val: 'High Sweat (+500)' }
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
                                className={`text-[10px] font-semibold text-left p-1.5 rounded-lg border flex items-center justify-between transition-all ${active ? 'bg-[#e3f2fd] border-[#0381fe] text-[#0381fe]' : 'bg-zinc-50 border-zinc-100 text-zinc-600'}`}
                              >
                                <span>{item.val}</span>
                                {active && <Check className="w-3 h-3 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Required Clinical Disclaimer Container */}
                      <div className="bg-[#0381fe]/8 border-l-4 border-[#0381fe] rounded-[20px] p-3.5 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[#004D99]">
                          <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce text-[#0381fe]" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Required Safety Clause</span>
                        </div>
                        {/* Scroll container required */}
                        <div className="h-16 overflow-y-auto pr-1 text-[9px] leading-relaxed text-[#004D99] font-medium select-text scrollbar-thin">
                          This hydration calculations provided are not statements of diagnosis. Complex conditions require professional medical oversight. Fluid limitations must follow clinical guidance.
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            id="disclaimer-checkbox"
                            checked={profile.agreedDisclaimer}
                            onChange={(e) => setProfile({...profile, agreedDisclaimer: e.target.checked})}
                            className="accent-[#0381fe] shrink-0 w-3 h-3 rounded"
                          />
                          <span className="text-[9px] font-bold text-[#004D99]">I accept clinical safeguards</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-onboarding-complete"
                  disabled={!profile.agreedDisclaimer}
                  onClick={() => handleFinishOnboarding(profile.agreedDisclaimer, tempWeight, tempHeight, tempActivity, tempConditions)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md mt-2 ${profile.agreedDisclaimer ? 'bg-[#0381fe] hover:bg-[#0270dd] text-white' : 'bg-zinc-200 text-zinc-450 cursor-not-allowed'}`}
                >
                  Calculate My Formula Goal
                </button>
              </motion.div>
            ) : (
              // ACTIVE SMARTPHONE ENVIRONMENTS
              <div className="absolute inset-0 flex flex-col justify-between">
                
                {/* Active Switcher views layout */}
                <div className="flex-1 overflow-y-auto no-scrollbar bg-zinc-50 flex flex-col">
                  
                  {/* PHONE COMPONENT INNER VIEWPORT */}
                  {phoneScreen === 'app' && (
                    <motion.div 
                      key="app-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col justify-between p-4"
                    >
                      {activeTab === 'home' && (
                        <div className="flex flex-col justify-between flex-1">
                          
                          {/* Samsung One UI reached spaced header */}
                          <div className="flex justify-between items-center pt-3 pb-1">
                            <div>
                              <p className="text-[10px] font-bold text-[#0381fe] tracking-wider uppercase">HydroMind</p>
                              <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none">Home</h3>
                            </div>
                            <div className="flex items-center bg-amber-50 border border-amber-200/60 rounded-full px-2.5 py-1 text-amber-700 gap-1 shadow-sm">
                              <span className="text-sm">🔥</span>
                              <span className="text-[10px] font-black">3 Days</span>
                            </div>
                          </div>

                          {/* Dynamic Progress indicator ring */}
                          <div className="flex flex-col items-center justify-center my-4 relative">
                            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                              {/* Background arc */}
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="#f1f5f9" 
                                strokeWidth="8"
                              />
                              {/* Active foreground fluid sweep */}
                              <motion.circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="#03a9f4" 
                                strokeWidth="9"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                                strokeLinecap="round"
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </svg>

                            {/* Centered data telemetry content */}
                            <div className="absolute flex flex-col items-center justify-center">
                              <motion.div 
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                              >
                                <Droplet className="w-7 h-7 text-[#03a9f4] fill-[#03a9f4]/40" />
                              </motion.div>
                              <span className="text-sm font-extrabold text-zinc-800 leading-none mt-1">
                                {formatAmount(todayTotal)}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                of {formatAmount(activeGoal)}
                              </span>
                              <span className="text-[11px] font-black text-[#0381fe] mt-0.5">{progressPercent}%</span>
                            </div>
                          </div>

                          {/* Motivational notice */}
                          <div id="motivation-box" className="bg-[#e0f2fe]/60 border border-[#b3e5fc]/30 rounded-2xl p-3 text-center mb-3 shadow-sm">
                            <span className="text-[11px] font-bold text-[#0288d1]">
                              {getMotivationalMessage()}
                            </span>
                          </div>

                          {/* Fast Add presets container */}
                          <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quick Adds</p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[150, 250, 350, 500].map(amt => (
                                <button
                                  key={amt}
                                  id={`btn-add-${amt}`}
                                  onClick={() => handleLogAmount(amt)}
                                  className="bg-white hover:bg-sky-50 border border-zinc-200 hover:border-[#0381fe] active:scale-95 text-[#0381fe] font-extrabold text-[11px] py-2 rounded-xl transition-all shadow-sm"
                                >
                                  +{preferences.unitPreference === 'oz' ? `${Math.round(amt * 0.033814)}oz` : `${amt}`}
                                </button>
                              ))}
                            </div>
                            
                            {/* Manual precision custom milliliter input override */}
                            <div className="flex gap-1.5 mt-1 border-t border-zinc-100 pt-2.5">
                              <input 
                                type="number"
                                id="custom-log-input"
                                value={customInputMl}
                                onChange={(e) => setCustomInputMl(e.target.value)}
                                className="bg-white border border-zinc-200 focus:border-[#0381fe] outline-none text-[11px] font-semibold text-zinc-800 rounded-xl px-2.5 py-1.5 fill-cyan-50 flex-1 min-w-0"
                                placeholder="Custom (ml)"
                              />
                              <button
                                id="btn-custom-add"
                                onClick={handleCustomLog}
                                className="bg-zinc-800 hover:bg-zinc-900 active:scale-95 font-bold text-white text-[10px] uppercase px-3 rounded-xl shadow-md flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STATS LOG TAB INDEX */}
                      {activeTab === 'log' && (
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex flex-col">
                            
                            {/* Space headers */}
                            <div className="pt-3 pb-1">
                              <p className="text-[10px] font-bold text-[#0381fe] tracking-wider uppercase font-sans">Water logs</p>
                              <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none mt-0.5">My History</h3>
                            </div>

                            {/* Custom drawn weekly visualization */}
                            <div className="bg-white rounded-2xl p-3 border border-zinc-100 shadow-sm mt-2 flex flex-col items-center">
                              <h4 className="text-[10px] font-bold text-zinc-400 self-start uppercase tracking-wider mb-2">Past 7 days volume</h4>
                              {drawWeeklyHistoryGraph()}
                            </div>

                            {/* Today logs database scroll view */}
                            <div className="flex flex-col mt-4">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Entries today</span>
                                {logs.length > 0 && (
                                  <button 
                                    id="btn-reset-logs"
                                    onClick={handleResetLogs}
                                    className="text-[9px] font-extrabold text-red-600 hover:text-red-700 uppercase"
                                  >
                                    Reset Today
                                  </button>
                                )}
                              </div>

                              <div className="max-h-24 overflow-y-auto no-scrollbar flex flex-col gap-1.5">
                                {logs.length === 0 ? (
                                  <div className="text-center py-5 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                                    <p className="text-[10px] text-zinc-400 font-bold">No registered tracking elements.</p>
                                  </div>
                                ) : (
                                  logs.map(log => (
                                    <div 
                                      key={log.id} 
                                      className="flex justify-between items-center bg-white px-3 py-1.5 rounded-xl border border-zinc-100 shadow-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#03a9f4] rounded-full"></div>
                                        <span className="text-xs font-bold text-zinc-800">{formatAmount(log.amountMl)}</span>
                                        <span className="text-[9px] text-zinc-400 font-semibold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <button 
                                        id={`btn-delete-log-${log.id}`}
                                        onClick={() => handleDeleteLog(log)}
                                        className="text-zinc-300 hover:text-red-500 active:scale-90 transition-all p-0.5"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick summary status banner */}
                          <div className="bg-zinc-800 text-white rounded-2xl p-3 shadow-md flex justify-between items-center mt-3">
                            <div>
                              <p className="text-[8px] font-extrabold uppercase text-cyan-400 tracking-widest leading-none">Total Cleared</p>
                              <p className="text-sm font-black leading-none mt-1">{formatAmount(todayTotal)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-extrabold uppercase text-zinc-400 tracking-widest leading-none">Remaining</p>
                              <p className="text-sm font-black leading-none mt-1 text-zinc-200">
                                {formatAmount(Math.max(0, activeGoal - todayTotal))}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PROFILE CONFIG / SETTINGS TAB */}
                      {activeTab === 'settings' && (
                        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 py-1">
                          
                          {/* Space header */}
                          <div className="pt-2">
                            <p className="text-[10px] font-bold text-[#0381fe] tracking-wider uppercase font-sans">Configs</p>
                            <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none mt-0.5">Settings</h3>
                          </div>

                          {/* Profile editor */}
                          <div className="bg-white rounded-2xl p-3 border border-zinc-100 shadow-sm flex flex-col gap-2">
                            <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-[#0381fe]" />
                              <span>Hydration biometrics</span>
                            </h4>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase">Weight</label>
                                <input 
                                  type="number"
                                  id="settings-weight"
                                  value={tempWeight}
                                  onChange={(e) => setTempWeight(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase">Height</label>
                                <input 
                                  type="number"
                                  id="settings-height"
                                  value={tempHeight}
                                  onChange={(e) => setTempHeight(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold"
                                />
                              </div>
                            </div>

                            <button
                              id="btn-settings-recalc"
                              onClick={() => {
                                const wNum = parseFloat(tempWeight);
                                const hNum = parseFloat(tempHeight);
                                if (isNaN(wNum) || isNaN(hNum)) {
                                  triggerToast("Please input valid metrics.");
                                  return;
                                }
                                const dynamicGoal = calculateGoalMl(wNum, profile.weightUnit, hNum, profile.heightUnit, profile.conditions, profile.activityLevel);
                                setProfile({
                                  ...profile,
                                  weight: wNum,
                                  height: hNum,
                                  calculatedGoalMl: dynamicGoal
                                });
                                triggerToast(`Goal recalculated: ${dynamicGoal}ml.`);
                              }}
                              className="bg-[#0381fe] text-white hover:bg-[#0270dd] py-1.5 rounded-xl text-[10px] font-bold mt-1.5 transition-all shadow-sm"
                            >
                              Update & Recalculate
                            </button>
                          </div>

                          {/* Manual Goals override box */}
                          <div className="bg-white rounded-2xl p-3 border border-zinc-100 shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Manual limits override</h4>
                              <input 
                                type="checkbox"
                                id="manual-goal-override-toggle"
                                checked={preferences.manualGoalOverride}
                                onChange={(e) => setPreferences({...preferences, manualGoalOverride: e.target.checked})}
                                className="accent-[#0381fe] w-3.5 h-3.5 rounded"
                              />
                            </div>

                            {preferences.manualGoalOverride && (
                              <div className="flex gap-2 items-center mt-1">
                                <input 
                                  type="number"
                                  id="manual-goal-input"
                                  value={preferences.overriddenGoalMl}
                                  onChange={(e) => setPreferences({...preferences, overriddenGoalMl: Math.max(1000, parseInt(e.target.value, 10))})}
                                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold w-full"
                                  placeholder="2000"
                                />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">ML</span>
                              </div>
                            )}
                          </div>

                          {/* Measurement Display Units configurations */}
                          <div className="bg-white rounded-2xl p-3 border border-zinc-100 shadow-sm flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Metrics Unit preference</span>
                            <div className="flex bg-zinc-50 border border-zinc-200 rounded-xl p-0.5">
                              {(['ml', 'oz'] as DrinkUnit[]).map(unit => (
                                <button
                                  key={unit}
                                  id={`btn-unit-${unit}`}
                                  onClick={() => setPreferences({...preferences, unitPreference: unit})}
                                  className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg transition-all ${preferences.unitPreference === unit ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-600'}`}
                                >
                                  {unit}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Export CSV Data element */}
                          <button
                            id="btn-export-csv"
                            onClick={handleExportCSV}
                            className="bg-zinc-800 hover:bg-zinc-950 text-white rounded-2xl py-2 px-4 shadow-md flex items-center justify-center gap-2 text-xs font-bold transition-all"
                          >
                            <FileDown className="w-4 h-4" />
                            <span>Export Data Backup (CSV)</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* SAMSUNG ONE UI HOME LAUNCHER VIEWPORT */}
                  {phoneScreen === 'launcher' && (
                    <motion.div 
                      key="launcher"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 relative bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-4 flex flex-col justify-between"
                    >
                      {/* Interactive Samsung 4x1 Horizontal Widget Simulator */}
                      <div className="flex flex-col gap-3 mt-4">
                        <div id="widget-container" className="bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-white shadow-lg flex flex-col gap-2 relative group overflow-hidden">
                          {/* Animated widget ripple flash effect */}
                          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-sky-400 animate-pulse"></div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400/30">
                                <Droplet className="w-3 h-3 text-sky-400 fill-sky-400/40" />
                              </div>
                              <span className="text-[10px] font-extrabold text-white/90 tracking-wide uppercase">HydroTracker</span>
                            </div>
                            <span className="text-[9px] font-semibold text-white/50">{progressPercent}%</span>
                          </div>

                          {/* Horizontal progress bar */}
                          <div className="flex flex-col gap-1">
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <motion.div 
                                className="bg-[#2196F3] h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-bold text-white/70">
                              <span>{formatAmount(todayTotal)} / {formatAmount(activeGoal)}</span>
                              <span>Target</span>
                            </div>
                          </div>

                          {/* Quick Add direct lock widget action */}
                          <button
                            id="btn-widget-quick-drank"
                            onClick={() => {
                              onDrinkLogged(250);
                              triggerToast("Added 250ml instantly via BroadcastReceiver! 💧");
                            }}
                            className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 rounded-xl py-1 px-3 text-[10px] font-extrabold transition-all shadow-md mt-1 self-end flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>✓ Drank 250 ml</span>
                          </button>
                        </div>
                        
                        {/* Launcher widget resize hint notice */}
                        <div className="text-center">
                          <p className="text-[8px] font-bold text-white/75 bg-black/25 px-2.5 py-1 rounded-full inline-block backdrop-blur-sm shadow-sm leading-none">
                            Samsung Home Screen Smart Widget Preview
                          </p>
                        </div>
                      </div>

                      {/* Stock Android app launcher grid placeholder */}
                      <div className="grid grid-cols-4 gap-4 mt-auto mb-4">
                        {[
                          { emoji: "📞", val: "Phone" },
                          { emoji: "💬", val: "Chat" },
                          { emoji: "📷", val: "Camera" },
                          { emoji: "⚙️", val: "Settings" }
                        ].map((app, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md shadow-md flex items-center justify-center text-lg hover:scale-105 transition-all cursor-pointer">
                              {app.emoji}
                            </div>
                            <span className="text-[8px] font-semibold text-white tracking-wide">{app.val}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* GALAXY LOCK SCREEN NOTIFICATION POPUPS */}
                  {phoneScreen === 'lockscreen' && (
                    <motion.div 
                      key="lockscreen"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 bg-zinc-900 flex flex-col justify-between p-4 bg-cover bg-center"
                      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=300&auto=format&fit=crop')` }}
                    >
                      {/* Top Clock */}
                      <div className="text-center pt-8 text-white select-none">
                        <h2 className="text-3xl font-light tracking-widest leading-none">08:30</h2>
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1">Saturday, June 13</p>
                      </div>

                      {/* Floating Smart Alert Notification Card */}
                      <div className="my-auto flex flex-col gap-2">
                        <div id="lockscreen-notification" className="bg-black/75 border border-white/10 rounded-2xl p-3 backdrop-blur-md text-white shadow-xl flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <div className="flex items-center gap-1">
                              <Droplet className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                              <span className="text-[10px] font-black text-sky-400 tracking-wider uppercase">HydroMind</span>
                            </div>
                            <span className="text-[8px] text-zinc-400 font-semibold">Just now</span>
                          </div>

                          <div className="flex flex-col">
                            <p className="text-xs font-bold text-white/95">Time to hydrate! 💧</p>
                            <p className="text-[10px] text-zinc-300 font-medium leading-normal mt-0.5">
                              You've cleared {formatAmount(todayTotal)} of your {formatAmount(activeGoal)} daily target.
                            </p>
                          </div>

                          {/* Quick click notification trigger buttons */}
                          <div className="grid grid-cols-2 gap-1.5 mt-1 border-t border-white/5 pt-2">
                            <button
                              id="btn-notif-action-drank"
                              onClick={() => {
                                onDrinkLogged(250);
                                triggerToast("Added 250ml instantly via lockscreen push receiver! 💧");
                              }}
                              className="bg-[#0381fe] hover:bg-[#0270dd] active:scale-95 text-white rounded-xl py-1.5 text-[10px] font-bold shadow-md text-center"
                            >
                              Drank 250 ml ✔
                            </button>
                            <button
                              id="btn-notif-action-remind"
                              onClick={() => {
                                triggerToast("Snoozed Alert: Scheduled notification retry in 30 mins.");
                              }}
                              className="bg-white/10 hover:bg-white/15 active:scale-95 text-zinc-300 rounded-xl py-1.5 text-[10px] font-bold shadow"
                            >
                              Remind me in 30 min
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lockscreen footer swipe instruction text */}
                      <div className="text-center text-zinc-400 text-[9px] font-bold uppercase tracking-wider select-none mb-2">
                        Swipe up to unlock widget companion
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* BOTTOM NAVIGATION LAYOUT IF IN HYDRO_APP VIEW */}
                {phoneScreen === 'app' && (
                  <div id="app-nav-bar" className="flex justify-around items-center py-2 bg-white border-t border-zinc-100/80 z-30 select-none">
                    <button
                      id="nav-tab-home"
                      onClick={() => setActiveTab('home')}
                      className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 ${activeTab === 'home' ? 'text-[#0381fe] font-black' : 'text-zinc-400 font-medium'}`}
                    >
                      <Home className="w-5 h-5" />
                      <span className="text-[9px] uppercase tracking-wider">Home</span>
                    </button>
                    <button
                      id="nav-tab-log"
                      onClick={() => setActiveTab('log')}
                      className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 ${activeTab === 'log' ? 'text-[#0381fe] font-black' : 'text-zinc-400 font-medium'}`}
                    >
                      <ClipboardList className="w-5 h-5" />
                      <span className="text-[9px] uppercase tracking-wider font-sans">Logs</span>
                    </button>
                    <button
                      id="nav-tab-settings"
                      onClick={() => setActiveTab('settings')}
                      className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 ${activeTab === 'settings' ? 'text-[#0381fe] font-black' : 'text-zinc-400 font-medium'}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-[9px] uppercase tracking-wider font-sans">Settings</span>
                    </button>
                  </div>
                )}

                {/* SYSTEM BACK/HOME NAVIGATION PILL GRID (SIMULATORS COMPANIONS) */}
                <div className="flex bg-zinc-950 justify-around py-1.5 items-center text-zinc-600 gap-1 rounded-b-[34px] tracking-widest z-30 text-xs font-extrabold select-none">
                  <div className="w-12 h-0.5 bg-zinc-800 rounded-full cursor-pointer hover:bg-zinc-600"></div>
                </div>

              </div>
            )}
          </AnimatePresence>
          
          {/* Real-time Toast Alerts overlays inside UI screen */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                id="system-toast"
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: -45, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="absolute inset-x-8 bottom-0 bg-zinc-900/90 text-white text-[10px] font-semibold py-2 px-3 rounded-xl shadow-lg border border-white/5 backdrop-blur-md text-center z-50 select-none tracking-wide"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* QUICK EMULATOR WORKSPACE MANAGER BUTTONS */}
      <div className="flex bg-zinc-100 p-2 border border-zinc-200/80 rounded-2xl gap-1.5 w-full mt-4 justify-between shadow-sm select-none">
        
        <button
          key="app-flow"
          id="btn-emulator-app"
          onClick={() => setPhoneScreen('app')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${phoneScreen === 'app' ? 'bg-[#0381fe] text-white font-extrabold shadow-sm' : 'text-zinc-500 hover:bg-zinc-200/50 font-bold'}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="text-[8px] uppercase tracking-wider">In-App</span>
        </button>

        <button
          key="launcher-flow"
          id="btn-emulator-launcher"
          onClick={() => setPhoneScreen('launcher')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${phoneScreen === 'launcher' ? 'bg-[#0381fe] text-white font-extrabold shadow-sm' : 'text-zinc-500 hover:bg-zinc-200/50 font-bold'}`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="text-[8px] uppercase tracking-wider">Widget</span>
        </button>

        <button
          key="lockscreen-flow"
          id="btn-emulator-lockscreen"
          onClick={() => setPhoneScreen('lockscreen')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${phoneScreen === 'lockscreen' ? 'bg-[#0381fe] text-white font-extrabold shadow-sm' : 'text-zinc-500 hover:bg-zinc-200/50 font-bold'}`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="text-[8px] uppercase tracking-wider">Notif</span>
        </button>
        
      </div>
      
    </div>
  );
}
