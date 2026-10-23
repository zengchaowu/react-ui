import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc } from '../../storybook/chatDefaultAvatar'
import { storybookChatDownloadByUrl } from '../../storybook/chatMessageListStoryDemo'
import { storybookChatWalletRedEnvelopeIconSrc } from '../../storybook/chatWalletDemoAssets'
import { CwChatMessageCell } from './index'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'

const meta: Meta<typeof CwChatMessageCell> = {
  title: '1. Components/Chat/CwChatMessageCell',
  component: CwChatMessageCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '单条聊天消息：内部按 type 渲染文本 / 图片 / 视频 / 文件等子气泡，业务只使用本组件即可。头像、红包图标等业务资源由宿主通过 props 传入。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    peerAvatarFallbackSrc: storybookChatDefaultAvatarSrc,
    mentionAvatarFallbackSrc: storybookChatDefaultAvatarSrc,
    walletRedEnvelopeIconSrc: storybookChatWalletRedEnvelopeIconSrc,
    downloadByUrl: storybookChatDownloadByUrl,
  },
}

export default meta
type Story = StoryObj<typeof meta>

const base: Pick<ChatMessage, 'id' | 'timestamp' | 'sender'> = {
  id: '1',
  timestamp: new Date(),
  sender: { id: 'u1', name: 'A' },
}

export const Default: Story = {
  args: {
    message: {
      ...base,
      type: 'text',
      content: 'CwChatMessageCell',
      isOwn: false,
      status: 'sent',
    },
  },
}

export const TextPeer: Story = {
  args: {
    message: {
      ...base,
      type: 'text',
      content: '你好，这是一条文本',
      isOwn: false,
    },
  },
}

export const TextPeerGroupWithSender: Story = {
  args: {
    showPeerSenderInMultiParty: true,
    message: {
      ...base,
      sender: { id: 'u1', name: '成员甲', avatar: undefined },
      type: 'text',
      content: '多人会话里显示头像与昵称',
      isOwn: false,
    },
  },
}

export const TextOwn: Story = {
  args: {
    message: {
      ...base,
      id: '2',
      type: 'text',
      content: '我回复一条',
      isOwn: true,
      sender: { id: 'me', name: '我' },
    },
  },
}

export const ImageMessage: Story = {
  args: {
    message: {
      ...base,
      id: '3',
      type: 'image',
      content:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      isOwn: false,
    },
  },
}

export const VideoMessage: Story = {
  args: {
    message: {
      ...base,
      id: '4',
      type: 'video',
      content:
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      mediaWidth: 640,
      mediaHeight: 360,
      isOwn: false,
    },
  },
}

export const FileMessage: Story = {
  args: {
    message: {
      ...base,
      id: '5',
      type: 'file',
      content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      mediaOriginalFileName: '说明/合同.pdf',
      mediaFileSizeBytes: 13_381,
      isOwn: true,
      sender: { id: 'me', name: '我' },
    },
  },
}

export const RedEnvelopeMessage: Story = {
  args: {
    message: {
      ...base,
      id: '6',
      type: 'red_envelope',
      content: '',
      isOwn: false,
      redEnvelope: {
        envelope_no: 'env_demo_1',
        amount: 8.88,
        currency: 'CNY',
        greeting: '恭喜发财',
        status: 'pending',
        packet_type: 'fixed',
      },
    },
  },
}

export const WithMeta: Story = {
  args: {
    message: {
      ...base,
      type: 'text',
      content: '带时间与附件 meta',
      isOwn: false,
      timeLabel: '14:32',
      clientTimeLabel: '14:31:58',
    },
  },
}

export const AiAgentToolTimeline: Story = {
  parameters: { layout: 'padded' },
  args: {
    message: {
      ...base,
      id: 'ai_stream_demo',
      type: 'text',
      content: '根据文件内容，main 导出 init 函数。',
      isOwn: false,
      sender: { id: 'agent-1', name: '助手' },
      displaySpec: {
        blocks: [
          {
            type: 'im.agent_tool',
            props: {
              id: 'call_1',
              name: 'file_system',
              status: 'done',
              argsPreview: '{"operation":"read","path":"src/main.ts"}',
              resultPreview: 'export function main() { return 1 }',
            },
          },
          {
            type: 'im.agent_tool',
            props: {
              id: 'call_2',
              name: 'code_search',
              status: 'running',
              argsPreview: '{"query":"init"}',
            },
          },
          {
            type: 'im.markdown',
            props: {
              content: '正在分析代码库…',
            },
          },
        ],
      },
    },
  },
}
