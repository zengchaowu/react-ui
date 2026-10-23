import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwTree } from './CwTree'
import CwIcon from '../CwIcon/CwIcon'
import type { CwTreeNode } from './types'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwTree> = {
  title: '1. Components/Display/CwTree',
  component: CwTree,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwTree 是一个树形组件，用于展示层级结构数据。支持展开/折叠、节点选择、复选框、键盘导航等功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: { type: 'object' },
      description: '树形数据',
    },
    defaultExpandAll: {
      control: { type: 'boolean' },
      description: '是否默认展开所有节点',
    },
    defaultExpandedKeys: {
      control: { type: 'object' },
      description: '默认展开的节点 key 数组',
    },
    expandedKeys: {
      control: { type: 'object' },
      description: '受控的展开节点 key 数组',
    },
    defaultSelectedKeys: {
      control: { type: 'object' },
      description: '默认选中的节点 key 数组',
    },
    selectedKeys: {
      control: { type: 'object' },
      description: '受控的选中节点 key 数组',
    },
    defaultCheckedKeys: {
      control: { type: 'object' },
      description: '默认勾选的节点 key 数组',
    },
    checkedKeys: {
      control: { type: 'object' },
      description: '受控的勾选节点 key 数组',
    },
    checkable: {
      control: { type: 'boolean' },
      description: '是否显示复选框',
    },
    selectable: {
      control: { type: 'boolean' },
      description: '是否可选择',
    },
    multiple: {
      control: { type: 'boolean' },
      description: '是否允许多选（默认 true）；false 为单选模式',
    },
    showLine: {
      control: { type: 'boolean' },
      description: '是否显示连接线',
    },
    showIcon: {
      control: { type: 'boolean' },
      description: '是否显示图标',
    },
    switcherIcon: {
      control: { type: 'boolean' },
      description: '节点前是否显示展开/折叠图标',
    },
    reserveLeafSwitcherSpace: {
      control: { type: 'boolean' },
      description:
        '叶子是否预留箭头列空白（默认 true）；false 时叶子与同层文件夹箭头左对齐',
    },
    expandOnClickNode: {
      control: { type: 'boolean' },
      description: '点击节点时是否展开/折叠（默认 false）',
    },
    folderSelectable: {
      control: { type: 'boolean' },
      description: '文件夹（有子节点的节点）是否可选中（默认 true）',
    },
    highlightParentOnChildSelected: {
      control: { type: 'boolean' },
      description: '子元素选中时，父文件夹是否高亮（默认 false）',
    },
    accordion: {
      control: { type: 'boolean' },
      description: '手风琴模式，同级节点最多只能有一个展开（默认 false）',
    },
    indentSize: {
      control: { type: 'number' },
      description: '节点缩进距离（像素）',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '树形组件尺寸',
    },
    virtualScroll: {
      control: { type: 'boolean' },
      description: '虚拟滚动（仅渲染可见行；需根节点有明确高度）',
    },
    virtualBuffer: {
      control: { type: 'number' },
      description: '虚拟滚动上下缓冲行数',
    },
    onNodeClick: { action: 'nodeClick' },
    onNodeSelect: { action: 'nodeSelect' },
    onNodeCheck: { action: 'nodeCheck' },
    onNodeExpand: { action: 'nodeExpand' },
  },
}

export default meta
type Story = StoryObj<typeof CwTree>

// 基础树形数据
const basicTreeData: CwTreeNode[] = [
  {
    key: '1',
    label: '一级 1',
    children: [
      {
        key: '1-1',
        label: '二级 1-1',
        children: [
          {
            key: '1-1-1',
            label: '三级 1-1-1',
          },
          {
            key: '1-1-2',
            label: '三级 1-1-2',
          },
        ],
      },
      {
        key: '1-2',
        label: '二级 1-2',
      },
    ],
  },
  {
    key: '2',
    label: '一级 2',
    children: [
      {
        key: '2-1',
        label: '二级 2-1',
      },
      {
        key: '2-2',
        label: '二级 2-2',
      },
    ],
  },
  {
    key: '3',
    label: '一级 3',
  },
]

