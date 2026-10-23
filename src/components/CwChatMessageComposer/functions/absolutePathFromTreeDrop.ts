/** 树节点 key 为相对路径（posix）；与本机项目根拼成绝对路径再插入输入框 */
export function absolutePathFromTreeDrop(root: string, relPosix: string): string {
  const r = root.trim()
  const rel = relPosix.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!r) return relPosix.trim()
  if (!rel) return r
  const winDrive = /^[a-zA-Z]:[/\\]/.test(r)
  const useBackslash = winDrive || (r.includes('\\') && !r.includes('/'))
  const sep = useBackslash ? '\\' : '/'
  const base = r.replace(/[/\\]+$/, '')
  const parts = rel.split('/').filter(Boolean)
  return `${base}${sep}${parts.join(sep)}`
}
