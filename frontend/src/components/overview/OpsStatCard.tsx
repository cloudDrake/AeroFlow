import type { ReactNode } from 'react'

type OpsStatCardProps = {
  label: string
  children: ReactNode
}

export function OpsStatCard({ label, children }: OpsStatCardProps) {
  return (
    <div className="ops-card rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <span className="text-sm text-slate-300">{label}</span>
      {children}
    </div>
  )
}
