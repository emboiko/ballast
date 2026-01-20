import { z } from "zod"

const buildOptionalTrimmedString = (maxLength) => {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value
    }
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }
    return trimmed
  }, z.string().max(maxLength).nullable().optional())
}

const buildLowercaseTrimmedString = (maxLength) => {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value
    }
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }
    return trimmed.toLowerCase()
  }, z.string().max(maxLength).nullable().optional())
}

const isValidFullName = (value) => {
  if (typeof value !== "string") {
    return false
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < 2) {
    return false
  }
  if (words.length > 2) {
    return false
  }

  const wordRegex = /^[A-Za-z][A-Za-z'.-]*$/
  for (const word of words) {
    if (word.length < 2) {
      return false
    }
    if (!wordRegex.test(word)) {
      return false
    }
  }

  return true
}

const isValidPostalCode = (value) => {
  if (typeof value !== "string") {
    return false
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  if (trimmed.length < 3 || trimmed.length > 10) {
    return false
  }

  const postalRegex = /^\d{3,10}(-\d{1,10})?$/
  return postalRegex.test(trimmed)
}

const isValidRegion = (value) => {
  if (typeof value !== "string") {
    return false
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  const regionRegex = /^[A-Za-z][A-Za-z'. -]*$/
  return regionRegex.test(trimmed)
}

const buildPhoneNumber = () => {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value
    }
    const digits = value.replace(/\D/g, "")
    if (!digits) {
      return null
    }
    return digits
  }, z.string().length(10).nullable().optional())
}

const buildCountryCode = () => {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value
    }
    const trimmed = value.trim().toUpperCase()
    if (!trimmed) {
      return null
    }
    return trimmed
  }, z.string().length(2).nullable().optional())
}

const userInfoUpdateSchema = z
  .object({
    fullName: buildLowercaseTrimmedString(200).refine(
      (value) => {
        if (value === null || value === undefined) {
          return true
        }
        return isValidFullName(value)
      },
      { message: "Full name must include first and last name" }
    ),
    phoneNumber: buildPhoneNumber(),
    billingAddressLine1: buildOptionalTrimmedString(200),
    billingAddressLine2: buildOptionalTrimmedString(200),
    billingCity: buildOptionalTrimmedString(100),
    billingRegion: buildOptionalTrimmedString(100).refine(
      (value) => {
        if (value === null || value === undefined) {
          return true
        }
        return isValidRegion(value)
      },
      { message: "State or region looks invalid" }
    ),
    billingPostalCode: buildOptionalTrimmedString(20).refine(
      (value) => {
        if (value === null || value === undefined) {
          return true
        }
        return isValidPostalCode(value)
      },
      { message: "Postal code looks invalid" }
    ),
    billingCountry: buildCountryCode(),
  })
  .strict()

export const userInfoSelectFields = {
  fullName: true,
  phoneNumber: true,
  billingAddressLine1: true,
  billingAddressLine2: true,
  billingCity: true,
  billingRegion: true,
  billingPostalCode: true,
  billingCountry: true,
}

export const buildUserInfoUpdateData = (payload) => {
  const result = userInfoUpdateSchema.safeParse(payload)
  if (!result.success) {
    return { success: false, error: result.error.message }
  }

  const updateData = {}
  const updateKeys = Object.keys(userInfoSelectFields)

  for (const key of updateKeys) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      updateData[key] = result.data[key]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return { success: false, error: "No user info changes provided" }
  }

  return { success: true, data: updateData }
}
