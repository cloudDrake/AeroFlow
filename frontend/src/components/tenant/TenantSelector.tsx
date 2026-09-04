import type { Tenant } from '../../types/tenant'

type TenantSelectorProps = {
  tenants: Tenant[]
  value: string
  onChange: (tenantId: string) => void
}

export function TenantSelector({ tenants, value, onChange }: TenantSelectorProps) {
  return (
    <label className="flex min-w-[220px] flex-col gap-2">
      <span className="text-xs font-medium text-slate-300">Tenant</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="modern-input rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-indigo-400"
      >
        {tenants.map(item => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}
