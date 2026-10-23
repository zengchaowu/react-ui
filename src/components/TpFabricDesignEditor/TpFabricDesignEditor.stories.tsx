import type { Meta, StoryObj } from '@storybook/react'
import { TpFabricDesignEditor } from './TpFabricDesignEditor'

const meta: Meta<typeof TpFabricDesignEditor> = {
  title: '2. Third Party/Editor/TpFabricDesignEditor',
  component: TpFabricDesignEditor,
}

export default meta
type Story = StoryObj<typeof TpFabricDesignEditor>

export const Default: Story = {
  args: {
    width: 800,
    height: 600,
  },
  render: (args) => (
    <div style={{ display: 'flex', height: 480 }}>
      <TpFabricDesignEditor {...args} />
    </div>
  ),
}
