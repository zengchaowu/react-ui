import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TpTipTapEditor } from './TpTipTapEditor'
import { numberControlArgType } from '../../storybook/argTypes'

/** OSS 上传接口根地址，可设置 STORYBOOK_OSS_BASE_URL 覆盖 */
const OSS_UPLOAD_BASE = 'https://api.zengchaowu.com'

async function uploadViaSignedPutForStory(file: File, objectPath: string): Promise<string> {
  const sig = await fetch(`${OSS_UPLOAD_BASE}/oss/signed-upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bucket: 'editor',
      path: objectPath,
      upsert: true,
    }),
  })
  const sigJson = (await sig.json().catch(() => ({}))) as {
    data?: { signedUrl?: string; publicUrl?: string }
    message?: string
  }
  if (!sig.ok) {
    throw new Error(sigJson.message || sig.statusText)
  }
  const signedUrl = sigJson.data?.signedUrl
  const publicUrl = sigJson.data?.publicUrl
  if (!signedUrl || !publicUrl) throw new Error('signed-upload-url 响应不完整')
  const put = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })
  if (!put.ok) {
    throw new Error(`COS PUT 失败: ${put.status}`)
  }
  return publicUrl
}

/** 上传图片：预签名 PUT 直传 COS，仅使用返回的 publicUrl */
async function uploadImageForStory(file: File): Promise<string> {
  return uploadViaSignedPutForStory(file, `images/${Date.now()}-${file.name}`)
}

/** 上传视频：预签名 PUT 直传 COS */
async function uploadVideoForStory(file: File): Promise<string> {
  return uploadViaSignedPutForStory(file, `videos/${Date.now()}-${file.name}`)
}

const meta: Meta<typeof TpTipTapEditor> = {
  title: '2. Third Party/Editor/TpTipTapEditor',
  component: TpTipTapEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '基于 TipTap（ProseMirror）的 WYSIWYG 富文本编辑器组件，支持粗体、斜体、列表、引用、代码块等，符合 README 自研组件规范（Tailwind、tokens、styles/texts 外部化）。',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: '编辑器内容（HTML）',
    },
    placeholder: {
      control: 'text',
      description: '占位符',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用（置灰）',
    },
    readonly: {
      control: 'boolean',
      description: '是否只读（不可编辑，工具栏置灰）',
    },
    height: numberControlArgType({
      min: 0,
      step: 8,
      description:
        '最小高度：number 为设计稿 px（经 resolveDesignCssSize → rem）；string 可为 CSS 长度',
    }),
    toolbar: {
      control: 'boolean',
      description: '是否显示工具栏',
    },
    autofocus: {
      control: 'boolean',
      description: '是否自动聚焦',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TpTipTapEditor>

const defaultHtml =
  '<p>这是一段 <strong>富文本</strong> 内容，支持 <em>斜体</em>、<s>删除线</s>、<code>行内代码</code>。</p><p>列表与块级格式：</p><ul><li>无序列表</li><li>第二项</li></ul><ol><li>有序列表</li><li>第二项</li></ol><blockquote><p>引用块</p></blockquote>'

type DemoProps = {
  initialValue?: string
  placeholder?: string
  height?: number | string
  toolbar?: boolean
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  withUpload?: boolean
  logChange?: boolean
}

function TipTapDemo({
  initialValue = '',
  placeholder,
  height,
  toolbar,
  disabled,
  readonly,
  autofocus,
  withUpload = false,
  logChange = false,
}: DemoProps) {
  const [value, setValue] = useState(initialValue)
  return (
    <div className="max-w-2xl">
      <TpTipTapEditor
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readonly={readonly}
        height={height}
        toolbar={toolbar}
        autofocus={autofocus}
        imageUpload={withUpload ? uploadImageForStory : undefined}
        videoUpload={withUpload ? uploadVideoForStory : undefined}
        onChange={(next) => {
          setValue(next)
          if (logChange) console.log('change', next)
        }}
        onReady={() => console.log('ready')}
      />
    </div>
  )
}

export const Default: Story = {
  args: {
    value: defaultHtml,
    placeholder: '请输入内容…',
    height: 240,
    toolbar: true,
  },
  render: (args) => (
    <TipTapDemo
      initialValue={args.value ?? ''}
      placeholder={args.placeholder}
      disabled={args.disabled}
      readonly={args.readonly}
      height={args.height}
      toolbar={args.toolbar}
      autofocus={args.autofocus}
      withUpload
      logChange
    />
  ),
}

export const EmptyWithPlaceholder: Story = {
  args: {
    value: '',
    placeholder: '在此输入文章正文…',
    height: 200,
    toolbar: true,
  },
  render: (args) => (
    <TipTapDemo
      initialValue=""
      placeholder={args.placeholder}
      readonly={args.readonly}
      height={args.height}
      toolbar={args.toolbar}
      withUpload
    />
  ),
}

/** 带图片/视频上传：点击 🖼/🎬 或粘贴图片，会请求 signed-upload-url + COS PUT，失败则回退 base64/Object URL */
export const WithImageUpload: Story = {
  args: {
    value: '<p>可点击 🖼 插入图片、🎬 插入视频，或直接粘贴/拖拽图片。</p>',
    placeholder: '输入内容…',
    height: 280,
    toolbar: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '图片/视频上传走 api.zengchaowu.com/oss/signed-upload-url + COS PUT（bucket: editor），内容中只插入返回的 URL。',
      },
    },
  },
  render: (args) => (
    <TipTapDemo
      initialValue={args.value ?? ''}
      placeholder={args.placeholder}
      readonly={args.readonly}
      height={args.height}
      toolbar={args.toolbar}
      withUpload
    />
  ),
}

export const NoToolbar: Story = {
  args: {
    value: '<p>仅编辑区，无工具栏。</p>',
    height: 120,
    toolbar: false,
  },
  render: (args) => (
    <TipTapDemo initialValue={args.value ?? ''} height={args.height} toolbar={args.toolbar} />
  ),
}

export const Disabled: Story = {
  args: {
    value: '<p>禁用状态，不可编辑。</p>',
    height: 120,
    toolbar: true,
    disabled: true,
  },
  render: (args) => (
    <TipTapDemo
      initialValue={args.value ?? ''}
      height={args.height}
      toolbar={args.toolbar}
      disabled={args.disabled}
    />
  ),
}

/** 只读：不可编辑，工具栏显示但置灰不可点 */
export const Readonly: Story = {
  args: {
    value: defaultHtml,
    height: 240,
    toolbar: true,
    readonly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'readonly 时编辑区不可编辑，工具栏仍显示但置灰且不可点击。',
      },
    },
  },
  render: (args) => (
    <TipTapDemo
      initialValue={args.value ?? defaultHtml}
      height={args.height}
      toolbar={args.toolbar}
      readonly={args.readonly}
    />
  ),
}
