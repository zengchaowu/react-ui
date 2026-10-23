import type { NodeTypes } from '@xyflow/react'
import RectangleNode from './RectangleNode'
import CircleNode from './CircleNode'
import MenuNode from './MenuNode'

export const nodeTypes: NodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  menu: MenuNode,
}

export { RectangleNode, CircleNode, MenuNode }
