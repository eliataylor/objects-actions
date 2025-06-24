import { useCallback, useRef } from "react"

type DebouncedFunction<T extends (...args: any[]) => void> = T & {
  cancel: () => void
}

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): DebouncedFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as DebouncedFunction<T>

  debouncedFn.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return debouncedFn
} 