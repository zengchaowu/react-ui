/** React 侧无 Tiptap：以最小节点描述对象承载 Vue `Node.create` 的配置语义。 */
export interface CwMessageInputInlineNodeDefinition<Options extends object> {
  name: string
  group: 'inline'
  inline: true
  atom: true
  options: Options
  configure: (options: Partial<Options>) => CwMessageInputInlineNodeDefinition<Options>
}

export function defineCwMessageInputInlineNode<Options extends object>(
  name: string,
  defaults: Options,
): CwMessageInputInlineNodeDefinition<Options> {
  function build(options: Options): CwMessageInputInlineNodeDefinition<Options> {
    return {
      name,
      group: 'inline',
      inline: true,
      atom: true,
      options,
      configure: (next) => build({ ...options, ...next }),
    }
  }
  return build(defaults)
}
