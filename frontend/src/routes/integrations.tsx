import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  StatusBadge,
  EmptyState,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/integrations')({
  component: IntegrationsOverview,
})

function IntegrationsOverview() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    skillLabApi.getProviders().then(setProviders).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <SectionCard title="Provider Routing Console" subtitle="providers.yaml configuration">
        {!providers ? (
          <EmptyState title="Provider config unavailable" body="Could not load providers.yaml" />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 pb-6 border-b border-white/5 mb-6">
              <StatusBadge value={`default: ${providers.defaultProvider}`} tone="cyan" />
              <StatusBadge value={`model: ${providers.defaultModel}`} tone="blue" />
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Role Mappings</h4>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              {Object.entries(providers.roles).map(([role, config]: [string, any]) => (
                <div key={role} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 p-4">
                  <p className="text-sm font-semibold tracking-wide text-slate-200 capitalize">{role}</p>
                  <p className="font-mono text-xs text-cyan-400">
                    {config.provider} <span className="text-slate-600">/</span> {config.model}
                  </p>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Available Providers</h4>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(providers.providers ?? {}).map(([name, config]: [string, any]) => {
                const enabled = config.enabled === true
                const envConfigured = providers.envStatus?.[name]
                return (
                  <div key={name} className="flex flex-col justify-between rounded-lg border border-white/5 bg-slate-900/40 p-5 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold tracking-wide text-slate-100 capitalize">{name}</p>
                      <StatusBadge value={enabled ? 'enabled' : 'disabled'} tone={enabled ? 'green' : 'gray'} />
                    </div>
                    {typeof config.env_key === 'string' ? (
                      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="font-mono text-[10px] text-slate-500">{config.env_key}</span>
                        <div className={`h-2 w-2 rounded-full ${envConfigured ? 'bg-emerald-400' : 'bg-rose-500'}`} title={envConfigured ? 'Configured' : 'Missing'} />
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  )
}
