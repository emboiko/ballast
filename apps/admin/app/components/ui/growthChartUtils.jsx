"use client"

export const formatNumber = (value) => {
  if (typeof value !== "number") {
    return ""
  }
  return new Intl.NumberFormat("en-US").format(value)
}

export const createGrowthTooltip = ({
  TooltipCard,
  TooltipTitle,
  TooltipRow,
  TooltipValue,
  newLabel,
  totalLabel,
  newKey,
  totalKey,
}) => {
  return ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }

    let newValue = null
    let totalValue = null

    for (const entry of payload) {
      if (entry.dataKey === newKey) {
        newValue = entry.value
      }
      if (entry.dataKey === totalKey) {
        totalValue = entry.value
      }
    }

    return (
      <TooltipCard>
        <TooltipTitle>{label}</TooltipTitle>
        <TooltipRow>
          <span>{newLabel}</span>
          <TooltipValue>{formatNumber(newValue)}</TooltipValue>
        </TooltipRow>
        <TooltipRow>
          <span>{totalLabel}</span>
          <TooltipValue>{formatNumber(totalValue)}</TooltipValue>
        </TooltipRow>
      </TooltipCard>
    )
  }
}
