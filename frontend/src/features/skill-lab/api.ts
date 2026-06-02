import type {
  CliResponse,
  HealthResponse,
  LogsResponse,
  McpResponse,
  ProvidersResponse,
  RegistryResponse,
  ReportResponse,
  RunHistoryResponse,
  RuntimeResponse,
} from './types'

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

async function parseCommandResponse(response: Response): Promise<CliResponse> {
  try {
    const parsed = (await response.json()) as CliResponse
    return parsed
  } catch {
    return {
      ok: false,
      command: '',
      stdout: '',
      stderr: `Request failed with status ${response.status}`,
      exitCode: 1,
      durationMs: 0,
      timestamp: new Date().toISOString(),
    }
  }
}

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return parseResponse<T>(response)
}


async function postCommand(url: string, body?: unknown): Promise<CliResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return parseCommandResponse(response)
}

export const skillLabApi = {
  getHealth: () => get<HealthResponse>('/api/health'),
  getRegistry: () => get<RegistryResponse>('/api/registry'),
  getRuntime: () => get<RuntimeResponse>('/api/runtime'),
  getProviders: () => get<ProvidersResponse>('/api/providers'),
  getMcp: () => get<McpResponse>('/api/mcp'),
  getLogs: () => get<LogsResponse>('/api/logs'),
  getLatestReport: () => get<ReportResponse>('/api/reports/latest'),
  getRunHistory: () => get<RunHistoryResponse>('/api/history'),
  runCli: (command: string) => postCommand('/api/cli', { command }),
  runPrompt: (prompt: string) => postCommand('/api/run', { prompt }),
  syncAdapter: (target: string) => postCommand('/api/sync', { target }),
  runDoctor: () => postCommand('/api/doctor'),
  runEval: () => postCommand('/api/eval'),
  runDedupe: (name: string, description: string) =>
    postCommand('/api/dedupe', { name, description }),
  runGate: (command: string) => postCommand('/api/gate', { command }),
}
