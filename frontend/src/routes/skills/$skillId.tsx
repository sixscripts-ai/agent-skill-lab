import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  EmptyState,
  CommandButton,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/skills/$skillId')({
  component: SkillDetail,
})

function SkillDetail() {
  const { skillId } = Route.useParams()
  const [registry, setRegistry] = useState<any>(null)

  useEffect(() => {
    skillLabApi.getRegistry().then(setRegistry).catch(() => {})
  }, [])

  const skill = registry?.skills?.find((s: any) => s.name === skillId)

  if (!registry) return <div className="p-8 animate-pulse text-slate-500 text-center">Loading skill details...</div>

  if (!skill) {
    return <EmptyState title="Skill not found" body={`Could not find skill with ID: ${skillId}`} />
  }

  return (
    <div className="space-y-6">
      <SectionCard title={skill.name} subtitle="Skill package inspector" actions={
        <div className="flex gap-2">
          <CommandButton tone="primary" onClick={() => skillLabApi.runPrompt(`Run skill ${skill.name}`)}>
            Run Skill
          </CommandButton>
          <CommandButton onClick={() => skillLabApi.runEval()}>Run Eval</CommandButton>
        </div>
      }>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-[#0a0a0a] border border-white/5 p-4 font-mono text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Tier</span>
              <span className="text-cyan-400">{skill.tier}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Trust Tier</span>
              <span className="text-emerald-400">{skill.trustTier}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Status</span>
              <span className="text-slate-200">{skill.status}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Path</span>
              <span className="text-slate-400 text-xs break-all">{skill.path}</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Description</h4>
            <p className="text-sm leading-relaxed text-slate-300">{skill.description}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="SKILL.md preview" subtitle="File parser and markdown renderer">
        <EmptyState
          title="Coming soon"
          body="Raw SKILL.md and frontmatter parsing will be connected in the next increment."
        />
      </SectionCard>
    </div>
  )
}
