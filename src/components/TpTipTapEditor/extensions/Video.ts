import { Node, mergeAttributes, type RawCommands } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setVideo: (attrs: { src: string; poster?: string }) => ReturnType
  }
}

export const Video = Node.create({
  name: 'common--media--video-line',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      controls: { default: true },
    }
  },
  parseHTML() {
    return [{ tag: 'video' }]
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, { controls: '' })
    return ['video', attrs]
  },
  addCommands(): Partial<RawCommands> {
    return {
      setVideo:
        (attrs: { src: string; poster?: string }) =>
        ({ commands }: { commands: { insertContent: (content: { type: string; attrs: Record<string, unknown> }) => boolean } }) =>
          commands.insertContent({ type: this.name, attrs }),
    } as Partial<RawCommands>
  },
})
