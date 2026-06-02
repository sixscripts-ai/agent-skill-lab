import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  CommandButton,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/settings')({
  component: SettingsOverview,
})

function SettingsOverview() {
  const [health, setHealth] = useState<any>(null)
  const [runtime, setRuntime] = useState<any>(null)
  const [dedupeName, setDedupeName] = useState('project-diagnostic')
  const [dedupeDescription, setDedupeDescription] = useState(
    'Audits project structure and produces standardized AI context.',
  )
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    skillLabApi.getHealth().then(setHealth).catch(() => {})
    skillLabApi.getRuntime().then(setRuntime).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <SectionCard title="Environment Profile" subtitle="Read-only cockpit view of active paths">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Registry Root</h4>
            <p className="font-mono text-sm text-cyan-400 break-all">{health?.skillsHome ?? '~/ai-skills'}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Active Host Profile</h4>
            <p className="text-sm font-medium text-slate-200">{runtime?.activeHost ?? 'unknown'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Dedupe Tester" subtitle="semantic-deduplicator helper endpoint">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (isBusy) return
            setIsBusy(true)
            await skillLabApi.runDedupe(dedupeName, dedupeDescription)
            setIsBusy(false)
          }}
        >
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">Skill Name</label>
            <input
              value={dedupeName}
              onChange={(event) => setDedupeName(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 font-mono"
              placeholder="e.g. project-diagnostic"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">Description</label>
            <textarea
              value={dedupeDescription}
              onChange={(event) => setDedupeDescription(event.target.value)}
              className="h-32 w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
              placeholder="Describe what the skill does..."
            />
          </div>
          <div className="pt-2">
            <CommandButton tone="primary" disabled={isBusy}>Run Deduplicator</CommandButton>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
