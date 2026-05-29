import { HomeFeatureList } from '@/components/homepage/HomeFeatureList'

/** Left column: brand, headline, features. */
export function HomeHero() {
  return (
    <section className="flex flex-1 flex-col justify-center px-6 py-10 lg:px-12 lg:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex items-center gap-2">
          <img
            src="/favicon.svg"
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0"
            aria-hidden
          />
          <span className="text-lg font-semibold tracking-tight">
            SINC Sales CRM
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Build Stronger Relationships.{' '}
          <span className="text-primary">Close More Deals.</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
          Manage conversations, track pipelines, and grow admissions in one
          place.
        </p>

        <div className="mt-8">
          <HomeFeatureList />
        </div>
      </div>
    </section>
  )
}
