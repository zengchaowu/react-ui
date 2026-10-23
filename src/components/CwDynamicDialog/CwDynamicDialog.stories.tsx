import type { Meta, StoryObj } from '@storybook/react'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { CwButton } from '../CwButton'
import CwDynamicDialog from './CwDynamicDialog'
import { showDynamicDialog } from './index'
import type { CwDynamicDialogConfig } from './types'

type DynamicDialogStoryArgs = {
  headerTitle: string
  bodyText: string
  closeOnClickOutside: boolean
  draggable: boolean
  showCloseButton: boolean
}

const meta: Meta<DynamicDialogStoryArgs> = {
  title: '1. Components/Overlay/CwDynamicDialog',
  component: CwDynamicDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: "动态弹窗的函数式 API：showDynamicDialog(options) -> Promise<'close' | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    headerTitle: { control: { type: 'text' }, name: '标题' },
    bodyText: { control: { type: 'text' }, name: '正文' },
    closeOnClickOutside: { control: { type: 'boolean' } },
    draggable: { control: { type: 'boolean' } },
    showCloseButton: { control: { type: 'boolean' } },
  },
  args: {
    headerTitle: '弹窗标题',
    bodyText: '这是一个默认的动态弹窗示例，点击背景可以关闭。',
    closeOnClickOutside: true,
    draggable: false,
    showCloseButton: false,
  },
}

export default meta
type Story = StoryObj<DynamicDialogStoryArgs>

function buildDialogConfig(args: DynamicDialogStoryArgs): CwDynamicDialogConfig {
  return {
    header: <div className={CW_OVERLAY_HEADER_TITLE_CLASS}>{args.headerTitle}</div>,
    closeOnClickOutside: args.closeOnClickOutside,
    draggable: args.draggable,
    ...(args.showCloseButton ? { showCloseButton: true } : {}),
  }
}

function buildDialogBody(args: DynamicDialogStoryArgs) {
  return (
    <div className="p-6 text-center">
      <p className="mb-6 text-[var(--text-color-secondary)]">{args.bodyText}</p>
    </div>
  )
}

export const Default: Story = {
  render: (args) => {
    const showDialog = async () => {
      const { promise } = showDynamicDialog({
        component: buildDialogBody(args),
        config: buildDialogConfig(args),
      })
      const result = await promise
      console.log('Dialog result:', result)
    }

    return (
      <div className="p-4">
        <p className="mb-3 text-sm text-[var(--text-color-secondary)]">Controls 影响下次打开的弹窗</p>
        <CwButton type="primary" onClick={showDialog}>
          显示默认弹窗
        </CwButton>
      </div>
    )
  },
}

export const DraggableDialog: Story = {
  args: {
    headerTitle: '可拖拽弹窗',
    bodyText: '你可以通过拖拽标题栏来移动这个弹窗。',
    draggable: true,
    closeOnClickOutside: true,
  },
  render: (args) => {
    const showDraggableDialog = async () => {
      const { promise } = showDynamicDialog({
        component: buildDialogBody(args),
        config: {
          ...buildDialogConfig(args),
          background: {
            class: 'bg-[var(--mask-active)]',
          },
          content: {
            class: 'max-w-md',
          },
        },
      })
      const result = await promise
      console.log('Dialog result:', result)
    }

    return (
      <div className="p-4">
        <CwButton type="primary" onClick={showDraggableDialog}>
          显示可拖拽弹窗
        </CwButton>
      </div>
    )
  },
}

export const CloseWithoutHeader: Story = {
  args: {
    headerTitle: '',
    bodyText: '无标题栏，仅保留右上角关闭钮（absolute top-2 right-2，与有顶栏时一致）。',
    showCloseButton: true,
    closeOnClickOutside: true,
  },
  render: (args) => {
    const showDialog = async () => {
      const { promise } = showDynamicDialog({
        component: (
          <div className="text-sm text-[var(--text-color-secondary)]">{args.bodyText}</div>
        ),
        config: {
          showCloseButton: args.showCloseButton,
          closeOnClickOutside: args.closeOnClickOutside,
          content: { class: 'max-w-md' },
        },
      })
      await promise
    }

    return (
      <div className="p-4">
        <CwButton type="primary" onClick={showDialog}>
          无 Header、有关闭钮
        </CwButton>
      </div>
    )
  },
}

export const WithFooter: Story = {
  args: {
    headerTitle: '带底部栏的弹窗',
    bodyText: '这是一个带底部操作栏的弹窗示例。',
    closeOnClickOutside: true,
  },
  render: (args) => {
    const showDialog = async () => {
      const result = await showDynamicDialog({
        component: (
          <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4">
            <div className="p-6">
              <p className="text-[var(--text-color-secondary)]">{args.bodyText}</p>
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-2">
              <CwButton variant="text" onClick={() => {}}>
                取消
              </CwButton>
              <CwButton type="primary" onClick={() => {}}>
                确认
              </CwButton>
            </div>
          </div>
        ),
        config: {
          ...buildDialogConfig(args),
        },
      })
      console.log('Dialog result:', result)
    }

    return (
      <div className="p-4">
        <CwButton type="primary" onClick={showDialog}>
          显示带底部栏的弹窗
        </CwButton>
      </div>
    )
  },
}
