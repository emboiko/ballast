/**
 * Money utilities for safe arithmetic operations.
 * All money values are stored and computed as integers (cents) to avoid floating-point errors.
 * Display formatting converts cents to dollars only at render time.
 */

/**
 * Convert a dollar amount to cents (integer).
 * @param {number} dollars - Dollar amount (e.g., 93.29)
 * @returns {number} Integer cents (e.g., 9329)
 */
// TODO: Currently unused - will be used for user input conversion (e.g., admin forms)
export const toCents = (dollars) => Math.round(dollars * 100)

/**
 * Convert cents to dollars for display purposes only.
 * @param {number} cents - Integer cents
 * @returns {number} Dollar amount (use formatMoney for display)
 */
// TODO: Currently unused - will be used when raw numeric value needed (e.g., charts, calculations)
export const toDollars = (cents) => cents / 100

/**
 * Format cents as a dollar string for display.
 * @param {number} cents - Integer cents
 * @returns {string} Formatted string (e.g., "$93.29")
 */
export const formatMoney = (cents) => {
  const dollars = cents / 100
  return `$${dollars.toFixed(2)}`
}

/**
 * Format cents as a dollar amount without the $ symbol.
 * @param {number} cents - Integer cents
 * @returns {string} Formatted number string (e.g., "93.29")
 */
// TODO: Currently unused - will be used for input fields, exports, etc.
export const formatMoneyValue = (cents) => {
  return (cents / 100).toFixed(2)
}

/**
 * Parse a formatted money value into integer cents.
 * Accepts strings like "93.29", "$93.29", "1,234.00", "0.5".
 * Returns null for invalid input.
 * @param {string} input
 * @returns {number|null}
 */
export const parseMoneyValueToCents = (input) => {
  if (typeof input !== "string") {
    return null
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  const normalized = trimmed.replaceAll("$", "").replaceAll(",", "")
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null
  }

  const [dollarsPart, centsPartRaw] = normalized.split(".")
  const dollars = Number.parseInt(dollarsPart, 10)
  if (!Number.isFinite(dollars)) {
    return null
  }

  let centsPart = 0
  if (typeof centsPartRaw === "string") {
    const padded = centsPartRaw.padEnd(2, "0").slice(0, 2)
    const parsed = Number.parseInt(padded, 10)
    if (!Number.isFinite(parsed)) {
      return null
    }
    centsPart = parsed
  }

  return dollars * 100 + centsPart
}

/**
 * Add two cent values.
 * @param {number} a - Cents
 * @param {number} b - Cents
 * @returns {number} Sum in cents
 */
// TODO: Currently unused - will be used for subtotals, fees, etc.
export const addMoney = (a, b) => a + b

/**
 * Subtract two cent values.
 * @param {number} a - Cents
 * @param {number} b - Cents
 * @returns {number} Difference in cents
 */
export const subtractMoney = (a, b) => a - b

/**
 * Multiply cents by a quantity (e.g., for cart item totals).
 * @param {number} cents - Base amount in cents
 * @param {number} quantity - Integer multiplier
 * @returns {number} Product in cents
 */
// TODO: Currently unused - will be used for line item totals
export const multiplyMoney = (cents, quantity) => cents * quantity

/**
 * Calculate percentage of a cent amount.
 * Use for discounts, taxes, etc.
 * @param {number} cents - Base amount in cents
 * @param {number} percent - Percentage as a number (e.g., 10 for 10%)
 * @returns {number} Result in cents (rounded)
 */
// TODO: Currently unused - will be used for discounts, taxes, interest
export const percentOfMoney = (cents, percent) =>
  Math.round((cents * percent) / 100)

/**
 * Basis point utilities for percentage storage.
 * 1% = 100 basis points, so 56.67% = 5667 basis points.
 * This avoids floating-point issues with percentages.
 */
// TODO: Currently unused - will be used for percentPaid, interest rates on financing plans
export const BasisPoints = {
  /**
   * Convert a percentage to basis points.
   * @param {number} percent - Percentage (e.g., 56.67)
   * @returns {number} Basis points (e.g., 5667)
   */
  fromPercent: (percent) => Math.round(percent * 100),

  /**
   * Convert basis points to a percentage for display.
   * @param {number} basisPoints - Basis points (e.g., 5667)
   * @returns {number} Percentage (e.g., 56.67)
   */
  toPercent: (basisPoints) => basisPoints / 100,

  /**
   * Format basis points as a percentage string.
   * @param {number} basisPoints - Basis points
   * @param {number} [decimals=2] - Decimal places
   * @returns {string} Formatted string (e.g., "56.67%")
   */
  format: (basisPoints, decimals = 2) => {
    return `${(basisPoints / 100).toFixed(decimals)}%`
  },

  /**
   * Apply basis points to a cent amount.
   * @param {number} cents - Amount in cents
   * @param {number} basisPoints - Basis points to apply
   * @returns {number} Result in cents (rounded)
   */
  apply: (cents, basisPoints) => Math.round((cents * basisPoints) / 10000),
}
