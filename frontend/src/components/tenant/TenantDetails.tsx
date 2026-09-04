import type { Tenant } from '../../types/tenant'

type TenantDetailsProps = {
  tenant: Tenant | undefined
}

export function TenantDetails({ tenant }: TenantDetailsProps) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-300" htmlFor="tenant-name">
          Tenant
        </label>
        <input
          id="tenant-name"
          value={tenant?.name ?? 'Unknown tenant'}
          readOnly
          className="modern-input rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-300" htmlFor="region">
          Region
        </label>
        <input
          id="region"
          value={tenant?.region ?? 'n/a'}
          readOnly
          className="modern-input rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none"
        />
      </div>
    </div>
  )
}
