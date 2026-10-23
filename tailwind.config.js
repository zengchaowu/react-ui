import { tailwindBorderRadius } from '../vue-ui/tailwind.radius.js'
import { uiSharedContent } from '@zengchaowu/ui-shared/tailwind.content.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    ...uiSharedContent,
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      borderRadius: tailwindBorderRadius,
    },
  },
  plugins: [],
}
