import { createContext, useContext } from 'react'

/** 宿主公共资源 origin（用于 emojione / file-icons 等静态资源 URL 拼接） */
export const CwPublicAssetBaseUrlContext = createContext<string | null>(null)

export function resolveDefaultPublicAssetBaseUrl(): string {
  const base =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      typeof import.meta.env.BASE_URL === 'string' &&
      import.meta.env.BASE_URL) ||
    '/'
  return base
}

/** 从 Provider 读取宿主资源根；未提供时用 `import.meta.env.BASE_URL` */
export function usePublicAssetBaseUrl(): string {
  const injected = useContext(CwPublicAssetBaseUrlContext)
  return injected?.trim() || resolveDefaultPublicAssetBaseUrl()
}
