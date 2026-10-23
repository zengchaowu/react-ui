import CwIcon from '../../CwIcon/CwIcon'

export type TpFabricTransformSectionIconName =
  | 'align-left'
  | 'align-center-h'
  | 'align-right'
  | 'align-top'
  | 'align-center-v'
  | 'align-bottom'
  | 'distribute-h'
  | 'distribute-v'
  | 'rotate'
  | 'flip-h'
  | 'flip-v'
  | 'corner-radius'

export interface TpFabricTransformSectionIconProps {
  name: TpFabricTransformSectionIconName
  className?: string
}

const ICON_BY_NAME: Record<TpFabricTransformSectionIconName, string> = {
  'align-left': 'draw--align--left-line',
  'align-center-h': 'draw--align--center-horizontal-line',
  'align-right': 'draw--align--right-line',
  'align-top': 'draw--align--top-line',
  'align-center-v': 'draw--align--center-vertical-line',
  'align-bottom': 'draw--align--bottom-line',
  'distribute-h': 'draw--align--distribute-horizontal-line',
  'distribute-v': 'draw--align--distribute-vertical-line',
  rotate: 'common--action--refresh-line',
  'flip-h': 'draw--transform--flip-vertical-line',
  'flip-v': 'draw--transform--flip-vertical-line',
  'corner-radius': 'draw--shape--rect-line',
}

export function TpFabricTransformSectionIcon({
  name,
  className,
}: TpFabricTransformSectionIconProps) {
  return (
    <CwIcon
      name={ICON_BY_NAME[name]}
      prefix="icon"
      size={1}
      className={['block', name === 'flip-h' ? 'rotate-90' : '', className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export default TpFabricTransformSectionIcon
