import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import type { CSSProperties, HTMLAttributes, ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Video } from './extensions/Video'
import { CwIcon } from '../CwIcon'
import type {
  TpTipTapEditorProps,
  TpTipTapEditorEmits,
  TpTipTapEditorTexts,
  TpTipTapEditorHandle,
} from './types'
import { tipTapEditorBase } from './styles'
import { defaultTexts } from './texts'
import { defaultToolbarIcons } from './defaultToolbarIcons'
import { resolveDesignCssSize } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

export interface TpTipTapEditorComponentProps
  extends TpTipTapEditorProps,
    TpTipTapEditorEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onFocus' | 'onBlur' | 'className' | 'children'> {
  className?: string
}

interface ToolbarButton {
  name: string
  label: string
  title: string | undefined
  isActive: boolean
  onClick: () => void
}

/** 与 Vue 侧一致：setVideo 走未知链路断言（RawCommands 注册不进 ChainedCommands 类型） */
type VideoChain = { focus: () => { setVideo: (a: { src: string; poster?: string }) => { run: () => boolean } } }

export const TpTipTapEditor = forwardRef<TpTipTapEditorHandle, TpTipTapEditorComponentProps>(
  function TpTipTapEditor(
    {
      value = '',
      placeholder = '',
      disabled = false,
      readonly = false,
      height = '12.5rem',
      toolbar = true,
      autofocus = false,
      imageUpload,
      videoUpload,
      toolbarIcons: toolbarIconsProp,
      extensions,
      texts: textsProp,
      onChange,
      onFocus,
      onBlur,
      onReady,
      onImageUpload,
      onVideoUpload,
      className,
      ...rest
    },
    ref,
  ) {
    const texts = useMemo<TpTipTapEditorTexts>(
      () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
      [textsProp],
    )
    const toolbarIcons = useMemo(
      () => ({ ...defaultToolbarIcons, ...(toolbarIconsProp ?? {}) }),
      [toolbarIconsProp],
    )
    const toolbarIconSize = 1.125

    const computedHeight = resolveDesignCssSize(height)

    const rootStyle = { '--tiptap-min-height': computedHeight } as CSSProperties
    const editorWrapStyle: CSSProperties = { minHeight: computedHeight }

    const placeholderText = placeholder || texts.placeholder || ''

    // 回调经 ref 读取最新 prop，避免 editor 配置闭包过期
    const propsRef = useRef({ imageUpload, videoUpload, onChange, onFocus, onBlur })
    propsRef.current = { imageUpload, videoUpload, onChange, onFocus, onBlur }

    const editor = useEditor({
      content: value || '',
      editable: !disabled && !readonly,
      autofocus: !disabled && !readonly ? autofocus : false,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholderText || undefined,
        }),
        Image.configure({ allowBase64: true }),
        Video,
        ...(extensions || []),
      ],
      editorProps: {
        handlePaste: (_view, event) => {
          const items = event.clipboardData?.items
          const upload = propsRef.current.imageUpload
          if (!items || !upload) return false
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) {
                upload(file)
                  .then((src) => {
                    editorRef.current?.chain().focus().setImage({ src }).run()
                  })
                  .catch(() => {})
                return true
              }
            }
          }
          return false
        },
        handleDrop: (view, event) => {
          const files = event.dataTransfer?.files
          const upload = propsRef.current.imageUpload
          if (!files?.length || !upload) return false
          const file = files[0]
          if (file.type.startsWith('image/')) {
            upload(file)
              .then((src) => {
                const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coords)
                  editorRef.current
                    ?.chain()
                    .focus()
                    .insertContentAt(coords.pos, { type: 'image', attrs: { src } })
                    .run()
              })
              .catch(() => {})
            return true
          }
          return false
        },
      },
      onUpdate: ({ editor: e }) => {
        const html = e.getHTML()
        propsRef.current.onChange?.(html)
      },
      onFocus: ({ event }) => propsRef.current.onFocus?.(event as FocusEvent),
      onBlur: ({ event }) => propsRef.current.onBlur?.(event as FocusEvent),
    })

    const editorRef = useRef<Editor | null>(null)
    editorRef.current = editor

    // watch value（对应 Vue watch modelValue）
    useEffect(() => {
      const e = editorRef.current
      if (!e) return
      const current = e.getHTML()
      const next = value || ''
      if (current !== next) e.commands.setContent(next, false)
    }, [value])

    // watch disabled/readonly（对应 Vue watch）
    useEffect(() => {
      editorRef.current?.setEditable(!disabled && !readonly)
    }, [disabled, readonly])

    // onMounted → ready（对应 Vue onMounted emit ready）
    const readyEmittedRef = useRef(false)
    useEffect(() => {
      if (editor && !readyEmittedRef.current) {
        readyEmittedRef.current = true
        onReady?.(editor)
      }
    }, [editor, onReady])

    // @tiptap/react 的 useEditor 卸载时自动 destroy，无需手动 onBeforeUnmount

    const boldItalicStrikeButtons: ToolbarButton[] = editor
      ? [
          { name: 'bold', label: 'B', title: texts.bold, isActive: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
          { name: 'italic', label: 'I', title: texts.italic, isActive: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
          { name: 'strike', label: 'S', title: texts.strike, isActive: editor.isActive('strike'), onClick: () => editor.chain().focus().toggleStrike().run() },
          { name: 'common--nav--code-line', label: '&lt;/&gt;', title: texts.code, isActive: editor.isActive('code'), onClick: () => editor.chain().focus().toggleCode().run() },
        ]
      : []

    const listBlockButtons: ToolbarButton[] = editor
      ? [
          { name: 'bulletList', label: '•', title: texts.bulletList, isActive: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
          { name: 'orderedList', label: '1.', title: texts.orderedList, isActive: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() },
          { name: 'blockquote', label: '“', title: texts.blockquote, isActive: editor.isActive('blockquote'), onClick: () => editor.chain().focus().toggleBlockquote().run() },
          { name: 'codeBlock', label: '{ }', title: texts.codeBlock, isActive: editor.isActive('codeBlock'), onClick: () => editor.chain().focus().toggleCodeBlock().run() },
        ]
      : []

    const undoActive = editor?.can().undo() ?? false
    const redoActive = editor?.can().redo() ?? false

    function runUndo() {
      editorRef.current?.chain().focus().undo().run()
    }

    function runRedo() {
      editorRef.current?.chain().focus().redo().run()
    }

    const imageInputRef = useRef<HTMLInputElement | null>(null)
    function openImagePicker() {
      if (disabled) return
      imageInputRef.current?.click()
    }
    async function onImageFileChange(ev: ChangeEvent<HTMLInputElement>) {
      const input = ev.target
      const file = input.files?.[0]
      input.value = ''
      if (!file || !file.type.startsWith('image/')) return
      const upload = propsRef.current.imageUpload
      if (upload) {
        try {
          const src = await upload(file)
          editorRef.current?.chain().focus().setImage({ src }).run()
        } catch {
          // 上传失败由调用方处理
        }
      } else {
        onImageUpload?.(file)
      }
    }

    const videoInputRef = useRef<HTMLInputElement | null>(null)
    function openVideoPicker() {
      if (disabled) return
      videoInputRef.current?.click()
    }
    async function onVideoFileChange(ev: ChangeEvent<HTMLInputElement>) {
      const input = ev.target
      const file = input.files?.[0]
      input.value = ''
      if (!file || !file.type.startsWith('video/')) return
      const upload = propsRef.current.videoUpload
      if (upload) {
        try {
          const videoUrl: string = await upload(file)
          const chain = editorRef.current?.chain() as unknown as VideoChain
          chain?.focus().setVideo({ src: videoUrl }).run()
        } catch {
          // 上传失败由调用方处理
        }
      } else {
        onVideoUpload?.(file)
      }
    }

    useImperativeHandle(
      ref,
      (): TpTipTapEditorHandle => ({
        getEditor: () => editorRef.current,
        getHTML: () => editorRef.current?.getHTML() ?? '',
        setContent: (html: string) => {
          editorRef.current?.commands.setContent(html, false)
        },
        focus: () => {
          editorRef.current?.commands.focus()
        },
        setImage: (attrs) => editorRef.current?.chain().focus().setImage(attrs).run(),
        setVideo: (attrs) => {
          const chain = editorRef.current?.chain() as unknown as VideoChain
          return chain?.focus().setVideo(attrs).run()
        },
      }),
      [],
    )

    function renderToolbarButton(btn: ToolbarButton, iconSize: number) {
      return (
        <div
          key={btn.name}
          className={[tipTapEditorBase.toolbarButton, btn.isActive ? tipTapEditorBase.toolbarButtonActive : '']
            .filter(Boolean)
            .join(' ')}
          title={btn.title}
          role="button"
          tabIndex={disabled ? undefined : 0}
          onClick={btn.onClick}
          onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              btn.onClick()
            }
          }}
        >
          {toolbarIcons[btn.name] ? (
            <CwIcon name={toolbarIcons[btn.name] as string} size={iconSize} />
          ) : (
            <span className="text-sm font-semibold" dangerouslySetInnerHTML={{ __html: btn.label }} />
          )}
        </div>
      )
    }

    return (
      <div
        {...rest}
        className={[tipTapEditorBase.root, className].filter(Boolean).join(' ')}
        style={rootStyle}
      >
        {toolbar && editor ? (
          <div
            className={[
              tipTapEditorBase.toolbar,
              disabled || readonly ? tipTapEditorBase.toolbarDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="toolbar"
            aria-disabled={disabled || readonly}
          >
            <div className={tipTapEditorBase.toolbarGroup}>
              {boldItalicStrikeButtons.map((btn) => renderToolbarButton(btn, toolbarIconSize))}
            </div>
            <div className={tipTapEditorBase.toolbarGroup}>
              {listBlockButtons.map((btn) => (
                <div
                  key={btn.name}
                  className={[tipTapEditorBase.toolbarButton, btn.isActive ? tipTapEditorBase.toolbarButtonActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  title={btn.title}
                  role="button"
                  tabIndex={disabled ? undefined : 0}
                  onClick={btn.onClick}
                  onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      btn.onClick()
                    }
                  }}
                >
                  {toolbarIcons[btn.name] ? (
                    <CwIcon name={toolbarIcons[btn.name] as string} size={toolbarIconSize} />
                  ) : (
                    <span className="text-sm" dangerouslySetInnerHTML={{ __html: btn.label }} />
                  )}
                </div>
              ))}
            </div>
            <div className={tipTapEditorBase.toolbarGroup}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={onImageFileChange}
              />
              <div
                className={tipTapEditorBase.toolbarButton}
                title={texts.image}
                role="button"
                tabIndex={disabled ? undefined : 0}
                onClick={openImagePicker}
                onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openImagePicker()
                  }
                }}
              >
                {toolbarIcons.image ? (
                  <CwIcon name={toolbarIcons.image} size={toolbarIconSize} />
                ) : (
                  <span aria-hidden="true">🖼</span>
                )}
              </div>
            </div>
            <div className={tipTapEditorBase.toolbarGroup}>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={onVideoFileChange}
              />
              <div
                className={tipTapEditorBase.toolbarButton}
                title={texts.video}
                role="button"
                tabIndex={disabled ? undefined : 0}
                onClick={openVideoPicker}
                onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openVideoPicker()
                  }
                }}
              >
                {toolbarIcons.video ? (
                  <CwIcon name={toolbarIcons.video} size={toolbarIconSize} />
                ) : (
                  <span aria-hidden="true">🎬</span>
                )}
              </div>
            </div>
            <div className={tipTapEditorBase.toolbarGroup}>
              <div
                className={[tipTapEditorBase.toolbarButton, undoActive ? tipTapEditorBase.toolbarButtonActive : '']
                  .filter(Boolean)
                  .join(' ')}
                title={texts.undo}
                role="button"
                tabIndex={disabled ? undefined : 0}
                onClick={runUndo}
                onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    runUndo()
                  }
                }}
              >
                {toolbarIcons.undo ? (
                  <CwIcon name={toolbarIcons.undo} size={toolbarIconSize} />
                ) : (
                  <span aria-hidden="true">↶</span>
                )}
              </div>
              <div
                className={[tipTapEditorBase.toolbarButton, redoActive ? tipTapEditorBase.toolbarButtonActive : '']
                  .filter(Boolean)
                  .join(' ')}
                title={texts.redo}
                role="button"
                tabIndex={disabled ? undefined : 0}
                onClick={runRedo}
                onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    runRedo()
                  }
                }}
              >
                {toolbarIcons.redo ? (
                  <CwIcon name={toolbarIcons.redo} size={toolbarIconSize} />
                ) : (
                  <span aria-hidden="true">↷</span>
                )}
              </div>
            </div>
          </div>
        ) : null}
        <div className={tipTapEditorBase.editorWrap} style={editorWrapStyle}>
          <EditorContent editor={editor} className={tipTapEditorBase.editorContent} />
        </div>
      </div>
    )
  },
)

export default TpTipTapEditor
