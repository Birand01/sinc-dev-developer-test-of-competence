import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { ClientSignUpForm } from '@/components/homepage/ClientSignUpForm'
import { LoginForm } from '@/components/homepage/LoginForm'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs'

/** Fixed height so tab switches do not resize the card; children use h-full for bottom actions. */
const AUTH_FORM_PANEL_CLASS = 'flex h-[22.5rem] flex-col'

const AUTH_TAB_TRIGGER_CLASS =
  'h-full rounded-md text-zinc-700 hover:bg-zinc-400/80 hover:text-zinc-950 data-[state=active]:border-zinc-600 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50 data-[state=active]:shadow-md dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-50 dark:data-[state=active]:border-zinc-500 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-white'

/** Right column: sign-in and client sign-up in one card. */
export function HomeLoginPanel() {
  return (
    <aside className="flex w-full items-center justify-center px-4 py-10 lg:w-[min(440px,42%)] lg:min-h-svh lg:border-l lg:bg-background lg:px-10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>
            Sign in or create a client account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sign-in" className="w-full">
            <TabsList className="mb-6 grid h-11 w-full grid-cols-2 gap-1 rounded-lg bg-zinc-300/90 p-1 shadow-inner dark:bg-zinc-800">
              <TabsTrigger value="sign-in" className={AUTH_TAB_TRIGGER_CLASS}>
                Sign in
              </TabsTrigger>
              <TabsTrigger value="sign-up" className={AUTH_TAB_TRIGGER_CLASS}>
                Create account
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className={AUTH_FORM_PANEL_CLASS}>
              <LoginForm />
            </TabsContent>
            <TabsContent value="sign-up" className={AUTH_FORM_PANEL_CLASS}>
              <ClientSignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </aside>
  )
}
