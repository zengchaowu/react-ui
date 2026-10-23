import type { Meta, StoryObj } from '@storybook/react'
import { CwRow } from './CwRow'
import { CwCol } from './CwCol'
import { CwWrapRow } from './CwWrapRow'

const colClass = 'rounded p-4 text-center bg-[var(--brand-color-focus)]'

const meta: Meta<typeof CwRow> = {
  title: '1. Components/Layout/CwRow',
  component: CwRow,
}

export default meta
type Story = StoryObj<typeof CwRow>

export const Default: Story = {
  args: {
    gutter: 16,
    wrap: true,
    align: 'top',
    justify: 'start',
    children: (
      <>
        <CwCol xs={6}>
          <div className={colClass}>Col 1</div>
        </CwCol>
        <CwCol xs={6}>
          <div className={colClass}>Col 2</div>
        </CwCol>
        <CwCol xs={6}>
          <div className={colClass}>Col 3</div>
        </CwCol>
        <CwCol xs={6}>
          <div className={colClass}>Col 4</div>
        </CwCol>
      </>
    ),
  },
}

export const WrapRow: Story = {
  render: () => (
    <CwWrapRow wrap maxRows={1} colPros={{ xs: 8 }} gutter={16}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <CwCol key={item} xs={8}>
          <div className={colClass}>Item {item}</div>
        </CwCol>
      ))}
    </CwWrapRow>
  ),
}
