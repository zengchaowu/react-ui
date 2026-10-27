import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import type { CwCellGroupProps } from './types'
import type { CwCellTexts } from '@zengchaowu/ui-shared/components/CwCell/types'
import type { CwCellAppearance, CwCellGroupAppearance } from '@zengchaowu/ui-shared/components/CwCell/types'
import {
  cellGroupAppearanceStyles,
  cellGroupBase,
  cellGroupDefaultCellAppearance,
} from '@zengchaowu/ui-shared/components/CwCell/styles'

export interface CwCellGroupContextValue {
  cellAppearance?: CwCellAppearance
  cellTexts?: Partial<CwCellTexts>
  underlineAlign: 'full' | 'indent'
}

/** CwCellGroup → CwCell 的注入上下文（对应 Vue provide/inject） */
export const CwCellGroupContext =
  createContext<CwCellGroupContextValue | null>(null)

export function useCwCellGroupContext(): CwCellGroupContextValue | null {
  return useContext(CwCellGroupContext)
}

export interface CwCellGroupComponentProps
  extends CwCellGroupProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function CwCellGroup({
  appearance = 'default',
  cellAppearance,
  cellTexts,
  underlineAlign = 'full',
  children,
  className,
  ...rest
}: CwCellGroupComponentProps) {
  const resolvedAppearance: CwCellGroupAppearance = appearance || 'default'

  const styles = {
    ...cellGroupBase,
    ...(cellGroupAppearanceStyles[resolvedAppearance] ?? {}),
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(' ')

  const resolvedCellAppearance: CwCellAppearance | undefined =
    cellAppearance ?? cellGroupDefaultCellAppearance[resolvedAppearance]

  const contextValue = useMemo<CwCellGroupContextValue>(
    () => ({
      cellAppearance: resolvedCellAppearance,
      cellTexts,
      underlineAlign,
    }),
    [resolvedCellAppearance, cellTexts, underlineAlign],
  )

  return (
    <CwCellGroupContext.Provider value={contextValue}>
      <div {...rest} className={rootClassName}>
        {children}
      </div>
    </CwCellGroupContext.Provider>
  )
}

export default CwCellGroup
