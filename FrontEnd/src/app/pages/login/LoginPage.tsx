import { Navigate } from 'react-router-dom'

/** Alias route — canonical login UI lives on `/` (HomePage). */
export function LoginPage() {
  return <Navigate to="/" replace />
}
