# React 组件库性能对齐规范（对标 Vue 版）

> 本规范总结 React 版相对 Vue 版的核心性能差异及对齐方案，适用于 `packages/react-ui` 下所有组件。

## 背景：React vs Vue 的本质差异

| 维度 | Vue (setup) | React (函数组件) |
|------|-------------|------------------|
| 函数执行 | `setup` 仅执行一次，闭包引用稳定 | 每次渲染重新执行，所有局部函数重建 |
| 回调引用 | 天然稳定 | `useCallback` 依赖变化即重建 |
| 响应式 | `watch` 精准追踪依赖 | `useEffect` 依赖数组驱动 |

**核心风险**：React 中如果 `useCallback` 的依赖项不稳定（如每次渲染新建的对象/函数），回调会频繁重建，进而导致依赖该回调的 `useEffect` 反复 cleanup + re-run，造成事件监听器/Observer 被频繁移除重加、节流状态重置等性能问题。

## 规范 1：effect 中的回调必须用 ref 解耦

**规则**：`useEffect` 的依赖数组中**禁止**出现可能频繁重建的回调函数。必须用 `useRef` 持有最新回调，effect 内通过 `ref.current` 访问。

**反例**（CwPopup 修复前）：
```ts
// onMove 每次渲染可能是新引用 → effect 反复 cleanup+re-run
useEffect(() => {
  document.addEventListener('mousemove', onMove)
  return () => document.removeEventListener('mousemove', onMove)
}, [state.visible, onMove])  // ❌ onMove 不稳定
```

**正例**：
```ts
const onMoveRef = useRef(onMove)
onMoveRef.current = onMove

useEffect(() => {
  const handler = () => onMoveRef.current()
  document.addEventListener('mousemove', handler)
  return () => document.removeEventListener('mousemove', handler)
}, [state.visible])  // ✅ 只依赖真正需要重新订阅的项
```

## 规范 2：getTriggerElement / getMountContainer 等 getter 保持稳定

**规则**：向子组件/hook 传递的 getter 函数（如 `getTriggerElement`、`getMountContainer`）必须用 `useCallback` 且依赖**稳定值**。如果依赖的是 `virtualReference` 这类可能高频变化的 prop，应让调用方传入稳定引用（如 `ref.current`），而非每次新建对象。

**CwPopup 中的约束**：
```ts
// CwPopup.tsx — virtualReference 应由调用方保证引用稳定
const getTriggerElement = useCallback((): HTMLElement | VirtualElement | null => {
  if (virtualReference) return virtualReference
  return triggerRef.current
}, [virtualReference])  // ⚠️ virtualReference 变化时重建
```

调用方应传入稳定的 `virtualReference`（如 `useRef` 持有的对象），避免每次渲染新建。

## 规范 3：高频事件监听的 effect 依赖最小化

**规则**：设置 `mousemove`、`scroll`、`resize`、`selectionchange` 等高频事件的 `useEffect`，其依赖数组应只包含**真正需要重新订阅**的状态（如 `visible`、`enabled`），不包含回调。

**涉及场景**：
- 鼠标拖拽（Slider、Split、DraggableDialog）
- 滚动同步（InfiniteScroll、VirtualScroll）
- 浮层位置跟随（CwPopup virtual-reference）

## 规范 4：避免内联回调传入会触发 effect 重建的子组件

**规则**：如果子组件的 `useEffect` 依赖某个 prop 回调，父组件传入的该回调必须稳定（`useCallback` 且依赖稳定），或子组件内部用 ref 解耦。

**检查清单**：
- [ ] 传给子组件的回调是否 `useCallback([])` 或依赖稳定值？
- [ ] 子组件 effect 是否通过 ref 访问回调？

## 规范 5：面板显隐用可见状态直接控制挂载，不用 mounted 标志位

**规则**：浮层面板的渲染条件应直接使用可见状态（如 `visible && <Panel />`），而非 `mounted` 标志位（一旦 true 永不重置）。

**反例**（CwMessageInput mentions 修复前）：
```ts
const [mentionPanelMounted, setMentionPanelMounted] = useState(false)
useEffect(() => { if (visible) setMentionPanelMounted(true) }, [visible])
// ...
{mentionPanelMounted && <CwPopup value={visible} />}  // ❌ 面板永不卸载
```

**正例**：
```ts
{mentionPopupVisible && <CwPopup value={mentionPopupVisible} />}  // ✅ 直接控制挂载
```

原因：Vue 的 `watch` 同步执行 `hide()`，React 的 `useEffect` 异步执行。若面板永不卸载，`modelValue` 变 false 后到 `hide()` 执行前存在一帧空内容，表现为"高度变 0 再消失"。

## 规范 6：tooltip/hideDelay 行为与 Vue CwTooltip 对齐

**规则**：自行实现的 tooltip（非 CwTooltip 组件）必须对齐以下参数：
- `showDelay`: 300ms（悬停后延迟显示）
- `hideDelay`: 100ms（离开后延迟隐藏）
- 鼠标移入 tooltip 本身时取消隐藏

**实现要点**：
- 用 `setTimeout` 实现 show/hide 延迟
- `mouseenter` tooltip 元素时清除 hide timer
- `mouseleave` chip 时检查 `relatedTarget`，若进入 tooltip 则不隐藏

## 已修复的问题清单

| 组件 | 问题 | 根因 | 修复方案 |
|------|------|------|----------|
| CwPopup virtual-reference | 鼠标移动 1-2 秒后停止跟随 | `useMouseMoveTracker` effect 依赖 `onMove`（随 `virtualReference` 重建），监听器被频繁移除重加 | `onMoveRef` 解耦，effect 依赖改为 `[state.visible, throttleDelay]` |
| CwPopup | ResizeObserver 频繁 disconnect/observe | `usePopupResizeObserver` effect 依赖 `targetElement`/`onResize` | `targetElementRef`/`onResizeRef` 解耦 |
| CwPopup | scroll/resize 监听器频繁重建 | `usePopupPosition` effect 依赖 `updatePosition` | `updatePositionRef` 解耦 |
| CwPopup | trigger ResizeObserver 频繁重建 | `useTriggerResizeObserver` effect 依赖 `getTriggerElement` | `getTriggerElementRef` 解耦 |
| CwMessageInput mentions | 无匹配时面板高度变 0 再消失 | `mentionPanelMounted` 永不重置 + `hide()` 异步 | 直接用 `mentionPopupVisible` 控制挂载 |
| CwMessageInput file chip tooltip | 无 hideDelay、鼠标移入 tooltip 会消失 | 事件代理立即隐藏，未处理 tooltip 区域 | 添加 100ms hideDelay + tooltip 区域防隐藏 |

## 自查命令

```bash
# 类型检查
cd packages/react-ui && npx tsc --noEmit

# 搜索可能的反模式（effect 依赖回调）
# 手动审查以下模式：useEffect(... , [..., someCallback]) 中 someCallback 是否稳定
```

## 对照 Vue 版验证

每次修改后，在 Storybook 中对比 React 版与 Vue 版的行为一致性：
1. 交互响应延迟（hover/click/scroll）
2. 连续操作下的稳定性（拖拽、滚动不中断）
3. 显隐过渡（无中间帧异常状态）
