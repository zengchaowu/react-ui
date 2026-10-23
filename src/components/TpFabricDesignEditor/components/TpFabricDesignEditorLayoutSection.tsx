import { CwCheckbox } from '../../CwCheckbox'
import CwGrid from '../../CwGrid/CwGrid'
import { CwNumberInput } from '../../CwNumberInput'
import { CwSelect } from '../../CwSelect'
import type { CwSelectOption } from '../../CwSelect/types'
import type {
  FabricContainerLayoutAlign,
  FabricContainerLayoutJustify,
  FabricContainerLayoutMode,
} from '../tools/fabricContainerTool.pure'
import {
  FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS,
  FABRIC_EDITOR_INSPECTOR_SELECT_ROOT_CLASS,
} from '../document/fabricDesignEditorUi'

export interface TpFabricDesignEditorLayoutSectionProps {
  layoutMode: FabricContainerLayoutMode
  layoutDirection: 'horizontal' | 'vertical'
  layoutGap: number
  layoutPadding: number
  layoutAlign: FabricContainerLayoutAlign
  layoutJustify: FabricContainerLayoutJustify
  layoutColumns: number
  layoutClipContent: boolean
  /** 等价 Vue `apply-mode` */
  onApplyMode?: (value: unknown) => void
  /** 等价 Vue `apply-direction` */
  onApplyDirection?: (value: unknown) => void
  /** 等价 Vue `apply-gap` */
  onApplyGap?: (value: number | string) => void
  /** 等价 Vue `apply-padding` */
  onApplyPadding?: (value: number | string) => void
  /** 等价 Vue `apply-align` */
  onApplyAlign?: (value: unknown) => void
  /** 等价 Vue `apply-justify` */
  onApplyJustify?: (value: unknown) => void
  /** 等价 Vue `apply-columns` */
  onApplyColumns?: (value: number | string) => void
  /** 等价 Vue `apply-clip-content` */
  onApplyClipContent?: (value: boolean) => void
}

const modeOptions: CwSelectOption[] = [
  { label: '自由', value: 'free' },
  { label: 'Stack', value: 'stack' },
  { label: 'Grid', value: 'grid' },
]

const directionOptions: CwSelectOption[] = [
  { label: '纵向', value: 'vertical' },
  { label: '横向', value: 'horizontal' },
]

const alignOptions: CwSelectOption[] = [
  { label: '起点', value: 'start' },
  { label: '居中', value: 'center' },
  { label: '终点', value: 'end' },
  { label: '拉伸', value: 'stretch' },
]

const justifyOptions: CwSelectOption[] = [
  { label: '起点', value: 'start' },
  { label: '居中', value: 'center' },
  { label: '终点', value: 'end' },
  { label: '两端对齐', value: 'space-between' },
]

export function TpFabricDesignEditorLayoutSection({
  layoutMode,
  layoutDirection,
  layoutGap,
  layoutPadding,
  layoutAlign,
  layoutJustify,
  layoutColumns,
  layoutClipContent,
  onApplyMode,
  onApplyDirection,
  onApplyGap,
  onApplyPadding,
  onApplyAlign,
  onApplyJustify,
  onApplyColumns,
  onApplyClipContent,
}: TpFabricDesignEditorLayoutSectionProps) {
  return (
    <div className="flex flex-col gap-2.5 text-xs text-[var(--text-color-primary)]">
      <label className="flex min-w-0 items-center gap-1.5">
        <span className="w-12 shrink-0 text-[var(--text-color-placeholder)]">模式</span>
        <CwSelect
          value={layoutMode}
          options={modeOptions}
          size="small"
          clearable={false}
          className={FABRIC_EDITOR_INSPECTOR_SELECT_ROOT_CLASS}
          onChange={(v) => onApplyMode?.(v)}
        />
      </label>

      <label className="flex items-center gap-1.5">
        <span className="w-12 shrink-0 text-[var(--text-color-placeholder)]">裁剪</span>
        <CwCheckbox
          value={layoutClipContent}
          size="small"
          onChange={(v) => onApplyClipContent?.(v === true)}
        >
          超出画板隐藏
        </CwCheckbox>
      </label>

      {(layoutMode === 'stack' || layoutMode === 'grid') && (
        <>
          {layoutMode === 'stack' && (
            <label className="flex min-w-0 items-center gap-1.5">
              <span className="w-12 shrink-0 text-[var(--text-color-placeholder)]">方向</span>
              <CwSelect
                value={layoutDirection}
                options={directionOptions}
                size="small"
                clearable={false}
                className={FABRIC_EDITOR_INSPECTOR_SELECT_ROOT_CLASS}
                onChange={(v) => onApplyDirection?.(v)}
              />
            </label>
          )}

          {layoutMode === 'grid' && (
            <label className="flex min-w-0 items-center gap-1.5">
              <span className="w-12 shrink-0 text-[var(--text-color-placeholder)]">列数</span>
              <CwNumberInput
                value={layoutColumns}
                allowDecimal={false}
                min={1}
                step={1}
                size="small"
                clearable={false}
                className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
                onInput={(v) => onApplyColumns?.(v)}
              />
            </label>
          )}

          <CwGrid columns={2} gutter={8} rowGap={8} align="stretch">
            <label className="flex w-full min-w-0 items-center gap-1.5">
              <span className="w-8 shrink-0 text-[var(--text-color-placeholder)]">间距</span>
              <CwNumberInput
                value={layoutGap}
                allowDecimal={false}
                min={0}
                step={1}
                size="small"
                clearable={false}
                className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
                onInput={(v) => onApplyGap?.(v)}
              />
            </label>
            <label className="flex w-full min-w-0 items-center gap-1.5">
              <span className="w-8 shrink-0 text-[var(--text-color-placeholder)]">内边距</span>
              <CwNumberInput
                value={layoutPadding}
                allowDecimal={false}
                min={0}
                step={1}
                size="small"
                clearable={false}
                className={FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS}
                onInput={(v) => onApplyPadding?.(v)}
              />
            </label>
          </CwGrid>

          <label className="flex min-w-0 items-center gap-1.5">
            <span className="w-12 shrink-0 text-[var(--text-color-placeholder)]">对齐</span>
            <CwSelect
              value={layoutAlign}
              options={alignOptions}
              size="small"
              clearable={false}
              className={FABRIC_EDITOR_INSPECTOR_SELECT_ROOT_CLASS}
              onChange={(v) => onApplyAlign?.(v)}
            />
          </label>

          {layoutMode === 'stack' && (
            <label className="flex min-w-0 items-center gap-1.5">
              <span className="w-12 shrink-0 text-[var(--text-color-placeholder)]">分布</span>
              <CwSelect
                value={layoutJustify}
                options={justifyOptions}
                size="small"
                clearable={false}
                className={FABRIC_EDITOR_INSPECTOR_SELECT_ROOT_CLASS}
                onChange={(v) => onApplyJustify?.(v)}
              />
            </label>
          )}
        </>
      )}
    </div>
  )
}

export default TpFabricDesignEditorLayoutSection
