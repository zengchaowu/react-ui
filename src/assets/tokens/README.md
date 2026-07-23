# 设计令牌

> 自动生成于 2025/11/10 08:59:37

## 概述

本目录包含从设计规范 Excel 文件解析出的 **239 个设计令牌**，已转换为多种格式供不同技术栈使用。

## 生成的文件

- **tokens.css** - CSS 格式 (11.9 KB)
- **tokens.js** - JavaScript 格式 (11.2 KB)
- **tokens.ts** - TypeScript 格式 (17.2 KB)
- **tokens.json** - JSON 格式 (12.8 KB)

## 使用方式

### CSS 变量
```css
/* 引入 CSS 文件 */
@import './tokens.css';

.button {
  background-color: var(--brand-color-6);
  border-radius: var(--radius-small);
}
```

### SCSS 变量
```scss
// 引入 SCSS 文件
@import './tokens.scss';

.button {
  background-color: $brand-color-6;
  border-radius: $radius-small;
}
```

### JavaScript/TypeScript
```javascript
// 引入 JS/TS 文件
import { designTokens } from './tokens';

const buttonStyle = {
  backgroundColor: designTokens.brandColor6,
  borderRadius: designTokens.radiusSmall,
};
```

## 更新流程

1. 设计师更新 Excel 设计规范文件
2. 调用 `buildTokens` 函数重新生成令牌文件
3. 提交更新后的令牌文件到版本控制

---

*此文件由设计令牌构建函数自动生成*
