import type { ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { CwButton } from '../CwButton'
import { CwDynamicSheet } from './CwDynamicSheet'
import { showDynamicSheet } from './showDynamicSheet'
import type { CwDynamicSheetConfig } from './types'
import type { CwDynamicSheetDirection } from '@zengchaowu/ui-shared/components/CwDynamicSheet/types'

type DynamicSheetStoryArgs = {
  headerTitle: string
  bodyText: string
  direction: CwDynamicSheetDirection
  closeOnClickOutside: boolean
  dragToClose: boolean
  showDragHandle: boolean
}

const meta: Meta<DynamicSheetStoryArgs> = {
  title: '1. Components/Overlay/CwDynamicSheet',
  component: CwDynamicSheet as unknown as ComponentType<DynamicSheetStoryArgs>,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: "动态弹出组件的函数式 API：showDynamicSheet(options) -> Promise<'close' | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    headerTitle: { control: { type: 'text' }, name: '标题' },
    bodyText: { control: { type: 'text' }, name: '正文' },
    direction: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    closeOnClickOutside: { control: { type: 'boolean' } },
    dragToClose: { control: { type: 'boolean' } },
    showDragHandle: { control: { type: 'boolean' } },
  },
  args: {
    headerTitle: 'Sheet 标题',
    bodyText: '这是一个默认的底部弹出组件示例，点击背景可以关闭。',
    direction: 'bottom',
    closeOnClickOutside: true,
    dragToClose: true,
    showDragHandle: false,
  },
}

export default meta
type Story = StoryObj<DynamicSheetStoryArgs>

function buildSheetConfig(args: DynamicSheetStoryArgs): CwDynamicSheetConfig {
  return {
    direction: args.direction,
    closeOnClickOutside: args.closeOnClickOutside,
    dragToClose: args.dragToClose,
    showDragHandle: args.showDragHandle,
    header: <div className={CW_OVERLAY_HEADER_TITLE_CLASS}>{args.headerTitle}</div>,
  }
}

function buildSheetBody(args: DynamicSheetStoryArgs) {
  return (
    <div className="p-6">
      <p className="mb-6 text-[var(--text-color-secondary)]">{args.bodyText}</p>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <DefaultDemo {...args} />,
}

function DefaultDemo(args: DynamicSheetStoryArgs) {
  const showSheet = async () => {
    const { promise } = showDynamicSheet({
      component: buildSheetBody(args),
      config: buildSheetConfig(args),
    })
    const result = await promise
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <p className="mb-3 text-sm text-[var(--text-color-secondary)]">
        Controls 影响下次打开的 Sheet
      </p>
      <CwButton type="primary" onClick={showSheet}>
        显示底部 Sheet
      </CwButton>
    </div>
  )
}

export const WithCustomHeight: Story = {
  args: {
    headerTitle: '自定义高度',
    bodyText: '这个 Sheet 的高度被设置为 400px。',
    direction: 'bottom',
  },
  render: (args) => <WithCustomHeightDemo {...args} />,
}

function WithCustomHeightDemo(args: DynamicSheetStoryArgs) {
  const showSheet = async () => {
    const result = await showDynamicSheet({
      component: buildSheetBody(args),
      config: {
        ...buildSheetConfig(args),
        content: {
          class: 'w-full flex-col h-[400px] pb-[env(safe-area-inset-bottom,0px)]',
        },
      },
    })
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        显示自定义高度 Sheet
      </CwButton>
    </div>
  )
}

export const WithFooter: Story = {
  args: {
    headerTitle: '带底部栏的 Sheet',
    bodyText: '这是一个带底部操作栏的 Sheet 示例。',
    closeOnClickOutside: true,
  },
  render: (args) => <WithFooterDemo {...args} />,
}

function WithFooterDemo(args: DynamicSheetStoryArgs) {
  const showSheet = async () => {
    const result = await showDynamicSheet({
      component: buildSheetBody(args),
      config: {
        ...buildSheetConfig(args),
        footer: (
          <div className="flex items-center justify-end gap-2">
            <CwButton variant="text" onClick={() => {}}>
              取消
            </CwButton>
            <CwButton type="primary" onClick={() => {}}>
              确认
            </CwButton>
          </div>
        ),
      },
    })
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        显示带底部栏的 Sheet
      </CwButton>
    </div>
  )
}

export const FromTop: Story = {
  args: {
    direction: 'top',
    headerTitle: '顶部 Sheet',
    bodyText: '这个 Sheet 从顶部滑入，适合通知、提示等场景。',
    dragToClose: false,
  },
  render: (args) => <FromTopDemo {...args} />,
}

function FromTopDemo(args: DynamicSheetStoryArgs) {
  const showSheet = async () => {
    const result = await showDynamicSheet({
      component: buildSheetBody(args),
      config: {
        ...buildSheetConfig(args),
        content: {
          class: 'w-full flex-col h-[300px] pt-[env(safe-area-inset-top,0px)]',
        },
      },
    })
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        从顶部弹出
      </CwButton>
    </div>
  )
}

export const FromLeft: Story = {
  args: {
    direction: 'left',
    headerTitle: '左侧菜单',
    bodyText: '这个 Sheet 从左侧滑入，适合侧边栏、导航菜单等场景。',
    dragToClose: false,
  },
  render: (args) => <FromLeftDemo {...args} />,
}

function FromLeftDemo(args: DynamicSheetStoryArgs) {
  const showSheet = async () => {
    const result = await showDynamicSheet({
      component: buildSheetBody(args),
      config: {
        ...buildSheetConfig(args),
        content: {
          class: 'h-full flex-col max-w-[300px] w-[300px] pl-[env(safe-area-inset-left,0px)]',
        },
      },
    })
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        从左侧弹出
      </CwButton>
    </div>
  )
}

export const FromRight: Story = {
  args: {
    direction: 'right',
    headerTitle: '右侧面板',
    bodyText: '这个 Sheet 从右侧滑入，适合设置面板、详情页等场景。',
    dragToClose: false,
  },
  render: (args) => <FromRightDemo {...args} />,
}

function FromRightDemo(args: DynamicSheetStoryArgs) {
  const showSheet = async () => {
    const result = await showDynamicSheet({
      component: buildSheetBody(args),
      config: {
        ...buildSheetConfig(args),
        content: {
          class: 'h-full flex-col max-w-[350px] w-[350px] pr-[env(safe-area-inset-right,0px)]',
        },
      },
    })
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        从右侧弹出
      </CwButton>
    </div>
  )
}

export const DragToClose: Story = {
  args: {
    headerTitle: '',
    bodyText: '',
    direction: 'bottom',
    dragToClose: true,
    showDragHandle: true,
    closeOnClickOutside: true,
  },
  render: (args) => <DragToCloseDemo {...args} />,
}

function DragToCloseDemo(args: DynamicSheetStoryArgs) {
  const sheetContent = (
    <div className="space-y-3">
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className="rounded-[var(--radius-medium)] bg-[var(--bg-color-component)] px-4 py-3 text-[var(--text-color-secondary)]"
        >
          可滚动内容 {index + 1}
        </div>
      ))}
    </div>
  )

  const showSheet = async () => {
    await showDynamicSheet({
      component: sheetContent,
      config: {
        ...buildSheetConfig(args),
        header: undefined,
        content: {
          class:
            'w-full flex-col max-h-[70vh] pb-[env(safe-area-inset-bottom,0px)] rounded-t-[var(--radius-large)]',
        },
      },
    })
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        拖拽跟手关闭
      </CwButton>
    </div>
  )
}
