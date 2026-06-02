type SkillTier =
  | 'planning'
  | 'functional'
  | 'atomic'
  | 'governance'
  | 'acquisition'
  | 'evaluation'

type TrustTier = 'T1' | 'T2' | 'T3' | 'T4'

type SkillStatus =
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

export type RegistryPayload = {
  registryVersion: string
  mode: string
  architecture: string
  lastSynced: string | null
  skills: Array<RegistrySkill>
}

export type RuntimeHost = {
  enabled: boolean
  adapterPath: string
}

export type RuntimePayload = {
  mode: string
  activeHost: string
  hosts: Record<string, RuntimeHost>
  executionPolicy: Record<string, boolean>
  memory: Record<string, string>
}

export type ProvidersPayload = {
  defaultProvider: string
  defaultModel: string
  roles: Record<string, { provider: string; model: string }>
  providers: Record<string, Record<string, string | boolean | number | null>>
  envStatus: Record<string, boolean>
}

export type McpServer = {
  enabled: boolean
  purpose: string
  trustTier: string
  scope?: Array<string>
  envKey?: string
  envConfigured?: boolean
}

export type McpPayload = {
  servers: Record<string, McpServer>
}

export type LogsPayload = {
  entries: Array<string>
}

export type ReportPayload = {
  ok: boolean
  summary: string
  data: Record<string, unknown>
}

export type CliResult = {
  ok: boolean
  command: string
  stdout: string
  stderr: string
  exitCode: number
  durationMs: number
  timestamp: string
}

function normalizeHomePath(input: string): string {
  if (!input.startsWith('~')) {
    return input
  }
  const home = process.env.HOME ?? ''
  if (input === '~') {
    return home
  }
  return input.replace(/^~\//, `${home}/`)
}

async function fsModules() {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  return { fs, path }
}

async function exists(filePath: string): Promise<boolean> {
  const { fs } = await fsModules()
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function findRootFrom(startDir: string): Promise<string | null> {
  const { path } = await fsModules()
  let current = startDir

  while (true) {
    if (await exists(path.join(current, 'registry.yaml'))) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      return null
    }

    current = parent
  }
}

async function resolveSkillsHome(): Promise<string> {
  const { path } = await fsModules()
  const { fileURLToPath } = await import('node:url')

  const envHome = process.env.AI_SKILLS_HOME
    ? normalizeHomePath(process.env.AI_SKILLS_HOME)
    : null
  const moduleDir = path.dirname(fileURLToPath(import.meta.url))

  const seeds = [
    envHome,
    process.cwd(),
    path.resolve(moduleDir, '../..'),
  ].filter(Boolean) as Array<string>

  for (const seed of seeds) {
    const resolved = await findRootFrom(seed)
    if (resolved) {
      return resolved
    }
  }

  return seeds[0] ?? process.cwd()
}

async function readText(relativePath: string): Promise<string | null> {
  const { fs, path } = await fsModules()
  const root = await resolveSkillsHome()
  try {
    return await fs.readFile(path.join(root, relativePath), 'utf8')
  } catch {
    return null
  }
}

function parseYamlScalar(rawValue: string): string | boolean | number | null {
  const value = rawValue.trim()
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
  return value
}

function parseInlineObject(raw: string): Record<string, string | boolean | number | null> {
  const entries = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const parsed: Record<string, string | boolean | number | null> = {}
  for (const entry of entries) {
    const splitIndex = entry.indexOf(':')
    if (splitIndex === -1) continue
    const key = entry.slice(0, splitIndex).trim()
    const value = entry.slice(splitIndex + 1).trim()
    parsed[key] = parseYamlScalar(value)
  }
  return parsed
}

function extractSection(text: string, startKey: string, endKey?: string): string {
  const startToken = `${startKey}:\n`
  const startIndex = text.indexOf(startToken)
  if (startIndex === -1) return ''

  const sectionStart = startIndex + startToken.length
  if (!endKey) {
    return text.slice(sectionStart)
  }

  const endToken = `\n${endKey}:`
  const endIndex = text.indexOf(endToken, sectionStart)
  return endIndex === -1 ? text.slice(sectionStart) : text.slice(sectionStart, endIndex)
}

export async function getHealthPayload() {
  const root = await resolveSkillsHome()
  return {
    ok: true,
    service: 'universal-ai-skill-lab',
    skillsHome: root,
    timestamp: new Date().toISOString(),
  }
}

export async function getRegistryPayload(): Promise<RegistryPayload> {
  const text = (await readText('registry.yaml')) ?? ''

  const registryVersion =
    (text.match(/^registry_version:\s*"?([^"\n]+)"?/m)?.[1] ?? 'unknown').trim()
  const mode = (text.match(/^mode:\s*"?([^"\n]+)"?/m)?.[1] ?? 'unknown').trim()
  const architecture =
    (text.match(/^architecture:\s*"?([^"\n]+)"?/m)?.[1] ?? 'unknown').trim()
  const lastSyncedRaw = text.match(/^last_synced:\s*([^\n]+)/m)?.[1]?.trim() ?? 'null'

  const skillPattern =
    /^\s*- name:\s*([^\n]+)\n\s+tier:\s*([^\n]+)\n\s+path:\s*([^\n]+)\n\s+description:\s*"([^"]*)"\n\s+trust_tier:\s*([^\n]+)\n\s+status:\s*([^\n]+)/gm

  const skills: Array<RegistrySkill> = []
  for (const match of text.matchAll(skillPattern)) {
    skills.push({
      name: match[1].trim(),
      tier: match[2].trim() as SkillTier,
      path: match[3].trim(),
      description: match[4].trim(),
      trustTier: match[5].trim() as TrustTier,
      status: match[6].trim() as SkillStatus,
    })
  }

  return {
    registryVersion,
    mode,
    architecture,
    lastSynced: lastSyncedRaw === 'null' ? null : lastSyncedRaw,
    skills,
  }
}

