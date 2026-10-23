declare module 'emoji-datasource-emojione/emoji_pretty.json' {
  interface EmojiDatasourceJsonItem {
    name: string | null
    unified: string
    non_qualified: string | null
    short_name: string
    short_names: string[]
    category: string
    sort_order: number
    has_img_emojione: boolean
  }

  const data: EmojiDatasourceJsonItem[]
  export default data
}
