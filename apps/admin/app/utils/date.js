/**
 * Format an ISO date string or Date-like value for display.
 * @param {string|number|Date|null|undefined} dateValue
 * @returns {string}
 */
export const formatDate = (dateValue) => {
  if (!dateValue) {
    return "N/A"
  }

  try {
    return new Date(dateValue).toLocaleString()
  } catch {
    return "N/A"
  }
}
