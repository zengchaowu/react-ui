import { useMemo } from 'react'
import type { HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react'
import { hashMapBase } from './styles'
import type {
  CwHashMapBucket,
  CwHashMapEmits,
  CwHashMapEntry,
  CwHashMapProps,
} from './types'

export interface CwHashMapComponentProps
  extends CwHashMapProps,
    CwHashMapEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
}

interface PositionedBucket {
  index: number
  entries: CwHashMapEntry[]
  x: number
  y: number
}

interface PositionedEntry {
  bucketIndex: number
  entryIndex: number
  data: CwHashMapEntry
  x: number
  y: number
}

interface HashMapLayoutOptions {
  bucketWidth: number
  bucketHeight: number
  entryWidth: number
  entryHeight: number
  entryGap: number
  showIndex: boolean
}

const indexWidth = 40
const indexX = 10

// 计算桶的起始 X 位置
function getBucketsStartX(showIndex: boolean): number {
  return showIndex ? indexX + indexWidth + 10 : 20
}

// 计算位置
function calculatePositions(
  buckets: CwHashMapBucket[],
  options: HashMapLayoutOptions,
): { positionedBuckets: PositionedBucket[]; positionedEntries: PositionedEntry[] } {
  const positionedBucketList: PositionedBucket[] = []
  const positionedEntryList: PositionedEntry[] = []

  const bucketsStartX = getBucketsStartX(options.showIndex)

  // 确保桶之间的间距足够，避免条目重叠
  const rowHeight = Math.max(options.bucketHeight, options.entryHeight)
  const bucketSpacing = 15
  let currentY = 20

  buckets.forEach((bucket, bucketIdx) => {
    // 定位桶（垂直居中于行）
    const bucketY = currentY + (rowHeight - options.bucketHeight) / 2
    positionedBucketList.push({
      ...bucket,
      x: bucketsStartX,
      y: bucketY
    })

    // 定位该桶中的条目（水平链表，垂直居中于行）
    if (bucket.entries.length > 0) {
      let entryX = bucketsStartX + options.bucketWidth + 40
      const entryY = currentY + (rowHeight - options.entryHeight) / 2

      bucket.entries.forEach((entry, entryIdx) => {
        positionedEntryList.push({
          bucketIndex: bucketIdx,
          entryIndex: entryIdx,
          data: entry,
          x: entryX,
          y: entryY
        })

        entryX += options.entryWidth + options.entryGap
      })
    }

    currentY += rowHeight + bucketSpacing
  })

  return { positionedBuckets: positionedBucketList, positionedEntries: positionedEntryList }
}

// 计算桶到第一个条目的连接线
function computeBucketLines(
  positionedBuckets: PositionedBucket[],
  positionedEntries: PositionedEntry[],
  options: HashMapLayoutOptions,
): Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> {
  const lines: Array<{
    id: string
    x1: number
    y1: number
    x2: number
    y2: number
  }> = []

  positionedBuckets.forEach((bucket, idx) => {
    const firstEntry = positionedEntries.find(
      e => e.bucketIndex === idx && e.entryIndex === 0
    )

    if (firstEntry) {
      lines.push({
        id: `bucket-line-${idx}`,
        x1: bucket.x + options.bucketWidth,
        y1: bucket.y + options.bucketHeight / 2,
        x2: firstEntry.x,
        y2: firstEntry.y + options.entryHeight / 2
      })
    }
  })

  return lines
}

// 计算条目之间的连接线
function computeEntryLines(
  positionedEntries: PositionedEntry[],
  options: HashMapLayoutOptions,
): Array<{ id: string; path: string }> {
  const lines: Array<{
    id: string
    path: string
  }> = []

  positionedEntries.forEach((entry) => {
    const nextEntry = positionedEntries.find(
      e => e.bucketIndex === entry.bucketIndex && e.entryIndex === entry.entryIndex + 1
    )

    if (nextEntry) {
      const x1 = entry.x + options.entryWidth
      const y1 = entry.y + options.entryHeight / 2
      const x2 = nextEntry.x
      const y2 = nextEntry.y + options.entryHeight / 2

      const controlX = (x1 + x2) / 2
      const path = `M ${x1} ${y1} C ${controlX} ${y1}, ${controlX} ${y2}, ${x2} ${y2}`

      lines.push({
        id: `entry-line-${entry.bucketIndex}-${entry.entryIndex}`,
        path
      })
    }
  })

  return lines
}

