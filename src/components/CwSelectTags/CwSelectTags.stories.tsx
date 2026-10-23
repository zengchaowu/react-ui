import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSelectTags } from './CwSelectTags'
import { CwSelect } from '../CwSelect'
import type { CwSelectOption } from '../CwSelect/types'
import { defaultTexts } from './texts'

const demoTags: CwSelectOption[] = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' },
]

const meta: Meta<typeof CwSelectTags> = {
  title: '1. Components/Form/CwSelectTags',
  component: CwSelectTags,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '多选标签展示与折叠组件，通常作为 `CwSelect` 多选模式的触发区（含下拉箭头与清除）；单独使用时仅展示标签，不含下拉面板。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    closable: { control: { type: 'boolean' }, description: '是否显示标签删除钮' },
    showLabel: { control: { type: 'boolean' } },
    collapseSelectAll: { control: { type: 'boolean' } },
    maxRows: { control: { type: 'number', min: 1, step: 1 } },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    selectAllText: { control: { type: 'text' } },
    moreText: { control: { type: 'text' } },
    tagSize: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    tagType: {
      control: { type: 'select' },
      options: ['default', 'primary', 'success', 'warning', 'danger'],
    },
    tags: { control: false, description: '选项列表' },
    value: { control: false },
    selectAll: { control: { type: 'boolean' } },
    texts: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof CwSelectTags>

function SelectTagsDemo(props: ComponentProps<typeof CwSelectTags>) {
  const [value, setValue] = useState<Array<string | number>>(['a', 'b'])
  const [selectAll, setSelectAll] = useState(Boolean(props.selectAll))
  return (
    <div className="w-[min(100%,420px)] p-4">
      <CwSelectTags
        {...props}
        tags={demoTags}
        texts={defaultTexts}
        value={value}
        selectAll={selectAll}
        onChange={(nextValue, nextSelectAll) => {
          setValue(nextValue)
          setSelectAll(nextSelectAll)
        }}
        onSelectAllChange={setSelectAll}
      />
      <p className="mt-3 text-xs text-[var(--text-color-secondary)]">
        已选: {JSON.stringify(value)}
      </p>
    </div>
  )
}

export const Default: Story = {
  args: {
    placeholder: '请选择',
    label: '标签',
    showLabel: false,
    closable: true,
    collapseSelectAll: true,
    maxRows: 2,
    disabled: false,
    readonly: false,
    size: 'medium',
    tagType: 'default',
  },
  render: (args) => <SelectTagsDemo {...args} />,
}

/** 通过 CwSelect 多选使用（可点击展开下拉、清除、改选） */
export const WithCwSelect: Story = {
  render: () => {
    function WithCwSelectDemo() {
      const [value, setValue] = useState<Array<string | number>>(['a'])
      return (
        <div className="w-[min(100%,420px)] p-4">
          <CwSelect
            value={value}
            onChange={(next) => setValue(Array.isArray(next) ? [...next] : [])}
            options={demoTags}
            multiple
            clearable
            placeholder="请选择"
            texts={{ tagsTexts: defaultTexts }}
          />
          <p className="mt-3 text-xs text-[var(--text-color-secondary)]">
            已选: {JSON.stringify(value)}
          </p>
        </div>
      )
    }
    return <WithCwSelectDemo />
  },
}

/** 全选且 collapseSelectAll 时，触发区只显示一个「全选」标签（需配合 CwSelect 才有下拉） */
export const SelectAllCollapsed: Story = {
  render: () => {
    function SelectAllCollapsedDemo() {
      const [value, setValue] = useState<Array<string | number>>(['a', 'b', 'c'])
      const [isSelectAll, setIsSelectAll] = useState(true)
      return (
        <div className="w-[min(100%,420px)] p-4">
          <CwSelect
            value={value}
            onChange={(next) => setValue(Array.isArray(next) ? [...next] : [])}
            selectAll={isSelectAll}
            onSelectAllChange={setIsSelectAll}
            options={demoTags}
            multiple
            clearable
            placeholder="请选择"
            texts={{ tagsTexts: defaultTexts }}
            tagsProps={{ collapseSelectAll: true }}
          />
          <p className="mt-3 text-xs text-[var(--text-color-secondary)]">
            全选时应只显示一个「全选」标签；点击触发区可展开下拉继续改选
          </p>
        </div>
      )
    }
    return <SelectAllCollapsedDemo />
  },
}

export const WithLabelAndMaxRows: Story = {
  render: () => {
    function WithLabelAndMaxRowsDemo() {
      const [value, setValue] = useState<Array<string | number>>(['a', 'b', 'c'])
      return (
        <div className="w-[min(100%,420px)] p-4">
          <CwSelect
            value={value}
            onChange={(next) => setValue(Array.isArray(next) ? [...next] : [])}
            options={demoTags}
            multiple
            clearable
            placeholder="请选择"
            texts={{ tagsTexts: defaultTexts }}
            tagsProps={{ maxRows: 1, collapseSelectAll: false }}
          />
        </div>
      )
    }
    return <WithLabelAndMaxRowsDemo />
  },
}

/** 仅标签区（无下拉），与 Default 相同 props 绑定方式 */
export const TagsOnly: Story = {
  ...Default,
}

