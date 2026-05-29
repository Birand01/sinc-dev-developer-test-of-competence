import { HomeHero } from '@/components/homepage/HomeHero'
import { HomeLoginPanel } from '@/components/homepage/HomeLoginPanel'

/** Public landing (`/`): hero + sign-in side by side. */
export function HomePage() {
  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      <HomeHero />
      <HomeLoginPanel />
    </main>
  )
}
