import type { CwFlowNodeTypes } from '../types'
import CwFlowCircleNode from './CircleNode'
import CwFlowMenuNode from './MenuNode'
import CwFlowRectangleNode from './RectangleNode'

export { CwFlowCircleNode, CwFlowMenuNode, CwFlowRectangleNode }

/** 默认节点类型映射（rectangle / circle / menu） */
export const defaultCwFlowNodeTypes: CwFlowNodeTypes = {
  rectangle: CwFlowRectangleNode,
  circle: CwFlowCircleNode,
  menu: CwFlowMenuNode,
}
