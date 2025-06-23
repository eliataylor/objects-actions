"use client";

import { useState, useCallback, useEffect } from "react";
import {
  TextField,
  Box,
  Paper,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type ModelName, NAVITEMS } from "~/types/types";

interface SearchBarProps {
  currentType: ModelName;
  placeholder?: string;
  onSearchChange?: (query: string) => void;
}

export default function SearchBar({ 
  currentType, 
  placeholder,
  onSearchChange 
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") ?? ""
  );
  
  // Get current nav item info
  const currentNavItem = NAVITEMS.find(item => item.type === currentType);
  const isSearchable = currentNavItem?.search_fields && 
                      currentNavItem.search_fields.length > 0;

  // Update URL when search changes
  const updateSearchUrl = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    
    // Reset pagination when searching
    params.delete("offset");
    
    // Update URL
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
    
    // Call callback if provided
    onSearchChange?.(query);
  }, [pathname, searchParams, router, onSearchChange]);

  // Handle search input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  // Handle search submission
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateSearchUrl(searchQuery);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchQuery("");
    updateSearchUrl("");
  };

  // Sync with URL params on mount/navigation
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch ?? "");
    }
  }, [searchParams]);

  if (!isSearchable) {
    return null; // Don't render search bar for non-searchable types
  }

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder={
              placeholder || 
              `Search ${currentNavItem?.plural?.toLowerCase() || 'items'}...`
            }
            value={searchQuery}
            onChange={handleInputChange}
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>

        {/* Search info */}
        {searchQuery && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Searching in: {currentNavItem?.search_fields?.join(', ')}
            </Typography>
            <Chip
              size="small"
              label={`"${searchQuery}"`}
              onDelete={handleClear}
              variant="outlined"
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
} 