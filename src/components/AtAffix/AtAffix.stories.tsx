import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtAffix } from '.'
import type { AffixProps } from './types'

const meta: Meta<AffixProps> = {
  title: 'At/AtAffix',
  component: AtAffix,
}
export default meta

type Story = StoryObj<AffixProps>

export const Basic: Story = {
  args: {
    offsetTop: 20,
    children: (
      <div style={{ background: '#fafafa', padding: 12, border: '1px solid #ddd' }}>
        Affixed content
      </div>
    ),
  },
}