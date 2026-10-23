import CwGrid from '../../CwGrid/CwGrid'
import CwIcon from '../../CwIcon/CwIcon'
import { CwNumberInput } from '../../CwNumberInput'
import TpFabricTransformSectionIcon from './TpFabricTransformSectionIcon'
import type { FabricAlignMode } from '../selection/fabricEditorAlign.pure'
import {
  FABRIC_EDITOR_ICON_BTN_ACTIVE_CLASS,
  FABRIC_EDITOR_ICON_BTN_CLASS,
  FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS,
} from '../document/fabricDesignEditorUi'

export interface TpFabricDesignEditorTransformSectionProps {
  transformX: number
  transformY: number
  transformW: number
  transformH: number
  transformAngle: number
  transformFlipX: boolean
  transformFlipY: boolean
  transformCornerRadius: number | null
  lockAspectRatio: boolean
  multiSelection: boolean
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
}

const iconBtnClass = FABRIC_EDITOR_ICON_BTN_CLASS
const iconBtnActiveClass = FABRIC_EDITOR_ICON_BTN_ACTIVE_CLASS
const FABRIC_EDITOR_ANGLE_NUMBER_ROOT_CLASS = 'cw-number-input w-16 shrink-0'

type AlignIconName =
  | 'align-left'
  | 'align-center-h'
  | 'align-right'
  | 'align-top'
  | 'align-center-v'
  | 'align-bottom'
  | 'distribute-h'
  | 'distribute-v'

const alignItems: { mode: FabricAlignMode; icon: AlignIconName; label: string }[] = [
  { mode: 'left', icon: 'align-left', label: '左对齐' },
  { mode: 'center-h', icon: 'align-center-h', label: '水平居中' },
  { mode: 'right', icon: 'align-right', label: '右对齐' },
  { mode: 'top', icon: 'align-top', label: '顶对齐' },
  { mode: 'center-v', icon: 'align-center-v', label: '垂直居中' },
  { mode: 'bottom', icon: 'align-bottom', label: '底对齐' },
  { mode: 'distribute-h', icon: 'distribute-h', label: '水平分布' },
  { mode: 'distribute-v', icon: 'distribute-v', label: '垂直分布' },
]

export function TpFabricDesignEditorTransformSection({
  transformX,
  transformY,
  transformW,
  transformH,
  transformAngle,
  transformFlipX,
  transformFlipY,
  transformCornerRadius,
  lockAspectRatio,
  multiSelection,
  onAlign,
  onApplyPosition,
  onApplySize,
  onApplyAngle,
  onApplyCornerRadius,
  onFlipHorizontal,
  onFlipVertical,
  onToggleLockAspect,
}: TpFabricDesignEditorTransformSectionProps) {
  return (
    <div className="flex flex-col gap-2.5 text-xs text-[var(--text-color-primary)]">
      <CwGrid
        columns={8}
        gutter={2}
        rowGap={2}
        align="stretch"
        className="hairline-border-b border-[var(--border-color)] pb-2.5"
      >
        {alignItems.map((item) => (
          <button
            key={item.mode}
            type="button"
            className={iconBtnClass}
            title={item.label}
            onClick={() => onAlign?.(item.mode)}
          >
            <TpFabricTransformSectionIcon name={item.icon} />
          </button>
        ))}
      </CwGrid>

      <CwGrid columns={2} gutter={8} rowGap={8} align="stretch">
        <label className="flex w-full min-w-0 items-center gap-1.5">
          <span className="w-4 shrink-0 text-[var(--text-color-placeholder)]">X</span>
          <CwNumberInput
            value={transformX}
            allowDecimal={false}
            step={1}
            size="small"
            clearable={false}
            className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
            onInput={(v) => onApplyPosition?.('x', v)}
          />
        </label>
        <label className="flex w-full min-w-0 items-center gap-1.5">
          <span className="w-4 shrink-0 text-[var(--text-color-placeholder)]">Y</span>
          <CwNumberInput
            value={transformY}
            allowDecimal={false}
            step={1}
            size="small"
            clearable={false}
            className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
            onInput={(v) => onApplyPosition?.('y', v)}
          />
        </label>
        <label className="flex w-full min-w-0 items-center gap-1.5">
          <span className="w-4 shrink-0 text-[var(--text-color-placeholder)]">W</span>
          <CwNumberInput
            value={transformW}
            allowDecimal={false}
            min={1}
            step={1}
            size="small"
            clearable={false}
            disabled={multiSelection}
            className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
            onInput={(v) => onApplySize?.('w', v)}
          />
        </label>
        <div className="flex w-full min-w-0 items-center gap-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="w-4 shrink-0 text-[var(--text-color-placeholder)]">H</span>
            <CwNumberInput
              value={transformH}
              allowDecimal={false}
              min={1}
              step={1}
              size="small"
              clearable={false}
              disabled={multiSelection}
              className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
              onInput={(v) => onApplySize?.('h', v)}
            />
          </label>
          <button
            type="button"
            className={[iconBtnClass, lockAspectRatio ? iconBtnActiveClass : '']
              .filter(Boolean)
              .join(' ')}
            title="锁定宽高比"
            disabled={multiSelection}
            onClick={() => onToggleLockAspect?.()}
          >
            <CwIcon name="common--action--link-line" prefix="icon" size={0.875} />
          </button>
        </div>
      </CwGrid>

      <div className="flex items-center gap-1.5">
        <TpFabricTransformSectionIcon
          name="rotate"
          className="shrink-0 text-base text-[var(--text-color-secondary)]"
        />
        <CwNumberInput
          value={transformAngle}
          allowDecimal={false}
          min={-360}
          max={360}
          step={1}
          size="small"
          clearable={false}
          className={FABRIC_EDITOR_ANGLE_NUMBER_ROOT_CLASS}
          onInput={(v) => onApplyAngle?.(v)}
        />
        <span className="text-[var(--text-color-placeholder)]">°</span>
        <button
          type="button"
          className={[iconBtnClass, transformFlipX ? iconBtnActiveClass : '']
            .filter(Boolean)
            .join(' ')}
          title="水平翻转"
          onClick={() => onFlipHorizontal?.()}
        >
          <TpFabricTransformSectionIcon name="flip-h" />
        </button>
        <button
          type="button"
          className={[iconBtnClass, transformFlipY ? iconBtnActiveClass : '']
            .filter(Boolean)
            .join(' ')}
          title="垂直翻转"
          onClick={() => onFlipVertical?.()}
        >
          <TpFabricTransformSectionIcon name="flip-v" />
        </button>
      </div>

      {transformCornerRadius != null && (
        <div className="flex items-center gap-1.5">
          <TpFabricTransformSectionIcon
            name="corner-radius"
            className="shrink-0 text-base text-[var(--text-color-secondary)]"
          />
          <CwNumberInput
            value={transformCornerRadius}
            allowDecimal={false}
            min={0}
            step={1}
            size="small"
            clearable={false}
            className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
            onInput={(v) => onApplyCornerRadius?.(v)}
          />
        </div>
      )}
    </div>
  )
}

export default TpFabricDesignEditorTransformSection