// 带图标的数据
const treeDataWithIcons: CwTreeNode[] = [
  {
    key: '1',
    label: '文档',
    icon: '📄',
    children: [
      {
        key: '1-1',
        label: '工作文档',
        icon: '📁',
        children: [
          { key: '1-1-1', label: '项目计划.docx', icon: '📄' },
          { key: '1-1-2', label: '会议记录.md', icon: '📄' },
        ],
      },
      {
        key: '1-2',
        label: '个人文档',
        icon: '📁',
        children: [{ key: '1-2-1', label: '笔记.txt', icon: '📄' }],
      },
    ],
  },
  {
    key: '2',
    label: '图片',
    icon: '🖼️',
    children: [
      { key: '2-1', label: '照片', icon: '📷' },
      { key: '2-2', label: '截图', icon: '📸' },
    ],
  },
]

// 文件系统示例
const fileSystemTree: CwTreeNode[] = [
  {
    key: 'root',
    label: '我的电脑',
    icon: '💻',
    children: [
      {
        key: 'c',
        label: 'C:',
        icon: '💾',
        children: [
          {
            key: 'programs',
            label: 'Program Files',
            icon: '📦',
            children: [
              { key: 'app1', label: 'Application 1', icon: '⚙️' },
              { key: 'app2', label: 'Application 2', icon: '⚙️' },
            ],
          },
          {
            key: 'users',
            label: 'Users',
            icon: '👤',
            children: [
              { key: 'user1', label: 'User 1', icon: '👤' },
              { key: 'user2', label: 'User 2', icon: '👤' },
            ],
          },
        ],
      },
      {
        key: 'd',
        label: 'D:',
        icon: '💾',
        children: [
          { key: 'games', label: 'Games', icon: '🎮' },
          { key: 'media', label: 'Media', icon: '🎬' },
        ],
      },
    ],
  },
]

const customIconSlotTreeData: CwTreeNode[] = [
  {
    key: '1',
    label: '文档',
    children: [
      { key: '1-1', label: '工作文档' },
      { key: '1-2', label: '个人文档' },
    ],
  },
  {
    key: '2',
    label: '图片',
    children: [
      { key: '2-1', label: '照片' },
      { key: '2-2', label: '截图' },
    ],
  },
]

const extraSlotTreeData: CwTreeNode[] = [
  {
    key: '1',
    label: '文档',
    children: [
      { key: '1-1', label: '工作文档' },
      { key: '1-2', label: '个人文档' },
    ],
  },
  {
    key: '2',
    label: '图片',
    children: [
      { key: '2-1', label: '照片' },
      { key: '2-2', label: '截图' },
    ],
  },
  { key: '3', label: '视频' },
]

const slotTreeWrapperClass = 'border border-[var(--border-color)] rounded-lg p-4'