// 格式化值
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function CwHashMap(props: CwHashMapComponentProps) {
  const {
    buckets,
    bucketWidth = 60,
    bucketHeight = 40,
    entryWidth = 100,
    entryHeight = 60,
    entryGap = 20,
    showHash = false,
    showIndex = true,
    bucketClass = '',
    entryClass = '',
    textClass = '',
    indexClass = '',
    emptyBucketClass = '',
    lineClass = '',
    texts: _texts,
    onBucketClick,
    onEntryClick,
    className,
    ...rest
  } = props

  const layoutOptions = useMemo<HashMapLayoutOptions>(
    () => ({ bucketWidth, bucketHeight, entryWidth, entryHeight, entryGap, showIndex }),
    [bucketWidth, bucketHeight, entryWidth, entryHeight, entryGap, showIndex],
  )

  const { positionedBuckets, positionedEntries } = useMemo(
    () => calculatePositions(buckets, layoutOptions),
    [buckets, layoutOptions],
  )

  const bucketsStartX = getBucketsStartX(showIndex)

  const bucketLines = useMemo(
    () => computeBucketLines(positionedBuckets, positionedEntries, layoutOptions),
    [positionedBuckets, positionedEntries, layoutOptions],
  )

  const entryLines = useMemo(
    () => computeEntryLines(positionedEntries, layoutOptions),
    [positionedEntries, layoutOptions],
  )

  // 计算地图宽高
  const mapWidth = useMemo(() => {
    if (positionedEntries.length === 0) {
      return bucketsStartX + bucketWidth + 40
    }

    const maxX = Math.max(
      ...positionedEntries.map(e => e.x + entryWidth),
      bucketsStartX + bucketWidth
    )

    return Math.ceil(maxX + 20)
  }, [positionedEntries, bucketsStartX, bucketWidth, entryWidth])

  const mapHeight = useMemo(() => {
    if (positionedBuckets.length === 0) return 200

    const lastBucket = positionedBuckets[positionedBuckets.length - 1]
    return Math.ceil(lastBucket.y + bucketHeight + 20)
  }, [positionedBuckets, bucketHeight])

  // 事件处理
  const handleBucketClick = (bucket: CwHashMapBucket, event: ReactMouseEvent<HTMLDivElement>) => {
    onBucketClick?.(bucket, event)
  }

  const handleEntryClick = (entry: CwHashMapEntry, event: ReactMouseEvent<HTMLDivElement>) => {
    onEntryClick?.(entry, event)
  }

  return (
    <div className={[hashMapBase.root, className].filter(Boolean).join(' ')} {...rest}>
      <div
        className={hashMapBase.container}
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
      >
        {/* SVG 层：绘制链表连接线 */}
        <svg
          className={hashMapBase.svg}
          width={mapWidth}
          height={mapHeight}
        >
          {/* 绘制桶到第一个条目的连接线 */}
          {bucketLines.map((line) => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={lineClass || hashMapBase.line}
              strokeWidth={1.5}
            />
          ))}

          {/* 绘制条目之间的连接线 */}
          {entryLines.map((line) => (
            <path
              key={line.id}
              d={line.path}
              className={lineClass || hashMapBase.line}
              strokeWidth={1.5}
              fill="none"
            />
          ))}
        </svg>

        {/* 桶索引标签 */}
        {showIndex
          ? positionedBuckets.map((bucket) => (
              <div
                key={`index-${bucket.index}`}
                className={[
                  'absolute flex items-center justify-center font-mono text-xs font-semibold',
                  indexClass || '',
                ].filter(Boolean).join(' ')}
                style={{
                  left: `${indexX}px`,
                  top: `${bucket.y}px`,
                  width: `${indexWidth}px`,
                  height: `${bucketHeight}px`
                }}
              >
                [{bucket.index}]
              </div>
            ))
          : null}

        {/* 桶 */}
        {positionedBuckets.map((bucket) => (
          <div
            key={`bucket-${bucket.index}`}
            className={[
              'absolute cursor-pointer transition-all',
              bucket.entries.length === 0
                ? (emptyBucketClass || hashMapBase.bucket)
                : (bucketClass || hashMapBase.bucket),
            ].filter(Boolean).join(' ')}
            style={{
              left: `${bucket.x}px`,
              top: `${bucket.y}px`,
              width: `${bucketWidth}px`,
              height: `${bucketHeight}px`
            }}
            onClick={(event) => handleBucketClick(bucket, event)}
          >
            <div className="w-full h-full flex items-center justify-center overflow-hidden px-2">
              {bucket.entries.length === 0
                ? <span className="text-xs opacity-40">null</span>
                : <span className="text-xs font-medium">•</span>}
            </div>
          </div>
        ))}

        {/* 条目节点 */}
        {positionedEntries.map((entry) => (
          <div
            key={`entry-${entry.bucketIndex}-${entry.entryIndex}`}
            className={['absolute cursor-pointer transition-all', entryClass || hashMapBase.entry].filter(Boolean).join(' ')}
            style={{
              left: `${entry.x}px`,
              top: `${entry.y}px`,
              width: `${entryWidth}px`,
              height: `${entryHeight}px`
            }}
            onClick={(event) => handleEntryClick(entry.data, event)}
          >
            <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden px-3 py-1.5">
              <div className={['text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-center', textClass || hashMapBase.entryKey].filter(Boolean).join(' ')}>
                {entry.data.key}
              </div>
              <div className="text-xs opacity-60 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                {formatValue(entry.data.value)}
              </div>
              {showHash && entry.data.hash !== undefined ? (
                <div className="text-xs opacity-40 whitespace-nowrap mt-0.5">
                  h:{entry.data.hash}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CwHashMap
