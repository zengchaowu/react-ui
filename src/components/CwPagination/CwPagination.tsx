import { useEffect, useMemo, useState } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwPaginationProps } from './types'
import { paginationBase } from '@zengchaowu/ui-shared/components/CwPagination/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwPagination/texts'
import { CwButton } from '../CwButton'
import { CwNumberInput } from '../CwNumberInput'
import { CwSelect } from '../CwSelect'
import { CwIcon } from '../CwIcon'
import type { CwSelectValue } from '../CwSelect/types'

export interface CwPaginationComponentProps
  extends CwPaginationProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'> {
  className?: string
}

/**
 * CwPagination（对应 vue-ui `CwPagination.vue`）
 */
export function CwPagination({
  value,
  total,
  pageSize = 10,
  showJumper = false,
  showTotal = false,
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  pageButtonCount = 5,
  disabled = false,
  texts: textsProp,
  onChange,
  onPageSizeChange,
  className,
  ...rest
}: CwPaginationComponentProps) {
  const styles = paginationBase
  const texts = useMemo(() => ({ ...defaultTexts, ...(textsProp ?? {}) }), [textsProp])

  // 当前页码
  const currentPage = value
  const currentPageSize = pageSize
  const totalPages = Math.max(1, Math.ceil((total || 0) / currentPageSize))

  // 跳转输入框的值
  const [jumperValue, setJumperValue] = useState('')

  // 计算页码按钮数组（包括省略号）
  const pageButtons = useMemo(() => {
    const buttons: (number | string)[] = []
    const pageTotal = totalPages
    const current = currentPage
    const count = pageButtonCount || 5

    if (pageTotal <= count + 2) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= pageTotal; i++) {
        buttons.push(i)
      }
    } else {
      // 总页数较多，需要省略号
      const half = Math.floor(count / 2)

      // 总是显示第一页
      buttons.push(1)

      if (current <= half + 1) {
        // 当前页靠前
        for (let i = 2; i <= count; i++) {
          buttons.push(i)
        }
        buttons.push('...')
        buttons.push(pageTotal)
      } else if (current >= pageTotal - half) {
        // 当前页靠后
        buttons.push('...')
        for (let i = pageTotal - count + 1; i <= pageTotal; i++) {
          buttons.push(i)
        }
      } else {
        // 当前页在中间
        buttons.push('...')
        const start = current - half
        const end = current + half
        for (let i = start; i <= end; i++) {
          buttons.push(i)
        }
        buttons.push('...')
        buttons.push(pageTotal)
      }
    }

    return buttons
  }, [totalPages, currentPage, pageButtonCount])

  // 总数文本
  const totalText = useMemo(() => {
    const template = texts.total || '共 {total} 条'
    const pageTotal = total || 0
    const start = (currentPage - 1) * currentPageSize + 1
    const end = Math.min(currentPage * currentPageSize, pageTotal)

    return template
      .replace('{total}', String(pageTotal))
      .replace('{start}', String(start))
      .replace('{end}', String(end))
  }, [texts.total, total, currentPage, currentPageSize])

  // 每页条数选项（转换为 CwSelect 需要的格式）
  const selectOptions = useMemo(
    () =>
      pageSizeOptions.map((size) => ({
        label: String(size),
        value: size,
      })),
    [pageSizeOptions],
  )

  // 处理上一页
  const handlePrev = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      onChange?.(newPage, currentPageSize)
    }
  }

  // 处理下一页
  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      onChange?.(newPage, currentPageSize)
    }
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onChange?.(page, currentPageSize)
    }
  }

  // 处理跳转输入
  const handleJumperInput = (input: number | string) => {
    setJumperValue(typeof input === 'number' ? String(input) : input)
  }

  // 处理跳转确认
  const handleJumperConfirm = () => {
    const input = jumperValue
    if (input === '' || input === null || input === undefined) {
      setJumperValue('')
      return
    }
    const page = typeof input === 'number' ? input : parseInt(input, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page)
    }
    setJumperValue('')
  }

  // 处理每页条数变化
  const handlePageSizeChange = (nextValue: CwSelectValue | CwSelectValue[] | null) => {
    const next = Array.isArray(nextValue) ? Number(nextValue[0]) : Number(nextValue)
    if (!Number.isFinite(next) || next <= 0) return
    onPageSizeChange?.(next)
    // 重新计算当前页（确保不超过总页数）
    const newTotalPages = Math.max(1, Math.ceil((total || 0) / next))
    const newPage = Math.min(currentPage, newTotalPages)
    if (newPage !== currentPage) {
      onChange?.(newPage, next)
    }
  }

  // 监听当前页变化，清空跳转输入框
  useEffect(() => {
    setJumperValue('')
  }, [currentPage])

  return (
    <div
      {...rest}
      className={[
        styles.root,
        disabled ? styles.rootDisabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 总数信息 */}
      {showTotal ? <div className={styles.info}>{totalText}</div> : null}

      {/* 每页条数选择器 */}
      {showPageSize ? (
        <div className={styles.pageSize}>
          <span className="shrink-0">{texts.pageSize}</span>
          <div className={styles.pageSizeSelect}>
            <CwSelect
              value={currentPageSize}
              options={selectOptions}
              disabled={disabled}
              size="small"
              onChange={handlePageSizeChange}
            />
          </div>
        </div>
      ) : null}

      {/* 导航按钮 */}
      <div className={styles.nav}>
        {/* 上一页按钮 */}
        <CwButton
          size="small"
          disabled={disabled || currentPage <= 1}
          aria-label={texts.prev}
          onClick={handlePrev}
        >
          <CwIcon
            name="common--dir--arrow-left-line"
            prefix="icon"
            size={0.875}
            className="inline-flex items-center justify-center"
          />
        </CwButton>

        {/* 页码按钮 */}
        {pageButtons.map((page, index) =>
          typeof page === 'number' ? (
            <CwButton
              key={`page-${page}-${index}`}
              size="small"
              className={styles.pageButton}
              type={page === currentPage ? 'primary' : 'default'}
              variant={page === currentPage ? 'solid' : 'outline'}
              disabled={disabled}
              aria-label={texts.pageLabel?.replace('{page}', String(page))}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </CwButton>
          ) : (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              {page}
            </span>
          ),
        )}

        {/* 下一页按钮 */}
        <CwButton
          size="small"
          disabled={disabled || currentPage >= totalPages}
          aria-label={texts.next}
          onClick={handleNext}
        >
          <CwIcon
            name="common--dir--arrow-right-line"
            prefix="icon"
            size={0.875}
            className="inline-flex items-center justify-center"
          />
        </CwButton>
      </div>

      {/* 跳转输入框 */}
      {showJumper ? (
        <div className={styles.jumper}>
          <span className="shrink-0">{texts.jumper}</span>
          <div className={styles.jumperInput}>
            <CwNumberInput
              value={jumperValue}
              min={1}
              max={totalPages}
              allowDecimal={false}
              disabled={disabled}
              placeholder=""
              size="small"
              onChange={handleJumperInput}
              onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') handleJumperConfirm()
              }}
              onBlur={handleJumperConfirm}
            />
          </div>
          <span className="shrink-0">{texts.pageUnit}</span>
        </div>
      ) : null}
    </div>
  )
}

export default CwPagination
