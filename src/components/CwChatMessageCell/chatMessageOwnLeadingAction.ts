/** 自己消息气泡左侧的悬停操作（如「从这里继续」），相对气泡垂直居中。 */
export const chatMessageOwnLeadingActionClass = [
  'pointer-events-none absolute top-1/2 right-full z-[var(--z-index-above)] flex -translate-y-1/2 items-center pr-1',
  'opacity-0 transition-opacity duration-150',
  'group-hover/own-bubble:pointer-events-auto group-hover/own-bubble:opacity-100',
  '[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100',
].join(' ')
