import React, { FC, memo } from 'react'

interface LoadingProps {
  width?: string | number
  height?: string | number
  fill?: string
  fullwidth?: boolean
}

const Loading: FC<LoadingProps> = ({ width = 65, height = 65, fill = 'inherit', fullwidth = false }) => {
  const style = {
    width: `${fullwidth ? '100vw' : '100%'}`,
    height: `${fullwidth ? '100vh' : '100%'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  return (
    <span className='loader' style={style}>
      <svg viewBox='0 0 100 100' className='loader-svg' width={width} height={height} fill={fill}>
        <path
          d='M50,87.5c-20.7,0-37.5-16.8-37.5-37.5h-5c0,23.4,19.1,42.5,42.5,42.5S92.5,73.4,92.5,50h-5
          C87.5,70.7,70.7,87.5,50,87.5z'
        ></path>
      </svg>
    </span>
  )
}
export default memo(Loading)
