import { createElement } from 'react'
import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/style'
import './preview.css'
import { dispatchAppThemeChanged } from '../src/utils/appThemeDom'

export type StorybookTheme = 'light' | 'dark'

function applyStorybookTheme(theme: StorybookTheme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
    root.style.colorScheme = 'dark'
  } else {
    root.removeAttribute('data-theme')
    root.style.colorScheme = 'light'
  }
  dispatchAppThemeChanged(theme)
}

const withTheme: Decorator = (Story, context) => {
  const theme =
    context.globals.theme === 'dark' ? 'dark' : ('light' satisfies StorybookTheme)
  applyStorybookTheme(theme)

  return createElement('div', { className: 'sb-preview-root' }, createElement(Story))
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: '组件预览主题（切换语义 token / 深色模式）',
      toolbar: {
        title: '主题',
        icon: 'contrast',
        items: [
          { value: 'light', title: '浅色', icon: 'sun' },
          { value: 'dark', title: '深色', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withTheme],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    options: {
      storySort: {
        order: [
          '1. Components',
          [
            'Layout',
            'Navigation',
            'Form',
            'Action',
            'Display',
            'Media',
            'Overlay',
            'Chat',
            'Visualization',
          ],
          '2. Third Party',
          ['3D & Graphics', 'Editor', 'Diagram', 'File', 'Map'],
        ],
        method: 'alphabetical',
      },
    },
  },
}

export default preview
