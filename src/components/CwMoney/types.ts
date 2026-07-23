export type CwMoneySize = 'default' | 'sm' | 'xs'

export interface CwMoneyTexts {}

export interface CwMoneyProps {
  /** 完整展示文本，传入时优先使用，不拆分整数/小数 */
  text?: string
  /** 金额数值（number 或可解析字符串），未传 text 时生效 */
  value?: number | string
  /** 货币符号，默认 ¥ */
  currency?: string
  /** 小数位数，默认 2（仅数值模式） */
  decimals?: number
  /** 尺寸：default 大号 | sm 小号 | xs 超小号 */
  size?: CwMoneySize
  texts?: Partial<CwMoneyTexts>
}

export interface CwMoneyStyles {
  root: string
  currency: string
  text: string
  value: string
  decimal: string
}