export async function getRuntimePayload(): Promise<RuntimePayload> {
  const text = (await readText('runtime.yaml')) ?? ''

  const mode = (text.match(/^mode:\s*([^\n]+)/m)?.[1] ?? 'unknown').trim()
  const activeHost = (text.match(/^active_host:\s*([^\n]+)/m)?.[1] ?? 'unknown').trim()

  const hostsSection = extractSection(text, 'hosts', 'execution_policy')
  const executionPolicySection = extractSection(text, 'execution_policy', 'memory')
  const memorySection = extractSection(text, 'memory')

  const hosts: Record<string, RuntimeHost> = {}
  for (const match of hostsSection.matchAll(/^\s{2}([a-z0-9-]+):\s*\{([^}]+)\}/gm)) {
    const hostName = match[1].trim()
    const values = parseInlineObject(match[2])
    hosts[hostName] = {
      enabled: Boolean(values.enabled),
      adapterPath: String(values.adapter_path ?? ''),
    }
  }

  const executionPolicy: Record<string, boolean> = {}
  for (const match of executionPolicySection.matchAll(/^\s{2}([a-z0-9_]+):\s*([^\n]+)/gm)) {
    executionPolicy[match[1].trim()] = Boolean(parseYamlScalar(match[2]))
  }

  const memory: Record<string, string> = {}
  for (const match of memorySection.matchAll(/^\s{2}([a-z0-9_]+):\s*([^\n]+)/gm)) {
    memory[match[1].trim()] = String(parseYamlScalar(match[2]))
  }

  return {
    mode,
    activeHost,
    hosts,
    executionPolicy,
    memory,
  }
}

export async function getProvidersPayload(): Promise<ProvidersPayload> {
  const text = (await readText('providers.yaml')) ?? ''

  const defaultProvider =
    (text.match(/^default_provider:\s*([^\n]+)/m)?.[1] ?? 'unknown').trim()
  const defaultModel = (text.match(/^default_model:\s*([^\n]+)/m)?.[1] ?? 'unknown').trim()

  const rolesSection = extractSection(text, 'roles', 'providers')
  const providersSection = extractSection(text, 'providers')

  const roles: Record<string, { provider: string; model: string }> = {}
  for (const match of rolesSection.matchAll(/^\s{2}([a-z0-9-]+):\s*\{([^}]+)\}/gm)) {
    const role = match[1].trim()
    const values = parseInlineObject(match[2])
    roles[role] = {
      provider: String(values.provider ?? 'local'),
      model: String(values.model ?? 'none'),
    }
  }

  const providers: Record<string, Record<string, string | boolean | number | null>> = {}
  const envStatus: Record<string, boolean> = {}
  for (const match of providersSection.matchAll(/^\s{2}([a-z0-9-]+):\s*\{([^}]+)\}/gm)) {
    const providerName = match[1].trim()
    const parsed = parseInlineObject(match[2])
    providers[providerName] = parsed

    const envKey = parsed.env_key
    if (typeof envKey === 'string' && envKey.length > 0) {
      envStatus[providerName] = Boolean(process.env[envKey])
    }
  }

  return {
    defaultProvider,
    defaultModel,
    roles,
    providers,
    envStatus,
  }
}

