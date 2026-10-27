import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwDataTable } from './CwDataTable'
import type { CwDataTableComponentProps } from './CwDataTable'
import CwLoading from '../CwLoading/CwLoading'
import CwEmptyState from '../CwEmptyState/CwEmptyState'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDataTable/texts'
import type {
  CwDataTableConfig,
  CwDataTableExternalRowScope,
  CwDataTableHeaderRenderContext,
  CwDataTableRow,
} from './types'
import { groupRowsByFieldAsTree } from './functions/treeUtils'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwDataTable> = {
  title: '1. Components/Display/CwDataTable',
  component: CwDataTable,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '数据表格组件，支持固定表头、固定列、虚拟滚动、列宽调整、自定义组件渲染等。默认在布局完成后从表体首行测量列宽写入 columnWidths，使表头与表体像素对齐（config.syncColumnWidthsFromBody 可关闭）。亦可手动调用 syncColumnWidthsFromBodyRow。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: { type: 'boolean' },
      description: '是否显示加载中',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwDataTable>

// 示例数据
const sampleConfig: CwDataTableConfig = {
  columns: [
    { key: 'name', title: '姓名', sortable: true, width: 200 },
    { key: 'age', title: '年龄', sortable: true, align: 'center', width: 150 },
    { key: 'email', title: '邮箱', width: 300 },
    { key: 'status', title: '状态', align: 'center', width: 150 },
    { key: 'score', title: '分数', align: 'right', width: 150 },
  ],
  sort: {
    defaultSortable: false,
  },
  rowKey: 'id',
}

function createRows(count: number): CwDataTableRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `用户${i + 1}`,
    age: 20 + (i % 30),
    email: `user${i + 1}@example.com`,
    status: i % 3 === 0 ? '禁用' : '活跃',
    score: 60 + (i % 40),
  }))
}

const demoRows = createRows(100)

export const Default: Story = {
  args: {
    config: {
      ...sampleConfig,
      fixedHeader: true,
      virtualScroll: true,
    },
    modelValue: demoRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable
        {...args}
        onSortChange={(state) => console.log('Sort changed:', state)}
      />
    </div>
  ),
}

export const WithFixedHeader: Story = {
  args: {
    config: {
      ...sampleConfig,
      fixedHeader: true,
    },
    modelValue: demoRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable {...args} />
    </div>
  ),
}

export const WithFixedColumns: Story = {
  args: {
    config: {
      ...sampleConfig,
      fixedLeftColumns: 1,
      fixedRightColumns: 1,
      fixedHeader: true,
    },
    modelValue: demoRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable {...args} />
    </div>
  ),
}

const VIRTUAL_SCROLL_DEMO_ROW_COUNT = 5000

// 大数据勿放进 args：Controls 深拷贝会卡住进入 Story
const virtualScrollRows = createRows(VIRTUAL_SCROLL_DEMO_ROW_COUNT)

export const WithVirtualScroll: Story = {
  args: {
    config: {
      ...sampleConfig,
      virtualScroll: true,
      rowHeight: 50,
      fixedHeader: true,
      virtualBuffer: 5,
    },
    modelValue: [],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">
            虚拟滚动演示（{VIRTUAL_SCROLL_DEMO_ROW_COUNT} 条数据）
          </div>
          <div className="text-xs text-[var(--text-color-secondary)]">
            滚动表格查看效果，虚拟滚动只渲染可见区域的行（约 10–20 行），大幅提升性能。
            <br />
            打开浏览器开发者工具，可以看到 DOM 中只有少量行元素，而不是全部{' '}
            {VIRTUAL_SCROLL_DEMO_ROW_COUNT} 个。
          </div>
        </div>
      </div>
      <div className="flex h-[31.25rem] w-[37.5rem] flex-col overflow-hidden">
        <CwDataTable {...args} modelValue={virtualScrollRows} />
      </div>
    </div>
  ),
}

export const WithoutVirtualScroll: Story = {
  args: {
    config: {
      ...sampleConfig,
      virtualScroll: false,
      fixedHeader: true,
    },
    modelValue: demoRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">非虚拟滚动（100条数据）</div>
          <div className="text-xs text-[var(--text-color-secondary)]">
            对比：非虚拟滚动会渲染所有行，数据量大时性能较差
          </div>
        </div>
      </div>
      <div className="flex h-[31.25rem] w-[37.5rem] flex-col overflow-hidden">
        <CwDataTable {...args} />
      </div>
    </div>
  ),
}

