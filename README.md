# 组件规范，必须绝对遵守此规则。

## 组件库概述

本组件库按照前缀进行分组，包含两种类型的组件：

1. Ant Design 包装组件 (At 前缀)：以 `At` 开头，包装 Ant Design React 组件库，完全透传原组件功能
2. 自研组件 (Cw 前缀)：以 `Cw` 开头的自主研发组件，实现特定业务需求和自定义功能（仅使用 Tailwind CSS）

## 基本规范

1. 第三方包装组件（At 前缀）完全透传 Ant Design 原组件的 Props/Ref/Children，我们只做中转
2. 第三方包装组件不要自定义任何类型，所有类型都从 Ant Design 中直接导入并复用
3. 每个组件都必须提供 Storybook 示例
4. 所有组件都放在 `src/components` 目录下
5. 每个组件使用独立文件夹，固定包含：`index.ts`、`component.tsx`（组件实现文件，命名为具体组件名，如 `AtButton.tsx`）、`component.stories.tsx`、`types.ts`。所有类型统一放在 `types.ts` 中；At 前缀组件的 `types.ts` 仅做类型重导出（从 antd 引入再导出），禁止自定义类型。
6. 自研组件（Cw 开头）必须有自定义逻辑，并且样式只允许使用 Tailwind CSS（禁止自定义 CSS）
7. 需要双向交互的组件，在 Storybook 中通过受控模式演示

### 1. 组件代码与目录结构（强制）

#### 1.1 目录结构（每个组件固定包含四个文件）

```
src/components/AtButton/
├── index.ts            # 组件聚合导出（父/子组件 + 类型）
├── AtButton.tsx        # 组件实现（component.tsx）
├── AtButton.stories.tsx       # Storybook 示例
└── types.ts            # 类型定义或重导出（At 前缀仅重导出）
```

- 子组件与父组件同目录存放，如：`AtForm.tsx` 与 `AtFormItem.tsx`；它们的导出都集中在同一个 `index.ts` 中。
- `types.ts` 是组件唯一的类型出口：
  - At 前缀组件：只从 antd 重导出类型，例如 `export type { ButtonProps } from 'antd'`
  - Cw 前缀组件：定义并导出自研组件的类型，例如 `export interface CwCardProps { ... }`

#### 1.2 第三方库包装组件格式（At 开头）

所有第三方库包装组件必须严格按照以下格式编写，不允许偏差（文件：`AtButton.tsx`）：

```tsx
import React, { forwardRef } from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps } from 'antd'

export const AtButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <AntButton {...props} ref={ref} />
})

export default AtButton
```

强制要求：
- 必须使用 `forwardRef` 透传底层组件的 `ref`
- 必须直接从 `antd` 导入并使用原始类型，例如 `ButtonProps`
- 必须完整透传所有 `props` 和 `children`
- 不允许添加额外的逻辑或改动原有行为
- 不允许自定义类型或改写原类型定义

#### 1.3 组件聚合导出文件（index.ts，强制）

- 单组件导出（At 或 Cw 通用）：
```ts
export { default as AtButton } from './AtButton'
export * from './types'
```

- 多组件导出（包含子组件，放在同一目录）：
```ts
export { default as AtForm } from './AtForm'
export { default as AtFormItem } from './AtFormItem'
export * from './types'
```

### 2. Storybook 规范（强制）

- 子组件必须有且仅有一个 Story（一个导出对象）
- 父组件可以有多个 Story 用例（不同状态/场景）

示例（文件：`AtButton.stories.tsx`）：
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { AtButton } from './index'

const meta: Meta<typeof AtButton> = {
  title: 'Ant Design/AtButton',
  component: AtButton,
  args: {
    children: '按钮',
    type: 'primary',
  },
}

export default meta
export const Primary: StoryObj<typeof AtButton> = {}
```

### 3. 入口文件格式（强制）

本组件库采用分离式入口文件结构，按组件类型分别导出：

#### 3.1 主入口文件 `src/index.ts`（仅导出 Cw 组件）
```ts
// Cw 组件 - 按字母顺序导出
export * from './components/CwCard'
export * from './components/CwSomething'
```

#### 3.2 Ant Design 组件入口文件 `src/at.ts`
```ts
// Ant Design 包装组件 (At 前缀) - 按字母顺序导出
export * from './components/AtButton'
export * from './components/AtInput'
export * from './components/AtSelect'
// ... 其他 At 组件按字母顺序导出
```

分离式入口的强制要求：
- 按组件类型分离：每种组件类型使用独立的入口文件
- 组件按字母顺序排列并导出
- 清晰职责：入口文件只负责对应类型的导出
- 使用 `export * from` 格式统一导出

### 4. 类型文件（types.ts，强制）

- At 前缀组件：只重导出 antd 类型，不自定义类型
```ts
export type { ButtonProps } from 'antd'
```

- Cw 前缀组件：在 `types.ts` 中定义并导出所有类型
```ts
export interface CwCardProps {
  title: string
  children?: React.ReactNode
}
```

### 5. 样式规范（强制，仅 Cw 组件）

1. 只能使用 Tailwind CSS 类名
2. 禁止编写任何自定义 CSS 文件或样式

示例（Cw 组件）：
```tsx
export function CwCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  )
}
```
