import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtTour } from '.'
import type { TourProps } from './types'

const meta: Meta<TourProps> = {
  title: 'At/AtTour',
  component: AtTour,
}
export default meta

type Story = StoryObj<TourProps>

export const Basic: Story = {
  args: {
    open: true,
    steps: [
      {
        title: 'At/AtTour',
        description: 'Put your files here.',
        target: () => document.querySelector('.upload-btn') as HTMLElement,
      },
      {
        title: 'At/AtTour',
        description: 'Save your changes.',
        target: () => document.querySelector('.save-btn') as HTMLElement,
      },
    ],
  },
}