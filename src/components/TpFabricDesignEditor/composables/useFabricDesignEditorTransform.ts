import { useReactiveRef, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import { readFabricTransformSelectionSnapshot } from '../transform/fabricEditorTransformSync.pure'
import { useFabricTransformMutations } from './useFabricTransformMutations'
import type { TpFabricDesignEditorProps } from '../types'

type EmitFn = {
  (e: 'object-modified', obj: import('fabric').FabricObject): void
}

export function useFabricDesignEditorTransform(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getProps: () => Pick<TpFabricDesignEditorProps, 'readonly' | 'fixedCanvasSize'>
  emit: EmitFn
}) {
  const transformSelectionActive = useReactiveRef(false)
  const transformAngle = useReactiveRef(0)
  const transformFlipX = useReactiveRef(false)
  const transformFlipY = useReactiveRef(false)
  const transformX = useReactiveRef(0)
  const transformY = useReactiveRef(0)
  const transformW = useReactiveRef(0)
  const transformH = useReactiveRef(0)
  const transformCornerRadius = useReactiveRef<number | null>(null)
  const lockAspectRatio = useReactiveRef(false)
  const transformMultiSelection = useReactiveRef(false)

  function applySnapshotToState(
    snapshot: ReturnType<typeof readFabricTransformSelectionSnapshot>,
  ) {
    transformSelectionActive.value = snapshot.active
    transformMultiSelection.value = snapshot.multiSelection
    transformAngle.value = snapshot.angle
    transformFlipX.value = snapshot.flipX
    transformFlipY.value = snapshot.flipY
    transformX.value = snapshot.x
    transformY.value = snapshot.y
    transformW.value = snapshot.w
    transformH.value = snapshot.h
    transformCornerRadius.value = snapshot.cornerRadius
  }

  function syncTransformFromSelection() {
    if (options.getProps().readonly) {
      transformSelectionActive.value = false
      return
    }
    applySnapshotToState(
      readFabricTransformSelectionSnapshot(options.canvasRef.value),
    )
  }

  function afterTransformMutation() {
    const canvas = options.canvasRef.value
    if (!canvas) return
    canvas.requestRenderAll()
    syncTransformFromSelection()
  }

  const mutations = useFabricTransformMutations({
    canvasRef: options.canvasRef,
    getProps: options.getProps,
    emit: options.emit,
    lockAspectRatio,
    transformAngle,
    afterTransformMutation,
  })

  function toggleLockAspectRatio() {
    lockAspectRatio.value = !lockAspectRatio.value
  }

  return {
    transformSelectionActive,
    transformAngle,
    transformFlipX,
    transformFlipY,
    transformX,
    transformY,
    transformW,
    transformH,
    transformCornerRadius,
    lockAspectRatio,
    transformMultiSelection,
    syncTransformFromSelection,
    toggleLockAspectRatio,
    ...mutations,
  }
}