function TreeBox({ width = 300, children }: { width?: number; children: ReactNode }) {
  return (
    <div
      style={{
        width,
        border: '1px solid var(--border-color)',
        padding: 16,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  )
}

function renderDocIcon(node: CwTreeNode) {
  if (node.key === '1' || node.key === '1-1' || node.key === '1-2') {
    return <span className="text-[var(--brand-color-6)]">📄</span>
  }
  if (node.key === '2' || node.key === '2-1' || node.key === '2-2') {
    return <span className="text-[var(--success-color-6)]">🖼️</span>
  }
  return <span className="text-[var(--warning-color-6)]">📁</span>
}

export const Default: Story = {
  args: {
    data: basicTreeData,
    defaultExpandAll: false,
    selectable: true,
    checkable: false,
    showLine: false,
    showIcon: false,
    switcherIcon: true,
    indentSize: 24,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const WithCheckbox: Story = {
  args: {
    data: basicTreeData,
    checkable: true,
    selectable: true,
    defaultExpandAll: false,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const ExpandAll: Story = {
  args: {
    data: basicTreeData,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const WithLine: Story = {
  args: {
    data: basicTreeData,
    showLine: true,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const WithIcons: Story = {
  args: {
    data: treeDataWithIcons,
    showIcon: true,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const FileSystem: Story = {
  args: {
    data: fileSystemTree,
    showIcon: true,
    showLine: true,
    defaultExpandAll: false,
    selectable: true,
    checkable: false,
  },
  render: (args) => (
    <TreeBox width={350}>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const CheckboxAndSelect: Story = {
  args: {
    data: basicTreeData,
    checkable: true,
    selectable: true,
    defaultExpandAll: true,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const CustomIndent: Story = {
  args: {
    data: basicTreeData,
    indentSize: 32,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => (
    <TreeBox width={350}>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const NoSwitcherIcon: Story = {
  args: {
    data: basicTreeData,
    switcherIcon: false,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const CustomIcon: Story = {
  args: {
    data: customIconSlotTreeData,
    showIcon: true,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => (
    <TreeBox>
      <CwTree {...args} iconSlot={({ node }) => renderDocIcon(node)} />
    </TreeBox>
  ),
}

export const CustomIconComponent: Story = {
  args: {
    data: [
      {
        key: '1',
        label: '设置',
        children: [
          { key: '1-1', label: '账户设置' },
          { key: '1-2', label: '隐私设置' },
        ],
      },
      {
        key: '2',
        label: '帮助',
        children: [
          { key: '2-1', label: '使用指南' },
          { key: '2-2', label: '常见问题' },
        ],
      },
    ],
    showIcon: true,
    defaultExpandAll: true,
    selectable: true,
  },
  render: (args) => {
    const treeIconBadgeStyle = (key: string) => ({
      backgroundColor:
        key === '1' || key === '1-1' || key === '1-2'
          ? tokenSolidColors.brandColor6
          : tokenSolidColors.successColor6,
      color: tokenSolidColors.textColorAnti,
    })
    return (
      <TreeBox>
        <CwTree
          {...args}
          iconSlot={({ node }) => (
            <div
              className="inline-flex h-4 w-4 items-center justify-center rounded-sm [font-size:var(--font-size-xs)] font-bold"
              style={treeIconBadgeStyle(String(node.key))}
            >
              {node.key === '1' || node.key === '1-1' || node.key === '1-2' ? 'S' : 'H'}
            </div>
          )}
        />
      </TreeBox>
    )
  },
}

export const ExpandOnClickNode: Story = {
  args: {
    data: basicTreeData,
    expandOnClickNode: true,
    defaultExpandAll: false,
    selectable: true,
    showLine: true,
  },
  render: (args) => (
    <TreeBox>
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">
        点击节点本身可以展开/折叠（expandOnClickNode: true）
      </div>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const Accordion: Story = {
  args: {
    data: basicTreeData,
    accordion: true,
    defaultExpandAll: false,
    selectable: true,
    showLine: true,
  },
  render: (args) => (
    <TreeBox>
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">
        手风琴模式：同级节点最多只能有一个展开（accordion: true）
      </div>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const FolderNotSelectable: Story = {
  args: {
    data: basicTreeData,
    folderSelectable: false,
    defaultExpandAll: false,
    selectable: true,
    showLine: true,
  },
  render: (args) => (
    <TreeBox>
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">
        文件夹不可选中：只有叶子节点（无子节点）可以选中（folderSelectable: false）
      </div>
      <CwTree {...args} />
    </TreeBox>
  ),
}

export const HighlightParentOnChildSelected: Story = {
  args: {
    data: basicTreeData,
    highlightParentOnChildSelected: true,
    defaultExpandAll: true,
    selectable: true,
    showLine: true,
  },
  render: (args) => (
    <TreeBox>
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">
        子元素选中时，父文件夹高亮：选中子节点时，父文件夹会高亮显示（文字和图标变色，但不添加背景）（highlightParentOnChildSelected: true）
      </div>
      <CwTree {...args} />
    </TreeBox>
  ),
}

const extraSlotTreeArgs = {
  data: extraSlotTreeData,
  switcherIcon: false,
  expandOnClickNode: true,
  defaultExpandAll: false,
  selectable: true,
  showLine: true,
}

function ExtraSlotTreeDemo() {
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([])

  const handleExpand = (keys: (string | number)[]) => {
    setExpandedKeys(keys)
  }

  const handleToggle = (node: CwTreeNode) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      const isCurrentlyExpanded = next.has(node.key)

      if (isCurrentlyExpanded) {
        const removeNodeAndChildren = (targetNode: CwTreeNode) => {
          next.delete(targetNode.key)
          targetNode.children?.forEach((child) => {
            if (next.has(child.key)) {
              removeNodeAndChildren(child)
            }
          })
        }
        removeNodeAndChildren(node)
      } else {
        next.add(node.key)
      }
      return Array.from(next)
    })
  }

  const getIconStyles = (nodeKey: string | number) => {
    const expanded = expandedKeys.includes(nodeKey)
    return {
      className: `inline-flex items-center justify-center transition-transform duration-200 ${
        expanded ? 'transform rotate-0' : 'transform -rotate-90'
      }`,
      size: 0.75,
    }
  }

  return (
    <div className={slotTreeWrapperClass}>
      <CwTree
        {...extraSlotTreeArgs}
        expandedKeys={expandedKeys}
        onUpdateExpandedKeys={handleExpand}
        onNodeExpand={handleExpand}
        extraSlot={({ node }) => {
          if (!node.children || node.children.length === 0) return null
          const iconStyles = getIconStyles(node.key)
          return (
            <div
              role="button"
              tabIndex={0}
              className="flex h-4 w-4 cursor-pointer items-center justify-center text-[var(--text-color-placeholder)] transition-all hover:text-[var(--text-color-primary)]"
              onClick={(event) => {
                event.stopPropagation()
                handleToggle(node)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                  event.preventDefault()
                  event.stopPropagation()
                  handleToggle(node)
                }
              }}
            >
              <CwIcon
                name="common--dir--arrow-down-line"
                prefix="icon"
                size={iconStyles.size}
                className={iconStyles.className}
              />
            </div>
          )
        }}
      />
    </div>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[25rem] flex-col gap-8">
      <SlotStorySection slot="icon">
        <div className={slotTreeWrapperClass} style={{ width: 300 }}>
          <CwTree
            data={customIconSlotTreeData}
            showIcon
            defaultExpandAll
            selectable
            iconSlot={({ node }) => renderDocIcon(node)}
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="extra">
        <ExtraSlotTreeDemo />
      </SlotStorySection>
    </div>
  ),
}

export const SingleSelect: Story = {
  args: {
    data: basicTreeData,
    selectable: true,
    multiple: false,
    defaultExpandAll: true,
    showLine: true,
  },
  render: (args) => (
    <TreeBox>
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">
        单选模式：整棵树最多只能选中一个（multiple: false）
      </div>
      <CwTree {...args} />
    </TreeBox>
  ),
}

const treeSizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

export const Sizes: Story = {
  args: {
    data: basicTreeData,
    defaultExpandAll: true,
    selectable: true,
    checkable: false,
    showLine: false,
    showIcon: false,
    switcherIcon: true,
    indentSize: 24,
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {treeSizes.map((item) => (
          <div
            key={item.value}
            style={{
              width: 300,
              border: '1px solid var(--border-color)',
              padding: 16,
              borderRadius: 8,
            }}
          >
            <div className="text-xs text-[var(--text-color-secondary)] mb-2">{item.label}</div>
            <CwTree {...args} size={item.value} />
          </div>
        ))}
      </div>
    </div>
  ),
}

const lazyRootData: CwTreeNode[] = [
  {
    key: 'dept-1',
    label: '研发部',
    isLeaf: false,
  },
  {
    key: 'dept-2',
    label: '市场部',
    isLeaf: false,
  },
]

export const LazyLoadChildren: Story = {
  args: {
    data: lazyRootData,
    selectable: true,
    multiple: false,
    size: 'small',
    showLine: true,
    loadData: (node: CwTreeNode) =>
      new Promise<CwTreeNode[]>((resolve) => {
        window.setTimeout(() => {
          if (String(node.key) === 'dept-1') {
            resolve([
              { key: 'u-1', label: '成员 A (叶子)', isLeaf: true },
              {
                key: 'sub-1',
                label: '前端组',
                isLeaf: false,
              },
            ])
            return
          }
          if (String(node.key) === 'dept-2') {
            resolve([{ key: 'u-2', label: '成员 B (叶子)', isLeaf: true }])
            return
          }
          if (String(node.key) === 'sub-1') {
            resolve([{ key: 'u-3', label: '成员 C (叶子)', isLeaf: true }])
            return
          }
          resolve([])
        }, 500)
      }),
  },
  render: (args) => (
    <TreeBox width={360}>
      <p className="text-xs text-[var(--text-color-secondary)] mb-2">
        点击分支展开，约 500ms 后加载子节点；展开「前端组」会再懒加载一层。
      </p>
      <CwTree {...args} />
    </TreeBox>
  ),
}

function buildLargeTreeForVirtualScroll(): CwTreeNode[] {
  const packages: CwTreeNode[] = Array.from({ length: 400 }, (_, i) => ({
    key: `pkg-${i}`,
    label: `package-${String(i).padStart(3, '0')}`,
    isLeaf: false,
    children: [
      { key: `pkg-${i}-index`, label: 'index.js', isLeaf: true },
      { key: `pkg-${i}-pkg`, label: 'package.json', isLeaf: true },
    ],
  }))
  return [
    {
      key: 'root',
      label: 'WORKSPACE',
      isLeaf: false,
      labelStrong: true,
      children: [
        {
          key: 'node_modules',
          label: 'node_modules',
          isLeaf: false,
          children: packages,
        },
        {
          key: 'src',
          label: 'src',
          isLeaf: false,
          children: [{ key: 'src-main', label: 'main.ts', isLeaf: true }],
        },
      ],
    },
  ]
}

export const VirtualScroll: Story = {
  args: {
    data: buildLargeTreeForVirtualScroll(),
    virtualScroll: true,
    virtualBuffer: 5,
    defaultExpandedKeys: ['root', 'node_modules'],
    selectable: true,
    multiple: false,
    folderSelectable: false,
    expandOnClickNode: true,
    size: 'small',
    indentSize: 14,
    showIcon: false,
    switcherIcon: true,
    reserveLeafSwitcherSpace: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          '开启 `virtualScroll` 后仅渲染视口内可见行（适合 node_modules 等大目录）。根节点需有明确高度。',
      },
    },
  },
  render: (args) => (
    <div
      style={{
        width: 320,
        height: 420,
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <p className="text-xs text-[var(--text-color-secondary)] mb-2 shrink-0">
        约 400 个包目录；展开后滚动应保持流畅。
      </p>
      <div className="min-h-0 flex-1">
        <CwTree {...args} className="h-full min-h-0" />
      </div>
    </div>
  ),
}

function CheckableDemo(args: ComponentProps<typeof CwTree>) {
  const [checkedKeys, setCheckedKeys] = useState<(string | number)[]>(['1-1-1'])
  return (
    <CwTree
      {...args}
      checkedKeys={checkedKeys}
      onUpdateCheckedKeys={setCheckedKeys}
    />
  )
}

export const Checkable: Story = {
  args: {
    data: basicTreeData,
    defaultExpandAll: true,
    checkable: true,
    className: 'w-64',
  },
  render: (args) => <CheckableDemo {...args} />,
}

export const WithIconAndLine: Story = {
  args: {
    data: basicTreeData,
    defaultExpandAll: true,
    showLine: true,
    showIcon: true,
    className: 'w-64',
  },
}
