import type { Plugin } from 'vite'

/** 构建/开发前将 EmojiOne 64px PNG 复制到应用 public/emojione/64 */
export function emojioneStaticAssetsPlugin(): Plugin