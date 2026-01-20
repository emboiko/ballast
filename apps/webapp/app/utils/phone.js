export const normalizePhoneNumber = (value) => {
  if (typeof value !== "string") {
    return ""
  }

  const digits = value.replace(/\D/g, "")
  if (!digits) {
    return ""
  }

  return digits.slice(0, 10)
}

export const formatPhoneNumber = (value) => {
  if (typeof value !== "string") {
    return ""
  }

  const digits = value.replace(/\D/g, "").slice(0, 10)
  const length = digits.length

  if (length === 0) {
    return ""
  }

  if (length <= 3) {
    return `(${digits}`
  }

  if (length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
