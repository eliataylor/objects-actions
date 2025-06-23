"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ModelName, ModelType } from "~/types/types"

interface SelectionContextType {
  selectedItems: Record<ModelName, ModelType<ModelName>[]>
  toggleSelection: (item: ModelType<ModelName>) => void
  isSelected: (item: ModelType<ModelName>) => boolean
  clearSelections: () => void
  getItemsByType: (type: string) => ModelType<ModelName>[]
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<Record<ModelName, ModelType<ModelName>[]>>({} as Record<ModelName, ModelType<ModelName>[]>)

  const toggleSelection = (item: ModelType<ModelName>) => {
    setSelectedItems(prev => {
      const type = item._type
      const currentItems = prev[type] || []
      const isItemSelected = currentItems.some(i => i.id === item.id)

      if (isItemSelected) {
        return {
          ...prev,
          [type]: currentItems.filter(i => i.id !== item.id)
        }
      } else {
        return {
          ...prev,
          [type]: [...currentItems, item]
        }
      }
    })
  }

  const isSelected = (item: ModelType<ModelName>) => {
    const type = item._type
    return (selectedItems[type] || []).some(i => i.id === item.id)
  }

  const clearSelections = () => {
    setSelectedItems({} as Record<ModelName, ModelType<ModelName>[]>)
  }

  const getItemsByType = (type: string): ModelType<ModelName>[] => {
    // Find the matching type case-insensitively
    const matchingType = Object.keys(selectedItems).find(
      key => key.toLowerCase() === type.toLowerCase()
    ) as ModelName | undefined

    return matchingType ? selectedItems[matchingType] : []
  }

  return (
    <SelectionContext.Provider value={{ 
      selectedItems, 
      toggleSelection, 
      isSelected, 
      clearSelections,
      getItemsByType
    }}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider")
  }
  return context
} 