import { useMemo } from 'react'
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes as defaultNodeTypes } from './nodes'
import type { TpVueFlowProps } from './types'
import { vueFlowBase } from '@zengchaowu/ui-shared/components/TpVueFlow/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/TpVueFlow/texts'

export function TpVueFlow({
  nodes,
  edges,
  nodeTypes,
  showMinimap = false,
  showControls = true,
  showBackground = true,
  disabled = false,
  className,
  texts: textsProp = defaultTexts,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: TpVueFlowProps) {
  void (textsProp || defaultTexts)

  // 合并默认节点类型和用户提供的节点类型
  const customNodeTypes = useMemo(() => {
    return { ...defaultNodeTypes, ...nodeTypes }
  }, [nodeTypes])

  return (
    <div
      className={[
        vueFlowBase.root,
        disabled ? vueFlowBase.rootDisabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={!disabled}
        nodesConnectable={!disabled}
        elementsSelectable={!disabled}
        nodeTypes={customNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        {showMinimap && <MiniMap />}
        {showControls !== false && <Controls />}
        {showBackground !== false && <Background />}
      </ReactFlow>
    </div>
  )
}

export default TpVueFlow
