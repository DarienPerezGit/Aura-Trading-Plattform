import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SparklineChartProps {
  data: number[]
  width?: number
  height?: number
  className?: string
  positive?: boolean
}

export function SparklineChart({
  data,
  width = 80,
  height = 28,
  className,
  positive,
}: SparklineChartProps) {
  const path = useMemo(() => {
    if (data.length < 2) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const step = width / (data.length - 1)

    return data
      .map((val, i) => {
        const x = i * step
        const y = height - ((val - min) / range) * (height - 4) - 2
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [data, width, height])

  const isUp = positive ?? (data.length >= 2 && data[data.length - 1] >= data[0])
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', className)}
    >
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
