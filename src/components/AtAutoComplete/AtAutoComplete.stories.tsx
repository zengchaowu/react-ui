import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtAutoComplete } from '.'
import type { AutoCompleteProps } from './types'

const meta: Meta<AutoCompleteProps> = {
  title: 'At/AtAutoComplete',
  component: AtAutoComplete,
}
export default meta

type Story = StoryObj<AutoCompleteProps>

export const Basic: Story = {
  args: {
    style: { width: 240 },
    options: [
      { value: 'One' },
      { value: 'Two' },
      { value: 'Three' },
    ],
    placeholder: 'Type to search',
  },
}