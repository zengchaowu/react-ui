import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwAttachmentPreview } from './CwAttachmentPreview'
import { showCwAttachmentPreview } from './showCwAttachmentPreview'
import type { CwAttachmentPreviewProps } from './types'
import type { CwAttachmentGalleryItem } from '../CwAttachmentGallery/types'

const meta: Meta<typeof CwAttachmentPreview> = {
  title: '1. Components/Overlay/CwAttachmentPreview',
  component: CwAttachmentPreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '全屏媒体预览：基于 CwAttachmentGallery，同一组 items 可混排 URL 图片、视频与 File 附件；支持声明式与 `showCwAttachmentPreview()`。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    visible: { control: { type: 'boolean' }, description: '是否显示预览' },
    initialIndex: { control: { type: 'number', min: 0, step: 1 } },
    showIndex: {
      control: { type: 'boolean' },
      description: '顶部「当前 / 总数」；多页默认开',
    },
    showIndicator: {
      control: { type: 'boolean' },
      description: '底部画廊指示器；全屏默认关（与顶部 index 二选一）',
    },
    showDownload: {
      control: { type: 'boolean' },
      description: '右上角下载按钮；有可下载源时默认开',
    },
    closeable: { control: { type: 'boolean' } },
    closeOnClickOverlay: { control: { type: 'boolean' } },
    items: { control: false },
    galleryKey: { control: false },
    imagePreviewConfig: { control: false },
    texts: { control: false },
  },
  args: {
    visible: true,
    initialIndex: 0,
    showIndex: true,
    showIndicator: false,
    showDownload: true,
    closeable: true,
    closeOnClickOverlay: true,
  },
}

export default meta
type Story = StoryObj<typeof CwAttachmentPreview>

const demoImageUrls = [
  'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpg',
]

const demoVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'

function demoFile(name: string, type: string, sizeBytes: number): File {
  // 内容不必真实；体积用 sizeBytes 展示，扩展名驱动 CwFileIcon
  return new File([new Uint8Array(Math.min(sizeBytes, 64))], name, { type })
}

/** 混排：图 → 文件 → 图 → 视频 → 文件，覆盖画廊全路径 */
const mixedDemoItems: CwAttachmentGalleryItem[] = [
  {
    key: 'img-0',
    kind: 'image',
    src: demoImageUrls[0],
    sourceIndex: 0,
  },
  {
    key: 'file-pdf',
    kind: 'file',
    file: demoFile('季度复盘报告.pdf', 'application/pdf', 1_280_000),
    sizeBytes: 1_280_000,
    sourceIndex: 1,
  },
  {
    key: 'img-1',
    kind: 'image',
    src: demoImageUrls[1],
    sourceIndex: 2,
  },
  {
    key: 'video-0',
    kind: 'video',
    src: demoVideoUrl,
    sourceIndex: 3,
  },
  {
    key: 'file-docx',
    kind: 'file',
    file: demoFile(
      '需求说明.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      246_000,
    ),
    sizeBytes: 246_000,
    sourceIndex: 4,
  },
  {
    key: 'img-2',
    kind: 'image',
    src: demoImageUrls[2],
    sourceIndex: 5,
  },
  {
    key: 'file-zip',
    kind: 'file',
    file: demoFile('设计稿打包.zip', 'application/zip', 8_450_000),
    sizeBytes: 8_450_000,
    sourceIndex: 6,
  },
]

const imageOnlyItems: CwAttachmentGalleryItem[] = demoImageUrls.map((url, index) => ({
  key: `image-only-${index}`,
  kind: 'image' as const,
  src: url,
  sourceIndex: index,
}))

const fileOnlyItems: CwAttachmentGalleryItem[] = [
  {
    key: 'only-pdf',
    kind: 'file',
    file: demoFile('合同草案.pdf', 'application/pdf', 512_000),
    sizeBytes: 512_000,
    sourceIndex: 0,
  },
  {
    key: 'only-xlsx',
    kind: 'file',
    file: demoFile(
      '预算表.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      96_000,
    ),
    sizeBytes: 96_000,
    sourceIndex: 1,
  },
  {
    key: 'only-png-as-file',
    kind: 'file',
    file: demoFile('截图备档.png', 'image/png', 320_000),
    sizeBytes: 320_000,
    sourceIndex: 2,
  },
]

