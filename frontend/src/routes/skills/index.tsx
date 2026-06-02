import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import type { SkillTier, TrustTier } from '~/features/skill-lab/types'
import {
  SectionCard,
  StatusBadge,
  EmptyState,
  SkillTierBadge,
  TrustTierBadge,
  CommandButton,
} from '~/features/skill-lab/components/primitives'
import { Search } from 'lucide-react'

export const Route = createFileRoute('/skills/')({
  component: SkillsCatalog,
})

function SkillsCatalog() {
  const [registry, setRegistry] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<'all' | SkillTier>('all')
  const [trustFilter, setTrustFilter] = useState<'all' | TrustTier>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all')

  useEffect(() => {
    skillLabApi.getRegistry().then(setRegistry).catch(() => {})
  }, [])

  const skills = registry?.skills ?? []

  const filteredSkills = useMemo(() => {
    return skills.filter((skill: any) => {
      const matchesSearch =
        !searchTerm ||
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTier = tierFilter === 'all' || skill.tier === tierFilter
      const matchesTrust = trustFilter === 'all' || skill.trustTier === trustFilter
      const matchesStatus = statusFilter === 'all' || skill.status === statusFilter

      return matchesSearch && matchesTier && matchesTrust && matchesStatus
    })
  }, [skills, searchTerm, tierFilter, trustFilter, statusFilter])

  return (
    <div className="space-y-6">
      <SectionCard title="Skill Catalog" subtitle="Universal skill registry as source of truth">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search skills..."
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 pl-10 pr-4 py-2 text-sm text-slate-200 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value as 'all' | SkillTier)}
            className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 outline-none appearance-none"
          >
            <option value="all">All tiers</option>
            <option value="planning">planning</option>
            <option value="functional">functional</option>
            <option value="atomic">atomic</option>
            <option value="governance">governance</option>
            <option value="acquisition">acquisition</option>
            <option value="evaluation">evaluation</option>
          </select>
          <select
            value={trustFilter}
            onChange={(event) => setTrustFilter(event.target.value as 'all' | TrustTier)}
            className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 outline-none appearance-none"
          >
            <option value="all">All trust tiers</option>
            <option value="T1">T1</option>
            <option value="T2">T2</option>
            <option value="T3">T3</option>
            <option value="T4">T4</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 outline-none appearance-none"
          >
            <option value="all">All statuses</option>
            <option value="active">active</option>
            <option value="draft">draft</option>
            <option value="quarantined">quarantined</option>
            <option value="deprecated">deprecated</option>
          </select>
        </div>
      </SectionCard>

      {filteredSkills.length === 0 ? (
        <EmptyState title="No matching skills" body="Adjust filters or search text." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSkills.map((skill: any) => (
            <article
              key={skill.name}
              className="group flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900/40 p-5 transition-all hover:bg-slate-800/40 hover:border-cyan-500/30"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold tracking-wide text-cyan-50">{skill.name}</h3>
                    <p className="mt-1 font-mono text-[10px] uppercase text-slate-500">{skill.path}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge value={skill.status} tone={skill.status === 'active' ? 'green' : 'yellow'} />
                    <div className="flex gap-1.5">
                      <SkillTierBadge tier={skill.tier} />
                      <TrustTierBadge trust={skill.trustTier} />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400 line-clamp-3">{skill.description}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/5">
                <Link to="/skills/$skillId" params={{ skillId: skill.name }} className="flex-1">
                  <CommandButton tone="primary" className="w-full justify-center">View Details</CommandButton>
                </Link>
                <CommandButton onClick={() => skillLabApi.runPrompt(`Run skill ${skill.name}`)}>
                  Run
                </CommandButton>
                <CommandButton onClick={() => skillLabApi.runEval()}>
                  Eval
                </CommandButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
