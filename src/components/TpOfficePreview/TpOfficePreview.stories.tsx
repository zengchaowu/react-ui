import type { Meta, StoryObj } from '@storybook/react'
import { TpOfficePreview } from './TpOfficePreview'
import { defaultTexts } from './texts'
import sampleDataCsv from '../../storybook/assets/tp-office-preview/sample-data.csv?url'

/** Story 演示用 PDF（外链；Office 二进制样例请放入 storybook/assets/tp-office-preview/） */
const storybookSamplePdfUrl =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

const meta: Meta<typeof TpOfficePreview> = {
  title: '2. Third Party/File/TpOfficePreview',
  component: TpOfficePreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Office 文档预览组件，支持 PDF、Word (.docx)、Excel (.xlsx) 和 PowerPoint (.pptx) 文件的在线预览。基于 vue-office 库实现，提供统一的文档预览体验。',
      },
    },
  },
  argTypes: {
    src: {
      control: { type: 'text' },
      description: '文档源，可以是 URL 字符串或包含 url/file 的对象',
    },
    showRetry: {
      control: { type: 'boolean' },
      description: '是否显示重试按钮',
    },
    onRendered: { action: 'rendered' },
    onError: { action: 'error' },
    onLoading: { action: 'loading' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const PdfPreview: Story = {
  args: {
    texts: defaultTexts,
    src: storybookSamplePdfUrl,
    showRetry: true,
  },
  render: (args) => (
    <div className="w-full h-[100vh]">
      <TpOfficePreview {...args} />
    </div>
  ),
}

export const CsvPreview: Story = {
  args: {
    texts: defaultTexts,
    src: sampleDataCsv,
    showRetry: true,
  },
  render: (args) => (
    <div className="w-full h-[100vh]">
      <TpOfficePreview {...args} />
    </div>
  ),
}
