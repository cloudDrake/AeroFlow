import type { Tenant } from '../../types/tenant'
import { SignInForm } from '../auth/SignInForm'
import { TenantSelector } from '../tenant/TenantSelector'

type AppHeaderProps = {
  sessionReady: boolean
  email: string
  password: string
  authError: string | null
  tenants: Tenant[]
  effectiveTenantId: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSignIn: () => void
  onTenantChange: (tenantId: string) => void
  onToggleOverview: () => void
}

export function AppHeader({
  sessionReady,
  email,
  password,
  authError,
  tenants,
  effectiveTenantId,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onTenantChange,
  onToggleOverview
}: AppHeaderProps) {
  return (
    <header className="glass-panel flex flex-col gap-4 rounded-[1.5rem] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          Aero Flow
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {!sessionReady ? (
          <SignInForm
            email={email}
            password={password}
            authError={authError}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onSignIn={onSignIn}
          />
        ) : (
          <>
            <TenantSelector tenants={tenants} value={effectiveTenantId} onChange={onTenantChange} />
            <button
              type="button"
              onClick={onToggleOverview}
              className="secondary-button rounded-xl border border-slate-600/80 bg-slate-950/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100"
            >
              Status
            </button>
          </>
        )}
      </div>
    </header>
  )
}
