import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtMenu } from '.'
import type { MenuProps } from './types'

const meta: Meta<MenuProps> = {
  title: 'At/AtMenu',
  component: AtMenu,
}
export default meta

type Story = StoryObj<MenuProps>

export const Basic: Story = {
  args: {
    mode: 'horizontal',
    items: [
      { key: 'home', label: 'Home' },
      { key: 'about', label: 'About' },
      { key: 'contact', label: 'Contact' },
    ],
  },
}