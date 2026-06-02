import type { ReactNode } from 'react'
import { CommandButton, StatusBadge } from './primitives'

export type LabNavTab =
  | 'dashboard'
  | 'registry'
  | 'skillDetail'
  | 'sync'
  | 'cli'
  | 'providers'
  | 'mcp'
  | 'governance'
  | 'evals'
  | 'history'
  | 'settings'

const navItems: Array<{ id: LabNavTab; label: string; hint: string }> = [
  { id: 'dashboard', label: 'Dashboard', hint: 'control tower' },
  { id: 'registry', label: 'Skill Registry', hint: 'catalog' },
  { id: 'skillDetail', label: 'Skill Detail', hint: 'inspector' },
  { id: 'sync', label: 'Sync & Adapters', hint: 'compatibility' },
  { id: 'cli', label: 'CLI & Logs', hint: 'runtime terminal' },
  { id: 'providers', label: 'Providers', hint: 'routing console' },
  { id: 'mcp', label: 'MCP Servers', hint: 'tool bridge' },
  { id: 'governance', label: 'Governance', hint: 'safety gates' },
  { id: 'evals', label: 'Eval Reports', hint: 'quality lab' },
  { id: 'history', label: 'Run History', hint: 'operations' },
  { id: 'settings', label: 'Settings', hint: 'local config' },
]

export function AppShell({
  activeTab,
  onTabChange,
  children,
  registryRoot,
  activeHost,
  skillCount,
  isHealthy,
  backendConnected,
  onRunDoctor,
  onSyncAll,
  onRunEval,
  onOpenCli,
  onRefresh,
  isBusy,
}: {
  activeTab: LabNavTab
  onTabChange: (tab: LabNavTab) => void
  children: ReactNode
  registryRoot: string
  activeHost: string
  skillCount: number
  isHealthy: boolean
  backendConnected: boolean
  onRunDoctor: () => void
  onSyncAll: () => void
  onRunEval: () => void
  onOpenCli: () => void
  onRefresh: () => void
  isBusy: boolean
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#020617] text-slate-200">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 flex h-full w-full">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800/70 bg-slate-950/70 p-4 md:flex md:flex-col">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Universal AI Skill Lab v2
            </p>
            <p className="mt-1 text-sm text-slate-200">Local-first · provider-neutral</p>
          </div>

          <nav className="mt-4 space-y-1.5 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const selected = item.id === activeTab
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-100'
                      : 'border-transparent bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[11px] opacity-80">{item.hint}</p>
                </button>
              )
            })}
          </nav>

          <div className="mt-4 space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Registry root</p>
            <p className="font-mono text-emerald-300">{registryRoot}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <StatusBadge value={activeHost} tone="blue" />
              <StatusBadge value={`${skillCount} skills`} tone="purple" />
              <StatusBadge value={isHealthy ? 'healthy' : 'degraded'} tone={isHealthy ? 'green' : 'yellow'} />
              <StatusBadge value={backendConnected ? 'backend online' : 'demo mode'} tone={backendConnected ? 'green' : 'yellow'} />
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/70 bg-slate-950/60 px-4 md:px-6">
            <h1 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
              {activeTab}
            </h1>
            <div className="flex flex-wrap gap-2">
              <CommandButton onClick={onRunDoctor} disabled={isBusy}>Run Diagnostics</CommandButton>
              <CommandButton onClick={onSyncAll} disabled={isBusy}>Sync All</CommandButton>
              <CommandButton onClick={onRunEval} disabled={isBusy}>Run Eval</CommandButton>
              <CommandButton onClick={onOpenCli}>Open CLI</CommandButton>
              <CommandButton onClick={onRefresh}>Refresh</CommandButton>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
