import type { ReactNode } from 'react'
import type { SkillTier, TrustTier } from '../types'

export function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="rounded-xl glass-panel glow-border">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </header>
      <div className="p-6">{children}</div>
    </section>
  )
}

export function MetricCard({
  label,
  value,
  tone = 'default',
  detail,
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'warn' | 'info' | 'danger'
  detail?: string
}) {
  const toneMap: Record<string, string> = {
    default: 'text-slate-100',
    success: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]',
    warn: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]',
    info: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]',
    danger: 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]',
  }

  return (
    <article className="rounded-xl glass-panel glow-border p-5 transition-all hover:bg-slate-800/40">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-light tracking-tight ${toneMap[tone]}`}>{value}</p>
      {detail ? <p className="mt-2 font-mono text-[10px] uppercase text-slate-500">{detail}</p> : null}
    </article>
  )
}

export function StatusBadge({
  value,
  tone,
}: {
  value: string
  tone?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan' | 'gray'
}) {
  const toneMap: Record<string, string> = {
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_-2px_rgba(52,211,153,0.2)]',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_-2px_rgba(59,130,246,0.2)]',
    yellow: 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_-2px_rgba(251,191,36,0.2)]',
    red: 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_-2px_rgba(244,63,94,0.2)]',
    purple: 'border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-[0_0_10px_-2px_rgba(139,92,246,0.2)]',
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_-2px_rgba(6,182,212,0.2)]',
    gray: 'border-white/10 bg-white/5 text-slate-300',
  }

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${toneMap[tone ?? 'gray']}`}>
      {value}
    </span>
  )
}

export function SkillTierBadge({ tier }: { tier: SkillTier }) {
  return <StatusBadge value={tier} tone="blue" />
}

export function TrustTierBadge({ trust }: { trust: TrustTier }) {
  const tone = trust === 'T1' ? 'green' : trust === 'T4' ? 'red' : trust === 'T3' ? 'yellow' : 'cyan'
  return <StatusBadge value={trust} tone={tone} />
}

export function CommandButton({
  children,
  onClick,
  disabled,
  tone = 'default',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  tone?: 'default' | 'primary' | 'danger'
  className?: string
}) {
  const classes =
    tone === 'primary'
      ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] hover:bg-cyan-500/30'
      : tone === 'danger'
        ? 'border-rose-500/50 bg-rose-500/20 text-rose-50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)] hover:bg-rose-500/30'
        : 'border-white/10 bg-slate-800/50 text-slate-200 hover:border-white/20 hover:bg-slate-800/80'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-4 py-2 text-xs font-semibold tracking-wide transition-all ${classes} disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${className}`}
    >
      {children}
    </button>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center">
      <div className="h-10 w-10 rounded-full bg-slate-800/80 border border-white/5 flex items-center justify-center mb-4" />
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-2 text-xs text-slate-500 max-w-sm">{body}</p>
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-400 flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
      {label}
    </div>
  )
}

export function ErrorState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
      {label}
    </div>
  )
}

export function TerminalPanel({ lines }: { lines: Array<string> }) {
  return (
    <div className="min-h-[320px] rounded-xl border border-white/5 bg-[#0a0a0a] p-4 font-mono text-xs whitespace-pre-wrap shadow-inner overflow-y-auto">
      {lines.length === 0 ? (
        <p className="text-slate-600 italic">Waiting for terminal output...</p>
      ) : (
        lines.map((line, index) => {
          const isCommand = line.startsWith('$')
          const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')
          return (
            <p 
              key={`${line}-${index}`} 
              className={`leading-relaxed ${isCommand ? 'text-cyan-400 mt-2 font-semibold' : isError ? 'text-rose-400' : 'text-slate-300/80'}`}
            >
              {line}
            </p>
          )
        })
      )}
    </div>
  )
}
