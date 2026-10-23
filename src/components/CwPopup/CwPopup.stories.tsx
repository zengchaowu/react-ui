import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwPopup } from './CwPopup'
import type { CwPopupProps } from './types'
import { CwButton } from '../CwButton'
import { createDimensions } from './plugins/dimensions'
import { createPosition } from './plugins/position'
import { createOffset } from './plugins/offset'
import { createFlip } from './plugins/flip'
import { createPreventOverflow } from './plugins/prevent-overflow'
import { createAdaptiveHeight } from './plugins/adaptive-height'
import { createArrow } from './plugins/arrow'

const plugins = [
  createDimensions(),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 8 }),
  createPreventOverflow({ padding: 8 }),
  createArrow({
    margin: 8,
    arrowClass:
      'w-2 h-2 bg-[var(--bg-color-container)] border-[var(--border-color)]',
  }),
]

const meta: Meta<typeof CwPopup> = {
  title: '1. Components/Overlay/CwPopup',
  component: CwPopup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwPopup 是一个灵活的弹出层函数式 API，通过 useCwPopup 和 createCwPopup 提供动态化的弹出层能力。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: [
        'top',
        'top-start',
        'top-end',
        'right',
        'right-start',
        'right-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
      ],
      description: '弹出层的位置',
    },
    trigger: {
      control: { type: 'select' },
      options: ['click', 'hover', 'manual'],
      description: '触发方式',
    },
    showDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'hover 触发显示延迟（毫秒）',
    },
    hideDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'hover 触发隐藏延迟（毫秒）',
    },
    closeOnClickOutside: {
      control: { type: 'boolean' },
      description: '点击外部是否关闭（仅 click 触发有效）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwPopup>

const triggerClass =
  'px-4 py-2 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--brand-color-hover)] transition-colors duration-200 cursor-move inline-block text-center'

export const HoverTrigger: Story = {
  args: {
    placement: 'top',
    trigger: 'hover',
    showDelay: 200,
    hideDelay: 300,
    plugins,
  },
  render: (args) => (
    <div className="relative">
      <CwPopup
        {...args}
        popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg px-3 py-1.5"
        triggerSlot={
          <div className={triggerClass}>悬停显示弹出层</div>
        }
      >
        <div className="text-[var(--text-color-primary)]">鼠标悬停时显示此内容</div>
      </CwPopup>
    </div>
  ),
}

const richPlugins = [
  createDimensions(),
  createAdaptiveHeight({ padding: 8, minHeight: 160 }),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 8 }),
  createPreventOverflow({ padding: 8 }),
  createArrow({
    margin: 8,
    arrowClass:
      'w-2 h-2 bg-[var(--bg-color-container)] border-[var(--border-color)]',
  }),
]

export const RichContent: Story = {
  args: {
    placement: 'bottom',
    trigger: 'click',
  },
  render: (args) => (
    <div className="p-8">
      <CwPopup
        {...args}
        plugins={richPlugins}
        popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg px-3 py-2"
        triggerSlot={<div className={triggerClass}>底部弹出</div>}
      >
        <div className="min-w-[12.5rem]">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-[var(--brand-color-6)] rounded-full flex items-center justify-center text-[var(--text-color-anti)] font-semibold mr-3">
              U
            </div>
            <div>
              <div className="font-semibold text-[var(--text-color-primary)]">用户名称</div>
              <div className="text-xs text-[var(--text-color-secondary)]">在线</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="px-3 py-2 bg-[var(--bg-color-secondarycontainer)] rounded text-sm cursor-pointer hover:bg-[var(--bg-color-component-hover)] text-[var(--text-color-primary)]">
              个人资料
            </div>
            <div className="px-3 py-2 bg-[var(--bg-color-secondarycontainer)] rounded text-sm cursor-pointer hover:bg-[var(--bg-color-component-hover)] text-[var(--text-color-primary)]">
              设置
            </div>
            <div className="px-3 py-2 bg-[var(--bg-color-secondarycontainer)] rounded text-sm cursor-pointer hover:bg-[var(--bg-color-component-hover)] text-[var(--text-color-primary)]">
              帮助
            </div>
            <div className="hairline-border-t border-[var(--border-color)] pt-2 mt-2">
              <div className="px-3 py-2 bg-[var(--button-danger-tint-hover-bg)] text-[var(--error-color-6)] rounded text-sm cursor-pointer hover:bg-[var(--button-danger-tint-active-bg)]">
                退出登录
              </div>
            </div>
          </div>
        </div>
      </CwPopup>
    </div>
  ),
}

