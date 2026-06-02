export type RuntimeHost =
  | 'custom-python'
  | 'opencode'
  | 'claude-code'
  | 'cursor'
  | 'chatgpt'
  | 'gemini'
  | 'hermes'
  | 'codex'
  | 'copilot'
  | 'unknown'

export type SkillTier =
  | 'planning'
  | 'functional'
  | 'atomic'
  | 'governance'
  | 'acquisition'
  | 'evaluation'

export type TrustTier = 'T1' | 'T2' | 'T3' | 'T4'

export type SkillStatus =
  | 'active'
  | 'draft'
  | 'quarantined'
  | 'sandbox-tested'
  | 'critic-reviewed'
  | 'human-approved'
  | 'deprecated'
  | 'rejected'

export type RegistrySkill = {
  name: string
  tier: SkillTier
  path: string
  description: string
  trustTier: TrustTier
  status: SkillStatus
}

export type RegistryResponse = {
  registryVersion: string
  mode: string
  architecture: string
  lastSynced: string | null
  skills: Array<RegistrySkill>
}

export type RuntimeResponse = {
  mode: string
  activeHost: RuntimeHost
  hosts: Record<string, { enabled: boolean; adapterPath: string }>
  executionPolicy: Record<string, boolean>
  memory: Record<string, string>
}

export type ProvidersResponse = {
  defaultProvider: string
  defaultModel: string
  roles: Record<string, { provider: string; model: string }>
  providers?: Record<string, Record<string, string | boolean | number | null>>
  envStatus?: Record<string, boolean>
}

export type McpResponse = {
  servers: Record<
    string,
    {
      enabled: boolean
      purpose: string
      trustTier: string
      scope?: Array<string>
      envKey?: string
      envConfigured?: boolean
    }
  >
}

export type LogsResponse = {
  entries: Array<string>
}

export type ReportResponse = {
  ok: boolean
  summary: string
  data?: Record<string, unknown>
}

export type HealthResponse = {
  ok: boolean
  service: string
  skillsHome: string
  timestamp: string
}

export type CliResponse = {
  ok: boolean
  command: string
  stdout: string
  stderr: string
  exitCode: number
  durationMs: number
  timestamp: string
}

export type RunHistoryResponse = {
  entries: Array<{
    timestamp: string
    command: string
    exitCode: number
    durationMs: number
    ok: boolean
    stdoutPreview: string
    stderrPreview: string
  }>
}

export type ApiState<T> = {
  loading: boolean
  error: string | null
  data: T | null
}
