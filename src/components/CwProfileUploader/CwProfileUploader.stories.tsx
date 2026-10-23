import type { Meta, StoryObj } from '@storybook/react'
import { CwProfileUploader } from './CwProfileUploader'
import { numberControlArgType } from '../../storybook/argTypes'

const storybookProfileImageSrc =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop'

async function mockUpload(file: File): Promise<string> {
  await new Promise((r) => setTimeout(r, 5000))
  if (Math.random() < 0.5) {
    throw new Error('Mock upload failed')
  }
  return URL.createObjectURL(file)
}

const meta = {
  title: '1. Components/Form/CwProfileUploader',
  component: CwProfileUploader,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    accept: 'image/*',
    multiple: false,
    maxCount: 1,
    upload: mockUpload,
    profileImage: storybookProfileImageSrc,
  },
  argTypes: {
    multiple: { control: 'boolean' },
    maxCount: numberControlArgType({ min: 1, step: 1 }),
    deletable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    accept: { control: 'text' },
    profileImage: { control: 'text' },
    upload: { control: false },
    texts: { control: false },
  },
} satisfies Meta<typeof CwProfileUploader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div>
      <CwProfileUploader {...args} />
    </div>
  ),
}

export const Multiple: Story = {
  args: {
    multiple: true,
    maxCount: 3,
  },
  render: Default.render,
}
