"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { type ModelName, type ModelType, type NavItem, NAVITEMS, type RelEntity } from "~/types/types";

export interface AcOption {
  label: string;
  value: string | number;
  subheader?: string;
  image?: string;
}

export interface BaseAcFieldProps<T extends ModelName> {
  type: T;
  field_name: string;
  image_field?: keyof ModelType<T>;
  search_fields: string[];
  field_label: string;
}

export function Api2Options<T extends ModelName>(
  data: ModelType<T>[] | RelEntity<T>[],
  search_fields: string[],
  image_field?: keyof ModelType<T>
): AcOption[] {
  if (!data) return [];
  return data.map((obj: any) => {
    let label = search_fields.map((search_field) => {
      if (search_field === "username") {
        return `@${obj[search_field]}`;
      }
      return obj[search_field];
    });
    if (label.length === 0) label = [obj.id];
    const image = image_field ? obj[image_field] : undefined;
    return { label: label.join(", "), value: obj.id, image };
  });
}

export function debounce<T extends unknown[]>(func: (...args: T) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function createBaseEntity<T extends ModelName>(type: T) {
  return {
    id: 0,
    _type: type
  } as unknown as ModelType<T>;
}

// Custom hook for handling autocomplete state and API calls using tRPC
export function useAutocomplete<T extends ModelName>({
                                                       type,
                                                       search_fields,
                                                       image_field
                                                     }: BaseAcFieldProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const [nestedForm, setNestedForm] = useState<ModelType<T> | boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input
  const debounceFetch = useMemo(
    () => debounce((search: string) => setDebouncedSearch(search), 300),
    []
  );

  useEffect(() => {
    if (inputValue.trim() !== "") {
      debounceFetch(inputValue);
    } else {
      setDebouncedSearch("");
    }
  }, [inputValue, debounceFetch]);

  // Use tRPC query to fetch options
  const { data: entityData, isLoading } = api.entities.list.useQuery(
    {
      entityType: type,
      search: debouncedSearch,
      limit: 50, // Reasonable limit for autocomplete
      offset: 0,
    },
    {
      enabled: debouncedSearch.trim() !== "", // Only fetch when there's a search term
    }
  );

  // Transform API data to options
  const options = useMemo(() => {
    if (!entityData?.results) return [];
    return Api2Options(entityData.results as ModelType<T>[], search_fields, image_field);
  }, [entityData?.results, search_fields, image_field]);

  // Wrapper function to update inputValue
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const setNestedEntity = () => {
    setNestedForm(createBaseEntity(type));
  };

  return {
    options,
    inputValue,
    loading: isLoading,
    nestedForm,
    setInputValue: handleInputChange,
    setNestedForm,
    setNestedEntity,
    setOptions: () => {} // Keep for compatibility but not needed with tRPC
  };
}
