type SignInFormProps = {
  email: string
  password: string
  authError: string | null
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSignIn: () => void
}

export function SignInForm({
  email,
  password,
  authError,
  onEmailChange,
  onPasswordChange,
  onSignIn
}: SignInFormProps) {
  return (
    <div className="min-w-[320px] space-y-2">
      <span className="text-xs font-medium text-slate-300">Sign in</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="email"
          className="modern-input w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
        />
        <input
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          type="password"
          placeholder="password"
          className="modern-input w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
        />
        <button
          onClick={onSignIn}
          className="primary-button rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.45)] transition hover:brightness-110"
        >
          Login
        </button>
      </div>
      {authError && <small className="block text-xs text-rose-300">{authError}</small>}
    </div>
  )
}