function ManualTriggerDemo({ args }: { args: CwPopupProps }) {
  const [visible, setVisible] = useState(false)

  return (
      <div className="p-8">
        <CwPopup
          {...args}
          plugins={plugins}
          modelValue={visible}
          onUpdateModelValue={setVisible}
          closeOnClickOutside={false}
          popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg px-3 py-1.5"
          triggerSlot={
            <div className="mb-4 px-4 py-2 bg-[var(--bg-color-secondarycomponent)] text-[var(--text-color-primary)] rounded-md inline-block">
              参考元素
            </div>
          }
        >
          <div className="text-[var(--text-color-primary)]">手动控制的弹出层</div>
        </CwPopup>
        <div className="flex gap-2">
          <CwButton type="primary" onClick={() => setVisible(true)}>
            显示
          </CwButton>
          <CwButton type="danger" onClick={() => setVisible(false)}>
            隐藏
          </CwButton>
          <CwButton type="primary" onClick={() => setVisible((prev) => !prev)}>
            切换
          </CwButton>
        </div>
      </div>
  )
}

export const ManualTrigger: Story = {
  args: {
    placement: 'bottom',
    trigger: 'manual',
  },
  render: (args) => <ManualTriggerDemo args={args} />,
}

function VirtualReferenceDemo() {
  const [point, setPoint] = useState({ x: 0, y: 0 })

  const virtualReference = useMemo(
      () => ({
        getBoundingClientRect: () => new DOMRect(point.x, point.y, 0, 0),
      }),
      [point],
    )

    return (
      <div
        className="p-16 text-center"
        onMouseMove={(event) => {
          setPoint({ x: event.clientX, y: event.clientY })
        }}
      >
        <div className="px-6 py-4 bg-[var(--bg-color-secondarycontainer)] border border-dashed border-[var(--border-color)] rounded-lg inline-block text-[var(--text-color-secondary)]">
          移动鼠标查看弹窗跟随效果
        </div>
        <div className="mt-4 text-xs text-[var(--text-color-placeholder)]">
          弹窗通过虚拟参考元素定位，无需真实的 trigger DOM 元素
        </div>
        <CwPopup
          trigger="manual"
          placement="bottom-start"
          modelValue
          virtualReference={virtualReference}
          plugins={[
            createDimensions(),
            createFlip({ padding: 8 }),
            createPosition(),
            createOffset({ offset: 12 }),
            createPreventOverflow({ padding: 8 }),
            createArrow({
              margin: 8,
              arrowClass:
                'w-2 h-2 bg-[var(--bg-color-container)] border-[var(--border-color)]',
            }),
          ]}
          closeOnClickOutside={false}
          popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg px-3 py-2"
        >
          <div className="text-[var(--text-color-primary)] whitespace-nowrap">
            <div className="font-semibold mb-1">📍 虚拟参考元素</div>
            <div className="text-xs text-[var(--text-color-secondary)]">
              弹窗跟随鼠标位置移动
            </div>
          </div>
        </CwPopup>
      </div>
  )
}

/**
 * 虚拟参考元素（Virtual Reference）
 * 通过传递一个包含 getBoundingClientRect 的虚拟对象来定位弹窗，
 * 适用于参考元素不是真实 DOM 元素的场景（如跟随鼠标光标、图表坐标点等）
 */
export const VirtualReference: Story = {
  render: () => <VirtualReferenceDemo />,
}

