export const toCents: (dollars: number) => number

export const toDollars: (cents: number) => number

export const formatMoney: (cents: number) => string

export const formatMoneyValue: (cents: number) => string

export const parseMoneyValueToCents: (input: string) => number | null

export const addMoney: (a: number, b: number) => number

export const multiplyMoney: (cents: number, quantity: number) => number

export const percentOfMoney: (cents: number, percent: number) => number

export const BasisPoints: {
  fromPercent: (percent: number) => number
  toPercent: (basisPoints: number) => number
  format: (basisPoints: number, decimals?: number) => string
  apply: (cents: number, basisPoints: number) => number
}
