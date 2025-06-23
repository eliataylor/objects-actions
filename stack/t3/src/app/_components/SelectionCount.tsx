import { Chip } from "@mui/material"
import type { ModelName } from "~/types/types"
import Link from "next/link"

interface SelectionCountProps {
  type: ModelName
  selectedIds?: string[]
  showZero?: boolean
}

export function SelectionCount({ 
  type, 
  selectedIds = [], 
  showZero = false 
}: SelectionCountProps) {
  const count = selectedIds.length

  if (count === 0 && !showZero) {
    return null
  }

  const chip = (
    <Chip
      label={`${count} selected`}
      color="primary"
      size="small"
      variant="outlined"
      sx={{ 
        height: 24,
        '& .MuiChip-label': {
          fontSize: '0.75rem',
          px: 1
        },
        cursor: count > 1 ? 'pointer' : 'default'
      }}
    />
  )

  if (count > 1) {
    const searchParams = new URLSearchParams()
    searchParams.set('selected', selectedIds.join(','))
    
    return (
      <Link 
        href={`/compare/${type.toLowerCase()}?${searchParams.toString()}`}
        style={{ textDecoration: 'none' }}
      >
        {chip}
      </Link>
    )
  }

  return chip
} 