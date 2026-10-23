import type { Meta, StoryObj } from '@storybook/react'
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
          void showConfirmDialog({ ...args })
        }}
      >
        显示确认对话框
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
          void showConfirmDialog({ ...args })
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
    message: '这是一个标题展示在正文区的确认对话框。',
    showTitleInHeader: false,
    showTitleInContent: true,
  },
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showConfirmDialog({ ...args })
        }}
      >
        显示正文标题对话框
      </CwButton>
    </div>
  ),
}
