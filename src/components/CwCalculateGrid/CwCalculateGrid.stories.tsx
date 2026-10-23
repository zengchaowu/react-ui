import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import CwCalculateGrid from './CwCalculateGrid'
import type { CwCalculateGridColumn } from './types'
import type {
  DisplayRow,
  FormulaField,
  GlobalScope,
  KeyPathDepsMap,
  KeyPathFuncStrMap,
  NumberField,
  ScopeDisplayRowMap,
  SourceRow,
  TextField,
} from './types'
import { defaultTexts } from './texts'
import type { CalculateEditTiming, CalculateLoadTiming } from './functions/editTiming'
import type { CalculateIdleTiming } from './functions/formulaScheduler'

function text(value: string): TextField {
  return { type: 'text', value }
}

function num(value: string | number): NumberField {
  return { type: 'number', value: String(value) }
}

function formula(value: string): FormulaField {
  return { type: 'formula', value, display: 'result' }
}

function createEngine() {
  const globalScope = {
    __CHAIN_CALL__: undefined,
    __PATCH__: undefined,
    __DRY_RUN__: undefined,
    __DRY_RUN_SCOPE__: undefined,
  } as unknown as GlobalScope
  const keyPathDepsMap: KeyPathDepsMap = new Map()
  const keyPathFuncStrMap: KeyPathFuncStrMap = new Map()
  const scopeDisplayRowMap: ScopeDisplayRowMap = new Map<string, DisplayRow>()
  return {
    texts: defaultTexts,
    keyPathDepsMap,
    keyPathFuncStrMap,
    scopeDisplayRowMap,
    globalScope,
  }
}

const locked = { editable: false }
const input = { editable: true }

const lineCols: CwCalculateGridColumn[] = [
  { headerName: '引用名', field: 'id', width: 110, pinned: 'left', ...locked },
  { headerName: '商品', field: 'name', width: 120, ...locked },
  { headerName: '数量', field: 'quantity', width: 100, ...input },
  { headerName: '单价', field: 'price', width: 110, ...input },
  { headerName: '折扣', field: 'discount', width: 100, ...input },
  { headerName: '公式', field: 'expr', flex: 1, minWidth: 220, ...locked },
  { headerName: '小计', field: 'amount', width: 120, pinned: 'right', ...locked },
]

function lineFormulaSourceRows(): SourceRow[] {
  const expr = 'quantity*price*discount'
  return [
    {
      id: text('sofa'),
      name: text('沙发'),
      quantity: num(2),
      price: num(4000),
      discount: num(0.9),
      expr: text(expr),
      amount: formula(expr),
    },
    {
      id: text('desk'),
      name: text('书桌'),
      quantity: num(1),
      price: num(1200),
      discount: num(1),
      expr: text(expr),
      amount: formula(expr),
    },
    {
      id: text('lamp'),
      name: text('台灯'),
      quantity: num(4),
      price: num(200),
      discount: num(0.8),
      expr: text(expr),
      amount: formula(expr),
    },
  ]
}

