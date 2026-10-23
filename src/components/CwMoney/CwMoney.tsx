import { useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import type { CwMoneyProps } from './types'
import { resolveMoneyStyles } from './styles'
import { formatAmount } from './functions'

export interface CwMoneyComponentProps
  extends CwMoneyProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {}

export function CwMoney({
  text,
  value,
  currency = '¥',
  decimals = 2,
  size = 'default',
  texts: _texts,
  className,
  ...rest
}: CwMoneyComponentProps) {
  const styles = useMemo(() => resolveMoneyStyles(size ?? 'default'), [size])

  const dec = Math.max(0, decimals ?? 0)
  const formattedAmount = useMemo(() => {
    const result = formatAmount(value ?? 0, dec)
    if (dec === 0) return { integer: result.integer, decimal: '' }
    return result
  }, [value, dec])

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {text ? (
        <>
          {currency ? <span className={styles.currency}>{currency}</span> : null}
          <span className={styles.text}>{text}</span>
        </>
      ) : (
        <>
          {currency ? <span className={styles.currency}>{currency}</span> : null}
          <span className={styles.value}>
            {formattedAmount.integer}
            {decimals > 0 ? (
              <span className={styles.decimal}>.{formattedAmount.decimal}</span>
            ) : null}
          </span>
        </>
      )}
    </div>
  )
}

export default CwMoney
