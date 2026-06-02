import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  StatusBadge,
  EmptyState,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/history')({
  component: HistoryOverview,
})

function HistoryOverview() {
  const [runHistory, setRunHistory] = useState<any>(null)

  useEffect(() => {
    skillLabApi.getRunHistory().then(setRunHistory).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <SectionCard title="Run History" subtitle="Global execution ledger (run-history.ndjson)">
        {(runHistory?.entries ?? []).length === 0 ? (
          <EmptyState title="No history entries" body="Run commands from the Terminal or Catalog to generate history." />
        ) : (
          <div className="space-y-4">
            {(runHistory?.entries ?? []).map((entry: any) => (
              <div key={`${entry.timestamp}-${entry.command}`} className="rounded-xl border border-white/5 bg-slate-900/40 p-5 hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-mono text-sm text-cyan-400">{entry.command}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-slate-500">{entry.durationMs}ms</span>
                    <StatusBadge value={entry.ok ? 'success' : 'failed'} tone={entry.ok ? 'green' : 'red'} />
                  </div>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 mt-4 pt-4 border-t border-white/5">
                  {entry.stdoutPreview && (
                    <div className="rounded-lg bg-[#0a0a0a] border border-white/5 p-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">STDOUT Preview</span>
                      <p className="font-mono text-xs text-slate-300 line-clamp-3 leading-relaxed">{entry.stdoutPreview}</p>
                    </div>
                  )}
                  {entry.stderrPreview && (
                    <div className="rounded-lg bg-rose-500/5 border border-rose-500/10 p-3">
                      <span className="text-[10px] uppercase tracking-wider text-rose-500/70 font-semibold block mb-2">STDERR Preview</span>
                      <p className="font-mono text-xs text-rose-300 line-clamp-3 leading-relaxed">{entry.stderrPreview}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