const meta: Meta<typeof CwCalculateGrid> = {
  title: '1. Components/Display/CwCalculateGrid',
  component: CwCalculateGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    sourceRows: { control: false },
    colDefs: { control: false },
    keyPathDepsMap: { control: false },
    keyPathFuncStrMap: { control: false },
    scopeDisplayRowMap: { control: false },
    globalScope: { control: false },
    texts: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof meta>

function LineFormulaStory() {
  const [engine] = useState(createEngine)
  const [sourceRows] = useState(lineFormulaSourceRows)
  return (
    <div className="flex h-screen flex-col gap-3 p-4">
      <p className="m-0 shrink-0 text-sm leading-6 text-[var(--text-color-secondary)]">
        改数量、单价或折扣。小计按本行公式重算：沙发 2×4000×0.9 = 7200，书桌 1200，台灯 4×200×0.8 = 640。
      </p>
      <CwCalculateGrid
        {...engine}
        sourceRows={sourceRows}
        colDefs={lineCols}
        className="min-h-0 flex-1"
      />
    </div>
  )
}

export const Default: Story = {
  name: '行内公式',
  render: () => <LineFormulaStory />,
}

function AttachStory() {
  const [engine] = useState(createEngine)
  const [sourceRows] = useState<SourceRow[]>(() => [
    {
      id: text('sofa'),
      name: text('沙发'),
      quantity: num(2),
      price: num(4000),
      expr: text('quantity*price'),
      amount: formula('quantity*price'),
    },
    {
      id: text('desk'),
      name: text('书桌'),
      quantity: num(1),
      price: num(1200),
      expr: text('sofa.amount+quantity*price'),
      amount: formula('sofa.amount+quantity*price'),
    },
    {
      id: text('lamp'),
      name: text('台灯'),
      quantity: num(4),
      price: num(200),
      expr: text('desk.amount+quantity*price'),
      amount: formula('desk.amount+quantity*price'),
    },
  ])
  const [colDefs] = useState<CwCalculateGridColumn[]>(() => [
    { headerName: '引用名', field: 'id', width: 110, pinned: 'left', ...locked },
    { headerName: '商品', field: 'name', width: 120, ...locked },
    { headerName: '数量', field: 'quantity', width: 100, ...input },
    { headerName: '单价', field: 'price', width: 110, ...input },
    { headerName: '公式', field: 'expr', flex: 1, minWidth: 240, ...locked },
    { headerName: '累计', field: 'amount', width: 120, pinned: 'right', ...locked },
  ])
  return (
    <div className="flex h-screen flex-col gap-3 p-4">
      <p className="m-0 shrink-0 text-sm leading-6 text-[var(--text-color-secondary)]">
        累计会接着上一行。初始为 8000、9200、10000。改沙发数量，书桌和台灯的累计都会变。
      </p>
      <CwCalculateGrid
        {...engine}
        sourceRows={sourceRows}
        colDefs={colDefs}
        className="min-h-0 flex-1"
      />
    </div>
  )
}

export const Attach: Story = {
  name: '行间引用',
  render: () => <AttachStory />,
}

function LinkedTablesStory() {
  const [engine] = useState(createEngine)
  const [lines] = useState<SourceRow[]>(() => {
    const lineExpr = 'quantity*price'
    return [
      {
        id: text('sofa'),
        name: text('沙发'),
        quantity: num(2),
        price: num(4000),
        expr: text(lineExpr),
        amount: formula(lineExpr),
      },
      {
        id: text('desk'),
        name: text('书桌'),
        quantity: num(1),
        price: num(1200),
        expr: text(lineExpr),
        amount: formula(lineExpr),
      },
      {
        id: text('lamp'),
        name: text('台灯'),
        quantity: num(4),
        price: num(200),
        expr: text(lineExpr),
        amount: formula(lineExpr),
      },
    ]
  })
  const [rates] = useState<SourceRow[]>(() => [
    {
      id: text('tax'),
      name: text('增值税'),
      rate: num(0.13),
    },
  ])
  const [summary] = useState<SourceRow[]>(() => [
    {
      id: text('subtotal'),
      name: text('金额合计'),
      expr: text('sofa.amount+desk.amount+lamp.amount'),
      amount: formula('sofa.amount+desk.amount+lamp.amount'),
    },
    {
      id: text('taxAmount'),
      name: text('税额'),
      expr: text('subtotal.amount*tax.rate'),
      amount: formula('subtotal.amount*tax.rate'),
    },
    {
      id: text('payable'),
      name: text('应付'),
      expr: text('subtotal.amount+taxAmount.amount'),
      amount: formula('subtotal.amount+taxAmount.amount'),
    },
  ])
  const [lineColDefs] = useState<CwCalculateGridColumn[]>(() => [
    { headerName: '引用名', field: 'id', width: 110, ...locked },
    { headerName: '商品', field: 'name', width: 120, ...locked },
    { headerName: '数量', field: 'quantity', width: 100, ...input },
    { headerName: '单价', field: 'price', width: 110, ...input },
    { headerName: '公式', field: 'expr', flex: 1, minWidth: 160, ...locked },
    { headerName: '金额', field: 'amount', width: 120, pinned: 'right', ...locked },
  ])
  const [rateColDefs] = useState<CwCalculateGridColumn[]>(() => [
    { headerName: '引用名', field: 'id', width: 110, ...locked },
    { headerName: '项目', field: 'name', flex: 1, minWidth: 120, ...locked },
    { headerName: '税率', field: 'rate', width: 120, ...input },
  ])
  const [summaryColDefs] = useState<CwCalculateGridColumn[]>(() => [
    { headerName: '项目', field: 'name', width: 110, ...locked },
    { headerName: '公式', field: 'expr', flex: 1, minWidth: 180, ...locked },
    { headerName: '金额', field: 'amount', width: 110, pinned: 'right', ...locked },
  ])
  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      <p className="m-0 text-sm leading-6 text-[var(--text-color-secondary)]">
        三张表共用同一份依赖图。改明细的数量或单价，汇总的合计、税额、应付一起变。改税率，只重算税额和应付。初始合计 10000，税额 1300，应付 11300。
      </p>
      <section className="flex h-72 flex-col gap-1">
        <h2 className="m-0 text-sm font-medium text-[var(--text-color-primary)]">明细</h2>
        <CwCalculateGrid {...engine} sourceRows={lines} colDefs={lineColDefs} className="min-h-0 flex-1" />
      </section>
      <section className="flex h-64 gap-4">
        <div className="flex w-[17.5rem] shrink-0 min-h-0 flex-col gap-1">
          <h2 className="m-0 text-sm font-medium text-[var(--text-color-primary)]">税率</h2>
          <CwCalculateGrid {...engine} sourceRows={rates} colDefs={rateColDefs} className="min-h-0 flex-1" />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
          <h2 className="m-0 text-sm font-medium text-[var(--text-color-primary)]">汇总</h2>
          <CwCalculateGrid {...engine} sourceRows={summary} colDefs={summaryColDefs} className="min-h-0 flex-1" />
        </div>
      </section>
    </div>
  )
}

