import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  StatusBadge,
  CommandButton,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/evals')({
  component: EvalsOverview,
})

function EvalsOverview() {
  const [report, setReport] = useState<any>(null)
  const [isBusy, setIsBusy] = useState(false)

  const loadReport = () => {
    skillLabApi.getLatestReport().then(setReport).catch(() => {})
  }

  useEffect(() => {
    loadReport()
  }, [])

  const handleRunEval = async () => {
    if (isBusy) return
    setIsBusy(true)
    await skillLabApi.runEval()
    loadReport()
    setIsBusy(false)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Eval Harness" subtitle="harness/reports/latest.json" actions={
        <div className="flex gap-2">
          <CommandButton onClick={loadReport} disabled={isBusy}>Refresh Report</CommandButton>
          <CommandButton tone="primary" onClick={handleRunEval} disabled={isBusy}>Run Full Eval</CommandButton>
        </div>
      }>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-900/40 px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Status:</span>
            <StatusBadge value={report?.ok ? 'passed' : 'pending'} tone={report?.ok ? 'green' : 'yellow'} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-900/40 px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Summary:</span>
            <span className="text-sm font-medium text-cyan-400">{report?.summary ?? 'No summary available'}</span>
          </div>
        </div>

        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Raw Report Payload</h4>
        <pre className="max-h-[500px] overflow-auto rounded-xl border border-white/5 bg-[#0a0a0a] p-5 text-xs text-slate-300 font-mono shadow-inner">
          {JSON.stringify(report?.data ?? { status: 'Waiting for report data...' }, null, 2)}
        </pre>
      </SectionCard>
    </div>
  )
}
