import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwStickyTabs } from './CwStickyTabs'

const meta: Meta<typeof CwStickyTabs> = {
  title: '1. Components/Navigation/CwStickyTabs',
  component: CwStickyTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '吸顶 Tab：在滚动容器内 position: sticky 吸顶，滚动时根据区块位置自动高亮对应 Tab，点击 Tab 可平滑滚动到对应区块。支持受控/非受控、自定义 navHeight、自定义样式与文案。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: { control: 'object', description: 'Tab 配置列表' },
    activeIndex: { control: 'number', description: '受控时当前激活索引（v-model:activeIndex）' },
    navHeight: { control: 'number', description: '导航条高度（px）' },
    getSectionEl: { description: '根据 refName 获取区块 DOM' },
    scrollContainerRef: { description: '滚动容器 ref' },
  },
}

export default meta
type Story = StoryObj<typeof CwStickyTabs>

const scrollContainerStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  background: 'var(--bg-color-secondarycontainer)',
  WebkitOverflowScrolling: 'touch',
} as const

const sectionStyle = {
  scrollMarginTop: 45,
  minHeight: 260,
  padding: 16,
  background: 'var(--bg-color-container)',
  margin: '8px 0',
} as const

/** 默认：绑定滚动容器，Tab 吸顶，滚动自动高亮，点击 Tab 平滑滚动到区块 */
export const Default: Story = {
  parameters: { layout: 'centered' },
  args: {
    tabs: [
      { label: '我要投保', refName: 'formRef' },
      { label: '产品特色', refName: 'featureRef' },
      { label: '条款协议', refName: 'termsRef' },
    ],
    activeIndex: 0,
    navHeight: 45,
  },
  render: (args) => {
    function DefaultDemo() {
      const scrollContainerRef = useRef<HTMLDivElement>(null)
      const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
      const [activeIndex, setActiveIndex] = useState(args.activeIndex ?? 0)
      const getSectionEl = (refName: string): HTMLElement | null =>
        sectionRefs.current[refName] ?? null
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: 420,
            height: 440,
            border: '1px solid var(--bg-color-secondarycomponent)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div ref={scrollContainerRef} style={scrollContainerStyle}>
            <div
              style={{
                height: 80,
                background: 'var(--bg-color-component)',
                padding: 16,
                lineHeight: 1.5,
              }}
            >
              顶部 Banner。向下滚动后 Tab 吸顶，随滚动自动高亮对应 Tab，点击 Tab 可平滑滚动到对应区块。
            </div>
            <CwStickyTabs
              tabs={args.tabs}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              scrollContainerRef={scrollContainerRef}
              getSectionEl={getSectionEl}
              navHeight={args.navHeight}
              onTabClick={(index, tab) => console.log('tabClick', index, tab)}
            />
            <div
              ref={(el) => {
                sectionRefs.current.formRef = el
              }}
              style={sectionStyle}
            >
              <h3 style={{ margin: '0 0 12px' }}>我要投保</h3>
              <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}>
                表单区块。滚动到此处时「我要投保」Tab 会自动选中。
              </p>
            </div>
            <div
              ref={(el) => {
                sectionRefs.current.featureRef = el
              }}
              style={sectionStyle}
            >
              <h3 style={{ margin: '0 0 12px' }}>产品特色</h3>
              <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}>产品特色区块。</p>
            </div>
            <div
              ref={(el) => {
                sectionRefs.current.termsRef = el
              }}
              style={{ ...sectionStyle, minHeight: 180 }}
            >
              <h3 style={{ margin: '0 0 12px' }}>条款协议</h3>
              <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}>条款区块。</p>
            </div>
          </div>
        </div>
      )
    }
    return <DefaultDemo />
  },
}

/** 仅展示 Tab，不绑定滚动容器（无 getSectionEl），点击仅切换选中态 */
export const FixedOnly: Story = {
  args: {
    tabs: [
      { label: 'Tab 1', refName: 'a' },
      { label: 'Tab 2', refName: 'b' },
      { label: 'Tab 3', refName: 'c' },
    ],
  },
  render: (args) => {
    function FixedOnlyDemo() {
      const [active, setActive] = useState(0)
      return (
        <div style={{ maxWidth: 420 }}>
          <div style={{ height: 120, background: 'var(--bg-color-component)', padding: 16 }}>
            上方占位，向下滚动可看到吸顶效果
          </div>
          <CwStickyTabs
            {...args}
            activeIndex={active}
            onActiveIndexChange={setActive}
            onTabClick={(index, tab) => console.log('tabClick', index, tab)}
          />
          <div style={{ height: 400, padding: 16, background: 'var(--bg-color-page)' }}>
            内容区。此故事未传入 getSectionEl，点击 Tab 只切换高亮，不滚动。
            <br />
            <br />
            activeIndex: {active}
          </div>
        </div>
      )
    }
    return <FixedOnlyDemo />
  },
}

