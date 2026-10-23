import type { Meta, StoryObj } from '@storybook/react'
import { storyAlert } from '../../storybook/storyAlert'
import CwButton from '../CwButton/CwButton'
import { showConfirmDialog } from './showConfirmDialog'
import type { CwConfirmDialogOptions } from './types'

const meta: Meta<CwConfirmDialogOptions> = {
  title: '1. Components/Overlay/CwConfirmDialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '基于 CwDynamicDialog 的确认对话框函数，提供简单的 Promise API 来显示确认对话框。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: { type: 'text' } },
    message: { control: { type: 'text' } },
    confirmText: { control: { type: 'text' } },
    cancelText: { control: { type: 'text' } },
    confirmType: {
      control: { type: 'select' },
      options: ['default', 'primary', 'danger'],
    },
    cancelType: {
      control: { type: 'select' },
      options: ['default', 'primary', 'danger'],
    },
    showCancel: { control: { type: 'boolean' } },
    showTitleInHeader: { control: { type: 'boolean' } },
    showTitleInContent: { control: { type: 'boolean' } },
    texts: { control: false },
    dialogConfig: { control: false },
  },
  args: {
    title: '确认删除',
    message: '确定要删除这个项目吗？此操作无法撤销。',
    confirmText: '确认',
    cancelText: '取消',
    confirmType: 'primary',
    cancelType: 'default',
    showCancel: true,
    showTitleInHeader: true,
    showTitleInContent: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="p-4">
      <p className="mb-3 text-sm text-[var(--text-color-secondary)]">
        Controls 影响下次打开的对话框
      </p>
      <CwButton
        type="primary"
        onClick={() => {
          void showConfirmDialog({ ...args }).then((result) => {
            console.log('用户选择:', result)
            if (result === 'confirm') {
              storyAlert('已确认删除')
            }
          })
        }}
      >
        显示确认对话框
      </CwButton>
    </div>
  ),
}

export const CustomButtons: Story = {
  args: {
    title: '危险操作',
    message: '此操作可能会导致数据丢失，请谨慎操作。',
    confirmText: '确定删除',
    cancelText: '我再想想',
    confirmType: 'danger',
    cancelType: 'default',
  },
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="danger"
        onClick={() => {
          void showConfirmDialog({ ...args }).then((result) => {
            console.log('用户选择:', result)
          })
        }}
      >
        显示危险操作确认对话框
      </CwButton>
    </div>
  ),
}

export const NoCancelButton: Story = {
  args: {
    title: '提示',
    message: '操作已成功完成！',
    confirmText: '知道了',
    showCancel: false,
  },
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showConfirmDialog({ ...args }).then((result) => {
            console.log('用户选择:', result)
          })
        }}
      >
        显示提示对话框（无取消按钮）
      </CwButton>
    </div>
  ),
}

export const TitleInContent: Story = {
  args: {
    title: '自定义样式',
    message: '这是一个标题展示在正文区的对话框。',
    showTitleInHeader: false,
    showTitleInContent: true,
  },
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showConfirmDialog({ ...args }).then((result) => {
            console.log('用户选择:', result)
          })
        }}
      >
        显示正文标题对话框
      </CwButton>
    </div>
  ),
}
