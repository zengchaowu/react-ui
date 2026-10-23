import type { Meta, StoryObj } from '@storybook/react'
import CwButton from '../CwButton/CwButton'
import { showAppUpdateDialog } from './CwAppUpdateDialog'
import type { AppUpdateDialogOptions } from './types'

const meta: Meta<AppUpdateDialogOptions> = {
  title: '1. Components/Overlay/CwAppUpdateDialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '应用更新弹窗，通过 `showAppUpdateDialog` 以命令式方式打开。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    version: '1.2.0',
    notes: '修复已知问题并提升稳定性。',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showAppUpdateDialog({ ...args } as AppUpdateDialogOptions)
        }}
      >
        打开更新弹窗
      </CwButton>
    </div>
  ),
}
