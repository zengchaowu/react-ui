import React from 'react'
import { Typography } from 'antd'
import type { TitleProps } from 'antd/es/typography/Title'
import type { TextProps } from 'antd/es/typography/Text'
import type { ParagraphProps } from 'antd/es/typography/Paragraph'

export type AtTypographyProps = (TitleProps | TextProps | ParagraphProps) & {
  variant?: 'title' | 'text' | 'paragraph'
}

const AtTypography: React.FC<AtTypographyProps> = (props) => {
  const { variant = 'text', ...rest } = props
  if (variant === 'title') return <Typography.Title {...(rest as TitleProps)} />
  if (variant === 'paragraph') return <Typography.Paragraph {...(rest as ParagraphProps)} />
  return <Typography.Text {...(rest as TextProps)} />
}

export default AtTypography