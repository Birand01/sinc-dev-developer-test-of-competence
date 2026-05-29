import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/form/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'

/** Client registration form — Supabase sign-up wiring comes in the next step. */
export function ClientSignUpForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    // TODO: supabase.auth.signUp + profile + clients row
    setIsSubmitting(false)
  }

  return (
    <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-full-name">Full name</Label>
          <Input
            id="signup-full-name"
            name="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-phone">Phone (optional)</Label>
          <Input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+90 555 000 0000"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </div>
    </form>
  )
}
