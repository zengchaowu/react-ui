import type { CwGridStyles } from './types'

export const gridBase: CwGridStyles = {
  root: 'cw-grid w-full',
}

/** CwRow 基础 class（与 vue-ui `CwRow/styles.ts` 保持逐字一致） */
export const rowBase = {
  root: 'cw-row flex min-w-0 w-full flex-wrap',
  nowrap: 'flex-nowrap',
  alignTop: 'items-start',
  alignMiddle: 'items-center',
  alignBottom: 'items-end',
  alignStretch: 'items-stretch',
  justifyStart: 'justify-start',
  justifyCenter: 'justify-center',
  justifyEnd: 'justify-end',
  justifyBetween: 'justify-between',
  justifyAround: 'justify-around',
  justifyEvenly: 'justify-evenly',
} as const

/** CwCol 基础 class（与 vue-ui `CwCol.vue` 保持逐字一致） */
export const colBase = 'box-border flex h-full min-h-0 min-w-0 flex-col cw-col'
