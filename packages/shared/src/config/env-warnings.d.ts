/**
 * Create helpers that warn once when defaulting env values.
 */
export declare function createEnvWarningHelpers(scope: string): {
  (
    key: string,
    rawValue: string | undefined,
    defaultValue: string | number | undefined,
    options?: { parseNumber?: boolean }
  ): string | number | undefined
}
