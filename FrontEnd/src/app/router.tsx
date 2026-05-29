import { Route, Routes } from 'react-router-dom'

import { HomePage } from '@/app/pages/home/HomePage'
import { LoginPage } from '@/app/pages/login/LoginPage'

/**
 * URL → screen mapping for the CRM.
 * BrowserRouter lives in main.tsx; route definitions stay here as the app grows.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
