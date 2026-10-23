import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { designInspectorBase } from './styles'
import { defaultCwDesignInspectorTexts } from './texts'
import type {
  CwDesignInspectorProps,
  CwDesignInspectorSectionConfig,
} from './types'

function renderSectionSlot(
  slot:
    | ReactNode
    | ((section: CwDesignInspectorSectionConfig) => ReactNode)
    | undefined,
  section: CwDesignInspectorSectionConfig,
): ReactNode {
  if (typeof slot === 'function') {
    return (slot as (s: CwDesignInspectorSectionConfig) => ReactNode)(section)
  }
  return slot ?? null
}

export function CwDesignInspector({
  sections = [],
  texts,
  headerActions,
  sectionSlots,
  onSectionToggle,
  className,
}: CwDesignInspectorProps) {
  const mergedTexts = useMemo(
    () => ({
      ...defaultCwDesignInspectorTexts,
      ...(texts ?? {}),
    }),
    [texts],
  )

  const visibleSections = useMemo(
    () => sections.filter((s) => s.visible !== false),
    [sections],
  )

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  // 等价 Vue immediate + deep watch：只为尚未登记的 section 写入默认展开态
  useEffect(() => {
    setExpandedMap((prev) => {
      let changed = false
      const next = { ...prev }
      for (const section of sections) {
        if (!(section.id in next)) {
          next[section.id] = section.defaultExpanded !== false
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [sections])

  function isExpanded(id: string): boolean {
    return expandedMap[id] !== false
  }

  function toggleSection(id: string) {
    const next = !isExpanded(id)
    setExpandedMap((prev) => ({ ...prev, [id]: next }))
    onSectionToggle?.({ id, expanded: next })
  }

  return (
    <aside
      className={[designInspectorBase.root, className].filter(Boolean).join(' ')}
      aria-label="检查器"
    >
      <header className={designInspectorBase.header}>
        <span className={designInspectorBase.headerTitle}>{mergedTexts.title}</span>
        {headerActions}
      </header>

      <div className={designInspectorBase.body}>
        {visibleSections.length ? (
          visibleSections.map((section) => {
            const expanded = isExpanded(section.id)
            return (
              <section key={section.id} className={designInspectorBase.section}>
                <button
                  type="button"
                  className={[
                    designInspectorBase.sectionHeader,
                    expanded ? designInspectorBase.sectionHeaderActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-expanded={expanded}
                  onClick={() => toggleSection(section.id)}
                >
                  <span className={designInspectorBase.sectionLabel}>
                    {section.label}
                  </span>
                  <span
                    className={[
                      designInspectorBase.sectionChevron,
                      expanded ? 'rotate-180' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>
                <div
                  style={{ display: expanded ? undefined : 'none' }}
                  className={designInspectorBase.sectionBody}
                >
                  {renderSectionSlot(
                    sectionSlots?.[section.id] ??
                      sectionSlots?.[`section-${section.id}`],
                    section,
                  )}
                </div>
              </section>
            )
          })
        ) : (
          <div className={designInspectorBase.empty}>{mergedTexts.empty}</div>
        )}
      </div>
    </aside>
  )
}

export default CwDesignInspector
