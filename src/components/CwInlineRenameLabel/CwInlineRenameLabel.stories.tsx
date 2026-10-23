import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwInlineRenameLabel } from './CwInlineRenameLabel'

const meta: Meta<typeof CwInlineRenameLabel> = {
  title: '1. Components/Form/CwInlineRenameLabel',
  component: CwInlineRenameLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Inline rename host for line-clamp labels on top of CwEditableText.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: { type: 'text' }, description: '展示名称' },
    renaming: { control: { type: 'boolean' }, description: '是否处于重命名态' },
    align: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: '文本对齐',
    },
    labelClass: { control: { type: 'text' }, description: '标签 class' },
    asyncModify: { control: false },
    texts: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof CwInlineRenameLabel>

export const Default: Story = {
  args: {
    name: 'Untitled folder',
    renaming: true,
    align: 'left',
    labelClass: 'line-clamp-2 text-sm',
  },
  render: (args) => {
    const [name, setName] = useState(args.name)
    const [renaming, setRenaming] = useState(args.renaming)

    useEffect(() => {
      setName(args.name)
    }, [args.name])

    useEffect(() => {
      setRenaming(args.renaming)
    }, [args.renaming])

    async function asyncModify(next: string) {
      setName(next.trim() || name)
      setRenaming(false)
      return true
    }

    return (
      <div className="w-[12rem]">
        <CwInlineRenameLabel
          name={name}
          renaming={renaming}
          asyncModify={asyncModify}
          labelClass={args.labelClass}
          align={args.align}
          onCancel={() => setRenaming(false)}
          onSuccess={() => setRenaming(false)}
        />
      </div>
    )
  },
}
