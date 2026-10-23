import type { CwFormStyles } from './types'

/** @internal */
export const formBase: CwFormStyles = {
  root: 'cw-form w-full',
  rootNormal: '',
  rootReadonly: '',
  rootDisabled: 'pointer-events-none',
  nativeSubmitTrigger:
    'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 opacity-0',
}