function PreviewDemo({
  args,
  items,
  hint,
}: {
  args: CwAttachmentPreviewProps
  items: CwAttachmentGalleryItem[]
  hint: string
}) {
  const [visible, setVisible] = useState(args.visible ?? true)

  return (
    <div className="p-4">
      <p className="mb-2 text-sm text-[var(--text-color-secondary)]">{hint}</p>
      <CwAttachmentPreview
        visible={visible}
        onVisibleChange={setVisible}
        items={items}
        initialIndex={args.initialIndex}
        showIndex={args.showIndex}
        showIndicator={args.showIndicator}
        showDownload={args.showDownload}
        closeable={args.closeable}
        closeOnClickOverlay={args.closeOnClickOverlay}
      />
    </div>
  )
}

const menuButtonClass =
  'rounded-md bg-[var(--brand-color-6)] px-3 py-2 text-sm text-[var(--text-color-anti)]'

function ImperativeApiDemo(args: CwAttachmentPreviewProps) {
  function openMixed() {
    showCwAttachmentPreview({
      items: mixedDemoItems,
      initialIndex: args.initialIndex ?? 0,
      showIndex: args.showIndex,
      showIndicator: args.showIndicator,
      showDownload: args.showDownload,
      closeable: args.closeable,
      closeOnClickOverlay: args.closeOnClickOverlay,
    })
  }

  function openImages() {
    showCwAttachmentPreview({
      images: demoImageUrls,
      initialIndex: args.initialIndex ?? 0,
      showIndex: args.showIndex,
      showIndicator: args.showIndicator,
      showDownload: args.showDownload,
      closeable: args.closeable,
      closeOnClickOverlay: args.closeOnClickOverlay,
    })
  }

  function openFiles() {
    showCwAttachmentPreview({
      files: fileOnlyItems.map((item) => item.file!).filter(Boolean),
      initialIndex: 0,
      showIndex: args.showIndex,
      showIndicator: args.showIndicator,
      showDownload: args.showDownload,
      closeable: args.closeable,
      closeOnClickOverlay: args.closeOnClickOverlay,
    })
  }

  function openMixedAtVideo() {
    showCwAttachmentPreview({
      items: mixedDemoItems,
      initialIndex: 3,
      showIndex: true,
    })
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-[var(--text-color-secondary)]">
        命令式 showCwAttachmentPreview：混排 / 纯图 / 纯文件 / 定位到视频
      </p>
      <div role="button" tabIndex={0} className={menuButtonClass} onClick={openMixed}>
        打开混排（图 + 文件 + 视频）
      </div>
      <div role="button" tabIndex={0} className={menuButtonClass} onClick={openMixedAtVideo}>
        打开混排并定位到视频
      </div>
      <div role="button" tabIndex={0} className={menuButtonClass} onClick={openImages}>
        打开（images URL）
      </div>
      <div role="button" tabIndex={0} className={menuButtonClass} onClick={openFiles}>
        打开（files）
      </div>
    </div>
  )
}

/** 默认即混排：图 / 文件 / 视频 */
export const Default: Story = {
  render: (args) => (
    <PreviewDemo
      args={args}
      items={mixedDemoItems}
      hint="混排预览：默认顶部 index，底部指示器关闭（Controls 可开 showIndicator）。"
    />
  ),
}

export const ImagesOnly: Story = {
  args: { visible: true, initialIndex: 1 },
  render: (args) => (
    <PreviewDemo
      args={args}
      items={imageOnlyItems}
      hint="纯 URL 图片（无 File）：适合聊天气泡 / Markdown 内联图。"
    />
  ),
}

export const FilesOnly: Story = {
  args: { visible: true, initialIndex: 0 },
  render: (args) => (
    <PreviewDemo
      args={args}
      items={fileOnlyItems}
      hint="纯文件附件：图标 + 文件名 + 体积；无图片缩放手势。"
    />
  ),
}

export const StartOnFile: Story = {
  args: { visible: true, initialIndex: 1 },
  render: (args) => (
    <PreviewDemo
      args={args}
      items={mixedDemoItems}
      hint="从文件页打开（initialIndex = 1，PDF），再滑到相邻图片/视频。"
    />
  ),
}

export const BottomIndicatorOnly: Story = {
  args: { visible: true, showIndex: false, showIndicator: true },
  render: (args) => (
    <PreviewDemo
      args={args}
      items={mixedDemoItems}
      hint="只用底部指示器（showIndex=false, showIndicator=true）"
    />
  ),
}

export const ImperativeApi: Story = {
  args: { visible: false },
  render: (args) => <ImperativeApiDemo {...args} />,
}
