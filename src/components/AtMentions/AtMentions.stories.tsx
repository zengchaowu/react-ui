import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtMentions } from '.'
import type { MentionsProps } from './types'

const meta: Meta<MentionsProps> = {
  title: 'At/AtMentions',
  component: AtMentions,
}
export default meta

type Story = StoryObj<MentionsProps>

export const Basic: Story = {
  args: {
    style: { width: 300 },
    placeholder: 'Type @ to mention',
    options: [
      { value: 'afc163' },
      { value: 'zombieJ' },
      { value: 'yesmeck' },
    ],
  },
}