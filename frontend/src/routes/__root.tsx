import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
  useRouterState,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Library,
  Network,
  Cpu,
  ShieldAlert,
  Activity,
  History,
  Settings,
  Terminal,
} from 'lucide-react'
import appCss from '~/styles/app.css?url'
import { skillLabApi } from '~/features/skill-lab/api'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Agent Skill Registry' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div className="p-8 text-red-500">Route not found</div>,
  component: RootComponent,
})

const NAV_ITEMS = [
  { id: '/', label: 'Overview', icon: LayoutDashboard },
  { id: '/skills', label: 'Skill Catalog', icon: Library },
  { id: '/integrations', label: 'Integrations', icon: Network },
  { id: '/mcp', label: 'MCP Servers', icon: Cpu },
  { id: '/governance', label: 'Governance', icon: ShieldAlert },
  { id: '/evals', label: 'Eval Harness', icon: Activity },
  { id: '/history', label: 'Run History', icon: History },
  { id: '/cli', label: 'Terminal', icon: Terminal },
  { id: '/settings', label: 'Settings', icon: Settings },
]

function RootComponent() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Basic health check to show in the sidebar
  const [health, setHealth] = React.useState<any>(null)
  
  React.useEffect(() => {
    skillLabApi.getHealth().then(setHealth).catch(() => setHealth(null))
  }, [])

  return (
    <RootDocument>
      <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
        {/* Background glow effects - Graphite inspired */}
        <div className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-900/20 blur-[120px]" />
        
        {/* Sidebar - Clerk inspired */}
        <aside className="relative z-10 flex w-[260px] flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur-xl">
          <div className="flex h-16 items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu size={18} />
              </div>
              <span className="font-semibold tracking-wide text-slate-100 text-sm">Agent Registry</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            <div className="px-3 mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Menu
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.id || (item.id !== '/' && currentPath.startsWith(item.id))
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-white/5">
            <div className="rounded-lg bg-slate-900/60 border border-white/5 p-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${health?.ok ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-400'}`} />
                <span className="text-xs text-slate-300 font-medium">
                  {health?.ok ? 'System Online' : 'Offline / Degraded'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center border-b border-white/5 bg-slate-900/20 px-8 backdrop-blur-md">
            <div className="flex items-center text-sm text-slate-400 font-medium">
              <span className="text-slate-500">Registry</span>
              <span className="mx-2">/</span>
              <span className="text-slate-200 capitalize">
                {currentPath === '/' ? 'Overview' : currentPath.split('/')[1]}
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
