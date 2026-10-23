import CwIcon from '../../CwIcon/CwIcon'
import type { TpFabricPathEditTool } from '../composables/useFabricEditorToolMode'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export interface TpFabricPathEditToolbarProps {
  activeTool: TpFabricPathEditTool
  /** 等价 Vue `update:activeTool`（v-model:activeTool） */
  onActiveToolChange?: (tool: TpFabricPathEditTool) => void
  /** 等价 Vue `done` */
  onDone?: () => void
}

function btnClass(active: boolean) {
  return [
    'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-[background-color,color] duration-150',
    FOCUS_VISIBLE_INTERACTIVE_CLASS,
    active
      ? 'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)]'
      : 'text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)]',
  ].join(' ')
}

export function TpFabricPathEditToolbar({
  activeTool,
  onActiveToolChange,
  onDone,
}: TpFabricPathEditToolbarProps) {
  return (
    <header
      className="relative flex h-11 w-full shrink-0 items-center justify-center hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-2"
      role="toolbar"
      aria-label="路径编辑工具栏"
    >
      <div className="inline-flex items-center gap-0.5">
        <button
          type="button"
          className={btnClass(activeTool === 'node')}
          title="编辑锚点"
          onClick={() => onActiveToolChange?.('node')}
        >
          <CwIcon name="draw--tool--select-line" prefix="icon" size={1} />
        </button>
        <button
          type="button"
          className={btnClass(activeTool === 'hand')}
          title="抓手平移 (H)"
          onClick={() => onActiveToolChange?.('hand')}
        >
          <CwIcon name="draw--tool--hand-line" prefix="icon" size={1} />
        </button>
        <div
          className="mx-1 h-5 w-px shrink-0 bg-[var(--border-color)]"
          aria-hidden="true"
        />
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-md bg-[var(--brand-color-6)] px-3 text-xs font-medium text-[var(--text-color-anti)] transition-opacity duration-150 hover:opacity-90"
          title="完成路径编辑 (Enter)"
          onClick={() => onDone?.()}
        >
          完成
        </button>
      </div>
    </header>
  )
}

export default TpFabricPathEditToolbar
