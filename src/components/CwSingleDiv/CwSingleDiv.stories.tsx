import type { Meta, StoryObj } from '@storybook/react'
import { CwSingleDiv } from './CwSingleDiv'
import type { CwSingleDivDSL } from './types'

const meta: Meta<typeof CwSingleDiv> = {
  title: '1. Components/Layout/CwSingleDiv',
  component: CwSingleDiv,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof CwSingleDiv>

const circleDsl: CwSingleDivDSL = {
  main: {
    width: '6rem',
    height: '6rem',
    background: 'var(--brand-color-6)',
    borderRadius: '50%',
    boxShadow: 'var(--shadow-2)',
  },
}

export const Default: Story = {
  args: {
    dsl: circleDsl,
  },
}

export const NestedChildren: Story = {
  args: {
    dsl: {
      main: {
        position: 'relative',
        width: '7rem',
        height: '7rem',
        background: 'var(--warning-color-5)',
        borderRadius: '50%',
      },
      children: [
        {
          main: {
            position: 'absolute',
            top: '1.6rem',
            left: '1.5rem',
            width: '1.1rem',
            height: '1.1rem',
            background: 'var(--gray-color-15)',
            borderRadius: '50%',
          },
        },
        {
          main: {
            position: 'absolute',
            top: '1.6rem',
            right: '1.5rem',
            width: '1.1rem',
            height: '1.1rem',
            background: 'var(--gray-color-15)',
            borderRadius: '50%',
          },
        },
      ],
    } satisfies CwSingleDivDSL,
  },
}
