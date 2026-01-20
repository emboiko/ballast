export const toUtcDayStart = (date) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

export const addUtcDays = (date, days) => {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export const toUtcMonthStart = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export const addUtcMonths = (date, months) => {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}
