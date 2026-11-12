/**
 * CwPage：页面级容器。
 *
 * 负责把「一个页面」的样板工作收敛到一处：可视区高度、安全区、根级滚动策略、
 * 页面背景。业务页面只需要往里放 NavBar / 内容 / Tabbar。
 */

/** 高度来源 */
export type CwPageHeight =
  /** 撑满可视区（优先 `--app-viewport-height`，回退 100dvh） */
  | 'viewport'
  /** 撑满父级（父级已有确定高度，或嵌在手机壳 / 画布帧里时用） */
  | 'full'
  /** 由内容撑开，不锁高度 */
  | 'auto'

/** 页面背景 */
export type CwPageBackground =
  /** `--bg-color-page`，App 底色 */
  | 'page'
  /** `--bg-color-container`，卡片容器色 */
  | 'container'
  /** 透明，交给业务自己铺 */
  | 'none'

export interface CwPageProps {
  /** 默认 viewport */
  height?: CwPageHeight
  /** 默认 page */
  background?: CwPageBackground
  /** 顶部安全区（页内已有 NavBar 通栏时可关）默认 true */
  safeTop?: boolean
  /** 底部安全区（键盘弹出时自动归零）默认 true */
  safeBottom?: boolean
  /** 左右安全区（横屏刘海屏）默认 false */
  safeSides?: boolean
  /** 内容区独立滚动（`overflow-y: auto` + `overscroll-behavior: contain`）默认 false */
  scroll?: boolean
  /**
   * 挂载时若文档尚未初始化安全区（`html[data-app-safe-area-profile]` 缺失），
   * 自动调用 `bootstrapDocumentAppSafeArea`。默认 true。
   * 宿主已自行引导时会被跳过，不覆盖已有的原生壳判定。
   */
  autoSafeArea?: boolean
  /**
   * 给 html 挂 `app-root-viewport-lock`（锁 html/body/#app 高度、禁整页回弹），
   * 并在加锁期间代持键盘监听。默认 false。
   *
   * - 应用壳页面（`App` 那一层）开启，配合 `height="full"`；
   * - 嵌在手机壳 / 画布 / 微前端里时不要开，否则会把宿主的整页锁掉；
   * - 多实例共享引用计数，最后一个卸载才还原；宿主自己加过的 class 不会被移除。
   */
  lockViewport?: boolean
}
