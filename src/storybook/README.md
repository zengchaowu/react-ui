# Storybook 预览资源

本目录下的静态资源**仅**供 `*.stories.tsx` / Storybook 使用，不会从 `@zengchaowu/react-ui` 库入口（`src/index.ts` 等）引用，因此不会进入生产构建产物。

## Controls 接线（必读）

右侧 Controls 要实时生效，story **必须**把 `args` 绑到组件上。任选其一：

```tsx
// 1) CSF 仅 args（Storybook 自动渲染）
export const Default: Story = {
  args: { disabled: false, size: 'medium' },
}

// 2) 自定义 render：必须接收 args 并 spread
export const Default: Story = {
  args: { disabled: false, size: 'medium' },
  render: (args) => <CwX {...args} />,
}
```

反例：`render: () => <CwX disabled />` — Controls 面板有开关，但画布不更新，且 URL 上的 `args=...` 也完全不生效。

### URL 传参限制（Storybook 8）

URL `args=` 的字符串值只接受 **字母 / 数字 / 空格 / 下划线 / 连字符**（如 `args=fileName:test-pdf`）。中文、`.`、`/` 等会被判定为 malformed query string，**整条 args 被丢弃**（表现为「args 完全不生效」）。验证中文文案请用右侧 Controls 面板，或临时改成 ASCII 测试值。

### 带局部状态的 demo

demo 里有用 `useState` 管理受控值时，**只透传「可配置」的 props 子集**，受控 prop（`value` / `onChange` / `visible` / `modelValue` 等）留在 demo 内部：

```tsx
type DemoProps = Pick<CwXProps, 'placement' | 'showArrow' | 'content'>

function Demo(props: DemoProps) {
  const [visible, setVisible] = useState(false)
  return <CwX {...props} value={visible} onChange={setVisible} />
}

export const ManualControl: Story = {
  args: { placement: 'top', showArrow: true, content: '提示内容' },
  render: (args) => <Demo {...args} />,
}
```

若受控值本身也要由 Controls 驱动，用 `useState(args.xxx)` + `useEffect` 同步，不要直接 spread（否则覆盖 demo 内部 state）。

### 其他「绑了也不生效」的情况

1. **回退 prop 被单项字段盖住** — 如 `itemHeight` 只在 `items[].height` 缺失时生效；演示数据里写死 `height: 80` 会让 Controls 的 `itemHeight` 看起来坏掉。Default 演示应省略单项 height/width。
2. **布局相关 prop 需要可见父级** — 如 `block` / `h-full`：父级没有固定宽高时，开关在画布上几乎看不出变化。应包一层固定尺寸容器。

对比 / showcase（多实例并排）可以写死；但同一文件至少要保留一个 `args` 驱动、可调参的 Default / Playground。

### Controls 数值类型（必读）

Storybook 按 prop 类型推断控件。`number | string`（比例 / px）会被画成 **「Set string」** 联合控件，看起来像字符串。Default 演示应强制数字：

```tsx
import {
  numberControlArgType,
  type NumberOnlyProps,
} from '../../storybook/argTypes'

type StoryArgs = NumberOnlyProps<CwXProps, 'firstMinSize' | 'gap'>

const meta = {
  component: CwX,
  args: { firstMinSize: 0, gap: 8 },
  argTypes: {
    firstMinSize: numberControlArgType({ min: 0, max: 1, step: 0.01 }),
    gap: numberControlArgType({ min: 0, step: 1 }),
  },
} satisfies Meta<StoryArgs>
```

- prop 为 **number**：`numberControlArgType` + `args` 用数字（不要写 `"200"`）。
- prop 为 **number | string**：Default 用 `NumberOnlyProps` 收窄 + `numberControlArgType`；像素 / CSS 演示另建 story + `textControlArgType`。
- prop 仅为 **CSS 字符串**（如 `100vh`）：`control: 'text'` + `type: { name: 'string' }`。

## 头像（强制）

**所有 Story 中的用户头像**必须使用 `assets/chat-default-avatar.png`，经 `chatDefaultAvatar.ts` 导出为 `storybookChatDefaultAvatarSrc`：

```ts
import { storybookChatDefaultAvatarSrc } from '../../storybook/chatDefaultAvatar'
```

适用于 `CwAvatar`、聊天消息 / 会话列表、`@` 提及面板等一切头像 props 与演示数据。**禁止**在 Story 中使用 unsplash / picsum / 第三方 CDN 作为头像。
