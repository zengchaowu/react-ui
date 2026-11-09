import type { Meta, StoryObj } from '@storybook/react'
import { TpDesignEditor } from './TpDesignEditor'

const meta: Meta<typeof TpDesignEditor> = {
  title: '2. Third Party/3D & Graphics/TpDesignEditor',
  component: TpDesignEditor,
}

export default meta
type Story = StoryObj<typeof TpDesignEditor>

export const Default: Story = {
  args: {},
}
