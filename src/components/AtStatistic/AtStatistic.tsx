import React from 'react'
import { Statistic } from 'antd'
import type { StatisticProps } from 'antd'

const AtStatistic: React.FC<StatisticProps> = (props) => {
  return <Statistic {...props} />
}

export default AtStatistic