export async function getMcpPayload(): Promise<McpPayload> {
  const text = (await readText('mcp.yaml')) ?? ''
  const mcpSection = extractSection(text, 'mcp_servers')

  const servers: Record<string, McpServer> = {}
  const blockPattern = /^\s{2}([a-z0-9-]+):\n((?:\s{4}[^\n]+\n?)*)/gm
  for (const block of mcpSection.matchAll(blockPattern)) {
    const serverName = block[1].trim()
    const lines = block[2]
    const server: McpServer = {
      enabled: false,
      purpose: '',
      trustTier: 'unknown',
    }

    for (const entry of lines.matchAll(/^\s{4}([a-z0-9_]+):\s*(.+)$/gm)) {
      const key = entry[1].trim()
      const rawValue = entry[2].trim()

      if (key === 'enabled') {
        server.enabled = Boolean(parseYamlScalar(rawValue))
        continue
      }

      if (key === 'purpose') {
        server.purpose = String(parseYamlScalar(rawValue) ?? '')
        continue
      }

      if (key === 'trust_tier') {
        server.trustTier = String(parseYamlScalar(rawValue) ?? 'unknown')
        continue
      }

      if (key === 'env_key') {
        server.envKey = String(parseYamlScalar(rawValue) ?? '')
        server.envConfigured = server.envKey.length > 0 ? Boolean(process.env[server.envKey]) : undefined
        continue
      }

      if (key === 'scope') {
        const cleaned = rawValue.replace(/^\[/, '').replace(/\]$/, '')
        server.scope = cleaned
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => String(parseYamlScalar(item)))
      }
    }

    servers[serverName] = server
  }

  return { servers }
}

export async function getLogsPayload(): Promise<LogsPayload> {
  const content = (await readText('harness/logs/latest.log')) ?? ''
  const entries = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return { entries }
}

export async function getLatestReportPayload(): Promise<ReportPayload> {
  const text = await readText('harness/reports/latest.json')
  if (!text) {
    return {
      ok: false,
      summary: 'No eval report found',
      data: {},
    }
  }

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    return {
      ok: parsed.ok === true,
      summary: String(parsed.summary ?? 'Latest report loaded'),
      data: parsed,
    }
  } catch {
    return {
      ok: false,
      summary: 'Invalid report JSON',
      data: {},
    }
  }
}

export type RunHistoryEntry = {
  timestamp: string
  command: string
  exitCode: number
  durationMs: number
  ok: boolean
  stdoutPreview: string
  stderrPreview: string
}

const ALLOWED_SUBCOMMANDS = new Set([
  'doctor',
  'list',
  'sync',
  'eval',
  'gate',
  'dedupe',
  'run',
])

const ALLOWED_SYNC_TARGETS = new Set([
  'all',
  'custom-python',
  'opencode',
  'claude-code',
  'cursor',
  'chatgpt',
  'gemini',
  'hermes',
])

function splitShellLike(input: string): Array<string> {
  const tokens: Array<string> = []
  const matcher = /"([^"]*)"|'([^']*)'|(\S+)/g
  for (const match of input.matchAll(matcher)) {
    tokens.push(match[1] ?? match[2] ?? match[3] ?? '')
  }
  return tokens.filter(Boolean)
}

function summarizeOutput(value: string): string {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 3).join(' | ')
}

async function appendRunHistory(entry: RunHistoryEntry) {
  const { fs, path } = await fsModules()
  const root = await resolveSkillsHome()
  const logsDir = path.join(root, 'harness', 'logs')
  const historyFile = path.join(logsDir, 'run-history.ndjson')

  try {
    await fs.mkdir(logsDir, { recursive: true })
    await fs.appendFile(historyFile, `${JSON.stringify(entry)}\n`, 'utf8')
  } catch {
    // Best-effort logging; never fail command execution because history logging failed.
  }
}

