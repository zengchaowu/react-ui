import { useEffect, useRef } from 'react'
import { scrollElementIntoCwDivViewport } from '../../CwDiv/scrollElementIntoCwDivViewport'
import type { CwAutoCompleteOption } from '../types'

export interface UseAutoCompleteKeyboardOptions {
  popupVisible: boolean
  /** 触发器是否处于聚焦态 */
  triggerFocused: boolean
  options: CwAutoCompleteOption[]
  activeIndex: number
  setActiveIndex: (index: number) => void
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
 * CwAutoComplete 键盘支持（对齐 vue-ui `useAutoCompleteKeyboard`：全局 keydown 订阅）
 */
export function useAutoCompleteKeyboard(
  options: UseAutoCompleteKeyboardOptions,
): void {
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
        options: autoCompleteOptions,
        activeIndex,
        setActiveIndex,
        clearable = false,
        disabled = false,
        readonly = false,
        onSelect,
        onClose,
        onClear,
        onKeyboardInteract,
      } = optionsRef.current

      // 禁用状态不允许键盘操作
      if (disabled) return

      // 触发器聚焦且下拉未打开：处理删除键清空
      if (triggerFocused && !popupVisible) {
        if (readonly) {
          // Readonly 可聚焦但不允许清空
          if (
            clearable &&
            (event.key === 'Backspace' || event.key === 'Delete')
          ) {
            const target = event.target as HTMLElement | null
            if (
              target &&
              target.tagName === 'INPUT' &&
              (target as HTMLInputElement).value === ''
            ) {
              event.preventDefault()
            }
          }
          return
        }

        // 删除键清空（仅在 clearable 且非 readonly 时可用）
        if (
          clearable &&
          !readonly &&
          (event.key === 'Backspace' || event.key === 'Delete')
        ) {
          // 只在输入框为空时清空
          const target = event.target as HTMLElement | null
          if (
            target &&
            target.tagName === 'INPUT' &&
            (target as HTMLInputElement).value === ''
          ) {
            event.preventDefault()
            onClear()
          }
          return
        }
      }

      // 下拉未打开时无需导航
      if (!popupVisible) return

      // Readonly 状态下不允许通过键盘选择或关闭下拉框
      if (readonly) {
        if (event.key === 'Enter' || event.key === 'Escape') {
          event.preventDefault()
        }
        return
      }

      const enabledOptions = autoCompleteOptions.filter((opt) => !opt.disabled)
      const currentOption = autoCompleteOptions[activeIndex]
      const currentEnabledIndex =
        currentOption !== undefined ? enabledOptions.indexOf(currentOption) : -1

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          onKeyboardInteract?.()
          if (enabledOptions.length === 0) break

          if (currentEnabledIndex < enabledOptions.length - 1) {
            const nextIndex = autoCompleteOptions.indexOf(
              enabledOptions[currentEnabledIndex + 1]!,
            )
            setActiveIndex(nextIndex)
            scrollToIndex(nextIndex)
          } else {
            // 到达最后一个选项，循环到第一个
            const firstIndex = autoCompleteOptions.indexOf(enabledOptions[0]!)
            setActiveIndex(firstIndex)
            scrollToIndex(firstIndex)
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          onKeyboardInteract?.()
          if (enabledOptions.length === 0) break

          if (currentEnabledIndex === -1) {
            // 当前没有选中项：跳到最后一个
            const lastIndex = autoCompleteOptions.indexOf(
              enabledOptions[enabledOptions.length - 1]!,
            )
            setActiveIndex(lastIndex)
            scrollToIndex(lastIndex)
          } else if (currentEnabledIndex > 0) {
            const prevIndex = autoCompleteOptions.indexOf(
              enabledOptions[currentEnabledIndex - 1]!,
            )
            setActiveIndex(prevIndex)
            scrollToIndex(prevIndex)
          } else {
            // 到达第一个选项，循环到最后一个
            const lastIndex = autoCompleteOptions.indexOf(
              enabledOptions[enabledOptions.length - 1]!,
            )
            setActiveIndex(lastIndex)
            scrollToIndex(lastIndex)
          }
          break

        case 'Enter':
          event.preventDefault()
          if (
            activeIndex >= 0 &&
            activeIndex < autoCompleteOptions.length
          ) {
            onSelect(activeIndex)
            onClose()
          }
          break

        case 'Escape':
          event.preventDefault()
          onClose()
          break

        case 'Home':
          event.preventDefault()
          if (enabledOptions.length > 0) {
            const firstIndex = autoCompleteOptions.indexOf(enabledOptions[0]!)
            setActiveIndex(firstIndex)
            scrollToIndex(firstIndex)
          }
          break

        case 'End':
          event.preventDefault()
          if (enabledOptions.length > 0) {
            const lastIndex = autoCompleteOptions.indexOf(
              enabledOptions[enabledOptions.length - 1]!,
            )
            setActiveIndex(lastIndex)
            scrollToIndex(lastIndex)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeydown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])
}
