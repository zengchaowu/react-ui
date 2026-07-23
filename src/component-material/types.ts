/**
 * 低代码 / 物料库元信息类型。
 * 规范见 vue-ui README §3.4「低代码物料 materialMeta.ts」。
 */
export type CwComponentMaterialType = 'component' | 'container'

/** 设计器画布中的预览尺寸与需挂接的 slot */
export interface CwComponentMaterialPreviewMeta {
  /** 画布预览最小宽度（px） */
  minWidth?: number
  /** 画布预览最小高度（px）；容器含 h-full 子节点时设计器会同步设 height */
  minHeight?: number
  /** 设计器画布中需要渲染/编排内容的 slot 名 */
  slots?: string[]
}

/**
 * 组件物料元信息（声明在各组件目录 `materialMeta.ts`）
 * - `component`：叶子组件
 * - `container`：可编排子节点
 * - `preview`：设计器画布展示（尺寸 + 需挂接的 slot）
 */
export interface CwComponentMaterialMeta {
  type: CwComponentMaterialType
  preview?: CwComponentMaterialPreviewMeta
}
