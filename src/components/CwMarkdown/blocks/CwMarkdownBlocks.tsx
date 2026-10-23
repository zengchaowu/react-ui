import type { CwMarkdownBlock, CwMarkdownCodeBlockExtension } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownHeading } from './CwMarkdownHeading'
import { CwMarkdownParagraph } from './CwMarkdownParagraph'
import { CwMarkdownCodeBlock } from './CwMarkdownCodeBlock'
import { CwMarkdownBlockquote } from './CwMarkdownBlockquote'
import { CwMarkdownList } from './CwMarkdownList'
import { CwMarkdownHr } from './CwMarkdownHr'
import { CwMarkdownTable } from './CwMarkdownTable'

export interface CwMarkdownBlocksProps {
  blocks: CwMarkdownBlock[]
}

export function CwMarkdownBlocks({ blocks }: CwMarkdownBlocksProps) {
  const ctx = useCwMarkdownContext()

  function resolveCodeBlockExtension(
    language: string | undefined,
  ): CwMarkdownCodeBlockExtension | undefined {
    return ctx.codeBlockExtensions.find((ext) => ext.match(language))
  }

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return <CwMarkdownHeading key={index} block={block} />
          case 'paragraph':
            return <CwMarkdownParagraph key={index} block={block} />
          case 'codeBlock': {
            const extension = resolveCodeBlockExtension(block.language)
            if (extension) {
              const ExtensionComponent = extension.component
              return <ExtensionComponent key={index} block={block} />
            }
            return <CwMarkdownCodeBlock key={index} block={block} />
          }
          case 'blockquote':
            return <CwMarkdownBlockquote key={index} block={block} />
          case 'list':
            return <CwMarkdownList key={index} block={block} />
          case 'hr':
            return <CwMarkdownHr key={index} />
          case 'table':
            return <CwMarkdownTable key={index} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}

export default CwMarkdownBlocks
