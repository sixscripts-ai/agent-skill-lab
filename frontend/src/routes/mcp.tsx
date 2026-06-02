import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import {
  SectionCard,
  StatusBadge,
  EmptyState,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/mcp')({
  component: McpOverview,
})

function McpOverview() {
  const [mcp, setMcp] = useState<any>(null)

  useEffect(() => {
    skillLabApi.getMcp().then(setMcp).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <SectionCard title="MCP Servers" subtitle="Model Context Protocol configuration">
        {!mcp ? (
          <EmptyState title="MCP config unavailable" body="Could not load mcp.yaml" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(mcp.servers).map(([name, server]: [string, any]) => (
              <div key={name} className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900/40 p-5 hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold tracking-wide text-cyan-50">{name}</h3>
                    <StatusBadge value={server.enabled ? 'enabled' : 'disabled'} tone={server.enabled ? 'cyan' : 'gray'} />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">{server.purpose}</p>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                  <StatusBadge value={server.trustTier} tone="yellow" />
                  {server.envKey ? (
                    <StatusBadge
                      value={`${server.envKey}: ${server.envConfigured ? 'ok' : 'missing'}`}
                      tone={server.envConfigured ? 'green' : 'red'}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
