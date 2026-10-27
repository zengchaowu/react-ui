import type { MouseEvent as ReactMouseEvent } from 'react'
import type { CwHashMapTexts } from '@zengchaowu/ui-shared/components/CwHashMap/types'

export interface CwHashMapEntry {
  key: string | number
  value: unknown
  hash?: number
  next?: CwHashMapEntry
  [key: string]: unknown
}

export interface CwHashMapBucket {
  index: number
  entries: CwHashMapEntry[]
}

export interface CwHashMapProps {
  buckets: CwHashMapBucket[]
  bucketWidth?: number
  bucketHeight?: number
  entryWidth?: number
  entryHeight?: number
  entryGap?: number
  showHash?: boolean
  showIndex?: boolean
  bucketClass?: string
  entryClass?: string
  textClass?: string
  indexClass?: string
  emptyBucketClass?: string
  lineClass?: string
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwHashMapTexts>
}

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwHashMapEmits {
  onBucketClick?: (bucket: CwHashMapBucket, event: ReactMouseEvent<Element>) => void
  onEntryClick?: (entry: CwHashMapEntry, event: ReactMouseEvent<Element>) => void
}