function toFailureResult(command: string, stderr: string, durationMs = 0): CliResult {
  return {
    ok: false,
    command,
    stdout: '',
    stderr,
    exitCode: 1,
    durationMs,
    timestamp: new Date().toISOString(),
  }
}

async function executeAiskillSubcommand(
  subcommand: string,
  extraArgs: Array<string>,
): Promise<CliResult> {
  const startedAt = Date.now()
  const timestamp = new Date().toISOString()

  if (!ALLOWED_SUBCOMMANDS.has(subcommand)) {
    return toFailureResult(`aiskill ${subcommand}`, `Unsupported command: ${subcommand}`)
  }

  const runArgs = [subcommand, ...extraArgs]
  const { execFile } = await import('node:child_process')
  const { path } = await fsModules()

  const projectRoot = await resolveSkillsHome()
  const scriptPath = path.join(projectRoot, 'aiskill')

  if (!(await exists(scriptPath))) {
    return toFailureResult(
      `aiskill ${runArgs.join(' ')}`,
      `Could not find aiskill executable at ${scriptPath}`,
    )
  }

  const result = await new Promise<CliResult>((resolve) => {
    execFile(
      scriptPath,
      runArgs,
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          AI_SKILLS_HOME: projectRoot,
        },
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const exitCode = typeof error?.code === 'number' ? error.code : error ? 1 : 0
        resolve({
          ok: exitCode === 0,
          command: `aiskill ${runArgs.join(' ')}`,
          stdout,
          stderr: stderr || (error ? error.message : ''),
          exitCode,
          durationMs: Date.now() - startedAt,
          timestamp,
        })
      },
    )
  })

  await appendRunHistory({
    timestamp: result.timestamp,
    command: result.command,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    ok: result.ok,
    stdoutPreview: summarizeOutput(result.stdout),
    stderrPreview: summarizeOutput(result.stderr),
  })

  return result
}

export async function runCliCommand(commandInput: string): Promise<CliResult> {
  const tokens = splitShellLike(commandInput)
  if (tokens.length === 0) {
    return toFailureResult(commandInput, 'Missing command')
  }

  const args = [...tokens]
  const first = args[0]

  if (first === 'aiskill' || first.endsWith('/aiskill') || first === './aiskill') {
    args.shift()
  }

  const subcommand = args[0]
  if (!subcommand) {
    return toFailureResult(commandInput, 'Missing subcommand')
  }

  return executeAiskillSubcommand(subcommand, args.slice(1))
}

export async function runDoctorCommand(): Promise<CliResult> {
  return executeAiskillSubcommand('doctor', [])
}

export async function runEvalCommand(): Promise<CliResult> {
  return executeAiskillSubcommand('eval', [])
}

export async function runSyncCommand(target: string): Promise<CliResult> {
  const normalized = target.trim() || 'all'
  if (!ALLOWED_SYNC_TARGETS.has(normalized)) {
    return toFailureResult(`aiskill sync ${normalized}`, `Invalid sync target: ${normalized}`)
  }
  return executeAiskillSubcommand('sync', [normalized])
}

export async function runPromptCommand(prompt: string): Promise<CliResult> {
  const normalized = prompt.trim()
  if (!normalized) {
    return toFailureResult('aiskill run', 'Prompt is required')
  }
  return executeAiskillSubcommand('run', [normalized])
}

export async function runGateCommand(command: string): Promise<CliResult> {
  const normalized = command.trim()
  if (!normalized) {
    return toFailureResult('aiskill gate', 'Command is required')
  }
  return executeAiskillSubcommand('gate', [normalized])
}

export async function runDedupeCommand(
  name: string,
  description: string,
): Promise<CliResult> {
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()

  if (!normalizedName || !normalizedDescription) {
    return toFailureResult('aiskill dedupe', 'Both name and description are required')
  }

  return executeAiskillSubcommand('dedupe', [normalizedName, normalizedDescription])
}

export async function getRunHistoryPayload(): Promise<{ entries: Array<RunHistoryEntry> }> {
  const { fs, path } = await fsModules()
  const root = await resolveSkillsHome()
  const historyFile = path.join(root, 'harness', 'logs', 'run-history.ndjson')

  try {
    const content = await fs.readFile(historyFile, 'utf8')
    const entries = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RunHistoryEntry)
      .reverse()
      .slice(0, 100)

    return { entries }
  } catch {
    return { entries: [] }
  }
}
