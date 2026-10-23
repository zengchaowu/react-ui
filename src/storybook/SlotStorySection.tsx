import type { ReactNode } from 'react'
import { slotStorySectionLabel, slotStorySectionLabelClass } from './slotStory'

/** Storybook：WithSlots 分块容器（每个插槽单独一个组件实例） */
export function SlotStorySection({ slot, children }: { slot: string; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <p className={slotStorySectionLabelClass}>{slotStorySectionLabel(slot)}</p>
      {children}
    </section>
  )
}
