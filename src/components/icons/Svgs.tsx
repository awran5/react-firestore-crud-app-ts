import React from 'react'

interface Props {
  fill?: string
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
  className?: string
}

export const EditIcon = ({
  fill = 'currentColor',
  width = 24,
  height = 24,
  style = {},
  className
}: Props) => {
  return (
    <svg
      fill={fill}
      width={width}
      height={height}
      focusable='false'
      viewBox='0 0 24 24'
      aria-hidden='true'
      style={style}
      className={className}
    >
      <path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' />
    </svg>
  )
}
export const RemoveIcon = ({
  fill = 'currentColor',
  width = 24,
  height = 24,
  style = {},
  className
}: Props) => {
  return (
    <svg
      fill={fill}
      width={width}
      height={height}
      focusable='false'
      viewBox='0 0 24 24'
      aria-hidden='true'
      style={style}
      className={className}
    >
      <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
    </svg>
  )
}
export const UserIcon = ({
  fill = 'currentColor',
  width = 24,
  height = 24,
  style = {},
  className
}: Props) => {
  return (
    <svg
      fill={fill}
      width={width}
      height={height}
      focusable='false'
      viewBox='0 0 24 24'
      aria-hidden='true'
      style={style}
      className={className}
    >
      <path d='M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
    </svg>
  )
}
