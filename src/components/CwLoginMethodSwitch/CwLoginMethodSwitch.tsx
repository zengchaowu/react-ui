import { useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import type { CwLoginMethodSwitchProps } from './types'
import type { CwLoginMethodSwitchOption, LoginMethodType } from '@zengchaowu/ui-shared/components/CwLoginMethodSwitch/types'
import { loginMethodSwitchBase } from '@zengchaowu/ui-shared/components/CwLoginMethodSwitch/styles'
import { defaultCwLoginMethodSwitchTexts } from '@zengchaowu/ui-shared/components/CwLoginMethodSwitch/texts'

export function CwLoginMethodSwitch({
  value = 'qrcode',
  options,
  disabled = false,
  texts,
  onChange,
  className,
  ...rest
}: CwLoginMethodSwitchProps & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'onChange'>) {
  const mergedTexts = useMemo(
    () => ({
      ...defaultCwLoginMethodSwitchTexts,
      ...(texts ?? {}),
    }),
    [texts],
  )

  const normalizedOptions = useMemo<CwLoginMethodSwitchOption[]>(() => {
    if (options !== undefined) return options
    return [
      { label: mergedTexts.qrcodeOptionLabel, value: 'qrcode' },
      { label: mergedTexts.phoneOptionLabel, value: 'phone' },
    ]
  }, [options, mergedTexts])

  const currentOption =
    normalizedOptions.find((opt) => opt.value === value) ?? normalizedOptions[0]

  function handleToggle() {
    if (disabled) return
    const next: LoginMethodType = value === 'qrcode' ? 'phone' : 'qrcode'
    onChange?.(next)
  }

  return (
    <div
      className={[
        loginMethodSwitchBase.root,
        disabled && loginMethodSwitchBase.rootDisabled,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* 左侧 badge 文本（带圆角背景），不响应点击 */}
      <span className={loginMethodSwitchBase.badge}>{currentOption?.label}</span>

      {/* 右侧三角形区域：仅此处可点击切换，图标居中被斜边裁剪约一半 */}
      <div
        className={[
          loginMethodSwitchBase.toggleHit,
          disabled ? loginMethodSwitchBase.toggleHitDisabled : loginMethodSwitchBase.toggleHitEnabled,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleToggle}
      >
        {/* 视觉层：三角形裁剪 */}
        <div
          className={loginMethodSwitchBase.clipWrap}
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        >
          <div className={loginMethodSwitchBase.clipInner}>
            <span className={loginMethodSwitchBase.iconWrap}>
              <CwIcon
                name={value === 'qrcode' ? 'common--social--qrcode-line' : 'common--user--phone-line'}
                prefix="icon"
                size={1.5}
                className="block"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CwLoginMethodSwitch
