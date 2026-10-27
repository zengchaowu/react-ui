import type { Meta, StoryObj } from '@storybook/react'
import CwButton from '../CwButton/CwButton'
import { showSliderCaptchaDialog } from './showSliderCaptchaDialog'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/texts'
import type { CwSliderCaptchaChallenge, ShowSliderCaptchaDialogOptions } from '@zengchaowu/ui-shared/components/CwSliderCaptchaDialog/types'

const meta: Meta<ShowSliderCaptchaDialogOptions> = {
  title: '1. Components/Overlay/CwSliderCaptchaDialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '滑块拼图安全验证弹窗。通过 onGenerate / onVerify 注入挑战与校验；成功返回 token，关闭返回 cancel。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    texts: { title: defaultTexts.title },
    onGenerate: async () => mockChallenge(),
    onVerify: async (_id, offsetX) => `story_token_${offsetX}`,
  },
}

export default meta
type Story = StoryObj<typeof meta>

const STORY_WIDTH = 300
const STORY_HEIGHT = 150
const STORY_PIECE = 44

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * Math.max(1, max - min))
}

/** Story 演示：绘制渐变背景，并在背景上挖出与拼图块对应的缺口 */
function mockChallenge(): CwSliderCaptchaChallenge {
  const canvas = document.createElement('canvas')
  canvas.width = STORY_WIDTH
  canvas.height = STORY_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')

  const gradient = ctx.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT)
  gradient.addColorStop(0, '#4f46e5')
  gradient.addColorStop(1, '#22d3ee')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT)

  const pieceSize = STORY_PIECE
  const targetX = randomInt(pieceSize + 16, STORY_WIDTH - pieceSize - 10)
  const puzzleY = randomInt(10, STORY_HEIGHT - pieceSize - 10)

  const piece = document.createElement('canvas')
  piece.width = pieceSize
  piece.height = pieceSize
  const pctx = piece.getContext('2d')
  if (!pctx) throw new Error('canvas')
  pctx.drawImage(
    canvas,
    targetX,
    puzzleY,
    pieceSize,
    pieceSize,
    0,
    0,
    pieceSize,
    pieceSize,
  )
  pctx.strokeStyle = 'rgba(255,255,255,0.9)'
  pctx.lineWidth = 1
  pctx.strokeRect(0.5, 0.5, pieceSize - 1, pieceSize - 1)

  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(targetX, puzzleY, pieceSize, pieceSize)
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 1
  ctx.strokeRect(targetX + 0.5, puzzleY + 0.5, pieceSize - 1, pieceSize - 1)

  return {
    challengeId: `story_${Date.now()}`,
    backgroundImage: canvas
      .toDataURL('image/png')
      .replace(/^data:image\/png;base64,/, ''),
    puzzleImage: piece
      .toDataURL('image/png')
      .replace(/^data:image\/png;base64,/, ''),
    puzzleY,
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    pieceWidth: pieceSize,
    pieceHeight: pieceSize,
  }
}

export const Playground: Story = {
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showSliderCaptchaDialog({ ...args } as ShowSliderCaptchaDialogOptions)
        }}
      >
        打开滑块验证
      </CwButton>
    </div>
  ),
}
