import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtTypography } from '.'
import type { AtTypographyProps } from './types'

const meta: Meta<AtTypographyProps> = {
  title: 'At/AtTypography',
  component: AtTypography,
}
export default meta

type Story = StoryObj<AtTypographyProps>

export const Text: Story = { args: { children: 'This is text', variant: 'text' } }
export const Title: Story = { args: { children: 'This is title', variant: 'title', level: 3 } }
export const Paragraph: Story = {
  args: {
    children:
      'Ant Design is a design system for enterprise-level products. Create an efficient and enjoyable work experience.',
    variant: 'paragraph',
  },
}