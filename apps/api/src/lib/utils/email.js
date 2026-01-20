const uniqueStrings = (values) => {
  const seen = new Set()
  const result = []

  for (const value of values) {
    if (typeof value !== "string") {
      continue
    }

    const trimmedValue = value.trim()
    if (!trimmedValue) {
      continue
    }

    if (!seen.has(trimmedValue)) {
      seen.add(trimmedValue)
      result.push(trimmedValue)
    }
  }

  return result
}

const normalizeEmailAddress = (value) => {
  if (!value) {
    return null
  }
  return String(value).trim().toLowerCase()
}

const getHeaderValue = (headers, headerName) => {
  if (!headers || typeof headers !== "object") {
    return null
  }

  const targetName = String(headerName).toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === targetName) {
      if (Array.isArray(value)) {
        return value.join(", ")
      }
      if (value === null || value === undefined) {
        return null
      }
      return String(value)
    }
  }

  return null
}

const parseMessageIdList = (value) => {
  if (!value) {
    return []
  }

  return String(value)
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

const escapeHtml = (value) => {
  if (typeof value !== "string") {
    return ""
  }

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

const toSimpleHtml = (text) => {
  if (!text) {
    return null
  }

  const escaped = escapeHtml(String(text))

  const withBreaks = escaped.replaceAll("\n", "<br/>")
  return `<div style="font-family: sans-serif; white-space: normal;">${withBreaks}</div>`
}

/**
 * Derive a stable key used to group messages into a single thread.
 * Preference order: first References entry, then In-Reply-To, then Message-ID, then provider id.
 * @param {object} params
 * @param {string} params.receivedEmailId
 * @param {string[]|undefined|null} params.references
 * @param {string|undefined|null} params.inReplyTo
 * @param {string|undefined|null} params.messageId
 * @returns {string}
 */
const deriveThreadKey = ({
  receivedEmailId,
  references,
  inReplyTo,
  messageId,
}) => {
  if (Array.isArray(references) && references.length > 0) {
    return references[0]
  }

  if (inReplyTo) {
    return inReplyTo
  }

  if (messageId) {
    return messageId
  }

  return receivedEmailId
}

export {
  uniqueStrings,
  normalizeEmailAddress,
  getHeaderValue,
  parseMessageIdList,
  escapeHtml,
  toSimpleHtml,
  deriveThreadKey,
}
