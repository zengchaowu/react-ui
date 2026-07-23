# @zengchaowu/react-ui

React 一比一复刻 [`@zengchaowu/vue-ui`](../vue-ui) 的设计系统。组件集合、tokens、`appearance` / `texts` / `styles` 约定与 vue-ui **不多不少**对齐；运行时为 React。

## 组件分组（与 vue-ui 同构）

| 前缀 | 含义 |
|------|------|
| **Cw\*** | 自研可复用组件 |
| **Tp\*** | 重型第三方封装（**仅子路径导入**，不进主 barrel） |
| **Page\*** | 页面级组合 |
| **Bs\*** | 业务专用（当前与 vue-ui 一样暂无） |

**不再提供 At\***（antd 封装已移除）。

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

## 目录约定

```
src/components/CwButton/
  CwButton.tsx
  index.ts
  types.ts
  styles.ts
  texts.ts
  materialMeta.ts
  CwButton.stories.tsx
```

## 样式

```ts
import '@zengchaowu/react-ui/style'
```

设计 token / dark theme / hairline / iconfont 与 vue-ui 同源（`scripts/scaffold-from-vue-ui.mjs` + 资产同步）。

## 导入

```ts
import { CwButton, CwIcon } from '@zengchaowu/react-ui'
// Tp 必须子路径：
import { TpCodeEditor } from '@zengchaowu/react-ui/TpCodeEditor'
```

## 开发脚本

```bash
pnpm scaffold                 # 从 vue-ui 同步目录骨架
pnpm check:component-parity   # 目录差集必须为零
pnpm build                    # Vite lib + sync exports
pnpm storybook                # 端口 6007
```

## 移植状态

- **已实现样板**：`CwButton`、`CwIcon`（视觉 class 与 vue-ui 对齐）
- **其余组件**：目录 / types / styles / texts / materialMeta 已对齐，TSX 为可编译 scaffold stub，按 vue-ui `src/index.ts` 分组分批替换为完整实现
