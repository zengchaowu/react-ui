import { tailwindBorderRadius } from '../vue-ui/tailwind.radius.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
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
