import type { CwStackStyles } from './types'

export const defaultStyles: CwStackStyles = {
  root: 'cw-stack w-full h-full',
  layerHost: 'relative min-h-0 min-w-0 flex-[1_1_0%] overflow-hidden isolate',
  layer:
    'absolute inset-0 flex h-full w-full min-h-0 min-w-0 flex-col will-change-transform translate-x-0',
  layerIdleUnder: 'pointer-events-none animate-none translate-x-0',
  layerIdleTop: 'pointer-events-auto animate-none translate-x-0',
  layerEnterFwd:
    'animate-[cw-stack-enter-fwd_0.34s_cubic-bezier(0.32,0.72,0,1)_forwards] pointer-events-auto',
  layerEnterFwdRoot: 'pointer-events-auto',
  layerLeaveFwd:
    'animate-[cw-stack-leave-fwd_0.34s_cubic-bezier(0.32,0.72,0,1)_forwards] pointer-events-none',
  layerEnterBack:
    'animate-[cw-stack-enter-back_0.34s_cubic-bezier(0.32,0.72,0,1)_forwards] pointer-events-auto',
  layerLeaveBack:
    'animate-[cw-stack-leave-back_0.34s_cubic-bezier(0.32,0.72,0,1)_forwards] pointer-events-none',
  layerScrim:
    'pointer-events-none absolute inset-0 z-[var(--z-index-above)] bg-[var(--mask-active)]',
  layerScrimIdle: 'opacity-100',
  layerScrimEnter:
    'animate-[cw-stack-scrim-in_0.34s_cubic-bezier(0.32,0.72,0,1)_forwards] opacity-0',
  layerScrimLeave:
    'animate-[cw-stack-scrim-out_0.34s_cubic-bezier(0.32,0.72,0,1)_forwards] opacity-100',
}
