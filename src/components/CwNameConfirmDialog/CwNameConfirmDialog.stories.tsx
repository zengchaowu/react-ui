import type { Meta, StoryObj } from '@storybook/react'
import CwButton from '../CwButton/CwButton'
import { showNameConfirmDialog } from './showNameConfirmDialog'
import type { CwNameConfirmDialogOptions } from '@zengchaowu/ui-shared/components/CwNameConfirmDialog/types'

const meta: Meta<CwNameConfirmDialogOptions> = {
  title: '1. Components/Overlay/CwNameConfirmDialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Type-to-confirm dialog via `showNameConfirmDialog`. Confirm stays disabled until the expected name matches.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    title: '删除项目',
    message: '删除后无法恢复，请输入项目名称确认。',
    expectedName: 'demo-project',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="danger"
        onClick={() => {
          void showNameConfirmDialog({ ...args } as CwNameConfirmDialogOptions)
        }}
      >
        删除并输入名称确认
      </CwButton>
    </div>
  ),
}
