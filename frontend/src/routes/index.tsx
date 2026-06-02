import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  MetricCard,
  SectionCard,
  StatusBadge,
  EmptyState,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const [registry, setRegistry] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [runtime, setRuntime] = useState<any>(null)
  const [mcp, setMcp] = useState<any>(null)
  const [providers, setProviders] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [runHistory, setRunHistory] = useState<any>(null)
  const [logs, setLogs] = useState<any>(null)

  useEffect(() => {
    skillLabApi.getHealth().then(setHealth).catch(() => {})
    skillLabApi.getRegistry().then(setRegistry).catch(() => {})
    skillLabApi.getRuntime().then(setRuntime).catch(() => {})
    skillLabApi.getMcp().then(setMcp).catch(() => {})
    skillLabApi.getProviders().then(setProviders).catch(() => {})
    skillLabApi.getLatestReport().then(setReport).catch(() => {})
    skillLabApi.getRunHistory().then(setRunHistory).catch(() => {})
    skillLabApi.getLogs().then(setLogs).catch(() => {})
  }, [])

  const backendConnected = Boolean(health?.ok)
  const skills = registry?.skills ?? []
  const activeSkillsCount = skills.filter((s: any) => s.status === 'active').length
  const draftOrQuarantinedCount = skills.filter((s: any) =>
    ['draft', 'quarantined'].includes(s.status),
  ).length

  const enabledMcpCount = mcp
    ? Object.values(mcp.servers).filter((server: any) => server.enabled).length
    : 0
  const enabledProvidersCount = providers?.providers
    ? Object.values(providers.providers).filter((provider: any) => provider.enabled === true)
        .length
    : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Skills" value={String(skills.length)} detail="registry.yaml" />
        <MetricCard
          label="Active Skills"
          value={String(activeSkillsCount)}
          tone="success"
          detail="status = active"
        />
        <MetricCard
          label="Draft/Quarantined"
          value={String(draftOrQuarantinedCount)}
          tone="warn"
          detail="needs review"
        />
        <MetricCard
          label="Registry Health"
          value={backendConnected ? 'Healthy' : 'Degraded'}
          tone={backendConnected ? 'success' : 'danger'}
          detail={runtime?.activeHost ?? 'unknown host'}
        />
        <MetricCard label="Enabled MCPs" value={String(enabledMcpCount)} tone="info" />
        <MetricCard
          label="Enabled Providers"
          value={String(enabledProvidersCount)}
          tone="info"
        />
        <MetricCard
          label="Last Eval"
          value={report?.ok ? 'Passed' : 'Pending'}
          tone={report?.ok ? 'success' : 'warn'}
          detail={report?.summary ?? 'Run eval'}
        />
        <MetricCard
          label="Last Run"
          value={runHistory?.entries[0]?.timestamp?.split('T')[1]?.slice(0, 5) ?? 'none'}
          detail="run-history.ndjson"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Recent Runs" subtitle="From run-history.ndjson">
          <div className="space-y-3">
            {(runHistory?.entries ?? []).length === 0 ? (
              <EmptyState title="No recorded runs" body="CLI and quick action runs appear here." />
            ) : (
              (runHistory?.entries ?? []).slice(0, 6).map((entry: any) => (
                <div key={`${entry.timestamp}-${entry.command}`} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 p-3 hover:bg-slate-800/40 transition-colors">
                  <div>
                    <span className="font-mono text-xs text-cyan-400">{entry.command}</span>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                  <StatusBadge value={entry.ok ? 'ok' : 'failed'} tone={entry.ok ? 'green' : 'red'} />
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="System Events" subtitle="From harness/logs/latest.log">
          <div className="space-y-2 text-xs font-mono">
            {(logs?.entries ?? []).length === 0 ? (
              <EmptyState title="No logs yet" body="System activity will populate here." />
            ) : (
              (logs?.entries ?? []).slice(0, 8).map((entry: string, index: number) => (
                <div key={`${entry}-${index}`} className="rounded-lg border border-white/5 bg-[#0a0a0a] px-3 py-2 text-slate-400 opacity-80 hover:opacity-100 transition-opacity">
                  {entry}
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
