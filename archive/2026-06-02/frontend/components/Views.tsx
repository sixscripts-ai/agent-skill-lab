import React, { useState, useRef, useEffect } from 'react';
import { Registry, Skill, LogEntry, ExecutionResult, AgentType, SkillScope, SkillTier, SkillType, AppConfig, AdapterConfig } from '../types';
import { TerminalOutput } from './TerminalOutput';
import { 
  Database, ShieldAlert, Activity, Wrench, Cpu, 
  CheckCircle2, XCircle, AlertTriangle, Search, 
  Filter, Plus, FolderGit2, Link as LinkIcon, 
  HardDrive, Play, FileCode2, Settings, X, ChevronRight, Send, RefreshCw,
  Folder, FolderOpen, FileText, FileJson, Save, LayoutTemplate, BookOpen, Edit3
} from 'lucide-react';

// --- Helper Components ---
const Badge = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border whitespace-nowrap ${colorClass}`}>
    {children}
  </span>
);

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'T1': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'T2': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'T3': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'T4': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

// --- Dashboard View ---
export const DashboardView = ({ registry, logs, config }: { registry: Registry, logs: LogEntry[], config: AppConfig }) => {
  const activeAdaptersCount = config.adapters.filter(a => a.status === 'active' && a.enabled).length;
  
  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-10 animate-in fade-in duration-300 min-h-0">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="glass-panel p-5 md:p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400">Total Skills</h3>
              <Database size={18} className="text-cyan-500" />
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-slate-100">{registry.skills.length}</div>
              <p className="text-xs text-slate-500 mt-2">Across all scopes</p>
            </div>
          </div>
          <div className="glass-panel p-5 md:p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400">Registry Health</h3>
              <Activity size={18} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-emerald-400 flex items-center">
                <CheckCircle2 size={24} className="mr-2" /> {registry.health === 'healthy' ? 'Healthy' : 'Warning'}
              </div>
              <p className="text-xs text-slate-500 mt-2">No broken symlinks detected</p>
            </div>
          </div>
          <div className="glass-panel p-5 md:p-6 rounded-xl flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400">Active Adapters</h3>
              <FolderGit2 size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-slate-100">{activeAdaptersCount} / {config.adapters.length}</div>
              <p className="text-xs text-slate-500 mt-2">Adapters connected</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-800/50 bg-slate-900/40 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-semibold text-slate-300">Recent System Logs</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm font-mono min-w-[600px]">
              <tbody className="divide-y divide-slate-800/40">
                {logs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-500 w-24 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 w-24">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase whitespace-nowrap ${
                        log.level === 'info' ? 'bg-blue-500/10 text-blue-400' :
                        log.level === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.level === 'warn' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 w-32 truncate max-w-[120px]">{log.source}</td>
                    <td className="px-4 py-3 text-slate-300">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Registry View ---
export const RegistryView = ({ 
  registry, 
  onAddSkill,
  onEditSkill,
  onExecuteSkill
}: { 
  registry: Registry, 
  onAddSkill: (skill: Skill) => void,
  onEditSkill: (skill: Skill) => void,
  onExecuteSkill: (skill: Skill) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  
  const filteredSkills = registry.skills.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveSkill = (newSkill: Skill) => {
    if (skillToEdit) {
      onEditSkill(newSkill);
    } else {
      onAddSkill(newSkill);
    }
    setShowBuilder(false);
    setSkillToEdit(null);
  };

  const openEditor = (skill?: Skill) => {
    if (skill) {
      setSkillToEdit(skill);
    } else {
      setSkillToEdit(null);
    }
    setShowBuilder(true);
    setSelectedSkill(null);
  };

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 relative min-h-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search skills, tags, or descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} className="text-slate-400" />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => openEditor()}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Plus size={16} />
            <span>New Skill</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-10 min-h-0">
        {filteredSkills.map(skill => (
          <div 
            key={skill.id} 
            onClick={() => setSelectedSkill(skill)}
            className="glass-panel p-4 md:p-5 rounded-xl hover:border-cyan-500/30 transition-colors group cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 shrink-0">
                  <FileCode2 size={20} className="text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">{skill.name}</h3>
                  <div className="text-xs font-mono text-slate-500 mt-0.5 truncate">{skill.path}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Badge colorClass={skill.scope === 'shared' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}>
                  {skill.scope}
                </Badge>
                <Badge colorClass={getTierColor(skill.tier)}>{skill.tier}</Badge>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 mb-4 line-clamp-2">{skill.description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-800/50 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-slate-500">Agents:</span>
                  {skill.agents.map(a => (
                    <span key={a} className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">{a}</span>
                  ))}
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-slate-500">Tags:</span>
                  {skill.tags.map(t => (
                    <span key={t} className="text-[10px] text-slate-400">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 shrink-0">v{skill.version}</div>
            </div>
          </div>
        ))}
        {filteredSkills.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No skills found matching your search.
          </div>
        )}
      </div>

      {/* Skill Builder Full Screen Modal */}
      {showBuilder && (
        <SkillBuilder onClose={() => {setShowBuilder(false); setSkillToEdit(null);}} onSave={handleSaveSkill} initialSkill={skillToEdit} />
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-900/50 shrink-0">
              <div className="flex items-center space-x-3">
                <FileCode2 size={24} className="text-cyan-400 shrink-0" />
                <h2 className="text-lg md:text-xl font-bold text-slate-200 truncate">{selectedSkill.name}</h2>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="text-slate-400 hover:text-slate-200 p-1 shrink-0">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-6 overflow-y-auto min-h-0">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Metadata</h4>
                  <ul className="space-y-2 text-sm text-slate-300 font-mono">
                    <li><span className="text-slate-500">ID:</span> {selectedSkill.id}</li>
                    <li><span className="text-slate-500">Version:</span> {selectedSkill.version}</li>
                    <li><span className="text-slate-500">Type:</span> {selectedSkill.type}</li>
                    <li className="flex items-center"><span className="text-slate-500 mr-2">Tier:</span> <Badge colorClass={getTierColor(selectedSkill.tier)}>{selectedSkill.tier}</Badge></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Path</h4>
                  <div className="text-xs font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-400 break-all">
                    {selectedSkill.path}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mt-4 mb-2">Allowed Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.allowedTools.map(t => (
                      <span key={t} className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSkill.instructions && (
                <div className="mt-6 border-t border-slate-800/50 pt-6">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center">
                    <FileText size={14} className="mr-2" />
                    SKILL.md Content
                  </h4>
                  <div className="bg-[#0d1117] border border-slate-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedSkill.instructions}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <button 
                onClick={() => openEditor(selectedSkill)}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors w-full sm:w-auto"
              >
                <Edit3 size={16} />
                <span>Edit Skill</span>
              </button>
              <button 
                onClick={() => {
                  onExecuteSkill(selectedSkill);
                  setSelectedSkill(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Play size={16} className="fill-current" />
                <span>Execute Skill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sync & Adapters View ---
export const SyncView = ({ 
  config, 
  onRunCLI, 
  isExecuting,
  onUpdateAdapter
}: { 
  config: AppConfig, 
  onRunCLI: (cmd: string) => void, 
  isExecuting: boolean,
  onUpdateAdapter: (adapter: AdapterConfig) => void
}) => {
  const [editingAdapter, setEditingAdapter] = useState<AdapterConfig | null>(null);
  const [tempAdapter, setTempAdapter] = useState<AdapterConfig | null>(null);

  const openAdapterSettings = (adapter: AdapterConfig) => {
    setEditingAdapter(adapter);
    setTempAdapter(adapter);
  };

  const saveAdapterSettings = () => {
    if (tempAdapter) {
      onUpdateAdapter(tempAdapter);
    }
    setEditingAdapter(null);
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-10 animate-in fade-in duration-300 min-h-0 relative">
      <div className="space-y-6">
        <div className="glass-panel p-5 md:p-6 rounded-xl">
          <h2 className="text-lg font-bold text-slate-200 mb-2">Sync Center</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-3xl">Manage how shared skills are propagated to local agent directories. Symlinks are preferred to maintain a single source of truth.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={() => onRunCLI('sync --dry-run')}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              Dry Run Sync
            </button>
            <button 
              onClick={() => onRunCLI('sync --all')}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 w-full sm:w-auto"
            >
              Sync All Agents
            </button>
          </div>

          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Agent Adapters</h3>
          <div className="grid grid-cols-1 gap-4">
            {config.adapters.map(adapter => (
              <div key={adapter.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-slate-900/50 border rounded-xl gap-4 transition-colors ${adapter.enabled ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
                <div className="flex items-start sm:items-center space-x-4">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 sm:mt-0 shrink-0 ${
                    !adapter.enabled ? 'bg-slate-700' :
                    adapter.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 
                    adapter.status === 'missing' ? 'bg-rose-500' : 'bg-slate-600'
                  }`} />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-200 flex items-center">
                      {adapter.name}
                      {!adapter.enabled && <span className="ml-2 text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">DISABLED</span>}
                    </h4>
                    <div className="text-xs font-mono text-slate-500 mt-1 flex items-center truncate">
                      <HardDrive size={12} className="mr-1.5 shrink-0" /> 
                      <span className="truncate">{adapter.path}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
                  <Badge colorClass="bg-slate-800 text-slate-400 border-slate-700">
                    {adapter.type}
                  </Badge>
                  <button 
                    onClick={() => onRunCLI(`sync --agent ${adapter.id}`)}
                    disabled={adapter.status === 'missing' || !adapter.enabled || isExecuting}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30"
                    title="Sync this agent"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    onClick={() => openAdapterSettings(adapter)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adapter Settings Modal */}
      {editingAdapter && tempAdapter && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-200 flex items-center">
                <Settings size={20} className="mr-2 text-cyan-400" />
                {editingAdapter.name} Settings
              </h2>
              <button onClick={() => setEditingAdapter(null)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300">Enable Adapter</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={tempAdapter.enabled}
                    onChange={(e) => setTempAdapter({...tempAdapter, enabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Target Path</label>
                <input 
                  type="text" 
                  value={tempAdapter.path} 
                  onChange={(e) => setTempAdapter({...tempAdapter, path: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Sync Strategy</label>
                <select 
                  value={tempAdapter.type}
                  onChange={(e) => setTempAdapter({...tempAdapter, type: e.target.value as 'symlink' | 'copy-fallback'})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="symlink">Symlink (Recommended)</option>
                  <option value="copy-fallback">Copy Fallback</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/30 flex justify-end space-x-3">
              <button onClick={() => setEditingAdapter(null)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <button onClick={saveAdapterSettings} className="flex items-center space-x-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Save size={16} />
                <span>Save Adapter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CLI View ---
export const CLIView = ({ 
  history, 
  onRunCLI,
  isExecuting
}: { 
  history: ExecutionResult[], 
  onRunCLI: (cmd: string) => void,
  isExecuting: boolean
}) => {
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;
    onRunCLI(input.trim());
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 min-h-0">
      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl flex flex-col min-h-0">
        <div className="flex items-center px-4 py-3 bg-slate-900/80 border-b border-slate-800/80 shrink-0">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="mx-auto text-xs font-mono text-slate-500">
            ~/ai-skills/cli
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117] min-h-0">
          {history.length === 0 ? (
            <div className="text-slate-500 font-mono text-sm">
              Type a command to begin. Try 'list', 'sync', or 'doctor'. Type 'help' to see available commands...
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id}>
                {item.ui_component === 'command_echo' ? (
                  <div className="flex items-start space-x-3 text-emerald-400/90 font-mono text-sm">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    <span className="font-semibold tracking-wide break-all">aiskill {item.data}</span>
                  </div>
                ) : (
                  <div className="pl-2 md:pl-7">
                    <TerminalOutput output={item} />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-3 bg-slate-900/80 border-t border-slate-800/80 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center text-emerald-400 font-mono font-bold pl-1 md:pl-2 shrink-0">
              <ChevronRight size={18} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isExecuting}
              placeholder="aiskill command..."
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-200 font-mono text-sm placeholder-slate-600 disabled:opacity-50 min-w-0"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isExecuting}
              className="p-2 text-cyan-500 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
