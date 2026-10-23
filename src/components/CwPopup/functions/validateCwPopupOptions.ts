import type { CwPopupOptions } from '../types'
import { isValidPlacement } from '@zengchaowu/shared/functions/dom/isValidPlacement'

export function validateCwPopupOptions(options: CwPopupOptions): void {
  if (options.placement && !isValidPlacement(options.placement)) {
    throw new Error(`Invalid placement: ${options.placement}`)
  }

  if (options.trigger && !['click', 'hover', 'manual'].includes(options.trigger)) {
    throw new Error(`Invalid trigger: ${options.trigger}. Must be 'click', 'hover' or 'manual'`)
  }

  if (options.showDelay !== undefined && (options.showDelay < 0 || !Number.isFinite(options.showDelay))) {
    throw new Error(`Invalid showDelay: ${options.showDelay}. Must be a non-negative number`)
  }

  if (options.hideDelay !== undefined && (options.hideDelay < 0 || !Number.isFinite(options.hideDelay))) {
    throw new Error(`Invalid hideDelay: ${options.hideDelay}. Must be a non-negative number`)
  }

  if (options.virtualReference && options.trigger !== 'manual') {
    console.warn('[CwPopup] virtualReference is set but trigger is not "manual". Forcing trigger to "manual".')
  }
}
