import type { CwComponentMaterialMeta } from '../../component-material/types'

export const materialMeta: CwComponentMaterialMeta = {
  type: 'container',
  preview: {
    minWidth: 280,
    minHeight: 360,
    slots: ['banner', 'status'],
  },
}
