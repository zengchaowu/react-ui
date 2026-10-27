import type { Meta, StoryObj } from '@storybook/react'
import { CwAttachmentGallery } from './CwAttachmentGallery'
import { defaultCwAttachmentGalleryTexts } from '@zengchaowu/ui-shared/components/CwAttachmentGallery/texts'
import type {
  CwAttachmentGalleryItem,
  CwAttachmentGalleryProps,
} from './types'

/** 与全屏预览一致：文件页用 anti 字色，需深色底，不能用 container 白底 */
const storyShellClass =
  'h-[22rem] w-[22rem] overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--overlay-scrim-gallery)]'

const storyShellWideClass =
  'h-[24rem] w-[36rem] max-w-[min(36rem,100vw-2rem)] overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--overlay-scrim-gallery)]'

const meta: Meta<typeof CwAttachmentGallery> = {
  title: '1. Components/Media/CwAttachmentGallery',
  component: CwAttachmentGallery,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '附件画廊：同一组 items 可混排 URL 图片、视频与 File 附件；横向分页。底部指示器用 `showIndicator` 控制（多页默认开）。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: { control: false },
    texts: { control: false },
    imagePreviewConfig: { control: false },
    indicatorConfig: { control: false },
    showIndicator: { control: { type: 'boolean' } },
  },
  args: {
    showIndicator: true,
    texts: defaultCwAttachmentGalleryTexts,
  },
}

export default meta
type Story = StoryObj<typeof CwAttachmentGallery>

const demoImageUrls = [
  'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpg',
]

const demoVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'

function demoFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(Math.min(sizeBytes, 64))], name, { type })
}

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

function GalleryShell({ args, shellClass }: { args: CwAttachmentGalleryProps; shellClass: string }) {
  return (
    <div className={shellClass}>
      <CwAttachmentGallery {...args} />
    </div>
  )
}

/** 默认即混排：图 / 文件 / 视频（底部指示器默认开） */
export const Default: Story = {
  args: {
    items: mixedDemoItems,
    initialIndex: 0,
    showIndicator: true,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellWideClass} />,
}

export const WithoutIndicator: Story = {
  args: {
    items: mixedDemoItems,
    initialIndex: 0,
    showIndicator: false,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellWideClass} />,
}

export const ImagesOnly: Story = {
  args: {
    items: imageOnlyItems,
    initialIndex: 1,
    showIndicator: true,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellClass} />,
}

export const FilesOnly: Story = {
  args: {
    items: fileOnlyItems,
    initialIndex: 0,
    showIndicator: true,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellClass} />,
}

export const SingleImage: Story = {
  args: {
    items: imageOnlyItems.slice(0, 1),
    showIndicator: true,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellClass} />,
}

export const StartOnFile: Story = {
  args: {
    items: mixedDemoItems,
    initialIndex: 1,
    showIndicator: true,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellWideClass} />,
}

export const StartOnVideo: Story = {
  args: {
    items: mixedDemoItems,
    initialIndex: 3,
    showIndicator: true,
  },
  render: (args) => <GalleryShell args={args} shellClass={storyShellWideClass} />,
}
