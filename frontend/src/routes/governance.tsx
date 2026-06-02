import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  StatusBadge,
  EmptyState,
  CommandButton,
} from '~/features/skill-lab/components/primitives'

const fallbackBlockedPatterns = [
  'sudo',
  'rm -rf /',
  'rm -rf ~',
  'chmod -R',
  'chown -R',
  'curl | bash',
  'wget ... | sh',
  'cat ~/.ssh',
  'cat ~/.env',
  'printenv',
]

export const Route = createFileRoute('/governance')({
  component: GovernanceOverview,
})

function GovernanceOverview() {
  const [runtime, setRuntime] = useState<any>(null)
  const [gateInput, setGateInput] = useState('ls -la')
  const [lastGateResult, setLastGateResult] = useState<any>(null)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    skillLabApi.getRuntime().then(setRuntime).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <SectionCard title="Execution Policy" subtitle="runtime.yaml security policy">
        {!runtime ? (
          <EmptyState title="No policy loaded" body="runtime.yaml unavailable" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(runtime.executionPolicy).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 p-4 hover:bg-slate-800/40 transition-colors">
                <p className="text-sm font-medium text-slate-200">{key}</p>
                <StatusBadge value={enabled ? 'enabled' : 'disabled'} tone={enabled ? 'green' : 'gray'} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Blocked Patterns" subtitle="G1-G4 security rules">
          <div className="flex flex-wrap gap-2">
            {fallbackBlockedPatterns.map((pattern) => (
              <div key={pattern} className="rounded-md border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 text-xs font-mono text-rose-300">
                {pattern}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Gate Tester" subtitle="Run a live governance check">
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault()
              if (isBusy) return
              setIsBusy(true)
              try {
                const result = await skillLabApi.runGate(gateInput)
                setLastGateResult(result)
              } finally {
                setIsBusy(false)
              }
            }}
          >
            <input
              value={gateInput}
              onChange={(event) => setGateInput(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 font-mono"
            />
            <CommandButton tone="primary" disabled={isBusy}>Run Gate Check</CommandButton>
          </form>

          {lastGateResult ? (
            <div className="mt-6 rounded-lg border border-white/5 bg-[#0a0a0a] p-4 text-xs font-mono">
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Gate Verdict</p>
              <p className={lastGateResult.exitCode === 0 ? "text-emerald-400" : "text-rose-400"}>
                {lastGateResult.stdout || lastGateResult.stderr || 'No output'}
              </p>
              <div className="mt-3 pt-3 border-t border-white/5 flex gap-4">
                <span className="text-slate-500">exit_code: {lastGateResult.exitCode}</span>
                <span className="text-slate-500">time: {lastGateResult.durationMs}ms</span>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  )
}
