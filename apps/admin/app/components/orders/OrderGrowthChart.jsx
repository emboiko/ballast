"use client"

import { useMemo } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import {
  GrowthEmptyState,
  GrowthTooltipCard,
  GrowthTooltipRow,
  GrowthTooltipTitle,
  GrowthTooltipValue,
} from "@/components/orders/ordersStyles"
import { createGrowthTooltip } from "@/components/ui/growthChartUtils"

const CustomTooltip = createGrowthTooltip({
  TooltipCard: GrowthTooltipCard,
  TooltipTitle: GrowthTooltipTitle,
  TooltipRow: GrowthTooltipRow,
  TooltipValue: GrowthTooltipValue,
  newLabel: "New orders",
  totalLabel: "Total orders",
  newKey: "newOrders",
  totalKey: "totalOrdersToDate",
})

export default function OrderGrowthChart({ buckets }) {
  const data = useMemo(() => {
    if (!Array.isArray(buckets)) {
      return []
    }
    return buckets.map((bucket) => ({
      label: bucket.label,
      newOrders: bucket.newOrders,
      totalOrdersToDate: bucket.totalOrdersToDate,
    }))
  }, [buckets])

  if (data.length === 0) {
    return <GrowthEmptyState>No growth data yet</GrowthEmptyState>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border-color)" }}
          tickLine={{ stroke: "var(--border-color)" }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border-color)" }}
          tickLine={{ stroke: "var(--border-color)" }}
          width={40}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border-color)" }}
          tickLine={{ stroke: "var(--border-color)" }}
          width={52}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--overlay-hover-light)" }}
        />
        <Bar
          yAxisId="left"
          dataKey="newOrders"
          fill="var(--status-info-border)"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalOrdersToDate"
          stroke="var(--button-primary-bg)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
