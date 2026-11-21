import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type {
  CwFlowConnection,
  CwFlowEdge,
  CwFlowEdgeChange,
  CwFlowNode,
  CwFlowNodeChange,
} from '@zengchaowu/ui-shared/components/CwFlow/types'
import { CwFlow } from './CwFlow'
import type { CwFlowProps } from './types'

const defaultNodes: CwFlowNode[] = [
  {
    id: 'start',
    type: 'circle',
    position: { x: 40, y: 80 },
    data: { label: '开始' },
  },
  {
    id: 'approve',
    type: 'rectangle',
    position: { x: 240, y: 60 },
    data: { label: '审批节点', description: '由直属主管审批' },
  },
  {
    id: 'menu',
    type: 'menu',
    position: { x: 240, y: 220 },
    data: {
      label: '分支菜单',
      menuItems: [
        { label: '通过', value: 'pass' },
        { label: '驳回', value: 'reject' },
        { label: '转交', value: 'transfer' },
      ],
    },
  },
]

const defaultEdges: CwFlowEdge[] = [
  { id: 'start-approve', source: 'start', target: 'approve', label: '提交' },
  { id: 'approve-menu', source: 'approve', target: 'menu', animated: true },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function FlowDemo(args: CwFlowProps) {
  const [nodes, setNodes] = useState<CwFlowNode[]>(() => clone(defaultNodes))
  const [edges, setEdges] = useState<CwFlowEdge[]>(() => clone(defaultEdges))

  const handleNodesChange = (changes: CwFlowNodeChange[]) => {
    setNodes((previous) =>
      previous
        .map((node) => {
          for (const change of changes) {
            if (change.type === 'position' && change.id === node.id) {
              return { ...node, position: change.position }
            }
            if (change.type === 'select' && change.id === node.id) {
              return { ...node, selected: change.selected }
            }
          }
          return node
        })
        .filter((node) => !changes.some((change) => change.type === 'remove' && change.id === node.id)),
    )
    const removedIds = changes.flatMap((change) => (change.type === 'remove' ? [change.id] : []))
    if (removedIds.length > 0) {
      setEdges((previous) =>
        previous.filter((edge) => !removedIds.includes(edge.source) && !removedIds.includes(edge.target)),
      )
    }
  }

  const handleEdgesChange = (changes: CwFlowEdgeChange[]) => {
    setEdges((previous) =>
      previous
        .map((edge) => {
          for (const change of changes) {
            if (change.type === 'select' && change.id === edge.id) {
              return { ...edge, selected: change.selected }
            }
          }
          return edge
        })
        .filter((edge) => !changes.some((change) => change.type === 'remove' && change.id === edge.id)),
    )
  }

  const handleConnect = (connection: CwFlowConnection) => {
    setEdges((previous) => [
      ...previous,
      {
        id: `${connection.source}-${connection.target}-${previous.length}`,
        source: connection.source,
        target: connection.target,
      },
    ])
  }

  return (
    <div className="h-[100vh] w-full">
      <CwFlow
        {...args}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
      />
    </div>
  )
}

const meta = {
  title: '1. Components/Visualization/CwFlow',
  component: CwFlow,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    nodes: defaultNodes,
    edges: defaultEdges,
    showMinimap: true,
    showControls: true,
    showBackground: true,
  },
} satisfies Meta<typeof CwFlow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <FlowDemo {...args} />,
}
