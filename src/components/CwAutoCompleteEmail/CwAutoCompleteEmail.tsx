import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type HTMLAttributes,
} from 'react'
import { CwAutoComplete } from '../CwAutoComplete/CwAutoComplete'
import type { CwAutoCompleteHandle, CwAutoCompleteOption } from '../CwAutoComplete/types'
import type {
  CwAutoCompleteEmailHandle,
  CwAutoCompleteEmailProps,
} from './types'
import {
  cwAutoCompleteEmailRootClass,
  cwAutoCompleteEmailRootDisabledClass,
  cwAutoCompleteEmailRootReadonlyClass,
} from '@zengchaowu/ui-shared/components/CwAutoCompleteEmail/styles'
import { defaultTexts } from './texts'

export interface CwAutoCompleteEmailComponentProps
  extends CwAutoCompleteEmailProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'onChange' | 'onFocus' | 'onBlur'
    > {}

const DEFAULT_EMAIL_SUFFIXES: string[] = [
  '@qq.com',
  '@gmail.com',
  '@126.com',
  '@163.com',
  '@hotmail.com',
  '@yahoo.com',
  '@yahoo.com.cn',
  '@live.com',
  '@sohu.com',
  '@sina.com',
]

export const CwAutoCompleteEmail = forwardRef<
  CwAutoCompleteEmailHandle,
  CwAutoCompleteEmailComponentProps
>(function CwAutoCompleteEmail(
  {
    value,
    placeholder,
    disabled = false,
    readonly = false,
    clearable = false,
    debounce = 150,
    align = 'left',
    size = 'medium',
    emailSuffixes = DEFAULT_EMAIL_SUFFIXES,
    texts: textsProp,
    onChange,
    onClear,
    onFocus,
    onBlur,
    className,
    ...rest
  },
  ref,
) {
  const autoCompleteRef = useRef<CwAutoCompleteHandle | null>(null)

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const fetchEmailOptions = useCallback(
    async (query: string): Promise<CwAutoCompleteOption[]> => {
      const input = query.trim()

      // 如果输入为空，返回空数组
      if (!input) {
        return []
      }

      // 检查是否包含 @ 符号
      const atIndex = input.indexOf('@')

      if (atIndex === -1) {
        // 没有 @ 符号，显示所有后缀作为选项
        return emailSuffixes.map((suffix, index) => ({
          label: `${input}${suffix}`,
          key: `email-${index}-${input}${suffix}`,
        }))
      }

      // 有 @ 符号，提取前缀和后缀部分
      const prefix = input.substring(0, atIndex)
      const inputSuffix = input.substring(atIndex)

      // 如果前缀为空，不显示选项
      if (!prefix) {
        return []
      }

      // 根据输入的后缀部分，过滤匹配的邮箱后缀
      const matchedSuffixes = emailSuffixes.filter((suffix) =>
        suffix.toLowerCase().startsWith(inputSuffix.toLowerCase()),
      )

      // 生成匹配的完整邮箱选项
      return matchedSuffixes.map((suffix, index) => ({
        label: `${prefix}${suffix}`,
        key: `email-${index}-${prefix}${suffix}`,
      }))
    },
    [emailSuffixes],
  )

  useImperativeHandle(
    ref,
    () => ({
      // 暴露方法供外部调用
      isVisible: () => autoCompleteRef.current?.isVisible() ?? false,
    }),
    [],
  )

  return (
    <div
      {...rest}
      className={[
        cwAutoCompleteEmailRootClass,
        disabled
          ? cwAutoCompleteEmailRootDisabledClass
          : readonly
            ? cwAutoCompleteEmailRootReadonlyClass
            : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CwAutoComplete
        ref={autoCompleteRef}
        value={value}
        placeholder={placeholder ?? texts.placeholder}
        disabled={disabled}
        readonly={readonly}
        clearable={clearable}
        debounce={debounce}
        align={align}
        size={size}
        texts={texts.autoCompleteTexts}
        fetchOptions={fetchEmailOptions}
        onChange={(nextValue, option) => onChange?.(nextValue, option)}
        onClear={onClear}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  )
})

export default CwAutoCompleteEmail
