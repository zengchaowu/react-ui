import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState, type ReactNode } from 'react'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { CwSingleDiv } from './CwSingleDiv'
import type { CwSingleDivDSL, CwSingleDivProps } from './types'

const meta: Meta<typeof CwSingleDiv> = {
  title: '1. Components/Layout/CwSingleDiv',
  component: CwSingleDiv,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用 DSL 描述并渲染纯 CSS 图案。`main` 是主层，`before` / `after` 是叠层，`children` 可嵌套更多层。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    dsl: {
      control: { type: 'object' },
      description: 'DSL：main / before / after / children',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwSingleDiv>

const circleDsl: CwSingleDivDSL = {
  main: {
    width: '6rem',
    height: '6rem',
    background: 'var(--brand-color-6)',
    borderRadius: '50%',
    boxShadow: 'var(--shadow-2)',
  },
}

function withDslCaption(label: string): Story['render'] {
  return (args) => (
    <div className="flex flex-col items-center gap-3">
      <CwSingleDiv {...args} />
      <p className="text-xs text-[var(--text-color-secondary)]">{label}</p>
    </div>
  )
}

export const Default: Story = {
  args: {
    dsl: circleDsl,
  },
  render: withDslCaption('仅 main · 可在 Controls 改 dsl'),
}

export const BeforeAfter: Story = {
  args: {
    dsl: {
      main: {
        position: 'relative',
        width: '6rem',
        height: '6rem',
        background: tokenSolidColors.brandColor6,
        borderRadius: '50%',
      },
      before: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '6rem',
        height: '6rem',
        background: tokenSolidColors.bgColorPage,
        borderRadius: '50%',
        transform: 'translate(1.1rem, -0.35rem)',
      },
      after: {
        position: 'absolute',
        top: '1.75rem',
        left: '1.1rem',
        width: '0.85rem',
        height: '0.85rem',
        background: tokenSolidColors.brandColor6,
        borderRadius: '50%',
      },
    } satisfies CwSingleDivDSL,
  },
  render: withDslCaption('main + before + after · 月牙'),
}

export const NestedChildren: Story = {
  args: {
    dsl: {
      main: {
        position: 'relative',
        width: '7rem',
        height: '7rem',
        background: tokenSolidColors.warningColor5,
        borderRadius: '50%',
      },
      children: [
        {
          main: {
            position: 'absolute',
            top: '1.6rem',
            left: '1.5rem',
            width: '1.1rem',
            height: '1.1rem',
            background: tokenSolidColors.grayColor15,
            borderRadius: '50%',
          },
        },
        {
          main: {
            position: 'absolute',
            top: '1.6rem',
            right: '1.5rem',
            width: '1.1rem',
            height: '1.1rem',
            background: tokenSolidColors.grayColor15,
            borderRadius: '50%',
          },
        },
        {
          main: {
            position: 'absolute',
            top: '3.6rem',
            left: '50%',
            width: '2.4rem',
            height: '1.2rem',
            background: tokenSolidColors.errorColor6,
            borderRadius: '0 0 1.2rem 1.2rem',
            transform: 'translateX(-50%)',
          },
        },
      ],
    } satisfies CwSingleDivDSL,
  },
  render: withDslCaption('main + children · 嵌套表情'),
}

/** 注入 --countdown-angle 变量并持续动画（等价 Vue decorator 的 mounted 逻辑） */
function CountdownHost({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!document.getElementById('cw-single-div-countdown-styles')) {
      const style = document.createElement('style')
      style.id = 'cw-single-div-countdown-styles'
      style.textContent = ':root { --countdown-angle: 0deg; }'
      document.head.appendChild(style)
    }

    let startTime: number | null = null
    const duration = 10000
    let raf = 0

    const animateCountdown = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      document.documentElement.style.setProperty(
        '--countdown-angle',
        `${progress * 360}deg`,
      )
      if (progress < 1) {
        raf = requestAnimationFrame(animateCountdown)
      } else {
        startTime = null
        raf = requestAnimationFrame(animateCountdown)
      }
    }

    raf = requestAnimationFrame(animateCountdown)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <>{children}</>
}

export const Countdown: Story = {
  decorators: [
    (Story) => (
      <CountdownHost>
        <Story />
      </CountdownHost>
    ),
  ],
  args: {
    dsl: {
      main: {
        position: 'relative',
        width: '6.25rem',
        height: '6.25rem',
        background: tokenSolidColors.brandColor6,
        borderRadius: '50%',
        boxShadow: 'var(--shadow-2)',
        transform: 'rotate(-90deg)',
      },
      before: {
        position: 'absolute',
        inset: '0',
        width: '6.25rem',
        height: '6.25rem',
        background: `conic-gradient(from 90deg, ${tokenSolidColors.bgColorPage} 0deg var(--countdown-angle, 0deg), transparent var(--countdown-angle, 0deg) 360deg)`,
        borderRadius: '50%',
      },
    } satisfies CwSingleDivDSL,
  },
  render: withDslCaption('before 层 conic-gradient · 倒计时环'),
}

function ClickableDemo(args: CwSingleDivProps) {
  const [clicks, setClicks] = useState(0)

  return (
    <div className="flex flex-col items-center gap-3">
      <CwSingleDiv {...args} onClick={() => setClicks((prev) => prev + 1)} />
      <p className="text-xs text-[var(--text-color-secondary)]">
        点击次数：{clicks}
      </p>
    </div>
  )
}

export const Clickable: Story = {
  args: {
    dsl: {
      main: {
        width: '6rem',
        height: '6rem',
        background: tokenSolidColors.successColor6,
        borderRadius: '1rem',
        boxShadow: 'var(--shadow-2)',
        cursor: 'pointer',
      },
    } satisfies CwSingleDivDSL,
  },
  render: (args) => <ClickableDemo {...args} />,
}
