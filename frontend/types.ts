export type AgentType = 'opencode' | 'claude' | 'gemini' | 'custom';
export type SkillScope = 'shared' | 'agent-specific';
export type SkillTier = 'T1' | 'T2' | 'T3' | 'T4';
export type SkillType = 'planning' | 'functional' | 'atomic' | 'governance' | 'acquisition';

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  scope: SkillScope;
  agents: AgentType[];
  tags: string[];
  version: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  
  // Legacy/Extended fields for UI
  type: SkillType;
  tier: SkillTier;
  allowedTools: string[];
  
  // File structure contents
  instructions?: string;
  files?: Record<string, string>;
}

export interface Registry {
  version: string;
  lastSynced: string;
  health: 'healthy' | 'warning' | 'error';
  skills: Skill[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: string;
}

export interface ExecutionResult {
  id: string;
  ui_component: 'terminal_text' | 'json_table' | 'error' | 'loading' | 'command_echo';
  data: string;
  skillName?: string;
  timestamp?: string;
}

export interface AdapterConfig {
  id: string;
  name: string;
  status: 'active' | 'missing' | 'inactive';
  path: string;
  type: 'symlink' | 'copy-fallback';
  enabled: boolean;
}

export interface AppConfig {
  registryRoot: string;
  defaultAgent: AgentType;
  syncStrategy: 'symlink' | 'copy';
  adapters: AdapterConfig[];
}
