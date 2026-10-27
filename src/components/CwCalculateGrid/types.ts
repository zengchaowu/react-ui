import type { CalculateEditTiming, CalculateLoadTiming } from '@zengchaowu/ui-shared/components/CwCalculateGrid/functions/editTiming'
import type { CalculateIdleTiming } from '@zengchaowu/ui-shared/components/CwCalculateGrid/functions/formulaScheduler'
import type { SourceRow, KeyPathDepsMap, KeyPathFuncStrMap, ScopeDisplayRowMap, GlobalScope, CwCalculateGridColumn, CwCalculateGridTexts } from '@zengchaowu/ui-shared/components/CwCalculateGrid/types'

// 文本字段 不支持解析生成依赖

// 公式字段 会对公式解析生成依赖
// 公式字段和文本一样 直接修改都是修改的value，只有计算出来的值才会赋值到result

/** 组件事件（Vue defineEmits 的 React 回调等价） */
export interface CwCalculateGridEmits {
  onEditTiming?: (timing: CalculateEditTiming) => void
  onLoadTiming?: (timing: CalculateLoadTiming) => void
  onIdleTiming?: (timing: CalculateIdleTiming) => void
}

// 组件 Props 接口定义
export interface CwCalculateGridProps extends CwCalculateGridEmits {
  /** 源数据行 */
  sourceRows: SourceRow[];
  /** 键路径依赖映射 */
  keyPathDepsMap: KeyPathDepsMap;
  /** 键路径函数字符串映射 */
  keyPathFuncStrMap: KeyPathFuncStrMap;
  /** 作用域显示行映射 */
  scopeDisplayRowMap: ScopeDisplayRowMap;
  /** 全局作用域 */
  globalScope: GlobalScope;
  /** 列定义 */
  colDefs: CwCalculateGridColumn[];
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwCalculateGridTexts>;
}

export type {
  CalculateEditTiming,
  CalculateIdleTiming,
  CalculateLoadTiming,
}
