import React, { useState, useCallback, useRef, useEffect } from 'react';
import { INITIAL_REGISTRY, INITIAL_LOGS, INITIAL_CONFIG } from './constants';
import { Registry, ExecutionResult, LogEntry, Skill, AppConfig, AdapterConfig, AgentType } from './types';
import { DashboardView, RegistryView, SyncView, CLIView } from './components/Views';
import { executeSkillSimulated } from './services/geminiService';
import { 
  TerminalSquare, LayoutDashboard, Database, 
  RefreshCw, Terminal, Settings, ShieldCheck, Menu, X, Save
} from 'lucide-react';

type Tab = 'dashboard' | 'registry' | 'sync' | 'cli';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [registry, setRegistry] = useState<Registry>(INITIAL_REGISTRY);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [cliHistory, setCliHistory] = useState<ExecutionResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);

  const addLog = useCallback((level: LogEntry['level'], message: string, source: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      source
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const handleRunCLI = useCallback((commandString: string) => {
    setActiveTab('cli');
    setIsMobileMenuOpen(false);
    
    const args = commandString.trim().split(/\s+/);
    const command = args[0].toLowerCase();

    if (command === 'clear') {
      setCliHistory([]);
      return;
    }

    const cmdId = Math.random().toString(36).substring(7);
    
    // Echo the command
    setCliHistory(prev => [...prev, {
      id: `echo-${cmdId}`,
      ui_component: 'command_echo',
      data: commandString,
      timestamp: new Date().toLocaleTimeString()
    }]);

    const loadingId = `load-${cmdId}`;
    setCliHistory(prev => [...prev, {
      id: loadingId,
      ui_component: 'loading',
      data: `Executing aiskill ${command}...`,
      skillName: command
    }]);

    setIsExecuting(true);

    // Simulate CLI execution delay
    setTimeout(() => {
      let outputData = '';
      
      switch (command) {
        case 'sync':
          outputData = `[INFO] Starting sync operation...\n[INFO] Target: ${commandString.includes('--all') ? 'All Agents' : commandString}\n[SUCCESS] Validated registry.yaml\n[SUCCESS] Created symlinks in ~/.config/opencode/commands\n[WARN] ~/.claude/scripts not found. Skipping.\n[SUCCESS] Sync complete.`;
          addLog('success', `Synced skills for ${commandString.includes('--all') ? 'all agents' : commandString}`, 'sync');
          setRegistry(prev => ({ ...prev, lastSynced: new Date().toISOString() }));
          break;
        case 'doctor':
          outputData = `[INFO] Running registry diagnostics...\n[PASS] ~/ai-skills directory exists\n[PASS] registry.yaml is valid\n[PASS] ${registry.skills.length}/${registry.skills.length} skills have valid SKILL.md files\n[PASS] No broken symlinks detected in active adapters.\n\nStatus: HEALTHY`;
          addLog('info', 'Ran registry diagnostics (doctor)', 'cli');
          break;
        case 'list':
          outputData = `REGISTRY SKILLS:\n\n` + registry.skills.map(s => `- ${s.name.padEnd(20)} [${s.scope.padEnd(14)}] (${s.agents.join(', ')})`).join('\n');
          break;
        case 'init':
          outputData = `[INFO] Initializing AI Agent Skill Registry...\n[SUCCESS] Created directory ~/ai-skills\n[SUCCESS] Created directory ~/ai-skills/shared\n[SUCCESS] Created directory ~/ai-skills/agents\n[SUCCESS] Generated default config.yaml\n[SUCCESS] Generated default registry.yaml\n\nRegistry initialized successfully.`;
          addLog('success', 'Initialized registry structure', 'cli');
          break;
        case 'scan':
          outputData = `[INFO] Scanning ~/ai-skills for skills...\n[INFO] Found ${registry.skills.length} skill directories.\n[INFO] Parsing SKILL.md files...\n[SUCCESS] Registry manifest updated.\n\nScan complete. ${registry.skills.length} skills registered.`;
          addLog('info', 'Scanned filesystem for skills', 'cli');
          break;
        case 'validate':
          outputData = `[INFO] Validating registry integrity...\n[PASS] Schema validation passed for ${registry.skills.length} skills.\n[PASS] No duplicate IDs found.\n[PASS] All required SKILL.md files present.\n[PASS] Symlink targets verified.\n\nValidation successful. 0 errors, 0 warnings.`;
          addLog('success', 'Registry validation passed', 'cli');
          break;
        case 'backup':
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          outputData = `[INFO] Creating backup of ~/ai-skills...\n[INFO] Compressing files...\n[SUCCESS] Backup created at ~/ai-skills/backups/registry-${timestamp}.zip`;
          addLog('info', 'Created registry backup', 'cli');
          break;
        case 'show':
          const target = args[1];
          if (!target) {
            outputData = `[ERROR] Missing argument. Usage: aiskill show <skill_name>`;
          } else {
            const skill = registry.skills.find(s => s.name === target || s.id === target);
            if (skill) {
              outputData = `SKILL DETAILS:\n\nName:        ${skill.name}\nID:          ${skill.id}\nScope:       ${skill.scope}\nTier:        ${skill.tier}\nPath:        ${skill.path}\nDescription: ${skill.description}\nAgents:      ${skill.agents.join(', ')}\nTools:       ${skill.allowedTools.join(', ')}\nVersion:     ${skill.version}\nEnabled:     ${skill.enabled}`;
            } else {
              outputData = `[ERROR] Skill '${target}' not found.`;
            }
          }
          break;
        case 'help':
          outputData = `AVAILABLE COMMANDS:\n\n  init      Initialize the registry directory structure\n  scan      Scan filesystem and update registry.yaml\n  list      List all registered skills\n  show      Show details for a specific skill (e.g., show system_audit)\n  validate  Run validation checks on the registry\n  sync      Sync shared skills to agent directories\n  doctor    Run system diagnostics\n  backup    Create a zip backup of the registry\n  clear     Clear terminal output\n  help      Show this help message`;
          break;
        default:
          outputData = `[ERROR] Unknown command: '${command}'. Type 'help' for available commands.`;
      }

      setCliHistory(prev => prev.map(item => 
        item.id === loadingId 
          ? {
              id: `res-${cmdId}`,
              ui_component: 'terminal_text',
              data: outputData,
              skillName: commandString,
              timestamp: new Date().toLocaleTimeString()
            }
          : item
      ));
      setIsExecuting(false);
    }, 800);
  }, [registry.skills, addLog]);

  const handleExecuteSkill = useCallback(async (skill: Skill) => {
    setActiveTab('cli');
    setIsMobileMenuOpen(false);
    const cmdId = Math.random().toString(36).substring(7);
    
    setCliHistory(prev => [...prev, {
      id: `echo-${cmdId}`,
      ui_component: 'command_echo',
      data: `run ${skill.name}`,
      timestamp: new Date().toLocaleTimeString()
    }]);

    const loadingId = `load-${cmdId}`;
    setCliHistory(prev => [...prev, {
      id: loadingId,
      ui_component: 'loading',
      data: `Initializing ${skill.name}...\nEstablishing secure context...\nExecuting...`,
      skillName: skill.name
    }]);

    setIsExecuting(true);
    addLog('info', `Triggered execution of skill: ${skill.name}`, 'agent');

    const result = await executeSkillSimulated(skill);
    
    setCliHistory(prev => prev.map(item => 
      item.id === loadingId 
        ? { ...result, id: `res-${cmdId}` }
        : item
    ));
    
    addLog(result.ui_component === 'error' ? 'error' : 'success', `Completed execution of skill: ${skill.name}`, 'agent');
    setIsExecuting(false);
  }, [addLog]);

  const handleAddSkill = useCallback((newSkill: Skill) => {
    setRegistry(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    addLog('success', `Created new skill: ${newSkill.name}`, 'registry');
  }, [addLog]);

  const handleEditSkill = useCallback((updatedSkill: Skill) => {
    setRegistry(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === updatedSkill.id ? updatedSkill : s)
    }));
    addLog('success', `Updated skill: ${updatedSkill.name}`, 'registry');
  }, [addLog]);

  const handleUpdateAdapter = useCallback((updatedAdapter: AdapterConfig) => {
    setConfig(prev => ({
      ...prev,
      adapters: prev.adapters.map(a => a.id === updatedAdapter.id ? updatedAdapter : a)
    }));
    addLog('info', `Updated adapter settings for ${updatedAdapter.name}`, 'system');
  }, [addLog]);

  const openSettings = () => {
    setTempConfig(config);
    setIsSettingsOpen(true);
  };

  const saveSettings = () => {
    setConfig(tempConfig);
    setIsSettingsOpen(false);
    addLog('info', 'Global settings updated', 'system');
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#020617] text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-100 relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-slate-800/50 z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
            <TerminalSquare size={18} className="text-cyan-400" />
          </div>
          <h1 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">
            Skill Registry
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full w-64 flex flex-col glass border-r border-slate-800/50 z-50
        transform transition-transform duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center space-x-3 border-b border-slate-800/50 shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <TerminalSquare size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">
              Skill Registry
            </h1>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Local Environment
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="registry" icon={Database} label="Skill Registry" />
          <NavItem id="sync" icon={RefreshCw} label="Sync & Adapters" />
          <NavItem id="cli" icon={Terminal} label="CLI & Logs" />
        </nav>

        <div className="p-4 border-t border-slate-800/50 shrink-0">
          <button 
            onClick={() => handleRunCLI('doctor')}
            disabled={isExecuting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Run Diagnostics</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden h-full min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-slate-800/30 bg-slate-900/20 backdrop-blur-sm shrink-0">
          <h2 className="text-lg font-semibold text-slate-200 capitalize tracking-wide">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-xs font-mono text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800">
              {config.registryRoot}
            </div>
            <button 
              onClick={openSettings}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic View Container */}
        <div className="flex-1 overflow-hidden p-4 md:p-8 flex flex-col relative min-h-0">
          {activeTab === 'dashboard' && <DashboardView registry={registry} logs={logs} config={config} />}
          {activeTab === 'registry' && <RegistryView registry={registry} onAddSkill={handleAddSkill} onEditSkill={handleEditSkill} onExecuteSkill={handleExecuteSkill} />}
          {activeTab === 'sync' && <SyncView config={config} onRunCLI={handleRunCLI} isExecuting={isExecuting} onUpdateAdapter={handleUpdateAdapter} />}
          {activeTab === 'cli' && <CLIView history={cliHistory} onRunCLI={handleRunCLI} isExecuting={isExecuting} />}
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-200 flex items-center">
                <Settings size={20} className="mr-2 text-cyan-400" />
                Global Settings
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Registry Root Path</label>
                <input 
                  type="text" 
                  value={tempConfig.registryRoot} 
                  onChange={(e) => setTempConfig({...tempConfig, registryRoot: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Default Agent</label>
                <select 
                  value={tempConfig.defaultAgent}
                  onChange={(e) => setTempConfig({...tempConfig, defaultAgent: e.target.value as AgentType})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="opencode">OpenCode</option>
                  <option value="claude">Claude Code</option>
                  <option value="gemini">Gemini CLI</option>
                  <option value="custom">Custom Agent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Sync Strategy</label>
                <select 
                  value={tempConfig.syncStrategy}
                  onChange={(e) => setTempConfig({...tempConfig, syncStrategy: e.target.value as 'symlink' | 'copy'})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="symlink">Symlinks (Recommended)</option>
                  <option value="copy">Hard Copy (Fallback)</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/30 flex justify-end space-x-3">
              <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <button onClick={saveSettings} className="flex items-center space-x-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Save size={16} />
                <span>Save Config</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
