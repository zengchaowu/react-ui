import CwIcon from '../../CwIcon/CwIcon'

export interface TpFabricAppearanceEyeIconProps {
  visible: boolean
}

export function TpFabricAppearanceEyeIcon({
  visible,
}: TpFabricAppearanceEyeIconProps) {
  return (
    <CwIcon
      name={visible ? 'common--action--eye-line' : 'common--action--eye-off-line'}
      prefix="icon"
      mode="symbol"
      size={1}
      className="block"
    />
  )
}

export default TpFabricAppearanceEyeIcon
