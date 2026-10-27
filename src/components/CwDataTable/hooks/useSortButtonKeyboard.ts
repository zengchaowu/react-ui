import { useCallback } from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { CwDataTableColumn } from '../types'
import { useBrowserFocusVisible } from '../../../hooks/useBrowserFocusVisible'

export interface UseSortButtonKeyboardOptions {
  visibleColumns: CwDataTableColumn[]
  handleSort: (column: CwDataTableColumn) => void
}

/** 排序按钮键盘支持 Hook */
export function useSortButtonKeyboard(options: UseSortButtonKeyboardOptions) {
  const { isFocusVisible, handleFocus, handleBlur } = useBrowserFocusVisible()

  const handleSortButtonFocus = useCallback(
    (_event: ReactFocusEvent<HTMLDivElement>) => {
      handleFocus()
    },
    [handleFocus],
  )

  const handleSortButtonBlur = useCallback(() => {
    handleBlur()
  }, [handleBlur])

  const handleSortButtonKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const column = options.visibleColumns.find((c) => c.sortable !== false)
        if (column) options.handleSort(column)
      }
    },
    [options.visibleColumns, options.handleSort],
  )

  return {
    isFocusVisible,
    tabindex: 0,
    handleSortButtonFocus,
    handleSortButtonBlur,
    handleSortButtonKeyDown,
  }
}
