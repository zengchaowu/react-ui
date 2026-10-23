import { USER_AVATAR_MAX_BYTES } from '@zengchaowu/shared/constants/userAvatar'
import {
  showImageCropperSheet,
  type ShowImageCropperSheetOptions,
  type ShowImageCropperSheetResult,
} from './showImageCropperSheet'

/** 用户头像裁剪默认参数（1:1 JPEG，长边 512，不超过上传上限） */
export const USER_AVATAR_CROPPER_OPTIONS = {
  aspectRatio: [1, 1] as [number, number],
  outputFormat: 'image/jpeg' as const,
  quality: 0.88,
  maxEdge: 512,
  maxBytes: USER_AVATAR_MAX_BYTES,
} satisfies ShowImageCropperSheetOptions

/**
 * 选择并裁剪用户头像，返回 JPEG Blob；取消则为 `'cancel'`。
 */
export function pickUserAvatarCropBlob(
  options?: ShowImageCropperSheetOptions,
): Promise<ShowImageCropperSheetResult> {
  return showImageCropperSheet({
    ...USER_AVATAR_CROPPER_OPTIONS,
    ...options,
  })
}
