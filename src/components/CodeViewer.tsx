import { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  FolderOpen, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  BookOpen, 
  Download,
  Flame,
  MousePointer
} from 'lucide-react';
import { androidCodebase, CodeFile } from '../androidCode';
import { androidCodebaseExtra } from '../androidCodeExtra';

export default function CodeViewer() {
  const allFiles: CodeFile[] = [...androidCodebase, ...androidCodebaseExtra];

  const [selectedFile, setSelectedFile] = useState<CodeFile>(allFiles[3]); // Default to MainActivity.kt
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explorer' | 'instructions'>('explorer');

  // Directory visual group mapper
  const categorizePath = (path: string): string => {
    if (path.startsWith('app/src/main/java/com/hydromind/app/bridge/') || path.endsWith('MainActivity.kt')) {
      return '🔌 JS Bridge & Activity';
    }
    if (path.startsWith('app/src/main/java/com/hydromind/app/notification/') || path.startsWith('app/src/main/java/com/hydromind/app/widget/')) {
      return '📲 Widgets & WorkManager';
    }
    if (path.startsWith('app/src/main/res/')) {
      return '🎨 XML Layouts & Res';
    }
    return '⚙️ Configuration & Manifests';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = allFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group files by One UI categories
  const groupedFiles: { [key: string]: CodeFile[] } = {};
  filteredFiles.forEach(file => {
    const category = categorizePath(file.path);
    if (!groupedFiles[category]) {
      groupedFiles[category] = [];
    }
    groupedFiles[category].push(file);
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col h-full shadow-sm relative">
      
      {/* Visual background atmospheric flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0381fe]/5 rounded-full blur-3xl select-none pointer-events-none"></div>

      {/* Code panel header console tabs */}
      <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex justify-between items-center z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <span className="text-[10px] font-black tracking-widest text-[#8E8E93] uppercase font-mono ml-2">DEVELOPER TERMINAL</span>
        </div>

        <div className="flex bg-zinc-100 rounded-xl p-0.5 border border-zinc-200">
          <button
            id="tab-explorer"
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'explorer' ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Project Explorer</span>
          </button>
          <button
            id="tab-instructions"
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'instructions' ? 'bg-[#0381fe] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Setup Instructions</span>
          </button>
        </div>
      </div>

      {activeTab === 'explorer' ? (
        // PROJECT STRUCTURE CODE VIEWING TERMINAL
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200 h-full overflow-hidden">
          
          {/* File search, explorer sidebar sidebar */}
          <div className="w-full md:w-72 bg-zinc-50/50 flex flex-col h-full shrink-0">
            {/* Search box element */}
            <div className="p-3 border-b border-zinc-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  id="search-files-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-zinc-200 focus:border-[#0381fe] outline-none text-[11px] text-zinc-800 font-bold placeholder-zinc-400 rounded-xl pl-8 pr-3 py-1.5"
                  placeholder="Search project files..."
                />
              </div>
            </div>

            {/* Tree listing folders */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 max-h-[180px] md:max-h-full scrollbar-thin">
              {Object.keys(groupedFiles).map(category => (
                <div key={category} className="flex flex-col gap-1 select-none">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                    <span>{category}</span>
                  </div>

                  <div className="flex flex-col gap-0.5 mt-1">
                    {groupedFiles[category].map(file => {
                      const isSelected = file.path === selectedFile.path;
                      return (
                        <button
                          key={file.path}
                          id={`file-tree-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          onClick={() => setSelectedFile(file)}
                          className={`flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all group ${isSelected ? 'bg-sky-50 text-[#0381fe] font-bold shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'}`}
                        >
                          <div className="flex items-center gap-2 truncate pr-1">
                            {isSelected ? <FolderOpen className="w-3.5 h-3.5 shrink-0 text-[#0381fe]" /> : <Folder className="w-3.5 h-3.5 shrink-0 text-zinc-400" />}
                            <span className="truncate">{file.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {filteredFiles.length === 0 && (
                <div className="text-center py-6 text-zinc-400 text-[11px] font-bold">
                  No files matched keyword.
                </div>
              )}
            </div>
          </div>

          {/* Active File syntax viewer console */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50/25">
            {/* File info banner */}
            <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex justify-between items-center flex-wrap gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold font-mono text-zinc-400 truncate">{selectedFile.path}</span>
                <span className="text-xs font-black text-zinc-800 tracking-tight">{selectedFile.name}</span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-copy-code"
                  onClick={handleCopyCode}
                  className="bg-white border border-zinc-200 hover:bg-zinc-100 active:scale-95 text-zinc-700 rounded-xl px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Custom file description note */}
            <div className="bg-[#EEF1F5] px-4 py-2 border-b border-zinc-200 flex items-center gap-2 select-none">
              <span className="text-[9px] font-black bg-white text-zinc-500 border border-zinc-200 px-1.5 py-0.5 rounded tracking-widest font-mono uppercase">Info</span>
              <p className="text-[10px] font-medium text-zinc-500 italic font-mono">{selectedFile.description}</p>
            </div>

            {/* Syntax Editor box container */}
            <div className="flex-1 overflow-auto p-4 bg-zinc-50/40 relative font-mono scrollbar-thin border-t border-zinc-100">
              <pre className="text-[11px] leading-relaxed text-zinc-700 font-semibold select-text h-full overflow-x-auto whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </div>

        </div>
      ) : (
        // EXHAUSTIVE DIRECTIVES ON HOW TO DEPLOY TO MOBILE
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 md:gap-8 scrollbar-thin bg-zinc-950 text-white rounded-b-3xl">
          
          <div className="flex flex-col gap-1.5 border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0381fe]" />
              <span>Android WebView Deployment Blueprint</span>
            </h3>
            <p className="text-xs text-zinc-400">How to convert the existing Vite web client into a native Android app wrapper built on Android Studio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl flex flex-col gap-2 shadow-inner">
              <span className="text-xl font-bold bg-[#0381fe] text-white w-7 h-7 rounded-full flex items-center justify-center font-mono shadow-md">1</span>
              <h4 className="text-xs font-black text-zinc-100 uppercase mt-1">Bundle Front-End</h4>
              <p className="text-[11px] text-zinc-400 leading-normal font-medium leading-relaxed">
                Run <code className="bg-zinc-950/80 px-1 py-0.5 rounded font-mono text-cyan-400">npm run build</code> in your web workspace folder. This produces optimized index.html, JS, and CSS files in the <code className="bg-zinc-950/80 px-1 py-0.5 rounded font-mono text-cyan-400">dist/</code> package.
              </p>
            </div>
            
            <div className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl flex flex-col gap-2 shadow-inner">
              <span className="text-xl font-bold bg-[#0381fe] text-white w-7 h-7 rounded-full flex items-center justify-center font-mono shadow-md">2</span>
              <h4 className="text-xs font-black text-zinc-100 uppercase mt-1">Copy to Assets</h4>
              <p className="text-[11px] text-zinc-400 leading-normal font-medium leading-relaxed">
                In Android Studio, create a folder named <code className="bg-zinc-950/80 px-1 py-0.5 rounded font-mono text-cyan-400">app/src/main/assets/</code> and copy all build artifacts directly there (so <code className="text-white font-mono">index.html</code> is at root).
              </p>
            </div>

            <div className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl flex flex-col gap-2 shadow-inner">
              <span className="text-xl font-bold bg-[#0381fe] text-white w-7 h-7 rounded-full flex items-center justify-center font-mono shadow-md">3</span>
              <h4 className="text-xs font-black text-zinc-100 uppercase mt-1">Binds JS Bridge</h4>
              <p className="text-[11px] text-zinc-400 leading-normal font-medium leading-relaxed">
                The web application calls <code className="bg-zinc-950/80 px-1 py-0.5 rounded font-mono text-emerald-400">window.AndroidApp.logWater(ml)</code> or <code className="bg-zinc-950/80 px-1 py-0.5 rounded font-mono text-emerald-400">updateProgress()</code> to sync with notifications, widgets, and background workers!
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Step-by-step Setup Guide:</span>
            </h4>
            
            <ol className="list-decimal pl-5 text-[11px] text-zinc-300 font-semibold flex flex-col gap-2.5">
              <li>
                <span className="text-white font-bold font-mono">Create New Project:</span> Open Android Studio, selection "New Project" &gt; "Empty Views Activity". Pick Kotlin and set Target SDK 34. Match application package id: <code className="bg-zinc-900 border border-zinc-800 text-cyan-400 px-1 py-0.5 rounded font-mono">com.hydromind.app</code>.
              </li>
              <li>
                <span className="text-white font-bold font-mono">Configure Gradle Bulks:</span> Open <code className="text-white font-mono">build.gradle</code> files and declare WorkManager dependencies, permissions configs, and layout engines.
              </li>
              <li>
                <span className="text-white font-bold font-mono">Setup Assets WebView:</span> Add WebView element to your <code className="text-white font-mono">activity_main.xml</code> layout. Synchronize your Java folders for <code className="text-cyan-400 font-mono">bridge</code>, <code className="text-cyan-400 font-mono">widget</code>, and <code className="text-cyan-400 font-mono">notification</code>.
              </li>
              <li>
                <span className="text-white font-bold font-mono">Build Widget layout:</span> Match widget remote elements in <code className="text-white font-mono">hydro_widget.xml</code> and declare receiver properties in Manifest. Set up WorkManager reminders triggers.
              </li>
              <li>
                <span className="text-white font-bold font-mono">Sync Dark / Light Theme:</span> Native toggles write directly to shared preference variables, applying theme configurations inside WebView seamlessly!
              </li>
            </ol>
          </div>

        </div>
      )}
      
      {/* Code panel footer status rail */}
      <div className="bg-zinc-950 p-2.5 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between select-none">
        <span>STATUS: SYSTEM READY</span>
        <span>LANGUAGES: EN_US</span>
      </div>

    </div>
  );
}
