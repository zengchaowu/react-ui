import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwFileDropTarget } from './CwFileDropTarget'
import type { CwFileDropTargetProps } from './types'
import { defaultCwFileDropTargetTexts } from '@zengchaowu/ui-shared/components/CwFileDropTarget/texts'

const meta: Meta<typeof CwFileDropTarget> = {
  title: '1. Components/Form/CwFileDropTarget',
  component: CwFileDropTarget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '文件拖拽投放区域，拖入外部文件时显示 overlay 提示。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

type DemoProps = Pick<CwFileDropTargetProps, 'texts'>

function Demo({ texts = defaultCwFileDropTargetTexts }: DemoProps) {
  const [names, setNames] = useState<string[]>([])

  return (
    <div className="h-72 w-[32rem]">
      <CwFileDropTarget
        className="h-full w-full overflow-hidden rounded-lg border border-dashed border-[var(--border-color)] transition-[border-color] duration-150"
        texts={texts}
        onFilesDrop={(files) => setNames(files.map((file) => file.name))}
      >
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-[var(--text-color-secondary)]">
          <span>将文件拖入此区域</span>
          {names.length ? (
            <span className="max-w-full truncate text-xs text-[var(--text-color-primary)]">
              已接收：{names.join(', ')}
            </span>
          ) : null}
        </div>
      </CwFileDropTarget>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    texts: defaultCwFileDropTargetTexts,
  },
}
