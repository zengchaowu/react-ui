# CwPdfEditor 内联编辑 — 待办（暂缓）

> **状态**：编辑能力未达可交付标准，**预览模式可先正常使用**；`mode: 'edit'` / Storybook `PdfEdit` 视为实验性，后续迭代再继续。

## 当前可用

- [x] PDF 多页预览、缩放、虚拟滚动
- [x] 滚动时页码跟随（`pageIndexAtScroll`）
- [x] 预览模式只看已改内容（`run.text !== run.source`）
- [x] 便签 notes 增删拖放（编辑模式）
- [x] 页旋转 / 复制 / 空白页 / 导出管线（`pdfDocumentToArrayBuffer`，需回归）

## 编辑 — 已知问题（未闭环）

- [ ] **坏文本层 PDF**（如华泰保单封面 `4069…SimHei` 子集）：`decodeFailed` 仅提示重输，无「识别此段」
- [ ] **字体**：内嵌 `fontFace` 与系统字混用；部分 PDF 编辑时方框、敲英文错位、与 canvas 字形不一致
- [ ] **Canvas 与叠层**：进入编辑铺白底；**换行编辑**需重绘该页，仍有轻微闪屏
- [ ] **长句越打越宽**：编辑中仅 DOM 扩框，canvas 遮罩不随输入变宽，边缘可能露底字
- [ ] **导出**：改字盖住旧字、体积不膨胀、ToUnicode/子集字体 — 需用真实保单 PDF 全量测
- [ ] **切换 run / blur**：偶发焦点被外层 `tabindex` 抢走（`openingRunId` 缓解，未彻底验证）

## 后续方案（按优先级）

1. **按需 OCR**：仅对 `decodeFailed` 或乱码 run / 单页裁图，填回 `run.text`（不全书 OCR）
2. **编辑态绘制**：独立遮罩层或离屏缓存 PDF 位图，避免每次换行 `pdfPage.render`
3. **`openPdfDocument`**：补 `standardFontDataUrl`，减少 Helvetica/Type1 警告
4. **`pdfDocument.ts` 拆分**：`pdfTextExtract` / `pdfExport` / `pdfRunPaint`，便于单测
5. **交互**：Esc 取消编辑、Tab 在相邻 run 间移动、撤销单段

## 代码入口（改编辑时从这里看）

| 模块 | 路径 |
|------|------|
| 视图 | `CwPdfEditor.vue` |
| 状态与交互 | `composables/useCwPdfEditor.ts` |
| Canvas 绘制 | `composables/usePdfEditorCanvasPaint.ts` |
| 文本 run / 导出 | `functions/pdfDocument.ts` |
| 叠层样式 | `functions/pdfOverlayStyle.ts` |
| 页布局 / 页码 | `functions/pdfPageLayout.ts` |
| contenteditable | `functions/pdfRunEditorDom.ts` |

## 回归用例

- 样本：`packages/vue-ui/src/storybook/assets/cw-pdf-editor/sample.pdf`
- 复杂内嵌字体：`PB017040J12605028870` 类保单（封面乱码 + 第 5 页起正文可抽中文）

---

*最后更新：与「编辑暂缓」决策同步；完成某项后把对应 checkbox 勾掉并删改本节。*
