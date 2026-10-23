export type FabricEditorContextMenuDoc = {
  deleteSelection: () => void
  exportSelectedSvgToFile: () => void
  groupSelection: () => void
  frameSelection: () => void
  ungroupSelection: () => void
  exportSvgToFile: () => void
  clearCanvas: () => void
}

export function runFabricEditorContextMenuAction(
  key: string,
  doc: FabricEditorContextMenuDoc,
): void {
  switch (key) {
    case 'delete':
      doc.deleteSelection()
      break
    case 'export-selection':
      doc.exportSelectedSvgToFile()
      break
    case 'group':
      doc.groupSelection()
      break
    case 'frame-selection':
      doc.frameSelection()
      break
    case 'ungroup':
      doc.ungroupSelection()
      break
    case 'export-canvas':
      doc.exportSvgToFile()
      break
    case 'clear':
      doc.clearCanvas()
      break
    default:
      break
  }
}