function VueComponentExampleDemo() {
  const userData = {
      name: '张三',
      email: 'zhangsan@example.com',
      status: '在线',
      avatar: 'Z',
    }
    const [actionLogs, setActionLogs] = useState<string[]>([])
    const [manualVisible, setManualVisible] = useState(false)

    const appendLog = (text: string) => {
      const time = new Date().toLocaleTimeString()
      setActionLogs((prev) => [`${time}: ${text}`, ...prev].slice(0, 5))
    }

    const handleVisibleChange = (visible: boolean) => {
      appendLog(`弹出层${visible ? '显示' : '隐藏'}`)
    }

    return (
      <div className="p-8 space-y-8 min-h-[200vh]">
        <div className="text-2xl font-bold mb-4">CwPopup React 组件使用示例</div>

        {/* 示例 1: 复杂用户菜单 (Click 触发) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">1. 复杂用户菜单 (Click 触发)</h3>
          <CwPopup
            placement="bottom-end"
            trigger="click"
            plugins={plugins}
            onVisibleChange={handleVisibleChange}
            popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg"
            triggerSlot={
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color-component-hover)] transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-color-6)] to-[var(--brand-color-6)] rounded-full flex items-center justify-center text-[var(--text-color-anti)] font-semibold text-sm">
                  {userData.avatar}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-[var(--text-color-primary)]">
                    {userData.name}
                  </div>
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    {userData.email}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-[var(--text-color-placeholder)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            }
          >
            <div className="min-w-[17.5rem] max-w-sm">
              <div className="flex items-center p-3 hairline-border-b border-[var(--border-color)]">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-color-6)] to-[var(--brand-color-6)] rounded-full flex items-center justify-center text-[var(--text-color-anti)] font-semibold mr-3">
                  {userData.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-color-primary)]">
                    {userData.name}
                  </div>
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    {userData.email}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="w-2 h-2 bg-[var(--success-color-6)] rounded-full mr-1.5" />
                    <span className="text-xs text-[var(--success-color-6)]">
                      {userData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-2">
                {[
                  { key: 'profile', label: '个人资料' },
                  { key: 'settings', label: '账户设置' },
                  { key: 'notifications', label: '通知中心' },
                  { key: 'help', label: '帮助中心' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center px-4 py-2.5 hover:bg-[var(--bg-color-component-hover)] cursor-pointer transition-colors group"
                    onClick={() => appendLog(item.label)}
                  >
                    <span className="text-sm text-[var(--text-color-secondary)] group-hover:text-[var(--text-color-primary)]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="hairline-border-t border-[var(--border-color)] py-2">
                <div
                  className="flex items-center px-4 py-2.5 hover:bg-[var(--button-danger-tint-hover-bg)] cursor-pointer transition-colors group"
                  onClick={() => appendLog('退出登录')}
                >
                  <span className="text-sm text-[var(--error-color-6)] font-medium">退出登录</span>
                </div>
              </div>
            </div>
          </CwPopup>
        </div>

        {/* 示例 2: Hover 提示 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">2. Hover 提示</h3>
          <div className="flex gap-3">
            <CwPopup
              placement="top"
              trigger="hover"
              showDelay={200}
              hideDelay={300}
              plugins={plugins}
              popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg px-3 py-1.5"
              triggerSlot={<CwButton type="primary">保存</CwButton>}
            >
              <div className="text-sm text-[var(--text-color-primary)]">保存当前更改</div>
            </CwPopup>

            <CwPopup
              placement="top"
              trigger="hover"
              showDelay={200}
              hideDelay={300}
              plugins={plugins}
              popupClass="bg-[var(--button-danger-tint-hover-bg)] border border-[var(--error-color-special)] rounded-lg shadow-lg px-3 py-1.5"
              triggerSlot={<CwButton type="danger">删除</CwButton>}
            >
              <div className="text-sm text-[var(--error-color-active)] font-medium">
                ⚠️ 此操作不可恢复
              </div>
            </CwPopup>
          </div>
        </div>

        {/* 示例 3: 手动控制 (v-model) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">3. 手动控制 (v-model)</h3>
          <CwPopup
            modelValue={manualVisible}
            onUpdateModelValue={setManualVisible}
            placement="bottom"
            trigger="manual"
            plugins={plugins}
            popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg"
            triggerSlot={
              <div className="px-4 py-2 bg-[var(--bg-color-component)] text-[var(--text-color-primary)] rounded-md inline-block">
                参考元素
              </div>
            }
          >
            <div className="p-2 text-sm text-[var(--text-color-primary)]">
              <div className="font-medium mb-2">这是手动控制的弹出层</div>
              <div className="text-xs text-[var(--text-color-secondary)]">
                通过 modelValue 进行双向绑定
              </div>
            </div>
          </CwPopup>

          <div className="mt-3 flex gap-2 items-center">
            <CwButton size="small" type="primary" onClick={() => setManualVisible(true)}>
              显示
            </CwButton>
            <CwButton size="small" type="danger" onClick={() => setManualVisible(false)}>
              隐藏
            </CwButton>
            <div className="px-3 py-1.5 text-sm bg-[var(--bg-color-component)] text-[var(--text-color-secondary)] rounded">
              状态:{' '}
              <span
                className={
                  manualVisible
                    ? 'text-[var(--success-color-6)]'
                    : 'text-[var(--text-color-placeholder)]'
                }
              >
                {manualVisible ? '显示' : '隐藏'}
              </span>
            </div>
          </div>
        </div>

        {/* 操作日志 */}
        <div className="mt-8 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg border border-[var(--border-color)]">
          <h4 className="font-semibold text-[var(--text-color-primary)] mb-3">操作日志</h4>
          {actionLogs.length === 0 ? (
            <div className="text-sm text-[var(--text-color-placeholder)]">暂无操作记录</div>
          ) : (
            <div className="space-y-1">
              {actionLogs.map((log, index) => (
                <div
                  key={`${log}-${index}`}
                  className="text-sm text-[var(--text-color-secondary)] font-mono bg-[var(--bg-color-container)] px-3 py-2 rounded border border-[var(--border-color)]"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

/**
 * 使用组件方式（推荐）
 * 展示一个复杂的用户菜单，包含交互、状态管理和事件处理
 */
export const VueComponentExample: Story = {
  render: () => <VueComponentExampleDemo />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => {
    const userData = {
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: 'Z',
    }

    return (
      <div className="flex flex-col gap-8 p-8">
        <SlotStorySection slot="trigger">
          <CwPopup
            placement="bottom-end"
            trigger="click"
            plugins={plugins}
            popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg p-3"
            triggerSlot={
              <div
                role="button"
                tabIndex={0}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] px-4 py-2 transition-colors hover:bg-[var(--bg-color-component-hover)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-color-6)] text-sm font-semibold text-[var(--text-color-anti)]">
                  {userData.avatar}
                </span>
                <span className="text-sm font-medium text-[var(--text-color-primary)]">
                  {userData.name}
                </span>
              </div>
            }
          >
            <div className="rounded-lg border border-dashed border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-color-placeholder)]">
              #default 占位
            </div>
          </CwPopup>
        </SlotStorySection>
        <SlotStorySection slot="default">
          <CwPopup
            placement="bottom-start"
            trigger="click"
            plugins={plugins}
            popupClass="bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg shadow-lg p-3"
            triggerSlot={
              <div
                role="button"
                tabIndex={0}
                className="rounded-md border border-dashed border-[var(--border-color)] px-4 py-2 text-sm text-[var(--text-color-secondary)]"
              >
                #trigger 占位
              </div>
            }
          >
            <div className="min-w-[12.5rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3 shadow-sm">
              <div className="mb-2 hairline-border-b border-[var(--border-color)] pb-2">
                <div className="text-sm font-semibold text-[var(--text-color-primary)]">
                  {userData.name}
                </div>
                <div className="text-xs text-[var(--text-color-secondary)]">{userData.email}</div>
              </div>
              <div
                role="button"
                tabIndex={0}
                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[var(--bg-color-component-hover)]"
              >
                弹出层菜单项
              </div>
            </div>
          </CwPopup>
        </SlotStorySection>
      </div>
    )
  },
}
