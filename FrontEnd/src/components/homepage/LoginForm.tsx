import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/form/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { AUTHENTICATED_HOME } from '@/features/auth/constants'
import { getSupabase } from '@/lib/supabase'

/** Email/password sign-in for the home page auth panel. */
export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setIsSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate(AUTHENTICATED_HOME, { replace: true })
  }

  return (
    <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <Label htmlFor="home-email">Email</Label>
          <Input
            id="home-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="manager@studentcrm.test"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="home-password">Password</Label>
          <Input
            id="home-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4">
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>
    </form>
  )
}
