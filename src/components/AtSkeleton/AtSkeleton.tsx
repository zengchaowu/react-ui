import React from 'react'
import { Skeleton } from 'antd'
import type { SkeletonProps } from 'antd'

const AtSkeleton: React.FC<SkeletonProps> = (props) => {
  return <Skeleton {...props} />
}

export default AtSkeleton