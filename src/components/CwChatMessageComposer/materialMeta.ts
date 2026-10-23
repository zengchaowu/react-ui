import type { CwComponentMaterialMeta } from '../../component-material/types'

export const materialMeta: CwComponentMaterialMeta = {
  type: 'container',
  preview: {
    minWidth: 100,
    minHeight: 160,
    slots: [
      'toolbar-append',
      'workspace-footer-left',
      'attachments-above',
      'above-workspace-shell',
    ],
  },
}
