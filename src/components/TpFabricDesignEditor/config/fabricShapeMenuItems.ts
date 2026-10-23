import type { CwDesignToolRailItemConfig } from '../../CwDesignToolRail/types'

/** Shape dropdown shared with plus-menu flyout */
export function fabricShapeMenuItems(): CwDesignToolRailItemConfig[] {
  return [
    { key: 'rect', icon: 'draw--shape--rect-line', label: '矩形', shortcut: 'R', toggle: true },
    { key: 'line', icon: 'common--status--minus-line', label: '直线', shortcut: 'L', disabled: true },
    { key: 'arrow', icon: 'common--dir--arrow-right-line', label: '箭头', shortcut: 'Shift L', disabled: true },
    { key: 'circle', icon: 'draw--shape--circle-line', label: '圆形', shortcut: 'O', toggle: true },
    { key: 'triangle', icon: 'draw--shape--triangle-line', label: '多边形', toggle: true },
    { key: 'star', icon: 'common--status--star-line', label: '星形', disabled: true },
    {
      key: 'insert-image',
      icon: 'common--media--image-line',
      label: '插入图片',
      shortcut: 'Ctrl Shift K',
    },
  ]
}