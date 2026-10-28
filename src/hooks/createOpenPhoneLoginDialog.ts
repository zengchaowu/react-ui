import {
  createOpenPhoneLoginDialogCore,
  type CreateOpenPhoneLoginDialogDepsCore,
} from '@zengchaowu/ui-shared/components/CwLoginDialog/createOpenPhoneLoginDialogCore'
import { showCwToast } from '../components/CwToast/showCwToast'
import { showLoginDialog } from '../components/CwLoginDialog/showLoginDialog'
import type {
  CwLoginDialogCarrierOneTap,
  CwLoginDialogCarrierOneTapRef,
  CwLoginDialogTexts,
  ShowLoginDialogOptions,
  ShowLoginDialogResult,
} from '../components/CwLoginDialog/types'

/** 可订阅的只读 ref（对齐 Vue shallowRef：补齐一键登录时通知 React 重渲染） */
function createCarrierOneTapRef(): {
  ref: CwLoginDialogCarrierOneTapRef
  set: (value: CwLoginDialogCarrierOneTap | undefined) => void
} {
  let current: CwLoginDialogCarrierOneTap | undefined
  const listeners = new Set<() => void>()
  return {
    ref: {
      get current() {
        return current
      },
      subscribe(listener: () => void) {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    },
    set(value) {
      current = value
      listeners.forEach((listener) => listener())
    },
  }
}

/**
 * react-ui 侧依赖类型：在框架无关核心类型基础上，把 presentLoginDialog 锚定为
 * react 的 ShowLoginDialogOptions。
 */
export type CreateOpenPhoneLoginDialogDeps = Omit<
  CreateOpenPhoneLoginDialogDepsCore<CwLoginDialogTexts, CwLoginDialogCarrierOneTapRef>,
  'presentLoginDialog'
> & {
  presentLoginDialog?: (
    options: ShowLoginDialogOptions,
  ) => Promise<ShowLoginDialogResult | 'cancel'>
}

/**
 * 工厂：各站手机号 / 微信扫码登录弹窗（单飞）。
 * 实际逻辑由 ui-shared 的框架无关核心承担；此处仅注入 react 适配点。
 */
export function createOpenPhoneLoginDialog(
  deps: CreateOpenPhoneLoginDialogDeps,
): () => Promise<boolean> {
  return createOpenPhoneLoginDialogCore<
    CwLoginDialogTexts,
    CwLoginDialogCarrierOneTapRef
  >(deps, {
    createCarrierHandle: () => {
      const carrier = createCarrierOneTapRef()
      return {
        get: () => carrier.ref.current,
        set: (value) => carrier.set(value),
        get ref() {
          return carrier.ref
        },
      }
    },
    present: showLoginDialog,
    onSuccessToast: () =>
      showCwToast({
        message: deps.successToastMessage ?? '登录成功',
        type: 'success',
      }),
  })
}
