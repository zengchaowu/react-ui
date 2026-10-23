import { useEffect, useRef } from 'react'
import { scrollElementIntoCwDivViewport } from '../../CwDiv/scrollElementIntoCwDivViewport'
import type { CwSelectOption } from '../types'

export interface UseSelectKeyboardOptions {
  popupVisible: boolean
  /** 触发器是否处于聚焦态 */
  triggerFocused: boolean
  options: CwSelectOption[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  /** 是否可清空 */
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
  onSelect: (index: number) => void
  onOpen: () => void
  onClose: () => void
  onClear: () => void
  /** 组件唯一标识，用于定位选项 DOM */
  componentId: string
  /** 键盘交互回调 */
  onKeyboardInteract?: () => void
}

/**
 * CwSelect 键盘支持（对齐 vue-ui `useSelectKeyboard`：全局 keydown 订阅）
 */
export function useSelectKeyboard(options: UseSelectKeyboardOptions): void {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const scrollToIndex = (index: number) => {
      requestAnimationFrame(() => {
        scrollElementIntoCwDivViewport(
          document.getElementById(
            `${optionsRef.current.componentId}-option-${index}`,
          ),
        )
      })
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const {
        popupVisible,
        triggerFocused,
        options: selectOptions,
        selectedIndex,
        setSelectedIndex,
        clearable = false,
        disabled = false,
        readonly = false,
        onSelect,
        onOpen,
        onClose,
        onClear,
        onKeyboardInteract,
      } = optionsRef.current

      // 禁用状态不允许键盘操作
      if (disabled) return

      // 触发器聚焦且下拉未打开：处理 Space / ArrowDown / Enter 打开
      if (triggerFocused && !popupVisible) {
        if (readonly) {
          // Readonly 可聚焦但不允许打开下拉框
          if (
            event.key === ' ' ||
            event.key === 'Space' ||
            event.key === 'Enter' ||
            event.key === 'ArrowDown'
          ) {
            event.preventDefault()
          }
          return
        }

        if (event.key === ' ' || event.key === 'Space') {
          event.preventDefault()
          onOpen()
          return
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          onOpen()
          return
        }

        if (event.key === 'Enter') {
          event.preventDefault()
          onOpen()
          return
        }

        // 删除键清空（仅在 clearable 且非 readonly 时可用）
        if (
          clearable &&
          !readonly &&
          (event.key === 'Backspace' || event.key === 'Delete')
        ) {
          event.preventDefault()
          onClear()
          return
        }
      }

      if (!popupVisible) return

      // Readonly 状态不允许通过键盘选择或关闭下拉框
      if (readonly) {
        if (event.key === 'Enter' || event.key === 'Escape') {
          event.preventDefault()
        }
        return
      }

      const enabledOptions = selectOptions.filter((opt) => !opt.disabled)
      const currentOption = selectOptions[selectedIndex]
      const currentEnabledIndex = currentOption
        ? enabledOptions.indexOf(currentOption)
        : -1

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          onKeyboardInteract?.()
          if (enabledOptions.length === 0) break

          if (currentEnabledIndex < enabledOptions.length - 1) {
            const nextIndex = selectOptions.indexOf(
              enabledOptions[currentEnabledIndex + 1]!,
            )
            setSelectedIndex(nextIndex)
            scrollToIndex(nextIndex)
          } else {
            // 到达最后一个选项，循环到第一个
            const firstIndex = selectOptions.indexOf(enabledOptions[0]!)
            setSelectedIndex(firstIndex)
            scrollToIndex(firstIndex)
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          onKeyboardInteract?.()
          if (enabledOptions.length === 0) break

          if (currentEnabledIndex === -1) {
            const lastIndex = selectOptions.indexOf(
              enabledOptions[enabledOptions.length - 1]!,
            )
            setSelectedIndex(lastIndex)
            scrollToIndex(lastIndex)
          } else if (currentEnabledIndex > 0) {
            const prevIndex = selectOptions.indexOf(
              enabledOptions[currentEnabledIndex - 1]!,
            )
            setSelectedIndex(prevIndex)
            scrollToIndex(prevIndex)
          } else {
            // 到达第一个选项，循环到最后一个
            const lastIndex = selectOptions.indexOf(
              enabledOptions[enabledOptions.length - 1]!,
            )
            setSelectedIndex(lastIndex)
            scrollToIndex(lastIndex)
          }
          break

        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < selectOptions.length) {
            onSelect(selectedIndex)
            onClose()
          }
          break

        // 触发器聚焦时空格切换（兜底：若仍保持触发器焦点）
        case ' ':
        case 'Space':
          if (triggerFocused) {
            event.preventDefault()
            onClose()
            return
          }
          break

        case 'Escape':
          event.preventDefault()
          onClose()
          break

        case 'Home':
          event.preventDefault()
          if (enabledOptions.length > 0) {
            const firstIndex = selectOptions.indexOf(enabledOptions[0]!)
            setSelectedIndex(firstIndex)
            scrollToIndex(firstIndex)
          }
          break

        case 'End':
          event.preventDefault()
          if (enabledOptions.length > 0) {
            const lastIndex = selectOptions.indexOf(
              enabledOptions[enabledOptions.length - 1]!,
            )
            setSelectedIndex(lastIndex)
            scrollToIndex(lastIndex)
          }
          break

        case 'Tab':
          // 只有当前聚焦且下拉框打开的组件才处理 Tab 键
          if (!triggerFocused) return

          event.preventDefault()
          onKeyboardInteract?.()
          if (enabledOptions.length === 0) break

          if (event.shiftKey) {
            // Shift+Tab: 向上切换
            if (currentEnabledIndex === -1) {
              const lastIndex = selectOptions.indexOf(
                enabledOptions[enabledOptions.length - 1]!,
              )
              setSelectedIndex(lastIndex)
              scrollToIndex(lastIndex)
            } else if (currentEnabledIndex > 0) {
              const prevIndex = selectOptions.indexOf(
                enabledOptions[currentEnabledIndex - 1]!,
              )
              setSelectedIndex(prevIndex)
              scrollToIndex(prevIndex)
            } else {
              const lastIndex = selectOptions.indexOf(
                enabledOptions[enabledOptions.length - 1]!,
              )
              setSelectedIndex(lastIndex)
              scrollToIndex(lastIndex)
            }
          } else if (currentEnabledIndex < enabledOptions.length - 1) {
            const nextIndex = selectOptions.indexOf(
              enabledOptions[currentEnabledIndex + 1]!,
            )
            setSelectedIndex(nextIndex)
            scrollToIndex(nextIndex)
          } else {
            const firstIndex = selectOptions.indexOf(enabledOptions[0]!)
            setSelectedIndex(firstIndex)
            scrollToIndex(firstIndex)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeydown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])
}