function ResizableDemo(args: CwDataTableComponentProps) {
  const [lastResize, setLastResize] = useState('')
  return (
    <div className="w-full">
      <div className="mb-4 rounded-lg bg-[var(--bg-color-secondarycontainer)] p-4 text-sm text-[var(--text-color-primary)]">
        <div className="mb-1 font-medium">列宽拖拽</div>
        <div className="text-xs text-[var(--text-color-secondary)]">
          列间分割线：左柄调左列；右柄默认也调左列（无横滚时同）；右固定或已滚到最右时右柄改调右列（往左拖保持贴最右）。末列外缘不可拖。单列可设{' '}
          <code className="rounded bg-[var(--bg-color-component)] px-1">resizable: false</code>{' '}
          关闭。
        </div>
        {lastResize ? (
          <div className="mt-2 text-xs text-[var(--brand-color-6)]">最近调整：{lastResize}</div>
        ) : null}
      </div>
      <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
        <CwDataTable
          {...args}
          onColumnResize={(column, width) => {
            setLastResize(`${column.title ?? column.key} → ${Math.round(width)}px`)
          }}
        />
      </div>
    </div>
  )
}

export const WithResizable: Story = {
  args: {
    config: {
      ...sampleConfig,
      fixedHeader: true,
      resizable: true,
    },
    modelValue: demoRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => <ResizableDemo {...args} />,
}

export const WithoutHeader: Story = {
  args: {
    config: {
      ...sampleConfig,
      showHeader: false,
    },
    modelValue: demoRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable {...args} />
    </div>
  ),
}

export const Loading: Story = {
  args: {
    config: sampleConfig,
    modelValue: [],
    loading: true,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable {...args} />
    </div>
  ),
}

export const Empty: Story = {
  args: {
    config: sampleConfig,
    modelValue: [],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable {...args} />
    </div>
  ),
}

export const EmptyWithSlot: Story = {
  args: {
    config: sampleConfig,
    modelValue: [],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable
        {...args}
        emptySlot={
          <CwEmptyState size="small" text={<span>暂无数据，请稍后再试</span>} />
        }
      />
    </div>
  ),
}

export const LoadingWithSlot: Story = {
  args: {
    config: sampleConfig,
    modelValue: [],
    loading: true,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="flex h-[25rem] w-[37.5rem] flex-col overflow-hidden">
      <CwDataTable
        {...args}
        loadingSlot={
          <div className="flex items-center gap-2">
            <CwLoading type="spinner" size="small" />
            <span className="text-sm text-[var(--text-color-placeholder)]">正在加载数据...</span>
          </div>
        }
      />
    </div>
  ),
}

export const WithWrap: Story = {
  args: {
    config: {
      columns: [
        { key: 'id', title: 'ID', sortable: true, width: 80 },
        { key: 'name', title: '姓名', sortable: true, width: 150 },
        { key: 'description', title: '描述（换行模式）', wrap: true, width: 300 },
        { key: 'shortText', title: '短文本（截断模式）', width: 200 },
        { key: 'status', title: '状态', align: 'center', width: 100 },
      ],
      fixedHeader: true,
      rowKey: 'id',
    },
    modelValue: [
      {
        id: 1,
        name: '张三',
        description:
          '这是一段很长的描述文本，当设置了 wrap: true 时，这段文本会自动换行显示，而不会被截断。这样可以完整展示所有内容。',
        shortText: '这是一段会被截断的文本，因为默认使用 truncate 模式',
        status: '活跃',
      },
      {
        id: 2,
        name: '李四',
        description:
          '换行模式非常适合展示长文本内容，比如产品描述、备注信息、详细说明等。多行内容会从顶部对齐显示。',
        shortText: '短文本内容',
        status: '活跃',
      },
      {
        id: 3,
        name: '王五',
        description:
          '当内容超出列宽时，换行模式会让文本自动换行，而不是显示省略号。这对于需要完整展示信息的场景非常有用。',
        shortText: '另一段会被截断的长文本内容，超出宽度时显示省略号',
        status: '禁用',
      },
      {
        id: 4,
        name: '赵六',
        description:
          '你可以通过设置列的 wrap 属性来控制是否启用换行模式。wrap: true 启用换行，wrap: false 或不设置则使用默认的 truncate 模式。',
        shortText: '普通文本',
        status: '活跃',
      },
    ],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">换行模式演示</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>
              • <strong>描述列</strong>：设置了{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">wrap: true</code>
              ，长文本会自动换行显示
            </div>
            <div>
              • <strong>短文本列</strong>：未设置 wrap（默认 false），长文本会被截断并显示省略号
            </div>
            <div>• 换行模式下，多行内容会从顶部对齐（items-start）</div>
            <div>• 截断模式下，文本会保持单行显示，超出部分显示省略号</div>
          </div>
        </div>
      </div>
      <div className="flex h-[25rem] w-[50rem] flex-col overflow-hidden">
        <CwDataTable {...args} />
      </div>
    </div>
  ),
}

export const FixedColumnWithWrap: Story = {
  args: {
    config: {
      columns: [
        { key: 'id', title: 'ID', sortable: true, width: 80, fixed: 'left' },
        { key: 'name', title: '姓名（固定+换行）', sortable: true, width: 150, fixed: 'left', wrap: true },
        { key: 'description', title: '描述', width: 300, wrap: true },
        { key: 'department', title: '部门', width: 180 },
        { key: 'position', title: '职位', width: 150 },
        { key: 'status', title: '状态', align: 'center', width: 100, fixed: 'right' },
        { key: 'note', title: '备注（固定+换行）', width: 200, fixed: 'right', wrap: true },
      ],
      fixedLeftColumns: 2,
      fixedRightColumns: 2,
      fixedHeader: true,
      rowKey: 'id',
    },
    modelValue: [
      {
        id: 1,
        name: '张三（这是一个很长的姓名，用于测试固定列换行效果）',
        description:
          '这是一段很长的描述文本，当设置了 wrap: true 时，这段文本会自动换行显示。固定列也支持换行模式。',
        department: '技术部',
        position: '高级工程师',
        status: '活跃',
        note: '这是右侧固定列的备注信息，也设置了换行模式，可以完整展示长文本内容。',
      },
      {
        id: 2,
        name: '李四',
        description:
          '换行模式非常适合展示长文本内容，比如产品描述、备注信息、详细说明等。多行内容会从顶部对齐显示。固定列同样支持这个功能。',
        department: '产品部',
        position: '产品经理',
        status: '活跃',
        note: '固定列换行功能可以让你在固定列中也能完整展示长文本，不会被截断。',
      },
      {
        id: 3,
        name: '王五（测试长文本）',
        description:
          '当内容超出列宽时，换行模式会让文本自动换行，而不是显示省略号。这对于需要完整展示信息的场景非常有用。',
        department: '运营部',
        position: '运营专员',
        status: '禁用',
        note: '左侧固定列和右侧固定列都可以独立设置 wrap 属性，互不影响。',
      },
      {
        id: 4,
        name: '赵六',
        description:
          '你可以通过设置列的 wrap 属性来控制是否启用换行模式。wrap: true 启用换行，wrap: false 或不设置则使用默认的 truncate 模式。固定列同样适用。',
        department: '市场部',
        position: '市场专员',
        status: '活跃',
        note: '这个功能让固定列也能灵活展示各种长度的内容。',
      },
    ],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">固定列换行模式演示</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>
              • <strong>左侧固定列</strong>：ID（普通）、姓名（固定+换行）
            </div>
            <div>
              • <strong>右侧固定列</strong>：状态（普通）、备注（固定+换行）
            </div>
            <div>
              • 固定列同样支持{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">wrap: true</code> 属性
            </div>
            <div>• 固定列换行时，多行内容会从顶部对齐（items-start）</div>
            <div>• 可以横向滚动查看中间的非固定列，固定列会始终显示在左右两侧</div>
          </div>
        </div>
      </div>
      <div className="flex h-[25rem] w-[50rem] flex-col overflow-hidden">
        <CwDataTable {...args} />
      </div>
    </div>
  ),
}

const personRows: CwDataTableRow[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    department: '技术部',
    position: '高级工程师',
    address: '北京市朝阳区xxx街道xxx号',
    city: '北京',
    country: '中国',
    zipcode: '100000',
    status: '活跃',
    actions: '操作',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    department: '产品部',
    position: '产品经理',
    address: '上海市浦东新区xxx路xxx号',
    city: '上海',
    country: '中国',
    zipcode: '200000',
    status: '活跃',
    actions: '操作',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    department: '运营部',
    position: '运营专员',
    address: '广州市天河区xxx大道xxx号',
    city: '广州',
    country: '中国',
    zipcode: '510000',
    status: '禁用',
    actions: '操作',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    department: '市场部',
    position: '市场专员',
    address: '深圳市南山区xxx科技园xxx栋',
    city: '深圳',
    country: '中国',
    zipcode: '518000',
    status: '活跃',
    actions: '操作',
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '13800138005',
    department: '设计部',
    position: 'UI设计师',
    address: '杭州市西湖区xxx路xxx号',
    city: '杭州',
    country: '中国',
    zipcode: '310000',
    status: '活跃',
    actions: '操作',
  },
  {
    id: 6,
    name: '孙八',
    email: 'sunba@example.com',
    phone: '13800138006',
    department: '人事部',
    position: 'HR专员',
    address: '成都市锦江区xxx街xxx号',
    city: '成都',
    country: '中国',
    zipcode: '610000',
    status: '活跃',
    actions: '操作',
  },
]

export const HideColumnBorder: Story = {
  args: {
    config: {
      columns: [
        { key: 'id', title: 'ID', sortable: true, width: 80 },
        { key: 'name', title: '姓名', sortable: true, width: 150, hideRightBorder: true },
        { key: 'email', title: '邮箱', width: 250 },
        { key: 'department', title: '部门', width: 180, hideRightBorder: true },
        { key: 'position', title: '职位', width: 150 },
        { key: 'status', title: '状态', align: 'center', width: 100 },
      ],
      fixedHeader: true,
      rowKey: 'id',
    },
    modelValue: personRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">隐藏列分割线演示</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>
              • 通过设置列的{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">
                hideRightBorder: true
              </code>{' '}
              可以隐藏该列的右侧分割线
            </div>
            <div>
              • <strong>姓名列</strong>：设置了{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">
                hideRightBorder: true
              </code>
              ，与邮箱列之间没有分割线
            </div>
            <div>
              • <strong>部门列</strong>：设置了{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">
                hideRightBorder: true
              </code>
              ，与职位列之间没有分割线
            </div>
            <div>• 其他列之间保持正常的分割线显示</div>
          </div>
        </div>
      </div>
      <div className="flex h-[25rem] w-[50rem] flex-col overflow-hidden">
        <CwDataTable {...args} />
      </div>
    </div>
  ),
}

const fullPersonConfig: CwDataTableConfig = {
  columns: [
    { key: 'id', title: 'ID', sortable: true, width: 80, fixed: 'left' },
    { key: 'name', title: '姓名', sortable: true, width: 150, fixed: 'left' },
    { key: 'email', title: '邮箱', width: 250 },
    { key: 'phone', title: '电话', width: 150 },
    { key: 'department', title: '部门', width: 180 },
    { key: 'position', title: '职位', width: 150 },
    { key: 'address', title: '地址', width: 300 },
    { key: 'city', title: '城市', width: 120 },
    { key: 'country', title: '国家', width: 120 },
    { key: 'zipcode', title: '邮编', width: 100 },
    { key: 'status', title: '状态', align: 'center', width: 100, fixed: 'right' },
    { key: 'actions', title: '操作', align: 'center', width: 120, fixed: 'right' },
  ],
  fixedLeftColumns: 2,
  fixedRightColumns: 2,
  fixedHeader: true,
  rowKey: 'id',
}

function ColumnSelectDemo(args: CwDataTableComponentProps) {
  const [selectedColumnKey, setSelectedColumnKey] = useState<string | undefined>(
    args.config.columnSelect?.defaultSelectedColumnKey,
  )
  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">列选中模式演示</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>
              • 通过设置{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">
                columnSelect.enabled: true
              </code>{' '}
              启用列选中模式
            </div>
            <div>• 点击列中的任何单元格（包括表头），都会选中整列</div>
            <div>• 再次点击已选中的列可以取消选中</div>
            <div>• 选中的列会显示背景色高亮，并自动滚动到可见区域中间（带平滑动画）</div>
            <div>• Hover 时整列会高亮显示</div>
            <div>• 固定列（左侧2列、右侧2列）不会触发滚动</div>
            <div>
              • 当前选中的列：<strong>{selectedColumnKey || '无'}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[25rem] w-[50rem] flex-col overflow-hidden">
        <CwDataTable
          {...args}
          onColumnSelectChange={(column) => {
            console.log('列选中变化:', column)
            setSelectedColumnKey(column?.key)
          }}
        />
      </div>
    </div>
  )
}

export const ColumnSelectMode: Story = {
  args: {
    config: {
      ...fullPersonConfig,
      columnSelect: {
        enabled: true,
        required: true,
      },
    },
    modelValue: personRows,
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => <ColumnSelectDemo {...args} />,
}

const customHeaderConfig: CwDataTableConfig = {
  columns: [
    { key: 'id', title: 'ID', sortable: true, width: 80 },
    {
      key: 'type',
      title: '类型',
      width: 150,
      headerRender: (ctx: CwDataTableHeaderRenderContext) => (
        <div className="flex flex-col items-start justify-center h-full px-2 py-1 rounded-md bg-[var(--button-brand-tint-hover-bg)] border border-[var(--brand-color-focus)] relative">
          <div className="text-sm font-semibold text-[var(--brand-color-6)]">标准款</div>
          <div className="text-xs text-[var(--brand-color-6)] mt-0.5">2025</div>
          {ctx.isSelected ? (
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[var(--brand-color-6)] rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-[var(--text-color-anti)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : null}
        </div>
      ),
    },
    { key: 'name', title: '姓名', sortable: true, width: 150 },
    { key: 'email', title: '邮箱', width: 250 },
    { key: 'department', title: '部门', width: 180 },
    { key: 'status', title: '状态', align: 'center', width: 100 },
  ],
  fixedHeader: true,
  rowKey: 'id',
  columnSelect: {
    enabled: true,
    defaultSelectedColumnKey: 'type',
  },
}

export const CustomHeader: Story = {
  args: {
    config: customHeaderConfig,
    modelValue: [
      {
        id: 1,
        type: '标准款',
        name: '张三',
        email: 'zhangsan@example.com',
        department: '技术部',
        status: '活跃',
      },
      {
        id: 2,
        type: '标准款',
        name: '李四',
        email: 'lisi@example.com',
        department: '产品部',
        status: '活跃',
      },
      {
        id: 3,
        type: '标准款',
        name: '王五',
        email: 'wangwu@example.com',
        department: '运营部',
        status: '禁用',
      },
      {
        id: 4,
        type: '标准款',
        name: '赵六',
        email: 'zhaoliu@example.com',
        department: '市场部',
        status: '活跃',
      },
    ],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => <ColumnSelectDemo {...args} />,
}

const externalRowColumns: CwDataTableConfig['columns'] = [
  { key: 'id', title: 'ID', sortable: true, width: 80, fixed: 'left' },
  { key: 'name', title: '姓名', sortable: true, width: 150, fixed: 'left' },
  { key: 'email', title: '邮箱', width: 250 },
  { key: 'phone', title: '电话', width: 150 },
  { key: 'department', title: '部门', width: 180 },
  { key: 'position', title: '职位', width: 150 },
  { key: 'address', title: '地址', width: 300 },
  { key: 'city', title: '城市', width: 120 },
  { key: 'status', title: '状态', align: 'center', width: 100, fixed: 'right' },
  { key: 'actions', title: '操作', align: 'center', width: 120, fixed: 'right' },
]

function renderExternalRow(scope: CwDataTableExternalRowScope) {
  const {
    visibleColumns,
    getColumnStyle,
    getBodyCellClasses,
    getExternalCellStyle,
    columnSelectEnabled,
    handleColumnSelect,
    handleColumnMouseEnter,
    handleColumnMouseLeave,
  } = scope
  return (
    <>
      {visibleColumns.map((column) => (
        <div
          key={column.key}
          className={[
            ...getBodyCellClasses(column),
            columnSelectEnabled ? 'cursor-pointer' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={getExternalCellStyle ? getExternalCellStyle(column) : getColumnStyle(column)}
          onClick={() => {
            if (columnSelectEnabled) handleColumnSelect(column)
          }}
          onMouseEnter={() => handleColumnMouseEnter(column)}
          onMouseLeave={handleColumnMouseLeave}
        >
          <div className="w-full px-4 py-2 text-sm text-[var(--text-color-primary)]">
            <span className="font-medium">外部行 - {column.title}</span>
          </div>
        </div>
      ))}
    </>
  )
}

export const ExternalRow: Story = {
  args: {
    config: {
      columns: externalRowColumns,
      fixedLeftColumns: 2,
      fixedRightColumns: 2,
      fixedHeader: true,
      rowKey: 'id',
      columnSelect: {
        enabled: true,
        required: true,
      },
    },
    modelValue: personRows.slice(0, 5),
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">外部行演示（列选中模式）</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>
              • 使用{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">#external-row</code>{' '}
              插槽可以在表格外部添加一行
            </div>
            <div>• 外部行会自动同步表格的列布局、列宽和滚动位置</div>
            <div>
              • <strong>列选中模式</strong>：已启用，且设置为{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">required: true</code>
              ，必须选中一列，默认选中第一列
            </div>
            <div>• 点击外部行或表格中的任意单元格可以选中整列，点击已选中的列不会取消选中</div>
            <div>
              • <strong>左侧固定列</strong>：ID、姓名（固定列在外部行中也会正确显示和定位）
            </div>
            <div>
              • <strong>右侧固定列</strong>：状态、操作（固定列会始终显示在左右两侧）
            </div>
            <div>• 外部行会跟随表格的横向滚动，固定列保持固定位置</div>
            <div>• 可以横向滚动查看中间的非固定列，固定列会始终显示</div>
          </div>
        </div>
      </div>
      <div className="flex h-[25rem] w-[50rem] flex-col overflow-hidden">
        <CwDataTable {...args} externalRowSlot={renderExternalRow} />
      </div>
    </div>
  ),
}

export const ComplexWithResizeAndFixed: Story = {
  args: {
    config: {
      columns: [
        { key: 'id', title: 'ID', sortable: true, width: 80, minWidth: 60, maxWidth: 120 },
        { key: 'name', title: '姓名', sortable: true, width: 150, minWidth: 100, maxWidth: 200 },
        { key: 'department', title: '部门', width: 180, minWidth: 120, maxWidth: 250 },
        { key: 'position', title: '职位', width: 150, minWidth: 100, maxWidth: 200 },
        { key: 'email', title: '邮箱', width: 250, minWidth: 200, maxWidth: 350 },
        { key: 'phone', title: '电话', width: 150, minWidth: 120, maxWidth: 200 },
        { key: 'status', title: '状态', align: 'center', width: 100, minWidth: 80, maxWidth: 150 },
        {
          key: 'score',
          title: '绩效分数',
          sortable: true,
          align: 'right',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
        },
        {
          key: 'actions',
          title: '操作',
          align: 'center',
          width: 150,
          minWidth: 120,
          maxWidth: 200,
          resizable: false,
        },
      ],
      fixedLeftColumns: 2,
      fixedRightColumns: 2,
      fixedHeader: true,
      resizable: true,
      virtualScroll: true,
      rowHeight: 50,
      virtualBuffer: 5,
      sort: {
        defaultSortable: false,
      },
      rowKey: 'id',
    },
    modelValue: Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `用户${i + 1}`,
      department: ['技术部', '产品部', '运营部', '市场部', '人事部'][i % 5],
      position: ['工程师', '产品经理', '运营专员', '市场专员', 'HR'][i % 5],
      email: `user${i + 1}@example.com`,
      phone: `138${String(i).padStart(8, '0')}`,
      status: i % 3 === 0 ? '禁用' : '活跃',
      score: 60 + (i % 40),
      actions: '操作',
    })),
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">复杂场景演示：固定列 + 列宽调整 + 虚拟滚动</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>• 固定左侧2列（ID、姓名）和右侧2列（绩效分数、操作）</div>
            <div>• 策略同 WithResizable；右固定「绩效」左缘可拖；最右「操作」resizable: false</div>
            <div>• 虚拟滚动：1000条数据，只渲染可见区域</div>
            <div>• 固定表头，支持横向和纵向滚动</div>
            <div>• 支持排序（ID、姓名、绩效分数）</div>
            <div>• 所有列都设置了最小宽度和最大宽度限制</div>
          </div>
        </div>
      </div>
      <div className="flex h-[37.5rem] w-[50rem] flex-col overflow-hidden">
        <CwDataTable
          {...args}
          onColumnResize={(column, width) => console.log('列宽调整:', column.key, width)}
          onSortChange={(state) => console.log('排序变化:', state)}
        />
      </div>
    </div>
  ),
}

/** 多列仅 minWidth + 可排序表头；组件默认内置从表体同步列宽 */
const syncWidthCatalogLikeConfig: CwDataTableConfig = {
  rowKey: 'id',
  fixedHeader: true,
  sort: { defaultSortable: true },
  columns: [
    { key: 'name', title: '名称', minWidth: 120 },
    {
      key: 'protocol',
      title: '协议',
      minWidth: 140,
      cellRender: ({ row }) => (
        <span className="font-mono text-xs">
          {String((row as { protocol?: string }).protocol ?? '')}
        </span>
      ),
    },
    {
      key: 'enabled',
      title: '启用',
      width: 72,
      cellRender: ({ row }) => ((row as { enabled?: boolean }).enabled ? '是' : '否'),
    },
    {
      key: 'credential_summary',
      title: '凭证摘要',
      minWidth: 200,
      flex: 1,
      cellRender: ({ row }) => {
        const text = String((row as { credential_summary?: string }).credential_summary ?? '')
        return (
          <span className="block max-w-[17.5rem] truncate font-mono text-xs" title={text}>
            {text}
          </span>
        )
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 160,
      fixed: 'right',
      cellRender: ({ row }) => (
        <span className="text-xs text-[var(--text-color-secondary)]">
          id {(row as { id: number }).id}
        </span>
      ),
    },
  ],
}

export const SyncHeaderWidthsFromBody: Story = {
  args: {
    config: syncWidthCatalogLikeConfig,
    modelValue: [
      {
        id: 1,
        name: 'OpenAI 官方',
        protocol: 'openai',
        enabled: true,
        credential_summary: 'apiKey …abcd · https://api.openai.com/v1',
      },
      {
        id: 2,
        name: '智谱',
        protocol: 'openai',
        enabled: true,
        credential_summary: 'apiKey …wxyz · https://open.bigmodel.cn/api/paas/v4',
      },
      {
        id: 3,
        name: 'Anthropic',
        protocol: 'claude_api',
        enabled: false,
        credential_summary: 'apiKey …ant · https://api.anthropic.com',
      },
    ],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => (
    <div className="w-full">
      <div className="mb-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg">
        <div className="text-sm text-[var(--text-color-primary)]">
          <div className="font-medium mb-2">表头 / 表体列宽对齐（内置同步）</div>
          <div className="text-xs text-[var(--text-color-secondary)] space-y-1">
            <div>
              • 列配置接近{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">
                /admin/system/ai-llm-catalog
              </code>
              ：多列仅 minWidth、默认可排序、右侧固定列。
            </div>
            <div>
              • 组件默认在布局完成后从<strong>表体首行</strong>测量宽度并写入{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">columnWidths</code>
              ；若需关闭可设{' '}
              <code className="bg-[var(--bg-color-component)] px-1 rounded">
                config.syncColumnWidthsFromBody: false
              </code>
              。
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[23.75rem] w-[45rem] flex-col overflow-hidden rounded-lg border border-dashed border-[var(--border-color)]">
        <CwDataTable {...args} />
      </div>
    </div>
  ),
}

const slotDemoConfig: CwDataTableConfig = {
  columns: [
    { key: 'name', title: '姓名', width: 160 },
    { key: 'age', title: '年龄', align: 'center', width: 80 },
  ],
  rowKey: 'id',
  columnSelect: { enabled: true },
}

const slotDemoData: CwDataTableRow[] = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
]

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[30rem] flex-col gap-10">
      <SlotStorySection slot="empty">
        <div className="flex h-[12.5rem] flex-col overflow-hidden">
          <CwDataTable
            config={slotDemoConfig}
            modelValue={[]}
            texts={defaultTexts}
            emptySlot={<CwEmptyState size="small" text={<span>自定义空状态</span>} />}
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="loading">
        <div className="flex h-[12.5rem] flex-col overflow-hidden">
          <CwDataTable
            config={slotDemoConfig}
            modelValue={[]}
            loading
            texts={defaultTexts}
            loadingSlot={
              <div className="flex items-center gap-2">
                <CwLoading type="spinner" size="small" />
                <span className="text-sm text-[var(--text-color-placeholder)]">
                  自定义加载中…
                </span>
              </div>
            }
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="external-row">
        <div className="flex h-[15rem] flex-col overflow-hidden">
          <CwDataTable
            config={slotDemoConfig}
            modelValue={slotDemoData}
            texts={defaultTexts}
            externalRowSlot={({ visibleColumns, getColumnStyle, getBodyCellClasses, getExternalCellStyle, columnSelectEnabled, handleColumnSelect, handleColumnMouseEnter, handleColumnMouseLeave }) => (
              <>
                {visibleColumns.map((column) => (
                  <div
                    key={column.key}
                    className={[
                      ...getBodyCellClasses(column),
                      columnSelectEnabled ? 'cursor-pointer' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={
                      getExternalCellStyle
                        ? getExternalCellStyle(column)
                        : getColumnStyle(column)
                    }
                    onClick={() => {
                      if (columnSelectEnabled) handleColumnSelect(column)
                    }}
                    onMouseEnter={() => handleColumnMouseEnter(column)}
                    onMouseLeave={handleColumnMouseLeave}
                  >
                    <div className="px-3 py-2 text-xs text-[var(--brand-color-6)]">
                      外部行 · {column.title}
                    </div>
                  </div>
                ))}
              </>
            )}
          />
        </div>
      </SlotStorySection>
    </div>
  ),
}

const TREE_MODE_DEMO_LEAF_COUNT = 5000
const TREE_MODE_DEMO_MODULES = ['content', 'system', 'commerce', 'ops', 'analytics'] as const

function createTreeModeDemoData(leafCount: number) {
  const flat = Array.from({ length: leafCount }, (_, i) => {
    const module = TREE_MODE_DEMO_MODULES[i % TREE_MODE_DEMO_MODULES.length]!
    return {
      id: `p${i + 1}`,
      name: `权限 ${i + 1}`,
      code: `${module}.item.${i + 1}`,
      module,
      description: `描述 ${i + 1}`,
    }
  })
  return groupRowsByFieldAsTree(flat, { field: 'module', groupIdPrefix: 'module' })
}

const treeConfig: CwDataTableConfig = {
  columns: [
    { key: 'name', title: '名称', minWidth: 200, flex: 1 },
    { key: 'code', title: '编码', minWidth: 180 },
    { key: 'description', title: '描述', minWidth: 120 },
  ],
  rowKey: 'id',
  fixedHeader: true,
  virtualScroll: true,
  rowHeight: 40,
  virtualBuffer: 5,
  tree: {
    enabled: true,
    indentColumnKey: 'name',
    defaultExpandAll: true,
  },
}

// 大数据勿放进 args：Controls 深拷贝会卡住进入 Story
const treeModeRows = createTreeModeDemoData(
  TREE_MODE_DEMO_LEAF_COUNT,
) as unknown as CwDataTableRow[]

function TreeModeDemo(args: CwDataTableComponentProps) {
  const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>([])
  return (
    <div className="w-full">
      <div className="mb-4 rounded-lg bg-[var(--bg-color-secondarycontainer)] p-4 text-sm text-[var(--text-color-primary)]">
        <div className="mb-1 font-medium">
          树形 + 虚拟滚动（{TREE_MODE_DEMO_LEAF_COUNT} 叶子 / {TREE_MODE_DEMO_MODULES.length}{' '}
          分组）
        </div>
        <div className="text-xs text-[var(--text-color-secondary)]">
          默认展开全部；滚动时只渲染可见行。可折叠分组验证缩进与虚拟窗口。
        </div>
      </div>
      <div className="flex h-[31.25rem] w-[40rem] flex-col overflow-hidden">
        <CwDataTable
          {...args}
          modelValue={treeModeRows}
          expandedKeys={expandedKeys}
          onUpdateExpandedKeys={setExpandedKeys}
        />
      </div>
    </div>
  )
}

export const TreeMode: Story = {
  args: {
    config: treeConfig,
    modelValue: [],
    loading: false,
    texts: defaultTexts,
  },
  render: (args) => <TreeModeDemo {...args} />,
}
