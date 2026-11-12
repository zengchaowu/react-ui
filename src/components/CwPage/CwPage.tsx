import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import {
  APP_OVERLAY_SAFE_LEFT_CLASS,
  APP_OVERLAY_SAFE_RIGHT_CLASS,
  APP_PAGE_CHROME_SAFE_BOTTOM_CLASS,
  APP_PAGE_CHROME_SAFE_TOP_CLASS,
} from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import { useCwPageEnv } from './useCwPageEnv'
import type { CwPageProps } from './types'
import './cw-page.css'

export interface CwPageComponentProps
  extends CwPageProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> {
  className?: string
  style?: CSSProperties
  /** 顶部插槽（通栏 NavBar 等） */
  header?: ReactNode
  /** 底部插槽（Tabbar 等） */
  footer?: ReactNode
  children?: ReactNode
}

/**
 * CwPage 页面容器：一个页面需要的外壳样板都在这里。
 *
 * - 高度：`--app-viewport-height`（夸克 / UC 由 bootstrap 写成 px），回退 100dvh → 100vh；
 * - 安全区：复用 tokens/safe-area.css 的 `.cw-safe-*`，跟随 `data-app-chrome`、
 *   键盘开关一起归零，不会在键盘上方多留一条 home 指示条；
 * - Android 网页（夸克 / UC 自带状态栏）：顶部安全区置 0，避免双份留白；
 * - 根节点 `overflow: hidden`，滚动只发生在内容区，避免整页回弹。
 *
 * 宿主只需在 index.html 配好 viewport meta（`viewport-fit=cover`）；
 * 安全区引导、视口锁、键盘监听由组件按需补位，宿主做过的一律跳过。
 */
export function CwPage({
  height = 'viewport',
  background = 'page',
  safeTop = true,
  safeBottom = true,
  safeSides = false,
  scroll = false,
  autoSafeArea = true,
  lockViewport = false,
  header,
  footer,
  children,
  className,
  style,
  ...rest
}: CwPageComponentProps) {
  useCwPageEnv({ autoSafeArea, lockViewport })

  const rootClassName = [
    'cw-page',
    `cw-page--height-${height}`,
    `cw-page--bg-${background}`,
    safeTop && APP_PAGE_CHROME_SAFE_TOP_CLASS,
    safeBottom && APP_PAGE_CHROME_SAFE_BOTTOM_CLASS,
    safeSides && APP_OVERLAY_SAFE_LEFT_CLASS,
    safeSides && APP_OVERLAY_SAFE_RIGHT_CLASS,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName} style={style} {...rest}>
      {header ? <div className="cw-page__header">{header}</div> : null}
      <div className={['cw-page__body', scroll && 'is-scroll'].filter(Boolean).join(' ')}>
        {children}
      </div>
      {footer ? <div className="cw-page__footer">{footer}</div> : null}
    </div>
  )
}

export default CwPage
