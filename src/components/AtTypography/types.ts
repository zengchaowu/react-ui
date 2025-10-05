export type { TitleProps } from 'antd/es/typography/Title'
export type { TextProps } from 'antd/es/typography/Text'
export type { ParagraphProps } from 'antd/es/typography/Paragraph'
export type AtTypographyProps = (TitleProps | TextProps | ParagraphProps) & { variant?: 'title' | 'text' | 'paragraph' }