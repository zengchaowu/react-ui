import { useCwMarkdownContext } from '../context'

export function CwMarkdownHr() {
  const ctx = useCwMarkdownContext()

  return <hr className={ctx.styles.hr} />
}

export default CwMarkdownHr
