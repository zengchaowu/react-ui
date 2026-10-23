/** 客户端表情面板用的表情包结构（与 GET /sticker-packs 对齐） */
export interface CwChatStickerPackItem {
  /** CloudBase 等为字符串；Supabase 自增为 number */
  id: string | number
  name: string
  cover_url?: string
  stickers: CwChatStickerItem[]
}

export interface CwChatStickerItem {
  id: string | number
  pack_id: string | number
  name?: string
  url: string
  width?: number
  height?: number
}

export interface CwChatStickerPickPayload {
  packId: string | number
  stickerId: string | number
  url: string
  name?: string
  width?: number
  height?: number
}
