import type { CSSProperties, HTMLAttributes } from 'react'
import type {
  CwSingleDivDSL,
  CwSingleDivEmits,
  CwSingleDivProps,
} from './types'
import { singleDivBase } from './styles'

export interface CwSingleDivComponentProps
  extends CwSingleDivProps,
    CwSingleDivEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClick'> {
  className?: string
}

function SingleDivElement({ dsl }: { dsl: CwSingleDivDSL }) {
  return (
    <div style={dsl.main as CSSProperties}>
      {dsl.before ? <div style={dsl.before as CSSProperties} /> : null}
      {dsl.children && dsl.children.length > 0
        ? dsl.children.map((child, index) => (
            <SingleDivElement key={index} dsl={child} />
          ))
        : null}
      {dsl.after ? <div style={dsl.after as CSSProperties} /> : null}
    </div>
  )
}

export function CwSingleDiv({
  dsl,
  texts: _texts,
  onClick,
  className,
  ...rest
}: CwSingleDivComponentProps) {
  return (
    <div
      {...rest}
      className={[singleDivBase.root, className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <SingleDivElement dsl={dsl} />
    </div>
  )
}

export default CwSingleDiv
