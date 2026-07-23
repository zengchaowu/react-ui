import type { Meta, StoryObj } from '@storybook/react'
import { CwParticleBackground } from './CwParticleBackground'

const meta: Meta<typeof CwParticleBackground> = {
  title: 'Cw/CwParticleBackground',
  component: CwParticleBackground,
}

export default meta
type Story = StoryObj<typeof CwParticleBackground>

export const Default: Story = {
  args: {
    children: 'CwParticleBackground',
  },
}
