"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface ValueTrendChartProps {
  data: any[]
}

export function ValueTrendChart({ data }: ValueTrendChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Process data for chart
    const chartData = data
      .map((item) => ({
        x: new Date(item.timestamp),
        y: Number.parseFloat(item.value_usd || item.balance || 0),
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime())

    const config: ChartConfiguration = {
      type: "line",
      data: {
        datasets: [
          {
            label: "Portfolio Value (USD)",
            data: chartData,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
            },
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Value (USD)",
            },
            ticks: {
              callback: (value) => "$" + Number(value).toLocaleString(),
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) => `Value: $${Number(context.parsed.y).toLocaleString()}`,
            },
          },
        },
      },
    }

    chartInstance.current = new Chart(ctx, config)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  if (!data.length) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No trend data available</div>
  }

  return (
    <div className="relative h-64">
      <canvas ref={chartRef} />
    </div>
  )
}
