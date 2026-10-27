import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import CwCascaderPanel from '../CwCascaderPanel/CwCascaderPanel'
import { buildCascaderColumns } from '../CwCascaderPanel/functions/buildCascaderColumns'
import { scrollElementIntoCwDivViewport } from '@zengchaowu/ui-shared/components/CwDiv/scrollElementIntoCwDivViewport'
import type {
  CwCascaderPanelOption,
  CwCascaderPanelValue,
} from '../CwCascaderPanel/types'
import type { CwCascaderSheetOption } from './types'

export interface CwCascaderSheetContentProps {
  options: CwCascaderSheetOption[]
  initialValue: CwCascaderPanelValue[]
  disabled: boolean
  readonly: boolean
  emptyText: string
  idPrefix: string
  onChange: (
    value: CwCascaderPanelValue[],
    option: CwCascaderSheetOption | null,
  ) => void
  onComplete: () => void
  /** 请求关闭 Sheet（Esc / 左侧收起） */
  onRequestClose: () => void
}

/**
 * Sheet 内的级联面板内容。
 * `showDynamicSheet` 保存的是渲染时的 ReactNode，故内容组件自持交互状态，
 * 通过回调把值同步给宿主（对齐 Vue 版本中闭包读 ref 的行为）。
 */
export function CwCascaderSheetContent({
  options,
  initialValue,
  disabled,
  readonly,
  emptyText,
  idPrefix,
  onChange,
  onComplete,
  onRequestClose,
}: CwCascaderSheetContentProps) {
  const [currentValue, setCurrentValue] =
    useState<CwCascaderPanelValue[]>(initialValue)
  const [activePathIndex, setActivePathIndex] = useState(-1)
  const [activeIndexPerLevel, setActiveIndexPerLevel] = useState<number[]>([])
  const [hasKeyboardInteracted, setHasKeyboardInteracted] = useState(false)

  const currentValueRef = useRef(currentValue)
  const activePathIndexRef = useRef(activePathIndex)
  const activeIndexPerLevelRef = useRef(activeIndexPerLevel)

  const setValue = useCallback((next: CwCascaderPanelValue[]) => {
    currentValueRef.current = next
    setCurrentValue(next)
  }, [])

  const setPathIndex = useCallback((next: number) => {
    activePathIndexRef.current = next
    setActivePathIndex(next)
  }, [])

  const setIndexes = useCallback((next: number[]) => {
    activeIndexPerLevelRef.current = next
    setActiveIndexPerLevel(next)
  }, [])

  const columns = useMemo(
    () => buildCascaderColumns(options, currentValue),
    [options, currentValue],
  )

  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const onSelectActive = useCallback(
    (level: number, idx: number) => {
      const items = buildCascaderColumns(
        options,
        currentValueRef.current,
      )[level] || []
      const item = items[idx]
      if (!item || item.disabled) return

      const nextPath = currentValueRef.current.slice(0, level)
      nextPath[level] = item.value
      setValue(nextPath)
      onChange(nextPath, item)

      if (!item.children || item.children.length === 0) {
        onComplete()
      }
    },
    [options, onChange, onComplete, setValue],
  )

  const scrollActiveIntoView = useCallback(() => {
    const level = activePathIndexRef.current
    const idx = activeIndexPerLevelRef.current[level]
    if (level < 0 || idx == null || idx < 0) return
    const id = `${idPrefix}-node-${level}-${idx}`
    requestAnimationFrame(() => {
      scrollElementIntoCwDivViewport(document.getElementById(id))
    })
  }, [idPrefix])

  useEffect(() => {
    const run = () => {
      columnsRef.current.forEach((levelItems, level) => {
        const items = levelItems || []
        const selectedVal = currentValueRef.current[level]
        let targetIdx = -1
        if (selectedVal !== undefined) {
          targetIdx = items.findIndex(
            (o) => o.value === selectedVal && !o.disabled,
          )
        }
        if (targetIdx < 0) {
          const idxFromActive = activeIndexPerLevelRef.current[level]
          targetIdx =
            idxFromActive != null && idxFromActive >= 0
              ? idxFromActive
              : items.findIndex((o) => !o.disabled)
        }
        if (level >= 0 && targetIdx >= 0) {
          const id = `${idPrefix}-node-${level}-${targetIdx}`
          scrollElementIntoCwDivViewport(document.getElementById(id), {
            block: 'center',
          })
        }
      })
    }
    requestAnimationFrame(() => {
      run()
      requestAnimationFrame(run)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 打开后把焦点列 / 各项索引对准已选路径（对齐 Vue nextTick 逻辑）
  useEffect(() => {
    if (columns.length > 0) {
      const desiredLevel =
        currentValue.length > 0 ? currentValue.length - 1 : 0
      setPathIndex(
        Math.max(0, Math.min(desiredLevel, columns.length - 1)),
      )

      setIndexes(
        columns.map((levelOptions, levelIdx) => {
          const selectedVal = currentValue[levelIdx]
          const selectedIdx =
            selectedVal !== undefined
              ? levelOptions.findIndex(
                  (o) => o.value === selectedVal && !o.disabled,
                )
              : -1
          if (selectedIdx >= 0) {
            return -1
          }
          return levelOptions.findIndex((o) => !o.disabled)
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const optionsRef = useRef({
    disabled,
    readonly,
    columns,
    onSelectActive,
    onRequestClose,
    setPathIndex,
    setIndexes,
    scrollActiveIntoView,
    activePathIndexRef,
    activeIndexPerLevelRef,
    currentValueRef,
  })
  optionsRef.current = {
    disabled,
    readonly,
    columns,
    onSelectActive,
    onRequestClose,
    setPathIndex,
    setIndexes,
    scrollActiveIntoView,
    activePathIndexRef,
    activeIndexPerLevelRef,
    currentValueRef,
  }

  useEffect(() => {
    const ensureActive = () => {
      const current = optionsRef.current
      if (current.activePathIndexRef.current < 0) {
        current.setPathIndex(
          Math.max(0, current.columns.length - 1),
        )
      }
      if (
        current.activeIndexPerLevelRef.current.length <
        current.columns.length
      ) {
        const next = [...current.activeIndexPerLevelRef.current]
        for (let i = next.length; i < current.columns.length; i++) {
          next.push(-1)
        }
        current.setIndexes(next)
      }
    }

    const normalizeFocus = () => {
      const current = optionsRef.current
      const activeLevel = current.activePathIndexRef.current
      if (activeLevel < 0) return
      current.setIndexes(
        current.activeIndexPerLevelRef.current.map((idx, level) =>
          level === activeLevel ? idx : -1,
        ),
      )
    }

    const move = (delta: 1 | -1) => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return

      ensureActive()
      const level = current.activePathIndexRef.current
      const items = current.columns[level] || []
      if (!items.length) return
      const enabled = items.filter((o) => !o.disabled)
      if (enabled.length === 0) return
      const currentIdx = current.activeIndexPerLevelRef.current[level]

      let baseIdx = currentIdx
      if (currentIdx < 0 && current.currentValueRef.current[level] !== undefined) {
        const selectedValue = current.currentValueRef.current[level]
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
      current.setIndexes(next)
      normalizeFocus()
      current.scrollActiveIntoView()
    }

    const selectCurrent = () => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return

      ensureActive()
      const level = current.activePathIndexRef.current
      let idx = current.activeIndexPerLevelRef.current[level]

      if (idx < 0 && current.currentValueRef.current[level] !== undefined) {
        const items = current.columns[level] || []
        const selectedValue = current.currentValueRef.current[level]
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

      current.onSelectActive(level, idx)
      const items = current.columns[level] || []
      const item = items[idx]
      if (item?.children && item.children.length) {
        current.setPathIndex(level + 1)
        requestAnimationFrame(() => {
          const latest = optionsRef.current
          const nextLevelItems = latest.columns[level + 1] || []
          const next = [...latest.activeIndexPerLevelRef.current]
          while (next.length <= level + 1) next.push(-1)
          next[level + 1] = nextLevelItems.findIndex((o) => !o.disabled)
          latest.setIndexes(next)
          normalizeFocus()
          latest.scrollActiveIntoView()
        })
      }
    }

    const collapse = () => {
      const current = optionsRef.current
      if (current.activePathIndexRef.current > 0) {
        const newLevel = current.activePathIndexRef.current - 1
        current.setPathIndex(newLevel)
        const items = current.columns[newLevel] || []
        const selectedVal = current.currentValueRef.current[newLevel]
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
        current.setIndexes(next)
        normalizeFocus()
      } else {
        current.onRequestClose()
      }
    }

    const jump = (edge: 'start' | 'end') => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return

      ensureActive()
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
      current.setIndexes(next)
      normalizeFocus()
      current.scrollActiveIntoView()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          move(1)
          break
        case 'ArrowUp':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          move(-1)
          break
        case 'Tab':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          if (event.shiftKey) {
            move(-1)
          } else {
            move(1)
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          selectCurrent()
          current.scrollActiveIntoView()
          break
        case 'ArrowLeft':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          collapse()
          current.scrollActiveIntoView()
          break
        case 'Home':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          jump('start')
          break
        case 'End':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          jump('end')
          break
        case 'Enter':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          selectCurrent()
          break
        case ' ':
        case 'Space':
          event.preventDefault()
          setHasKeyboardInteracted(true)
          selectCurrent()
          break
        case 'Escape':
          event.preventDefault()
          onRequestClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeydown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeydown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePanelChange = (
    nextValue: CwCascaderPanelValue[],
    option: CwCascaderPanelOption | null,
  ) => {
    setValue(nextValue)
    onChange(nextValue, option)
  }

  return (
    <CwCascaderPanel
      appearance="sheet"
      idPrefix={idPrefix}
      options={options}
      value={currentValue}
      disabled={disabled}
      readonly={readonly}
      emptyText={emptyText}
      activePathIndex={activePathIndex}
      activeIndexPerLevel={activeIndexPerLevel}
      showFocusHighlight={hasKeyboardInteracted || activePathIndex >= 0}
      optionTabIndex={true}
      onChange={handlePanelChange}
      onComplete={onComplete}
      onOptionFocus={(levelIndex, itemIndex) => {
        if (disabled) return
        setPathIndex(levelIndex)
        setIndexes(
          activeIndexPerLevelRef.current.map((idx, level) =>
            level === levelIndex ? itemIndex : idx,
          ),
        )
      }}
    />
  )
}

export default CwCascaderSheetContent
