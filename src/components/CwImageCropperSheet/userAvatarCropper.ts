import {
  showImageCropperSheet,
  type ShowImageCropperSheetOptions,
  type ShowImageCropperSheetResult,
} from './showImageCropperSheet'
import { withUserAvatarCropperOptions } from '@zengchaowu/ui-shared/components/CwImageCropperSheet/userAvatarCropper'

export { USER_AVATAR_CROPPER_OPTIONS } from '@zengchaowu/ui-shared/components/CwImageCropperSheet/userAvatarCropper'

/**
 * 选择并裁剪用户头像，返回 JPEG Blob；取消则为 `'cancel'`。
 */
export function pickUserAvatarCropBlob(
  options?: ShowImageCropperSheetOptions,
): Promise<ShowImageCropperSheetResult> {
  return showImageCropperSheet(withUserAvatarCropperOptions(options))
}