export const LinkedTables: Story = {
  name: '多表联动',
  render: () => <LinkedTablesStory />,
}

const CHAIN_ROW_COUNT = 1_000_000

function buildChainRows(): SourceRow[] {
  const sourceRows: SourceRow[] = []
  for (let i = 0; i < CHAIN_ROW_COUNT; i++) {
    const expr =
      i === 0 ? 'quantity*price' : `r${i - 1}.amount+quantity*price`
    sourceRows.push({
      id: text(`r${i}`),
      name: text(String(i + 1)),
      quantity: num(1),
      price: num(10),
      expr: text(i === 0 ? 'quantity*price' : '上一行.amount+quantity*price'),
      amount: formula(expr),
    })
  }
  return sourceRows
}

const chainCols: CwCalculateGridColumn[] = [
  { headerName: '行', field: 'name', width: 72, pinned: 'left', ...locked },
  { headerName: '数量', field: 'quantity', width: 100, ...input },
  { headerName: '单价', field: 'price', width: 90, ...locked },
  { headerName: '公式', field: 'expr', flex: 1, minWidth: 220, ...locked },
  { headerName: '累计', field: 'amount', width: 120, pinned: 'right', ...locked },
]

function ChainLoadStory() {
  const [engine] = useState(createEngine)
  const [sourceRows] = useState(buildChainRows)
  const [loadTiming, setLoadTiming] = useState<CalculateLoadTiming | null>(null)
  const [idleTiming, setIdleTiming] = useState<CalculateIdleTiming | null>(null)
  const [timing, setTiming] = useState<CalculateEditTiming | null>(null)
  return (
    <div className="flex h-screen flex-col gap-3 p-4">
      <p className="m-0 shrink-0 text-sm leading-6 text-[var(--text-color-secondary)]">
        {CHAIN_ROW_COUNT} 行串在一条依赖链上，末行累计初始为 {CHAIN_ROW_COUNT * 10}。
        首屏只算视口里的行，其余在空闲时补上。改第 1 行后视口立刻重算，后面的行滚到或等补齐后再是新结果。
      </p>
      {idleTiming ? (
        <p className="m-0 shrink-0 text-sm leading-6 text-[var(--text-color-primary)]">
          后台补齐 {idleTiming.totalMs} ms，公式 {idleTiming.formulaCount} 条。
        </p>
      ) : null}
      {loadTiming ? (
        <p className="m-0 shrink-0 text-sm leading-6 text-[var(--text-color-primary)]">
          加载合计 {loadTiming.totalMs} ms ·
          生成行 {loadTiming.buildRowsMs} ·
          依赖排序 {loadTiming.sortMs} ·
          编译公式 {loadTiming.formulaCompileMs}（{loadTiming.formulaCount} 次）·
          执行公式 {loadTiming.formulaRunMs} ·
          标记刷新 {loadTiming.refreshMs} ·
          虚拟切片 {loadTiming.virtualMs} ·
          表格重绘 {loadTiming.renderMs} ·
          浏览器绘制 {loadTiming.paintMs}
        </p>
      ) : null}
      {timing ? (
        <p className="m-0 shrink-0 text-sm leading-6 text-[var(--text-color-primary)]">
          编辑合计 {timing.totalMs} ms ·
          依赖排序 {timing.topoMs} ·
          编译公式 {timing.formulaCompileMs}（{timing.formulaCount} 次）·
          执行公式 {timing.formulaRunMs} ·
          标记刷新 {timing.refreshMs} ·
          虚拟切片 {timing.virtualMs} ·
          表格重绘 {timing.renderMs} ·
          格子闪动 {timing.flashMs}（{timing.flashCount} 格）·
          浏览器绘制 {timing.paintMs} ·
          调试日志 {timing.logMs}
        </p>
      ) : null}
      <CwCalculateGrid
        {...engine}
        sourceRows={sourceRows}
        colDefs={chainCols}
        className="min-h-0 flex-1"
        onLoadTiming={setLoadTiming}
        onIdleTiming={setIdleTiming}
        onEditTiming={setTiming}
      />
    </div>
  )
}

export const ChainLoad: Story = {
  name: '性能瓶颈',
  render: () => <ChainLoadStory />,
}
