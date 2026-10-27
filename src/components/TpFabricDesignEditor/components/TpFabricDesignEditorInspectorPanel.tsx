import type { ReactNode } from 'react'
import CwDesignInspector from '../../CwDesignInspector/CwDesignInspector'
import type { FabricAlignMode } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/selection/fabricEditorAlign.pure'
import type {
  FabricFillPaintLayer,
  FabricStrokeAlign,
  FabricStrokePaintLayer,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/appearance/fabricEditorPaintLayers.pure'
import type {
  FabricContainerLayoutAlign,
  FabricContainerLayoutJustify,
  FabricContainerLayoutMode,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/tools/fabricContainerTool.pure'
import TpFabricDesignEditorAppearanceSection from './TpFabricDesignEditorAppearanceSection'
import TpFabricDesignEditorLayoutSection from './TpFabricDesignEditorLayoutSection'
import TpFabricDesignEditorTransformSection from './TpFabricDesignEditorTransformSection'

export interface TpFabricDesignEditorInspectorPanelProps {
  sections: Array<{
    id: string
    label: string
    defaultExpanded?: boolean
    visible?: boolean
  }>
  readonly: boolean
  fillLayers: FabricFillPaintLayer[]
  strokeLayers: FabricStrokePaintLayer[]
  appearanceStrokeWidth: number
  strokeAlign: FabricStrokeAlign
  transformX: number
  transformY: number
  transformW: number
  transformH: number
  transformAngle: number
  transformFlipX: boolean
  transformFlipY: boolean
  transformCornerRadius: number | null
  lockAspectRatio: boolean
  transformMultiSelection: boolean
  layoutMode: FabricContainerLayoutMode
  layoutDirection: 'horizontal' | 'vertical'
  layoutGap: number
  layoutPadding: number
  layoutAlign: FabricContainerLayoutAlign
  layoutJustify: FabricContainerLayoutJustify
  layoutColumns: number
  layoutClipContent: boolean
  /** 具名插槽 `inspector-icon-meta` */
  inspectorIconMetaSlot?: ReactNode
  /** 等价 Vue `align` */
  onAlign?: (mode: FabricAlignMode) => void
  /** 等价 Vue `apply-position` */
  onApplyPosition?: (axis: 'x' | 'y', value: number | string) => void
  /** 等价 Vue `apply-size` */
  onApplySize?: (axis: 'w' | 'h', value: number | string) => void
  /** 等价 Vue `apply-angle` */
  onApplyAngle?: (value: number | string) => void
  /** 等价 Vue `apply-corner-radius` */
  onApplyCornerRadius?: (value: number | string) => void
  /** 等价 Vue `flip-horizontal` */
  onFlipHorizontal?: () => void
  /** 等价 Vue `flip-vertical` */
  onFlipVertical?: () => void
  /** 等价 Vue `toggle-lock-aspect` */
  onToggleLockAspect?: () => void
  /** 等价 Vue `apply-layout-mode` */
  onApplyLayoutMode?: (value: unknown) => void
  /** 等价 Vue `apply-layout-direction` */
  onApplyLayoutDirection?: (value: unknown) => void
  /** 等价 Vue `apply-layout-gap` */
  onApplyLayoutGap?: (value: number | string) => void
  /** 等价 Vue `apply-layout-padding` */
  onApplyLayoutPadding?: (value: number | string) => void
  /** 等价 Vue `apply-layout-align` */
  onApplyLayoutAlign?: (value: unknown) => void
  /** 等价 Vue `apply-layout-justify` */
  onApplyLayoutJustify?: (value: unknown) => void
  /** 等价 Vue `apply-layout-columns` */
  onApplyLayoutColumns?: (value: number | string) => void
  /** 等价 Vue `apply-layout-clip-content` */
  onApplyLayoutClipContent?: (value: boolean) => void
  /** 等价 Vue `add-fill` */
  onAddFill?: () => void
  /** 等价 Vue `remove-fill` */
  onRemoveFill?: (index: number) => void
  /** 等价 Vue `toggle-fill-visible` */
  onToggleFillVisible?: (index: number) => void
  /** 等价 Vue `apply-fill-color` */
  onApplyFillColor?: (index: number, ev: Event) => void
  /** 等价 Vue `apply-fill-hex` */
  onApplyFillHex?: (index: number, value: string) => void
  /** 等价 Vue `apply-fill-opacity` */
  onApplyFillOpacity?: (index: number, value: number | string) => void
  /** 等价 Vue `add-stroke` */
  onAddStroke?: () => void
  /** 等价 Vue `remove-stroke` */
  onRemoveStroke?: (index: number) => void
  /** 等价 Vue `toggle-stroke-visible` */
  onToggleStrokeVisible?: (index: number) => void
  /** 等价 Vue `apply-stroke-color` */
  onApplyStrokeColor?: (index: number, ev: Event) => void
  /** 等价 Vue `apply-stroke-hex` */
  onApplyStrokeHex?: (index: number, value: string) => void
  /** 等价 Vue `apply-stroke-opacity` */
  onApplyStrokeOpacity?: (index: number, value: number | string) => void
  /** 等价 Vue `apply-stroke-width` */
  onApplyStrokeWidth?: (value: number | string) => void
  /** 等价 Vue `apply-stroke-align` */
  onApplyStrokeAlign?: (value: unknown) => void
}

export function TpFabricDesignEditorInspectorPanel({
  sections,
  readonly,
  fillLayers,
  strokeLayers,
  appearanceStrokeWidth,
  strokeAlign,
  transformX,
  transformY,
  transformW,
  transformH,
  transformAngle,
  transformFlipX,
  transformFlipY,
  transformCornerRadius,
  lockAspectRatio,
  transformMultiSelection,
  layoutMode,
  layoutDirection,
  layoutGap,
  layoutPadding,
  layoutAlign,
  layoutJustify,
  layoutColumns,
  layoutClipContent,
  inspectorIconMetaSlot,
  onAlign,
  onApplyPosition,
  onApplySize,
  onApplyAngle,
  onApplyCornerRadius,
  onFlipHorizontal,
  onFlipVertical,
  onToggleLockAspect,
  onApplyLayoutMode,
  onApplyLayoutDirection,
  onApplyLayoutGap,
  onApplyLayoutPadding,
  onApplyLayoutAlign,
  onApplyLayoutJustify,
  onApplyLayoutColumns,
  onApplyLayoutClipContent,
  onAddFill,
  onRemoveFill,
  onToggleFillVisible,
  onApplyFillColor,
  onApplyFillHex,
  onApplyFillOpacity,
  onAddStroke,
  onRemoveStroke,
  onToggleStrokeVisible,
  onApplyStrokeColor,
  onApplyStrokeHex,
  onApplyStrokeOpacity,
  onApplyStrokeWidth,
  onApplyStrokeAlign,
}: TpFabricDesignEditorInspectorPanelProps) {
  return (
    <CwDesignInspector
      sections={sections}
      sectionSlots={{
        ...(inspectorIconMetaSlot != null
          ? { 'section-icon-meta': inspectorIconMetaSlot }
          : {}),
        'section-transform': (
          <TpFabricDesignEditorTransformSection
            transformX={transformX}
            transformY={transformY}
            transformW={transformW}
            transformH={transformH}
            transformAngle={transformAngle}
            transformFlipX={transformFlipX}
            transformFlipY={transformFlipY}
            transformCornerRadius={transformCornerRadius}
            lockAspectRatio={lockAspectRatio}
            multiSelection={transformMultiSelection}
            onAlign={(mode) => onAlign?.(mode)}
            onApplyPosition={(axis, value) => onApplyPosition?.(axis, value)}
            onApplySize={(axis, value) => onApplySize?.(axis, value)}
            onApplyAngle={(value) => onApplyAngle?.(value)}
            onApplyCornerRadius={(value) => onApplyCornerRadius?.(value)}
            onFlipHorizontal={() => onFlipHorizontal?.()}
            onFlipVertical={() => onFlipVertical?.()}
            onToggleLockAspect={() => onToggleLockAspect?.()}
          />
        ),
        'section-layout': (
          <TpFabricDesignEditorLayoutSection
            layoutMode={layoutMode}
            layoutDirection={layoutDirection}
            layoutGap={layoutGap}
            layoutPadding={layoutPadding}
            layoutAlign={layoutAlign}
            layoutJustify={layoutJustify}
            layoutColumns={layoutColumns}
            layoutClipContent={layoutClipContent}
            onApplyMode={(value) => onApplyLayoutMode?.(value)}
            onApplyDirection={(value) => onApplyLayoutDirection?.(value)}
            onApplyGap={(value) => onApplyLayoutGap?.(value)}
            onApplyPadding={(value) => onApplyLayoutPadding?.(value)}
            onApplyAlign={(value) => onApplyLayoutAlign?.(value)}
            onApplyJustify={(value) => onApplyLayoutJustify?.(value)}
            onApplyColumns={(value) => onApplyLayoutColumns?.(value)}
            onApplyClipContent={(value) => onApplyLayoutClipContent?.(value)}
          />
        ),
        'section-appearance': (
          <TpFabricDesignEditorAppearanceSection
            fillLayers={fillLayers}
            strokeLayers={strokeLayers}
            strokeWidth={appearanceStrokeWidth}
            strokeAlign={strokeAlign}
            disabled={readonly}
            onAddFill={() => onAddFill?.()}
            onRemoveFill={(index) => onRemoveFill?.(index)}
            onToggleFillVisible={(index) => onToggleFillVisible?.(index)}
            onApplyFillColor={(index, ev) => onApplyFillColor?.(index, ev)}
            onApplyFillHex={(index, value) => onApplyFillHex?.(index, value)}
            onApplyFillOpacity={(index, value) => onApplyFillOpacity?.(index, value)}
            onAddStroke={() => onAddStroke?.()}
            onRemoveStroke={(index) => onRemoveStroke?.(index)}
            onToggleStrokeVisible={(index) => onToggleStrokeVisible?.(index)}
            onApplyStrokeColor={(index, ev) => onApplyStrokeColor?.(index, ev)}
            onApplyStrokeHex={(index, value) => onApplyStrokeHex?.(index, value)}
            onApplyStrokeOpacity={(index, value) =>
              onApplyStrokeOpacity?.(index, value)
            }
            onApplyStrokeWidth={(value) => onApplyStrokeWidth?.(value)}
            onApplyStrokeAlign={(value) => onApplyStrokeAlign?.(value)}
          />
        ),
      }}
    />
  )
}

export default TpFabricDesignEditorInspectorPanel
