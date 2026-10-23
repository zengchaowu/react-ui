import type { CwMessageInputMentionItem } from '../../CwMessageInput/types'
import { basenameFromFilePath } from '../../CwChatMessageCell/chatInlineContentClip'
import { absolutePathFromTreeDrop } from './absolutePathFromTreeDrop'

export type WorkspacePathMentionMember = {
  id: string
  name?: string | null
  avatar?: string | null
}

/** 从文件相对路径推导可 @ 的目录前缀 */
export function collectWorkspaceFolderPrefixes(
  filePaths: readonly string[],
): string[] {
  const set = new Set<string>()
  for (const raw of filePaths) {
    const parts = String(raw ?? '')
      .replace(/\\/g, '/')
      .split('/')
      .filter(Boolean)
    let acc = ''
    for (let i = 0; i < parts.length - 1; i += 1) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i]!
      set.add(acc)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function toAbsPath(root: string | null | undefined, relPosix: string): string {
  const r = String(root ?? '').trim()
  if (!r) return relPosix
  return absolutePathFromTreeDrop(r, relPosix)
}

function fallbackMemberLabel(id: string): string {
  const s = id.trim()
  if (s.length <= 8) return s
  return s.slice(0, 8)
}

/**
 * 工作区 @ 候选：成员 + 目录 + 文件。
 * 文件 / 目录使用 `kind` + `path`，勿把路径写进 `id` 当作用户 uid。
 */
export function buildWorkspacePathMentionItems(options: {
  members: readonly WorkspacePathMentionMember[]
  selfUserId?: string | null
  filePaths: readonly string[]
  /** 本地项目根；有则 chip 用绝对路径（与树拖放一致） */
  localRootPath?: string | null
  /** 打开中的相对路径优先排在文件区前面 */
  openRelPaths?: readonly string[]
}): CwMessageInputMentionItem[] {
  const uid = String(options.selfUserId ?? '').trim()
  const root = options.localRootPath
  const items: CwMessageInputMentionItem[] = []

  for (const p of options.members) {
    const sid = String(p.id ?? '').trim()
    if (!sid) continue
    if (uid && sid === uid) continue
    const labelRaw = String(p.name ?? '').trim()
    const label = labelRaw || fallbackMemberLabel(sid)
    const avatarRaw = String(p.avatar ?? '').trim()
    items.push({
      id: sid,
      label,
      kind: 'user',
      ...(avatarRaw ? { avatar: avatarRaw } : {}),
    })
  }
  items.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))

  const folders = collectWorkspaceFolderPrefixes(options.filePaths)
  for (const rel of folders) {
    items.push({
      id: `folder:${rel}`,
      label: `${rel}/`,
      kind: 'folder',
      path: toAbsPath(root, rel),
    })
  }

  const openSet = new Set(
    (options.openRelPaths ?? []).map((p) => String(p).replace(/\\/g, '/')),
  )
  const files = [...options.filePaths]
    .map((p) => String(p).replace(/\\/g, '/'))
    .filter(Boolean)
    .sort((a, b) => {
      const ao = openSet.has(a) ? 0 : 1
      const bo = openSet.has(b) ? 0 : 1
      if (ao !== bo) return ao - bo
      return a.localeCompare(b, 'zh-CN')
    })

  for (const rel of files) {
    items.push({
      id: `file:${rel}`,
      label: basenameFromFilePath(rel, rel),
      kind: 'file',
      path: toAbsPath(root, rel),
    })
  }

  return items
}
