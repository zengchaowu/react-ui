import { CwIcon } from '../../CwIcon'
import { CwInput } from '../../CwInput'
import { CwNumberInput } from '../../CwNumberInput'
import { CwSelect } from '../../CwSelect'
import type { CwSelectOption } from '../../CwSelect/types'
import type {
  FabricFillPaintLayer,
  FabricStrokeAlign,
  FabricStrokePaintLayer,
} from '../appearance/fabricEditorPaintLayers.pure'
import {
  FABRIC_EDITOR_ICON_BTN_CLASS,
  FABRIC_EDITOR_ICON_BTN_DANGER_CLASS,
  FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS,
} from '../document/fabricDesignEditorUi'
import TpFabricAppearanceEyeIcon from './TpFabricAppearanceEyeIcon'

export interface TpFabricDesignEditorAppearanceSectionProps {
  fillLayers: FabricFillPaintLayer[]
  strokeLayers: FabricStrokePaintLayer[]
  strokeWidth: number
  strokeAlign: FabricStrokeAlign
  disabled?: boolean
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

const iconBtnClass = FABRIC_EDITOR_ICON_BTN_CLASS
const dangerBtnClass = FABRIC_EDITOR_ICON_BTN_DANGER_CLASS
const FABRIC_EDITOR_INSPECTOR_OPACITY_NUMBER_ROOT_CLASS =
  'cw-number-input min-w-0 w-full'

const strokeAlignOptions: CwSelectOption[] = [
  { label: '内部', value: 'inside' },
  { label: '居中', value: 'center' },
  { label: '外部', value: 'outside' },
]

function hexLabel(hex: string): string {
  return hex.replace(/^#/, '').toUpperCase()
}

function swatchColor(hex: string, opacity: number): string {
  const h = hex.startsWith('#') ? hex : `#${hex}`
  const a = Math.max(0, Math.min(100, opacity)) / 100
  return `color-mix(in srgb, ${h} ${Math.round(a * 100)}%, transparent)`
}

export function TpFabricDesignEditorAppearanceSection({
  fillLayers,
  strokeLayers,
  strokeWidth,
  strokeAlign,
  disabled,
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
}: TpFabricDesignEditorAppearanceSectionProps) {
  return (
    <div className="flex flex-col gap-4 text-xs text-[var(--text-color-primary)]">
      <section className="flex flex-col gap-1.5">
        <header className="flex items-center justify-between gap-2">
          <span className="font-medium text-[var(--text-color-secondary)]">填充</span>
          <button
            type="button"
            className={iconBtnClass}
            title="添加填充"
            disabled={disabled}
            onClick={() => onAddFill?.()}
          >
            <CwIcon name="common--status--plus-line" prefix="icon" size={0.875} />
          </button>
        </header>

        {fillLayers.map((layer, index) => (
          <div key={layer.id} className="flex items-center gap-1.5">
            <button
              type="button"
              className={iconBtnClass}
              title={layer.visible ? '隐藏填充' : '显示填充'}
              disabled={disabled}
              onClick={() => onToggleFillVisible?.(index)}
            >
              <TpFabricAppearanceEyeIcon visible={layer.visible} />
            </button>

            <label
              className={[
                'relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded border border-[var(--border-color)]',
                layer.unsupported ? 'opacity-40' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className="absolute inset-0"
                style={{ background: swatchColor(layer.hex, layer.opacity) }}
              />
              <input
                type="color"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                value={layer.hex}
                disabled={disabled || layer.unsupported}
                onInput={(e) => onApplyFillColor?.(index, e.nativeEvent)}
              />
            </label>

            <CwInput
              value={hexLabel(layer.hex)}
              size="small"
              clearable={false}
              disabled={disabled || layer.unsupported}
              className="min-w-0 flex-1"
              onChange={(v) => onApplyFillHex?.(index, v)}
            />

            <CwNumberInput
              value={layer.opacity}
              allowDecimal={false}
              min={0}
              max={100}
              step={1}
              size="small"
              clearable={false}
              disabled={disabled || layer.unsupported}
              className={[
                FABRIC_EDITOR_INSPECTOR_OPACITY_NUMBER_ROOT_CLASS,
                'w-[4.5rem] shrink-0',
              ]
                .filter(Boolean)
                .join(' ')}
              onInput={(v) => onApplyFillOpacity?.(index, v)}
              suffixSlot={
                <span className="pr-1.5 text-[var(--text-color-placeholder)]">%</span>
              }
            />

            <button
              type="button"
              className={[iconBtnClass, dangerBtnClass].filter(Boolean).join(' ')}
              title="删除填充"
              disabled={disabled}
              onClick={() => onRemoveFill?.(index)}
            >
              <CwIcon name="common--status--minus-line" prefix="icon" size={0.875} />
            </button>
          </div>
        ))}

        {fillLayers.some((l) => l.unsupported) && (
          <p className="text-[var(--warning-color-6)]">
            部分填充为渐变/图案，暂不可编辑
          </p>
        )}
      </section>

      <section className="flex flex-col gap-1.5">
        <header className="flex items-center justify-between gap-2">
          <span className="font-medium text-[var(--text-color-secondary)]">描边</span>
          <button
            type="button"
            className={iconBtnClass}
            title="添加描边"
            disabled={disabled}
            onClick={() => onAddStroke?.()}
          >
            <CwIcon name="common--status--plus-line" prefix="icon" size={0.875} />
          </button>
        </header>

        {strokeLayers.map((layer, index) => (
          <div key={layer.id} className="flex items-center gap-1.5">
            <button
              type="button"
              className={iconBtnClass}
              title={layer.visible ? '隐藏描边' : '显示描边'}
              disabled={disabled}
              onClick={() => onToggleStrokeVisible?.(index)}
            >
              <TpFabricAppearanceEyeIcon visible={layer.visible} />
            </button>

            <label
              className={[
                'relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded border border-[var(--border-color)]',
                layer.unsupported ? 'opacity-40' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className="absolute inset-0"
                style={{ background: swatchColor(layer.hex, layer.opacity) }}
              />
              <input
                type="color"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                value={layer.hex}
                disabled={disabled || layer.unsupported}
                onInput={(e) => onApplyStrokeColor?.(index, e.nativeEvent)}
              />
            </label>

            <CwInput
              value={hexLabel(layer.hex)}
              size="small"
              clearable={false}
              disabled={disabled || layer.unsupported}
              className="min-w-0 flex-1"
              onChange={(v) => onApplyStrokeHex?.(index, v)}
            />

            <CwNumberInput
              value={layer.opacity}
              allowDecimal={false}
              min={0}
              max={100}
              step={1}
              size="small"
              clearable={false}
              disabled={disabled || layer.unsupported}
              className={[
                FABRIC_EDITOR_INSPECTOR_OPACITY_NUMBER_ROOT_CLASS,
                'w-[4.5rem] shrink-0',
              ]
                .filter(Boolean)
                .join(' ')}
              onInput={(v) => onApplyStrokeOpacity?.(index, v)}
              suffixSlot={
                <span className="pr-1.5 text-[var(--text-color-placeholder)]">%</span>
              }
            />

            <button
              type="button"
              className={[iconBtnClass, dangerBtnClass].filter(Boolean).join(' ')}
              title="删除描边"
              disabled={disabled}
              onClick={() => onRemoveStroke?.(index)}
            >
              <CwIcon name="common--status--minus-line" prefix="icon" size={0.875} />
            </button>
          </div>
        ))}

        <div className="mt-0.5 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <CwIcon
              name="common--action--sort-line"
              prefix="icon"
              size={0.875}
              className="shrink-0 text-[var(--text-color-secondary)]"
            />
            <CwSelect
              value={strokeAlign}
              options={strokeAlignOptions}
              size="small"
              className="min-w-0 w-full"
              clearable={false}
              disabled={disabled}
              onChange={(v) => onApplyStrokeAlign?.(v)}
            />
          </div>
          <CwNumberInput
            value={strokeWidth}
            allowDecimal={false}
            min={0}
            max={80}
            step={1}
            size="small"
            clearable={false}
            disabled={disabled}
            className={[
              FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS,
              'w-[4.5rem] shrink-0',
            ]
              .filter(Boolean)
              .join(' ')}
            onInput={(v) => onApplyStrokeWidth?.(v)}
          />
        </div>
      </section>
    </div>
  )
}

export default TpFabricDesignEditorAppearanceSection
