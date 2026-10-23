import type { CwSwiperStyles } from './types'

export const swiperBase: CwSwiperStyles = {
  root: 'cw-swiper w-full h-full relative overflow-hidden outline-none focus:outline-none',
  rootNormal: 'cursor-default',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  item: 'absolute inset-0 flex items-center justify-center',
  itemImage: 'w-full h-full object-cover',
  itemContent: 'w-full h-full flex items-center justify-center'
}

