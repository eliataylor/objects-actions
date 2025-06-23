"use client"

import { useState, useCallback, useEffect } from "react"
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material"
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material"
import { NAVITEMS, type ModelName } from "~/types/types"
import { useDebounce } from "~/hooks/useDebounce"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

interface SearchBoxProps {
  onSearch: (query: string, types: ModelName[]) => void
  defaultTypes?: ModelName[]
}

export function SearchBox({ onSearch, defaultTypes = [] }: SearchBoxProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") ?? "")
  const [selectedTypes, setSelectedTypes] = useState<ModelName[]>(
    searchParams.get("types")?.split(",").filter(Boolean) as ModelName[] ?? defaultTypes
  )

  // Filter out vocabulary types and admin-only types
  const searchableTypes = NAVITEMS.filter(item =>
    item.model_type !== 'vocabulary' &&
    item.permissions !== 'IsAdmin' &&
    item.search_fields.length > 0
  )

  const updateUrl = useCallback((query: string, types: ModelName[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set("query", query)
    } else {
      params.delete("query")
    }
    if (types.length > 0) {
      params.set("types", types.join(","))
    } else {
      params.delete("types")
    }
    
    // Update URL without triggering navigation
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`)
  }, [pathname, searchParams])

  const debouncedSearch = useDebounce((query: string, types: ModelName[]) => {
    onSearch(query, types)
    updateUrl(query, types)
  }, 300)

  const handleSearch = useCallback((query: string, types: ModelName[]) => {
    if (query.trim()) {
      debouncedSearch(query, types)
    }
  }, [debouncedSearch])

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setSearchQuery(newQuery)
    handleSearch(newQuery, selectedTypes)
  }

  const handleTypesChange = (_event: any, newTypes: ModelName[]) => {
    setSelectedTypes(newTypes)
    if (searchQuery.trim()) {
      handleSearch(searchQuery, newTypes)
    }
  }

  const handleClear = () => {
    setSearchQuery("")
    setSelectedTypes([])
    updateUrl("", [])
  }

  // Initialize from URL params on mount
  useEffect(() => {
    const query = searchParams.get("query")
    const types = searchParams.get("types")?.split(",").filter(Boolean) as ModelName[]
    
    if (query || types?.length) {
      setSearchQuery(query ?? "")
      setSelectedTypes(types ?? [])
      if (query) {
        onSearch(query, types ?? [])
      }
    }
  }, [])

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        display: 'flex',
        flexDirection: { xs: 'column' },
        gap: 1,
        alignItems: 'flex-start'
      }}
    >
      <Autocomplete
        multiple
        fullWidth
        value={selectedTypes}
        onChange={handleTypesChange}
        options={searchableTypes.map(item => item.type)}
        getOptionLabel={(option) =>
          searchableTypes.find(item => item.type === option)?.plural || option
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select types..."
            size="small"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={searchableTypes.find(item => item.type === option)?.plural}
              size="small"
              {...getTagProps({ index })}
            />
          ))
        }
      />

      <TextField
        fullWidth
        placeholder="Search..."
        value={searchQuery}
        onChange={handleQueryChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Paper>
  )
} 