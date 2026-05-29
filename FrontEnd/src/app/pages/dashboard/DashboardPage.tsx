import { useAuth } from '@/features/auth/AuthContext'

/** Placeholder CRM home after sign-in; real widgets come later. */
export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Signed in as {user?.email ?? 'unknown'}
      </p>
      <button
        type="button"
        className="text-sm underline"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
    </main>
  )
}
