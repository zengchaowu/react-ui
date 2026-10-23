import type { Meta, StoryObj } from '@storybook/react'
import { CwMusicPlayer } from './CwMusicPlayer'
import { defaultTexts } from './texts'

const demoSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

const meta: Meta<typeof CwMusicPlayer> = {
  title: '1. Components/Media/CwMusicPlayer',
  component: CwMusicPlayer,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    texts: defaultTexts,
    src: demoSrc,
    title: 'SoundHelix Song 1',
    artist: 'SoundHelix',
    cover: 'https://picsum.photos/seed/music-cover/400/400',
    controls: true,
    autoplay: false,
    loop: false,
    shuffleActive: false,
    showCover: true,
    showLyrics: false,
    showTransport: true,
    showVolume: true,
    volume: 0.8,
    hasPrev: true,
    hasNext: true,
  },
}

export const WithLyrics: Story = {
  args: {
    ...Default.args,
    showLyrics: true,
    lyrics: '第一句歌词\n第二句歌词\n第三句歌词',
  },
}
