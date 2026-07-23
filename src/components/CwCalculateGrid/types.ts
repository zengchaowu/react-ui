// 文本字段 不支持解析生成依赖
export type TextField = {
  type: "text";
  value: string; // 文本
  editable?: boolean; // 是否可编辑
};

export type NumberField = {
  type: "number";
  value: string;
  editable?: boolean; // 是否可编辑
};

export type BooleanField = {
  type: "boolean";
  value: string;
  editable?: boolean; // 是否可编辑
};

export type ArrayField = {
  type: "array";
  value: Array<string>;
  editable?: boolean; // 是否可编辑
};

// 公式字段 会对公式解析生成依赖
// 公式字段和文本一样 直接修改都是修改的value，只有计算出来的值才会赋值到result
export type FormulaField = {
  type: "formula";
  value: string; // 公式
  _oldValue?: string; // 公式旧值 用于依赖删除和追加
  defaultValue?: string; // 公式默认值
  globalAlias?: string; // 全局别名
  display?: "result"; // 显示结果还是公式
  result?: string; // 公式计算结果
  editable?: boolean; // 是否可编辑
};

export type SourceRowField =
  | TextField
  | NumberField
  | BooleanField
  | ArrayField
  | FormulaField
  | undefined;

export type SourceRow = Record<string, SourceRowField> & {
  id: TextField;
  super?: TextField;
  children?: ArrayField;
};

export type DisplayRow = Record<string, string | undefined> & {
  _data: SourceRow;
};

export type GlobalScope = Record<string, FormulaField> & {
  __CHAIN_CALL__: boolean | undefined;
  __PATCH__:
    | Array<{
        keyPath: string;
        patch: {
          type: "value" | "result";
          from: string | string[] | undefined;
          to: string;
        };
      }>
    | undefined;
  __DRY_RUN__: boolean | undefined;
  __DRY_RUN_SCOPE__: Map<string, string> | undefined;
};

export type KeyPathDepsMap = Map<string, Set<string>>;
export type KeyPathFuncStrMap = Map<string, string>;
export type ScopeDisplayRowMap = Map<string, DisplayRow>;

// 组件 Props 接口定义
export interface CwCalculateGridProps {
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
  colDefs: import("ag-grid-enterprise").ColDef[];
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwCalculateGridStyles>;
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwCalculateGridTexts>;
}

export interface CwCalculateGridStyles {
  root: string
  container: string
  loading: string
  loadingSpinner: string
  loadingText: string
  error: string
  errorIcon: string
  errorText: string
}

export interface CwCalculateGridTexts {
  loading: string
  error: string
  retry: string
}
