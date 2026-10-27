import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { CwTag } from '../CwTag/CwTag'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import { selectTagsBase } from '@zengchaowu/ui-shared/components/CwSelectTags/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwSelectTags/texts'
import type { CwSelectTagsProps, CwSelectTagsTag } from './types'
import type { CwSelectTagsTexts } from '@zengchaowu/ui-shared/components/CwSelectTags/types'

export interface CwSelectTagsComponentProps
  extends CwSelectTagsProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'onChange' | 'onFocus' | 'onBlur'
    > {
  className?: string
}

const SIZE_CLASS_MAP = {
  small: selectTagsBase.sizeSmall,
  medium: selectTagsBase.sizeMedium,
  large: selectTagsBase.sizeLarge,
} as const

const PLACEHOLDER_SIZE_CLASS_MAP = {
  small: selectTagsBase.placeholderSizeSmall,
  medium: selectTagsBase.placeholderSizeMedium,
  large: selectTagsBase.placeholderSizeLarge,
} as const

const EMPTY_TAGS: CwSelectTagsTag[] = []

export function CwSelectTags({
  tags = [],
  value = [],
  selectAll,
  collapseSelectAll = true,
  maxRows,
  disabled = false,
  readonly = false,
  placeholder,
  label,
  showLabel = false,
  closable = true,
  tagSize = 'medium',
  size,
  tagType = 'default',
  selectAllText,
  moreText,
  texts: textsProp,
  suffixSlot,
  onChange,
  onSelectAllChange,
  onTagClick,
  onTagClose,
  onMoreClick,
  onFocus,
  onBlur,
  className,
  ...rest
}: CwSelectTagsComponentProps) {
  const texts = useMemo<CwSelectTagsTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  /** 触发器容器高度（与 CwInput / CwSelect 的 size 对齐） */
  const wrapperSize = size || 'medium'

  const effectiveTagSize = tagSize

  const wrapperSizeClass = SIZE_CLASS_MAP[wrapperSize]
  const placeholderSizeClass = PLACEHOLDER_SIZE_CLASS_MAP[wrapperSize]

  const tagsWrapperRef = useRef<HTMLDivElement | null>(null)
  const tagsContainerRef = useRef<HTMLDivElement | null>(null)
  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

  const [visibleTags, setVisibleTags] = useState<CwSelectTagsTag[]>([])
  const [showMoreTag, setShowMoreTag] = useState(false)
  const [moreCount, setMoreCount] = useState(0)
  const [measureTick, setMeasureTick] = useState(0)

  const isSelectAll = useMemo(() => {
    if (selectAll !== undefined) return selectAll
    if (!tags.length) return false
    if (!value.length) return false
    return value.length === tags.length
  }, [selectAll, tags, value])

  /** 全选时折叠为单个「全选」标签（collapseSelectAll 默认 true） */
  const showCollapsedSelectAll = isSelectAll && collapseSelectAll

  const selectedTags = useMemo(
    () => tags.filter((tag) => value.includes(tag.value)),
    [tags, value],
  )

  const selectedTagsRef = useRef(selectedTags)
  selectedTagsRef.current = selectedTags

  const displayLabel = label ?? texts.label
  const displayPlaceholder = placeholder ?? texts.placeholder
  const displaySelectAllText = selectAllText ?? texts.selectAll
  const displayMoreText = (
    moreText ??
    texts.more ??
    defaultTexts.more ??
    '+{count}'
  ).replace('{count}', moreCount.toString())

  // 计算可见的标签（考虑最大行数限制，对齐 Vue 的 nextTick 测量）
  const resetKeyRef = useRef<{
    tags: CwSelectTagsTag[]
    maxRows: number | undefined
    collapsed: boolean
    tick: number
  } | null>(null)

  useLayoutEffect(() => {
    const previousKey = resetKeyRef.current
    const resetChanged =
      !previousKey ||
      previousKey.tags !== selectedTags ||
      previousKey.maxRows !== maxRows ||
      previousKey.collapsed !== showCollapsedSelectAll ||
      previousKey.tick !== measureTick

    if (resetChanged) {
      resetKeyRef.current = {
        tags: selectedTags,
        maxRows,
        collapsed: showCollapsedSelectAll,
        tick: measureTick,
      }

      const targetTags =
        showCollapsedSelectAll || selectedTags.length === 0
          ? EMPTY_TAGS
          : selectedTags

      setShowMoreTag(false)
      setMoreCount(0)

      if (visibleTags !== targetTags) {
        setVisibleTags(targetTags)
        return
      }
    }

    // 折叠全选 / 无选中项 / 无行数限制时不测量
    if (showCollapsedSelectAll || selectedTags.length === 0) return
    if (!maxRows || maxRows <= 0) return

    // 只在全量渲染后测量一次，折叠后不再重测（避免循环）
    if (visibleTags.length !== selectedTags.length) return

    const container = tagsContainerRef.current
    if (!container) return

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-cw-select-tags-item]'),
    )
    const firstTag = elements[0]
    if (!firstTag) {
      setShowMoreTag(false)
      setMoreCount(0)
      return
    }

    const tagHeight = firstTag.offsetHeight
    if (!tagHeight) return

    // 与 styles.tagsContainer 的 gap-1（0.25rem）一致
    const gap = 4
    const lineHeight = tagHeight + gap
    const computedStyle = getComputedStyle(container)
    const paddingY =
      (parseFloat(computedStyle.paddingTop) || 0) +
      (parseFloat(computedStyle.paddingBottom) || 0)
    // 行高上限 + 上下 padding，避免 py 把测量高度抬高后误判「超出」
    const maxHeight = lineHeight * maxRows - gap + paddingY

    if (container.offsetHeight <= maxHeight) {
      if (showMoreTag) setShowMoreTag(false)
      if (moreCount !== 0) setMoreCount(0)
      return
    }

    const baseTop = firstTag.offsetTop
    let visibleCount = elements.filter(
      (el) => el.offsetTop - baseTop < maxHeight - tagHeight / 2,
    ).length

    // 如果可见数量为0，至少显示一个
    if (visibleCount === 0) visibleCount = 1

    // 需要为更多标签留出空间
    if (visibleCount < elements.length) {
      visibleCount = Math.max(1, visibleCount - 1)
    }

    if (visibleCount >= selectedTags.length) {
      if (showMoreTag) setShowMoreTag(false)
      if (moreCount !== 0) setMoreCount(0)
      return
    }

    setVisibleTags(selectedTags.slice(0, visibleCount))
    setShowMoreTag(true)
    setMoreCount(selectedTags.length - visibleCount)
  }, [
    selectedTags,
    visibleTags,
    maxRows,
    measureTick,
    showCollapsedSelectAll,
    showMoreTag,
    moreCount,
  ])

  // 窗口大小变化时重新计算
  useEffect(() => {
    const wrapper = tagsWrapperRef.current
    if (!wrapper || typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver(() => {
      setVisibleTags(selectedTagsRef.current)
      setShowMoreTag(false)
      setMoreCount(0)
      setMeasureTick((tick) => tick + 1)
    })
    resizeObserver.observe(wrapper)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // 事件处理
  const handleWrapperClick = useCallback(() => {
    if (disabled) return
    tagsWrapperRef.current?.focus()
  }, [disabled])

  const handleFocus = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>) => {
      if (disabled) return
      handleFocusVisibleFocus()
      onFocus?.(event.nativeEvent)
    },
    [disabled, handleFocusVisibleFocus, onFocus],
  )

  const handleBlur = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>) => {
      handleFocusVisibleBlur()
      onBlur?.(event.nativeEvent)
    },
    [handleFocusVisibleBlur, onBlur],
  )

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled || readonly) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        tagsWrapperRef.current?.focus()
      }
    },
    [disabled, readonly],
  )

  const handleTagClick = useCallback(
    (tag: CwSelectTagsTag, event: MouseEvent) => {
      if (disabled || readonly) return
      onTagClick?.(tag, event)
    },
    [disabled, readonly, onTagClick],
  )

  const handleTagClose = useCallback(
    (tag: CwSelectTagsTag, event: MouseEvent) => {
      if (disabled || readonly) return
      const newValue = value.filter((v) => v !== tag.value)
      onChange?.(newValue, false)
      onTagClose?.(tag, event)
    },
    [disabled, readonly, value, onChange, onTagClose],
  )

  const handleSelectAllClick = useCallback(
    (event: MouseEvent) => {
      if (disabled || readonly) return
      const label = displaySelectAllText ?? defaultTexts.selectAll ?? '全选'
      onTagClick?.({ label, value: 'select-all' }, event)
    },
    [disabled, readonly, displaySelectAllText, onTagClick],
  )

  const handleSelectAllClose = useCallback(() => {
    if (disabled || readonly) return
    onSelectAllChange?.(false)
    onChange?.([], false)
  }, [disabled, readonly, onSelectAllChange, onChange])

  const handleMoreClick = useCallback(
    (event: MouseEvent) => {
      if (disabled || readonly) return
      onMoreClick?.(event)
    },
    [disabled, readonly, onMoreClick],
  )

  return (
    <div
      {...rest}
      className={[
        selectTagsBase.root,
        disabled
          ? selectTagsBase.rootDisabled
          : readonly
            ? selectTagsBase.rootReadonly
            : selectTagsBase.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Label */}
      {showLabel ? (
        <div
          className={[
            selectTagsBase.label,
            disabled ? selectTagsBase.labelDisabled : selectTagsBase.labelNormal,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayLabel}
        </div>
      ) : null}

      {/* Tags Wrapper */}
      <div
        ref={tagsWrapperRef}
        className={[
          selectTagsBase.tagsWrapper,
          wrapperSizeClass,
          disabled
            ? selectTagsBase.tagsWrapperDisabled
            : readonly
              ? selectTagsBase.tagsWrapperReadonly
              : selectTagsBase.tagsWrapperNormal,
          isFocusVisible && !disabled ? selectTagsBase.tagsWrapperFocus : '',
        ]
          .filter(Boolean)
          .join(' ')}
        tabIndex={disabled ? undefined : 0}
        role="button"
        aria-disabled={disabled ? 'true' : 'false'}
        onClick={handleWrapperClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {/* Tags Container */}
        <div ref={tagsContainerRef} className={selectTagsBase.tagsContainer}>
          {showCollapsedSelectAll ? (
            <CwTag
              content={displaySelectAllText}
              closable={closable && !disabled && !readonly}
              disabled={disabled}
              readonly={readonly}
              type={tagType}
              size={effectiveTagSize}
              className={selectTagsBase.tagItem}
              onClose={handleSelectAllClose}
              onClick={handleSelectAllClick}
            />
          ) : visibleTags.length > 0 ? (
            <>
              {visibleTags.map((tag) => (
                <CwTag
                  key={tag.value}
                  data-cw-select-tags-item=""
                  content={tag.label}
                  closable={closable && !disabled && !readonly}
                  disabled={disabled}
                  readonly={readonly}
                  type={tagType}
                  size={effectiveTagSize}
                  className={[selectTagsBase.tagItem, 'tag-item']
                    .filter(Boolean)
                    .join(' ')}
                  onClose={(event) => handleTagClose(tag, event)}
                  onClick={(event) => handleTagClick(tag, event)}
                />
              ))}

              {/* 更多标签（当标签超出最大行数时显示） */}
              {showMoreTag ? (
                <CwTag
                  content={displayMoreText}
                  closable={false}
                  disabled={disabled}
                  readonly={readonly}
                  type={tagType}
                  size={effectiveTagSize}
                  className={[selectTagsBase.tagItem, selectTagsBase.moreTag]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={handleMoreClick}
                />
              ) : null}
            </>
          ) : (
            <div
              className={[
                selectTagsBase.placeholder,
                placeholderSizeClass,
                disabled ? selectTagsBase.placeholderDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {displayPlaceholder}
            </div>
          )}
        </div>

        {suffixSlot != null ? suffixSlot : null}
      </div>
    </div>
  )
}

export default CwSelectTags
