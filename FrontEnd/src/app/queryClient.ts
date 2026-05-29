import { QueryClient } from '@tanstack/react-query'

/** Shared React Query cache for all routes (see QueryClientProvider in main.tsx). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})
