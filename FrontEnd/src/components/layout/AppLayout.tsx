import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { staffRoutes } from '@/app/staffRoutes'
import { Avatar, AvatarFallback } from '@/components/ui/display/avatar'
import { Separator } from '@/components/ui/display/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay/dropdown-menu'
import { Input } from '@/components/ui/form/input'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useMe } from '@/features/auth/hooks/useMe'
import { authQueryKeys } from '@/features/auth/lib/queryKeys'
import { AppRole } from '@/features/auth/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

function profileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

/** Authenticated shell: top bar, staff nav, user menu, page outlet. */
export function AppLayout() {
  const queryClient = useQueryClient()
  const { signOut } = useAuth()
  const { data: me, isLoading, isError, error } = useMe()

  async function handleSignOut() {
    await signOut()
    queryClient.removeQueries({ queryKey: authQueryKeys.me })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm" role="status">
          Loading profile…
        </p>
      </div>
    )
  }

  if (isError || !me) {
    const message =
      error instanceof ApiError ? error.message : 'Could not load profile'
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6">
        <p className="text-destructive text-sm" role="alert">
          {message}
        </p>
        <p className="text-muted-foreground text-xs">
          Check Worker is running and seed profile exists.
        </p>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => void handleSignOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  const showStaffNav = me.role !== AppRole.Client

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <img
              src="/favicon.svg"
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0"
              aria-hidden
            />
            <span className="truncate text-sm font-semibold tracking-tight">
              SINC Sales CRM
            </span>
          </div>

          <div className="mx-auto hidden w-full max-w-md sm:block">
            <Input
              type="search"
              placeholder="Search..."
              disabled
              aria-label="Search (coming soon)"
              className="bg-muted/40"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="ml-auto flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar size="sm">
                <AvatarFallback className="text-xs">
                  {profileInitials(me.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[8rem] truncate font-medium sm:inline">
                {me.fullName}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium">{me.fullName}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {me.role}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleSignOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showStaffNav ? (
          <>
            <Separator />
            <nav
              className="flex gap-1 overflow-x-auto px-4 lg:px-6"
              aria-label="Main"
            >
              {staffRoutes.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    cn(
                      'border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </>
        ) : null}
      </header>

      <main className="flex-1">
        {showStaffNav ? (
          // React Router renders the active child <Route> here (Dashboard, Clients, …).
          <Outlet />
        ) : (
          <div className="p-6">
            <p className="text-muted-foreground text-sm">
              Client portal routes are not wired yet.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
