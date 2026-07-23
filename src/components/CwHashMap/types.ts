export interface CwHashMapEntry {
  key: string | number
  value: any
  hash?: number
  next?: CwHashMapEntry
  [key: string]: any
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
   * 自定义样式对象
   */
  styles?: Partial<CwHashMapStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwHashMapTexts>
}

export interface CwHashMapStyles {
  root: string
  container: string
  svg: string
  bucket: string
  bucketActive: string
  bucketLabel: string
  entry: string
  entryActive: string
  entryKey: string
  entryValue: string
  controls: string
  button: string
  buttonPrimary: string
  buttonSecondary: string
  buttonDanger: string
  input: string
  status: string
  line: string
}

export interface CwHashMapTexts {
  put: string
  get: string
  remove: string
  clear: string
  addEntry: string
  removeEntry: string
  findEntry: string
  status: string
  entries: string
  buckets: string
  operations: string
}

export interface CwHashMapEmits {
  'bucket-click': [bucket: CwHashMapBucket, event: MouseEvent]
  'entry-click': [entry: CwHashMapEntry, event: MouseEvent]
}

