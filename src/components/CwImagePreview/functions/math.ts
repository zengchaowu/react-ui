import type { CwImagePreviewProps } from '../types'

/** 归一化角度到 0-360 区间 */
export function normalizeRotation(rotation: number): number {
  const result = rotation % 360
  return result < 0 ? result + 360 : result
}

/** 根据 props 的 minScale/maxScale 约束缩放比例（纯函数） */
export function clampScaleByProps(
  value: number,
  props: Pick<CwImagePreviewProps, 'minScale' | 'maxScale'>,
): number {
  const min = props.minScale ?? 0.2
  const max = props.maxScale ?? 4
  return Math.min(max, Math.max(min, value))
}

/** 触摸点最小结构（兼容原生 Touch 与 React.Touch） */
export interface TouchPoint {
  clientX: number
  clientY: number
}

/** 计算两点之间的距离（双指缩放用） */
export function getDistance(touch1: TouchPoint, touch2: TouchPoint): number {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/** 计算两点之间的角度（双指旋转用，单位：度） */
export function getAngle(touch1: TouchPoint, touch2: TouchPoint): number {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

export const IMAGE_PREVIEW_SCALE_EPSILON = 0.01

const TRANSFORM_SCALE_EPSILON = 0.001
const TRANSFORM_OFFSET_EPSILON = 0.5
const TRANSFORM_ROTATION_EPSILON = 0.1

/** 是否已放大到应接管平移手势（相对 initialScale） */
export function isImagePreviewScaledForPan(
  scale: number,
  props: Pick<CwImagePreviewProps, 'initialScale'>,
): boolean {
  const baseline = props.initialScale ?? 1
  return (scale || 1) > baseline + IMAGE_PREVIEW_SCALE_EPSILON
}

/** 当前变换是否偏离初始缩放 / 平移 / 旋转 */
export function isTransformDeviatedFromInitial(
  transform: { scale: number; offsetX: number; offsetY: number; rotation: number },
  props: Pick<CwImagePreviewProps, 'initialScale' | 'initialRotation'>,
): boolean {
  const initialScale = props.initialScale ?? 1
  const initialRotation = normalizeRotation(props.initialRotation ?? 0)
  return (
    Math.abs(transform.scale - initialScale) > TRANSFORM_SCALE_EPSILON ||
    Math.abs(transform.offsetX) > TRANSFORM_OFFSET_EPSILON ||
    Math.abs(transform.offsetY) > TRANSFORM_OFFSET_EPSILON ||
    Math.abs(normalizeRotation(transform.rotation) - initialRotation) >
      TRANSFORM_ROTATION_EPSILON
  )
}
