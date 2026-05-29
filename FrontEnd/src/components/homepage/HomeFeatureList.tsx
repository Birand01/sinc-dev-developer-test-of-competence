import { Filter, MessageSquare, Users } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Centralized Conversations',
    description: 'Manage all student inquiries in one place.',
  },
  {
    icon: Filter,
    title: 'Pipeline Insights',
    description: 'Track every deal from lead to enrollment.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Empower your team to work smarter together.',
  },
] as const

/** Marketing feature bullets for the home hero (left column). */
export function HomeFeatureList() {
  return (
    <ul className="flex flex-col gap-4">
      {features.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex gap-3">
          <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
