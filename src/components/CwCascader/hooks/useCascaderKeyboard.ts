import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { scrollElementIntoCwDivViewport } from '@zengchaowu/ui-shared/components/CwDiv/scrollElementIntoCwDivViewport'
import type {
  CwCascaderPanelOption,
  CwCascaderPanelValue,
} from '../../CwCascaderPanel/types'

export interface UseCascaderKeyboardOptions {
  popupVisible: boolean
  triggerFocused: boolean
  clearable?: boolean
  componentId: string
  columns: CwCascaderPanelOption[][]
  modelValue: CwCascaderPanelValue[]
  activePathIndexRef: MutableRefObject<number>
  activeIndexPerLevelRef: MutableRefObject<number[]>
  setActivePathIndex: (value: number) => void
  setActiveIndexPerLevel: (value: number[]) => void
  onOpen: () => void
  onClose: () => void
  onClear: () => void
  onSelectActive: (level: number, index: number) => void
  onKeyboardInteract?: () => void
}

/**
 * CwCascader 键盘支持（对齐 vue-ui `useCascaderKeyboard`：全局 keydown 订阅）
 */
export function useCascaderKeyboard(options: UseCascaderKeyboardOptions): void {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const setPathIndex = (value: number) => {
      const current = optionsRef.current
      current.activePathIndexRef.current = value
      current.setActivePathIndex(value)
    }

    const setIndexes = (value: number[]) => {
      const current = optionsRef.current
      current.activeIndexPerLevelRef.current = value
      current.setActiveIndexPerLevel(value)
    }

    const ensureActive = () => {
      const current = optionsRef.current
      if (current.activePathIndexRef.current < 0) {
        setPathIndex(Math.max(0, current.columns.length - 1))
      }
      if (
        current.activeIndexPerLevelRef.current.length <
        current.columns.length
      ) {
        const next = [...current.activeIndexPerLevelRef.current]
        for (
          let i = next.length;
          i < current.columns.length;
          i++
        ) {
          next.push(-1)
        }
        setIndexes(next)
      }
    }

    // 仅保留当前激活列的焦点索引，其他列置为 -1，避免切换列时的焦点闪烁
    const normalizeFocus = () => {
      const current = optionsRef.current
      const activeLevel = current.activePathIndexRef.current
      if (activeLevel < 0) return
      setIndexes(
        current.activeIndexPerLevelRef.current.map((idx, level) =>
          level === activeLevel ? idx : -1,
        ),
      )
    }

    const scrollActiveIntoView = () => {
      const current = optionsRef.current
      const level = current.activePathIndexRef.current
      const idx = current.activeIndexPerLevelRef.current[level]
      if (level < 0 || idx == null || idx < 0) return
      const id = `${current.componentId}-node-${level}-${idx}`
      requestAnimationFrame(() => {
        scrollElementIntoCwDivViewport(document.getElementById(id))
      })
    }

    const move = (delta: 1 | -1) => {
      ensureActive()
      const current = optionsRef.current
      const level = current.activePathIndexRef.current
      const items = current.columns[level] || []
      if (!items.length) return
      const enabled = items.filter((o) => !o.disabled)
      if (enabled.length === 0) return
      const currentIdx = current.activeIndexPerLevelRef.current[level]

      // 如果有选中值，以选中值作为起点；否则以当前激活索引为起点
      let baseIdx = currentIdx
      if (currentIdx < 0 && current.modelValue[level] !== undefined) {
        const selectedValue = current.modelValue[level]
        const selectedIdx = items.findIndex(
          (o) => o.value === selectedValue && !o.disabled,
        )
        if (selectedIdx >= 0) {
          baseIdx = selectedIdx
        }
      }

      const currentEnabledIndex = enabled.findIndex(
        (e) => items.indexOf(e) === baseIdx,
      )
      const next = [...current.activeIndexPerLevelRef.current]
      while (next.length <= level) next.push(-1)

      if (delta === 1) {
        if (currentEnabledIndex < enabled.length - 1) {
          next[level] = items.indexOf(enabled[currentEnabledIndex + 1])
        } else {
          next[level] = items.indexOf(enabled[0])
        }
      } else {
        if (currentEnabledIndex < 0) {
          next[level] = items.indexOf(enabled[enabled.length - 1])
        } else if (currentEnabledIndex > 0) {
          next[level] = items.indexOf(enabled[currentEnabledIndex - 1])
        } else {
          next[level] = items.indexOf(enabled[enabled.length - 1])
        }
      }
      setIndexes(next)
      normalizeFocus()
    }

    const selectCurrent = () => {
      ensureActive()
      const current = optionsRef.current
      const level = current.activePathIndexRef.current
      let idx = current.activeIndexPerLevelRef.current[level]

      // 如果当前激活为 -1，但有选中值，以选中值作为当前位置
      if (idx < 0 && current.modelValue[level] !== undefined) {
        const items = current.columns[level] || []
        const selectedValue = current.modelValue[level]
        const selectedIdx = items.findIndex(
          (o) => o.value === selectedValue && !o.disabled,
        )
        if (selectedIdx >= 0) {
          idx = selectedIdx
        } else {
          return
        }
      }

      if (idx < 0) return

      const items = current.columns[level] || []
      const item = items[idx]

      // Enter：选中当前项，如果有子列则展开到子列第一项，否则关闭
      current.onSelectActive(level, idx)
      if (item?.children && item.children.length) {
        // 等待 modelValue 和 columns 更新完成
        setPathIndex(level + 1)
        requestAnimationFrame(() => {
          const latest = optionsRef.current
          const nextLevelItems = latest.columns[level + 1] || []
          const next = [...latest.activeIndexPerLevelRef.current]
          while (next.length <= level + 1) next.push(-1)
          next[level + 1] = nextLevelItems.findIndex((o) => !o.disabled)
          setIndexes(next)
          normalizeFocus()
          scrollActiveIntoView()
        })
      }
    }

    const expand = () => {
      // 右箭头就是选中，行为同 Enter
      selectCurrent()
    }

    const collapse = () => {
      const current = optionsRef.current
      if (current.activePathIndexRef.current > 0) {
        const newLevel = current.activePathIndexRef.current - 1
        setPathIndex(newLevel)
        // 收起到父级时，应让焦点落在父级“选中项”，若无选中则落在第一个可用项
        const items = current.columns[newLevel] || []
        const selectedVal = current.modelValue[newLevel]
        let idx = -1
        if (selectedVal !== undefined) {
          idx = items.findIndex(
            (o) => o.value === selectedVal && !o.disabled,
          )
        }
        if (idx < 0) {
          idx = items.findIndex((o) => !o.disabled)
        }
        const next = [...current.activeIndexPerLevelRef.current]
        while (next.length <= newLevel) next.push(-1)
        next[newLevel] = idx
        setIndexes(next)
        normalizeFocus()
      } else {
        current.onClose()
      }
    }

    const jump = (edge: 'start' | 'end') => {
      ensureActive()
      const current = optionsRef.current
      const level = current.activePathIndexRef.current
      const items = current.columns[level] || []
      if (!items.length) return
      let idx = edge === 'start' ? 0 : items.length - 1
      if (items[idx]?.disabled) {
        const step = edge === 'start' ? 1 : -1
        for (let i = idx; i >= 0 && i < items.length; i += step) {
          if (!items[i]?.disabled) {
            idx = i
            break
          }
        }
      }
      const next = [...current.activeIndexPerLevelRef.current]
      while (next.length <= level) next.push(-1)
      next[level] = idx
      setIndexes(next)
      normalizeFocus()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const current = optionsRef.current

      // 触发器聚焦且下拉未打开：处理 Space/Enter/ArrowDown 打开，Backspace/Delete 清空
      if (current.triggerFocused && !current.popupVisible) {
        if (
          event.key === ' ' ||
          event.key === 'Space' ||
          event.key === 'Enter' ||
          event.key === 'ArrowDown'
        ) {
          event.preventDefault()
          current.onOpen()
          return
        }
        if (
          (current.clearable ?? false) &&
          (event.key === 'Backspace' || event.key === 'Delete')
        ) {
          event.preventDefault()
          current.onClear()
          return
        }
      }

      if (!current.popupVisible) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          current.onKeyboardInteract?.()
          move(1)
          scrollActiveIntoView()
          break
        case 'ArrowUp':
          event.preventDefault()
          current.onKeyboardInteract?.()
          move(-1)
          scrollActiveIntoView()
          break
        case 'Tab':
          // 下拉打开时，Tab/Shift+Tab 等同上下移动，避免浏览器切换焦点
          event.preventDefault()
          current.onKeyboardInteract?.()
          if (event.shiftKey) {
            move(-1)
          } else {
            move(1)
          }
          scrollActiveIntoView()
          break
        case 'ArrowRight':
          event.preventDefault()
          current.onKeyboardInteract?.()
          expand()
          scrollActiveIntoView()
          break
        case 'ArrowLeft':
          event.preventDefault()
          current.onKeyboardInteract?.()
          collapse()
          scrollActiveIntoView()
          break
        case 'Home':
          event.preventDefault()
          current.onKeyboardInteract?.()
          jump('start')
          scrollActiveIntoView()
          break
        case 'End':
          event.preventDefault()
          current.onKeyboardInteract?.()
          jump('end')
          scrollActiveIntoView()
          break
        case 'Enter':
          event.preventDefault()
          current.onKeyboardInteract?.()
          selectCurrent()
          break
        case ' ':
        case 'Space':
          if (current.triggerFocused) {
            event.preventDefault()
            current.onClose()
          }
          break
        case 'Escape':
          event.preventDefault()
          current.onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeydown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])
}
