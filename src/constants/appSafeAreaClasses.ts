/**
 * 安全区 class：必须是 tokens/safe-area.css 里的真实选择器。
 * 禁止再写成 Tailwind 任意值（`pt-[var(--app-…)]`），预构建 CSS 扫不到。
 */

/** 壳层根节点 top / bottom（CwChatShellLayout；可被 data-app-chrome 清零） */
export const APP_CHROME_SAFE_TOP_CLASS = 'cw-safe-pt-chrome'
export const APP_CHROME_SAFE_BOTTOM_CLASS = 'cw-safe-pb-chrome'

/** 页内顶栏（NavBar） */
export const APP_PAGE_CHROME_SAFE_TOP_CLASS = 'cw-safe-pt-page'

/** 页内底栏 / 输入框 */
export const APP_PAGE_CHROME_SAFE_BOTTOM_CLASS = 'cw-safe-pb-page'

/** 可滚动内容区底部留白 */
export const APP_PAGE_SCROLL_SAFE_BOTTOM_CLASS = 'cw-safe-pb-page-scroll'

/** 页内固定底栏（完成按钮等） */
export const APP_PAGE_FOOTER_SAFE_BOTTOM_CLASS = 'cw-safe-pb-page-footer'

/** 移动端底栏 Tab */
export const APP_TABBAR_SAFE_BOTTOM_CLASS = 'cw-safe-pb-tabbar'

/** Overlay / Sheet 四边 */
export const APP_OVERLAY_SAFE_TOP_CLASS = 'cw-safe-pt-overlay'
export const APP_OVERLAY_SAFE_BOTTOM_CLASS = 'cw-safe-pb-overlay'
export const APP_OVERLAY_SAFE_LEFT_CLASS = 'cw-safe-pl-overlay'
export const APP_OVERLAY_SAFE_RIGHT_CLASS = 'cw-safe-pr-overlay'
export const APP_OVERLAY_SAFE_FOOTER_BOTTOM_CLASS = 'cw-safe-pb-overlay-footer'
