"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface HolderPieChartProps {
  holders: Array<{
    address: string
    percentage: number
    isWhale?: boolean
  }>
}

export function HolderPieChart({ holders }: HolderPieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || !holders.length) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Process data for chart
    const topHolders = holders.slice(0, 8)
    const othersPercentage = holders.slice(8).reduce((sum, holder) => sum + holder.percentage, 0)

    const chartData = topHolders.map((holder) => holder.percentage)
    const labels = topHolders.map(
      (holder, index) => `#${index + 1} ${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`,
    )

    if (othersPercentage > 0) {
      chartData.push(othersPercentage)
      labels.push("Others")
    }

    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"]

    const config: ChartConfiguration = {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: chartData,
            backgroundColor: colors.slice(0, chartData.length),
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 15,
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, index) => ({
                    text: `${label} (${chartData[index].toFixed(1)}%)`,
                    fillStyle: colors[index],
                    strokeStyle: colors[index],
                    lineWidth: 0,
                    index,
                  }))
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed.toFixed(2)}%`,
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
  }, [holders])

  if (!holders.length) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No holder data available</div>
  }

  return (
    <div className="relative h-64">
      <canvas ref={chartRef} />
    </div>
  )
}
