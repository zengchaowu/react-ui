import { Fragment, useMemo } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import type { CwRichTextProps } from './types'
import type { CwRichTextNode, CwRichTextStyles, CwRichTextTexts } from '@zengchaowu/ui-shared/components/CwRichText/types'
import { resolveRichTextStyles } from '@zengchaowu/ui-shared/components/CwRichText/richTextAppearance'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwRichText/texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export function CwRichText({
  dsl,
  disabled = false,
  readonly = false,
  size = 'medium',
  appearance = 'default',
  texts: textsProp,
  className,
  onLinkClick,
  ...rest
}: CwRichTextProps) {
  const styles = useMemo<CwRichTextStyles>(
    () => resolveRichTextStyles(appearance ?? 'default'),
    [appearance],
  )

  const sizeClass = useMemo(() => {
    const sizeMap = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return sizeMap[size || 'medium']
  }, [styles, size])

  const texts = useMemo<CwRichTextTexts>(
    () => ({
      ...defaultTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  // Focus 状态：区分键盘导航与鼠标点击
  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

  // 处理链接点击（避免闭包）
  function handleLinkClick(href: string, event: MouseEvent | KeyboardEvent) {
    if (disabled || readonly) return
    event.preventDefault()
    onLinkClick?.(href, event as MouseEvent)
  }

  // 处理链接键盘事件
  function handleLinkKeyDown(href: string, event: KeyboardEvent) {
    if (disabled || readonly) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleLinkClick(href, event)
    }
  }

  // 递归渲染节点
  function renderNode(node: CwRichTextNode): ReactNode {
    const children: ReactNode[] = []

    // 添加文本内容（仅对支持文本的节点类型）
    if (node.type !== 'br' && 'text' in node && node.text) {
      children.push(node.text)
    }

    // 添加子节点（仅对支持子节点的节点类型）
    if (
      node.type !== 'text' &&
      node.type !== 'br' &&
      'children' in node &&
      node.children?.length
    ) {
      children.push(
        ...node.children.map((child, index) => (
          <Fragment key={index}>{renderNode(child)}</Fragment>
        )),
      )
    }

    const currentStyles = styles
    const currentTexts = texts

    switch (node.type) {
      case 'text':
        return (
          <span className={currentStyles.text} style={node.style}>
            {children}
          </span>
        )

      case 'link':
        return (
          <span
            className={[
              currentStyles.link,
              disabled
                ? currentStyles.linkDisabled
                : readonly
                  ? currentStyles.linkReadonly
                  : currentStyles.linkNormal,
              isFocusVisible && !disabled && !readonly
                ? currentStyles.linkFocused
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={node.style}
            onClick={(e: ReactMouseEvent<HTMLSpanElement>) =>
              handleLinkClick(node.href, e.nativeEvent)
            }
            onKeyDown={(e: ReactKeyboardEvent<HTMLSpanElement>) =>
              handleLinkKeyDown(node.href, e.nativeEvent)
            }
            onFocus={() => handleFocusVisibleFocus()}
            onBlur={handleFocusVisibleBlur}
            role="link"
            tabIndex={disabled ? undefined : 0}
            aria-label={`${currentTexts.linkAriaLabelPrefix}${node.text || ''}`}
            aria-disabled={disabled ? 'true' : 'false'}
          >
            {children}
          </span>
        )

      case 'bold':
        return (
          <span className={currentStyles.bold} style={node.style}>
            {children}
          </span>
        )

      case 'italic':
        return (
          <span className={currentStyles.italic} style={node.style}>
            {children}
          </span>
        )

      case 'underline':
        return (
          <span className={currentStyles.underline} style={node.style}>
            {children}
          </span>
        )

      case 'br':
        return <br />
    }

    return null
  }

  return (
    <div
      {...rest}
      className={[
        styles.root,
        sizeClass,
        disabled
          ? styles.rootDisabled
          : readonly
            ? styles.rootReadonly
            : styles.rootNormal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
    >
      {dsl.map((node, index) => (
        <Fragment key={index}>{renderNode(node)}</Fragment>
      ))}
    </div>
  )
}

export default CwRichText
