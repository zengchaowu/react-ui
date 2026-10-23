# @zengchaowu/react-ui

React 复刻 [`@zengchaowu/vue-ui`](../vue-ui) 的设计系统。**公共 API 实行“Vue ⊆ React”对齐**：vue-ui 的每个公共导出都必须在 react-ui 存在（`vueOnly = 0`），React 允许按框架习惯提供超集（如 `*Handle` / `*Context` / `*SlotScope`）。组件集合、tokens、`appearance` / `texts` / `*Base` 约定与 vue-ui 对齐；运行时为 React。

## 组件分组（与 vue-ui 同构）

| 前缀 | 含义 |
|------|------|
| **Cw\*** | 自研可复用组件 |
| **Tp\*** | 重型第三方封装（**仅子路径导入**，不进主 barrel） |
| **Page\*** | 页面级组合 |
| **Bs\*** | 业务专用（当前与 vue-ui 一样暂无） |

**不再提供 At\***（antd 封装已移除）。

## 当前状态

- **结构已对齐**：`pnpm scaffold` 已从 vue-ui 生成 **177 个**同名组件目录（`check:component-parity` 通过），每个目录当前为可编译的 React 桩。
- **共享底座已就位**：框架无关的 UI 函数 / 常量抽到 `@zengchaowu/shared`，vue-ui 与 react-ui 均通过 re-export 引用同一份实现，避免双份维护：
  - `functions/ui/cwRemSize`、`focusStyles`、`cwClearIconSize`、`mergeOverlayTailwindClass`、`fullscreenAttachmentPreview*Styles`
  - `constants/appSafeAreaClasses`、`cwOverlayHeaderTitle`、`cwOverlayDialogSizePresets`、`cwOverlayZIndex`
- **组件行为按批次移植**：每批需同步 `types / styles / texts / materialMeta` 与组件内的框架无关辅助函数；Vue composable 与 React hook 各自实现，底层纯逻辑继续下沉 shared。


## Vue → React 固定映射

| Vue (vue-ui) | React (react-ui) |
|---|---|
| `modelValue` + `update:modelValue` | `value` + `onChange` |
| `v-model:xxx` | `xxx` + `onXxxChange` |
| 默认插槽 | `children` |
| 具名插槽 | `xxxSlot` / 对应 `ReactNode` prop |
| `defineExpose` | `forwardRef` + imperative handle |
| `showXxx()` | 同名命令式 API（portal / overlay 栈） |
| `styles.ts` class map | **verbatim 复用**同一套 Tailwind class |
| `materialMeta.ts` | 同结构保留 |

## 样式

```ts
import '@zengchaowu/react-ui/style'
```

设计 token / dark theme / hairline / iconfont 与 vue-ui 同源（`scripts/scaffold-from-vue-ui.mjs` + 资产同步）。

## 导入

```ts
import { useAppThemeTick } from '@zengchaowu/react-ui'
// 组件恢复后：
// import { CwButton, CwIcon } from '@zengchaowu/react-ui'
// import { TpCodeEditor } from '@zengchaowu/react-ui/TpCodeEditor'
```

## 开发脚本

```bash
pnpm scaffold                 # 从 vue-ui 同步目录骨架
pnpm check:component-parity   # 目录差集必须为零
pnpm check:export-parity      # 主入口导出：vueOnly 必须为零（加 --strict 则要求完全同名）
pnpm build                    # Vite lib + sync exports
pnpm storybook                # 端口 6007
```

## 公共 API 对齐规范

以 vue-ui 为基准，只校验一个方向：**Vue 有的 React 必须有**。

| 规则 | 说明 |
|---|---|
| 禁止缺失 | `vueOnly` 必须为空；Vue 新增公共导出时同步补到 React |
| 允许超集 | React 惯用等价物（`*Handle`、`*Context`、`*ComponentProps`、`*SlotScope`、`useXxx`）可以额外导出 |
| 框架映射 | Vue `*Exposed` → React `*Handle`；Vue `*InjectionKey` → React `*Context`（并保留 `*Key` 兼容别名）；Vue `Emits` / `Slot` 类型原样导出以免破坏名字对齐 |
| 强制校验 | `pnpm check:export-parity` 在 CI/发版前执行，缺失即失败 |
| 严格模式 | `pnpm check:export-parity --strict` 额外要求 `reactOnly = 0`，仅用于审计，不作为默认门禁 |
