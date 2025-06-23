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
  CircularProgress
} from "@mui/material"
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material"
import { NAVITEMS, type ModelName } from "~/types/types"
import { useDebounce } from "~/hooks/useDebounce"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import ApiClient from "../_components/ApiClient"

interface SearchBoxProps {
  onSearch: (query: string, types: ModelName[]) => void
  defaultTypes?: ModelName[]
}

interface AutocompleteSuggestion {
  id: number;
  label: string;
}

export function SearchBox({ onSearch, defaultTypes = [] }: SearchBoxProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") ?? "")
  const [selectedTypes, setSelectedTypes] = useState<ModelName[]>(
    searchParams.get("types")?.split(",").filter(Boolean) as ModelName[] ?? defaultTypes
  )
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filter out vocabulary types and admin-only types
  const searchableTypes = NAVITEMS.filter(item =>
    item.model_type !== 'vocabulary' &&
    item.permissions !== 'IsAdmin' &&
    item.search_fields.length > 0
  )

  // Fetch autocomplete suggestions
  const fetchAutocompleteSuggestions = useCallback(async (query: string, type: ModelName) => {
    if (!query.trim() || !type) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        query,
        types: type
      })
      const response = await ApiClient.get(`/api/search?${params.toString()}`)
      if (response.success && response.data?.results?.[type]) {
        const suggestions = response.data.results[type].items.map(item => ({
          id: item.id,
          label: item.name || item.title || `${item.id}`
        }))
        setAutocompleteSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Autocomplete error:', error)
      setAutocompleteSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedAutocomplete = useDebounce(fetchAutocompleteSuggestions, 300)

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
    
    // Only fetch autocomplete suggestions if exactly one type is selected
    if (selectedTypes.length === 1) {
      debouncedAutocomplete(newQuery, selectedTypes[0])
    } else {
      setAutocompleteSuggestions([])
    }
  }

  const handleTypesChange = (_event: any, newTypes: ModelName[]) => {
    setSelectedTypes(newTypes)
    setAutocompleteSuggestions([]) // Clear suggestions when types change
    if (searchQuery.trim()) {
      handleSearch(searchQuery, newTypes)
      // Fetch new autocomplete suggestions if exactly one type is selected
      if (newTypes.length === 1) {
        debouncedAutocomplete(searchQuery, newTypes[0])
      }
    }
  }

  const handleClear = () => {
    setSearchQuery("")
    setSelectedTypes([])
    setAutocompleteSuggestions([])
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

      <Autocomplete
        fullWidth
        freeSolo
        value={searchQuery}
        onChange={(_event, newValue) => {
          if (newValue) {
            setSearchQuery(newValue)
            handleSearch(newValue, selectedTypes)
          }
        }}
        onInputChange={(_event, newValue) => {
          setSearchQuery(newValue)
          handleSearch(newValue, selectedTypes)
        }}
        options={autocompleteSuggestions.map(suggestion => suggestion.label)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : searchQuery && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </Paper>
  )
} 