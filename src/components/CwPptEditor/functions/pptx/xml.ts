import { A, RELS, type ZipRel } from './shared'

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function parseXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('xml')
  return doc
}

export function readPair(xfrm: Element, name: string) {
  const el = [...xfrm.children].find((child) => child.localName === name)
  if (!el) return { x: 0, y: 0 }
  return {
    x: Number(el.getAttribute('x') || el.getAttribute('cx') || 0),
    y: Number(el.getAttribute('y') || el.getAttribute('cy') || 0),
  }
}

export function childEl(el: Element | null | undefined, name: string) {
  if (!el) return null
  return [...el.children].find((child) => child.localName === name || child.localName === `a:${name}`) ?? null
}

export function spPrHasNoFill(spPr: Element) {
  return [...spPr.children].some((child) => child.localName === 'noFill' || child.localName === 'a:noFill')
}

export function readRels(xml: string) {
  const doc = parseXml(xml)
  const map = new Map<string, ZipRel>()
  for (const node of doc.getElementsByTagNameNS(RELS, 'Relationship')) {
    const id = node.getAttribute('Id')
    const target = node.getAttribute('Target')
    if (id && target) map.set(id, { target, type: node.getAttribute('Type') || '' })
  }
  return map
}

export function relByType(rels: Map<string, ZipRel>, kind: string) {
  for (const rel of rels.values()) {
    if (rel.type.split('/').pop() === kind) return rel.target
  }
  return ''
}

export function resolveTarget(basePath: string, target: string) {
  if (target.startsWith('/')) return target.replace(/^\/+/, '')
  const parts = basePath.split('/').slice(0, -1)
  for (const bit of target.split('/')) {
    if (bit === '..') parts.pop()
    else if (bit && bit !== '.') parts.push(bit)
  }
  return parts.join('/')
}

export function shapeXfrm(el: Element) {
  for (const child of [...el.children]) {
    if (child.localName === 'xfrm') return child
    if (child.localName === 'spPr') {
      const nested = [...child.children].find((node) => node.localName === 'xfrm')
      if (nested) return nested
    }
  }
  const byNs = el.getElementsByTagNameNS(A, 'xfrm')[0]
  if (byNs) return byNs
  for (const node of [...el.getElementsByTagName('*')]) {
    if (node.localName === 'xfrm') return node
  }
  return null
}
