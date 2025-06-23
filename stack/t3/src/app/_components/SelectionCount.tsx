"use client"

import { Chip } from "@mui/material"
import { useSelection } from "~/contexts/SelectionContext"
import type { ModelName } from "~/types/types"
import Link from "next/link"

interface SelectionCountProps {
  type: ModelName
  showZero?: boolean
}

export function SelectionCount({ type, showZero = false }: SelectionCountProps) {
  const { selectedItems } = useSelection()
  const count = selectedItems[type]?.length ?? 0

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
    return (
      <Link 
        href={`/compare/${type.toLowerCase()}`}
        style={{ textDecoration: 'none' }}
      >
        {chip}
      </Link>
    )
  }

  return chip
} 