import type { Result } from '@prisma/client'

export type BingoJSON = Array<{
  key: string
  value: string
  results: Array<{
    key: string
    value: string
    index: number
  }>
}>

export type CallbackResultType = (
  cbk:
    | {
        error: string
      }
    | {
        error: null
        result: Result
      }
) => void

export type CallbackClearType = (cbk: { error: string | null }) => void

export type AuthedEvent = {
  authToken: string
}
