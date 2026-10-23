import type { CwComponentMaterialMeta } from '../../component-material/types'

export const materialMeta: CwComponentMaterialMeta = {
  type: 'container',
  preview: {
    minWidth: 100,
    minHeight: 160,
    slots: ['title', 'left', 'right'],
  },
}
