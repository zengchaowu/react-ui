import type { CwDesignToolRailGroupConfig } from '../../CwDesignToolRail/types'
import { fabricShapeMenuItems } from './fabricShapeMenuItems'

export const defaultTpFabricToolRailGroups: CwDesignToolRailGroupConfig[] = [
  {
    id: 'tools',
    ariaLabel: '工具',
    items: [
      {
        key: 'draw-tools-menu',
        icon: 'common--status--plus-line',
        label: '创建',
        menuItems: [
          {
            key: 'frame',
            icon: 'draw--shape--frame-line',
            label: '容器',
            shortcut: 'F',
            toggle: true,
          },
          {
            key: 'section',
            icon: 'common--action--arrange-line',
            label: '分区',
            shortcut: 'Shift S',
            disabled: true,
          },
          {
            key: 'magic-wand',
            icon: 'draw--tool--magic-pen-line',
            label: '魔法棒',
            disabled: true,
          },
          {
            key: 'slice',
            icon: 'common--action--cut-line',
            label: '切片',
            shortcut: 'S',
            disabled: true,
            dividerAfter: true,
          },
          {
            key: 'shapes-flyout',
            icon: 'draw--shape--rect-line',
            label: '形状',
            menuItems: fabricShapeMenuItems(),
          },
          {
            key: 'pen',
            icon: 'draw--tool--pen-line',
            label: '钢笔',
            shortcut: 'P',
            toggle: true,
          },
          {
            key: 'draw',
            icon: 'draw--tool--freehand-line',
            label: '铅笔',
            shortcut: 'Shift P',
            toggle: true,
          },
        ],
      },
      { key: 'text', icon: 'draw--shape--text-line', label: '文本', shortcut: 'T', toggle: true },
    ],
  },
  {
    id: 'file',
    ariaLabel: '文件',
    align: 'bottom',
    items: [
      { key: 'import-append', icon: 'draw--io--import-line', label: '追加导入' },
      { key: 'import-replace', icon: 'draw--tool--replace-line', label: '替换画布导入' },
      { key: 'export-canvas', icon: 'draw--io--export-line', label: '导出画布' },
      { key: 'export-selection', icon: 'draw--io--export-filled', label: '导出选中' },
    ],
  },
  {
    id: 'edit',
    ariaLabel: '编辑',
    align: 'bottom',
    items: [
      { key: 'delete', icon: 'draw--canvas--delete-line', label: '删除选中', shortcut: 'Del', danger: true },
      { key: 'clear', icon: 'draw--canvas--clear-line', label: '清空画布', danger: true },
    ],
  },
]
