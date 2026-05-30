import { Input } from '@/components/ui/form/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select'

export type PipelineOwnerOption = {
  id: string
  label: string
}

type PipelineToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  ownerFilter: string
  onOwnerFilterChange: (value: string) => void
  ownerOptions: PipelineOwnerOption[]
}

const ALL_OWNERS = 'all'

/** Pipeline filters — owner (GET ?ownerId=) and title search (?q=). */
export function PipelineToolbar({
  search,
  onSearchChange,
  ownerFilter,
  onOwnerFilterChange,
  ownerOptions,
}: PipelineToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <label
          htmlFor="pipeline-owner-filter"
          className="text-muted-foreground text-sm whitespace-nowrap"
        >
          Owner
        </label>
        <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
          <SelectTrigger
            id="pipeline-owner-filter"
            className="w-full sm:w-[180px]"
            aria-label="Filter by owner"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OWNERS}>All</SelectItem>
            {ownerOptions.map((owner) => (
              <SelectItem key={owner.id} value={owner.id}>
                {owner.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        type="search"
        placeholder="Search deals…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search deals"
        className="w-full sm:max-w-xs"
      />
    </div>
  )
}

export { ALL_OWNERS as pipelineOwnerFilterAll }
