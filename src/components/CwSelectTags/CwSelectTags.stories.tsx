import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSelectTags } from './CwSelectTags'
import type { CwSelectTagsTag } from './types'

const demoTags: CwSelectTagsTag[] = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' },
]

const meta: Meta<typeof CwSelectTags> = {
  title: '1. Components/Form/CwSelectTags',
  component: CwSelectTags,
}

export default meta
type Story = StoryObj<typeof CwSelectTags>

export const Default: Story = {
  args: {
    tags: demoTags,
    maxRows: 2,
    placeholder: '请选择',
    label: '标签',
    showLabel: false,
  },
  render: (args) => {
    const [value, setValue] = useState<Array<string | number>>(['a', 'b'])

    return (
      <div className="w-[min(100%,420px)] p-4">
        <CwSelectTags
          {...args}
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
        />
      </div>
    )
  },
}