/** 受控模式：外部通过 v-model:activeIndex 和按钮控制当前 Tab，并与滚动联动 */
export const Controlled: Story = {
  parameters: { layout: 'centered' },
  args: {
    tabs: [
      { label: '概览', refName: 'overview' },
      { label: '详情', refName: 'detail' },
      { label: '评论', refName: 'comments' },
    ],
    navHeight: 45,
  },
  render: (args) => {
    function ControlledDemo() {
      const [activeIndex, setActiveIndex] = useState(0)
      const scrollContainerRef = useRef<HTMLDivElement>(null)
      const sectionRefs = useRef<Array<HTMLDivElement | null>>([])
      const getSectionEl = (refName: string): HTMLElement | null => {
        const i = args.tabs?.findIndex((t) => t.refName === refName) ?? -1
        return i >= 0 ? sectionRefs.current[i] ?? null : null
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 420,
            height: 400,
            border: '1px solid var(--bg-color-secondarycomponent)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: 'var(--bg-color-component)',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-color-secondary)',
                alignSelf: 'center',
              }}
            >
              受控切换：
            </span>
            {args.tabs?.map((tab, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => setActiveIndex(i)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--bg-color-secondarycomponent-hover)',
                  background: 'var(--bg-color-container)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              background: 'var(--bg-color-secondarycontainer)',
            }}
          >
            <div style={{ height: 60, padding: 12, background: 'var(--bg-color-component)' }}>
              顶部
            </div>
            <CwStickyTabs
              tabs={args.tabs}
              scrollContainerRef={scrollContainerRef}
              getSectionEl={getSectionEl}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              navHeight={args.navHeight}
            />
            {args.tabs?.map((tab, i) => (
              <div
                key={i}
                ref={(el) => {
                  sectionRefs.current[i] = el
                }}
                style={{
                  scrollMarginTop: 45,
                  minHeight: 180,
                  padding: 16,
                  background: 'var(--bg-color-container)',
                  margin: '8px 0',
                }}
              >
                <h3 style={{ margin: '0 0 8px' }}>{tab.label}</h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: 'var(--text-color-secondary)',
                  }}
                >
                  当前 activeIndex: {activeIndex}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return <ControlledDemo />
  },
}

/** 自定义导航高度（navHeight=56），适用于需要更大点击区域或与自定义 header 对齐的场景 */
export const CustomNavHeight: Story = {
  parameters: { layout: 'centered' },
  args: {
    tabs: [
      { label: '区块 A', refName: 'a' },
      { label: '区块 B', refName: 'b' },
    ],
    navHeight: 56,
  },
  render: (args) => {
    function CustomNavHeightDemo() {
      const scrollContainerRef = useRef<HTMLDivElement>(null)
      const aRef = useRef<HTMLDivElement>(null)
      const bRef = useRef<HTMLDivElement>(null)
      const getSectionEl = (refName: string) =>
        refName === 'a' ? aRef.current : refName === 'b' ? bRef.current : null
      const navHeight = args.navHeight ?? 56
      const customSectionStyle = {
        scrollMarginTop: `${navHeight}px`,
        minHeight: 200,
        padding: 16,
        background: 'var(--bg-color-container)',
        margin: '8px 0',
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 420,
            height: 360,
            border: '1px solid var(--bg-color-secondarycomponent)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              background: 'var(--bg-color-secondarycontainer)',
            }}
          >
            <div style={{ height: 60, padding: 12, background: 'var(--bg-color-component)' }}>
              Banner
            </div>
            <CwStickyTabs
              tabs={args.tabs}
              scrollContainerRef={scrollContainerRef}
              getSectionEl={getSectionEl}
              navHeight={args.navHeight}
            />
            <div ref={aRef} style={customSectionStyle}>
              区块 A（navHeight=56）
            </div>
            <div ref={bRef} style={customSectionStyle}>
              区块 B
            </div>
          </div>
        </div>
      )
    }
    return <CustomNavHeightDemo />
  },
}

/** 多 Tab + 长内容：模拟 5 个章节，每章内容较长，滚动联动与点击跳转均可用 */
export const ManyTabsWithLongContent: Story = {
  parameters: { layout: 'centered' },
  args: {
    tabs: [
      { label: '第一章', refName: 'ch1' },
      { label: '第二章', refName: 'ch2' },
      { label: '第三章', refName: 'ch3' },
      { label: '第四章', refName: 'ch4' },
      { label: '第五章', refName: 'ch5' },
    ],
    navHeight: 45,
  },
  render: (args) => {
    function ManyTabsDemo() {
      const scrollContainerRef = useRef<HTMLDivElement>(null)
      const sectionEls = useRef<Array<HTMLDivElement | null>>([])
      const getSectionEl = (refName: string): HTMLElement | null => {
        const i = args.tabs?.findIndex((t) => t.refName === refName) ?? -1
        return i >= 0 ? sectionEls.current[i] ?? null : null
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 420,
            height: 500,
            border: '1px solid var(--bg-color-secondarycomponent)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              background: 'var(--bg-color-secondarycontainer)',
            }}
          >
            <div style={{ height: 60, padding: 12, background: 'var(--bg-color-component)' }}>
              简介区域
            </div>
            <CwStickyTabs
              tabs={args.tabs}
              scrollContainerRef={scrollContainerRef}
              getSectionEl={getSectionEl}
              navHeight={args.navHeight}
            />
            {args.tabs?.map((tab, i) => (
              <div
                key={i}
                ref={(el) => {
                  sectionEls.current[i] = el
                }}
                style={{
                  scrollMarginTop: 45,
                  minHeight: 320,
                  padding: 16,
                  background: 'var(--bg-color-container)',
                  margin: '8px 0',
                }}
              >
                <h3 style={{ margin: '0 0 12px' }}>{tab.label}</h3>
                <p style={{ margin: 0, color: 'var(--text-color-secondary)', lineHeight: 1.6 }}>
                  这里是 {tab.label} 的较长内容区块，用于演示多 Tab 与长内容时的滚动联动。向下滚动时当前可见区块对应的 Tab
                  会自动高亮；点击 Tab 会平滑滚动到对应区块。
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return <ManyTabsDemo />
  },
}
