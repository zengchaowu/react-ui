import type { Meta, StoryObj } from '@storybook/react'
import { TpFabricDesignEditor } from './TpFabricDesignEditor'

const meta: Meta<typeof TpFabricDesignEditor> = {
  title: 'Tp/TpFabricDesignEditor',
  component: TpFabricDesignEditor,
}

export default meta
type Story = StoryObj<typeof TpFabricDesignEditor>

export const Default: Story = {
  args: {
    children: 'TpFabricDesignEditor',
  },
}
