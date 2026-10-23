import { useContext, useMemo } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type {
  CwMarkdownCodeBlockCopyPayload,
  CwMarkdownCodeBlockPreviewPayload,
  CwMarkdownImageContextMenuPayload,
  CwMarkdownProps,
  CwMarkdownStyles,
  CwMarkdownTexts,
} from './types'
import { markdownBase } from './styles'
import { defaultTexts } from './texts'
import {
  CwMarkdownCodeBlockExtensionsContext,
  CwMarkdownContext,
  CwMarkdownInlineImageExtensionsContext,
} from './context'
import { useMarkdownBlocks, useMarkdownPreprocessedContent } from './hooks'
import { CwMarkdownBlocks } from './blocks/CwMarkdownBlocks'

export function CwMarkdown({
  content = '',
  mentionLabelResolver,
  disabled = false,
  readonly = false,
  size = 'medium',
  contentTextClass,
  heading4Class,
  texts: textsProp,
  codeBlockExtensions: codeBlockExtensionsProp = [],
  inlineImageExtensions: inlineImageExtensionsProp = [],
  codeBlockDefaultExpanded = true,
  codeBlockPreviewLanguages = [],
  onLinkClick,
  onImageClick,
  onImageContextMenu,
  onCodeBlockCopy,
  onCodeBlockPreview,
  className,
  ...rest
}: CwMarkdownProps) {
  const injectedCodeBlockExtensions = useContext(
    CwMarkdownCodeBlockExtensionsContext,
  )
  const injectedInlineImageExtensions = useContext(
    CwMarkdownInlineImageExtensionsContext,
  )

  const styles: CwMarkdownStyles = useMemo(() => {
    let base: CwMarkdownStyles = { ...markdownBase }
    if (contentTextClass) {
      base = {
        ...base,
        sizeSmall: contentTextClass,
        sizeMedium: contentTextClass,
        sizeLarge: contentTextClass,
      }
    }
    if (heading4Class) {
      base = { ...base, heading4: heading4Class }
    }
    return base
  }, [contentTextClass, heading4Class])

  const sizeClass =
    size === 'small'
      ? styles.sizeSmall
      : size === 'large'
        ? styles.sizeLarge
        : styles.sizeMedium

  const texts: CwMarkdownTexts = useMemo(
    () => ({
      ...defaultTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const preprocessedContent = useMarkdownPreprocessedContent(content ?? '')
  const blocks = useMarkdownBlocks(preprocessedContent)

  const codeBlockExtensions = useMemo(
    () => [...injectedCodeBlockExtensions, ...(codeBlockExtensionsProp ?? [])],
    [injectedCodeBlockExtensions, codeBlockExtensionsProp],
  )

  const inlineImageExtensions = useMemo(
    () => [
      ...injectedInlineImageExtensions,
      ...(inlineImageExtensionsProp ?? []),
    ],
    [injectedInlineImageExtensions, inlineImageExtensionsProp],
  )

  const previewLanguages = useMemo(
    () =>
      codeBlockPreviewLanguages
        .map((language) => language.trim().toLowerCase())
        .filter(Boolean),
    [codeBlockPreviewLanguages],
  )

  const ctx = useMemo(
    () => ({
      styles,
      texts,
      disabled,
      readonly,
      size,
      mentionLabelResolver,
      onLinkClick: (
        href: string,
        event: ReactMouseEvent<HTMLElement>,
      ) => onLinkClick?.(href, event),
      onImageClick: (
        src: string,
        event: ReactMouseEvent<HTMLElement>,
        documentImageIndex: number,
      ) => onImageClick?.(src, event, documentImageIndex),
      onImageContextMenu: (payload: CwMarkdownImageContextMenuPayload) =>
        onImageContextMenu?.(payload),
      onCodeBlockCopy: (payload: CwMarkdownCodeBlockCopyPayload) =>
        onCodeBlockCopy?.(payload),
      onCodeBlockPreview: (payload: CwMarkdownCodeBlockPreviewPayload) =>
        onCodeBlockPreview?.(payload),
      codeBlockPreviewLanguages: previewLanguages,
      codeBlockExtensions,
      inlineImageExtensions,
      codeBlockDefaultExpanded: codeBlockDefaultExpanded !== false,
    }),
    [
      styles,
      texts,
      disabled,
      readonly,
      size,
      mentionLabelResolver,
      onLinkClick,
      onImageClick,
      onImageContextMenu,
      onCodeBlockCopy,
      onCodeBlockPreview,
      previewLanguages,
      codeBlockExtensions,
      inlineImageExtensions,
      codeBlockDefaultExpanded,
    ],
  )

  return (
    <CwMarkdownContext.Provider value={ctx}>
      <div
        {...rest}
        data-cw-markdown-root
        className={[styles.root, styles.rootNormal, sizeClass, className]
          .filter(Boolean)
          .join(' ')}
        aria-disabled={disabled ? 'true' : 'false'}
        aria-readonly={readonly ? 'true' : 'false'}
      >
        <CwMarkdownBlocks blocks={blocks} />
      </div>
    </CwMarkdownContext.Provider>
  )
}

export default CwMarkdown
