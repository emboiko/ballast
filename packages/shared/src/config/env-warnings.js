const warnedEnvKeysByScope = new Map()

const getScopeSet = (scope) => {
  if (!warnedEnvKeysByScope.has(scope)) {
    warnedEnvKeysByScope.set(scope, new Set())
  }
  return warnedEnvKeysByScope.get(scope)
}

/**
 * Create a helper that warns once when defaulting env values.
 * @param {string} scope
 * @returns {(key: string, rawValue: string | undefined, defaultValue: string | number | undefined, options?: { parseNumber?: boolean }) => string | number | undefined}
 */
export const createEnvWarningHelpers = (scope) => {
  const warnedEnvKeys = getScopeSet(scope)

  /**
   * Warns once per key when defaulting an env value.
   * @param {string} key
   * @param {string|undefined} rawValue
   * @param {string|number|undefined} defaultValue
   * @param {{ parseNumber?: boolean }} [options]
   * @returns {string|number|undefined}
   */
  const warnEnvValue = (key, rawValue, defaultValue, options = {}) => {
    const hasValue = typeof rawValue === "string" && rawValue.trim().length > 0
    if (!hasValue) {
      if (!warnedEnvKeys.has(key)) {
        warnedEnvKeys.add(key)
        console.warn(
          `[${scope}/constants] ${key} missing; defaulting to ${defaultValue}`
        )
      }
      return defaultValue
    }

    if (options.parseNumber) {
      const parsedValue = Number.parseInt(rawValue, 10)
      if (Number.isNaN(parsedValue)) {
        const invalidKey = `${key}:invalid`
        if (!warnedEnvKeys.has(invalidKey)) {
          warnedEnvKeys.add(invalidKey)
          console.warn(
            `[${scope}/constants] ${key} invalid; defaulting to ${defaultValue}`
          )
        }
        return defaultValue
      }
      return parsedValue
    }

    return rawValue
  }

  return warnEnvValue
}
