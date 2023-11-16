export type BingoJSON = Array<{
  key: string
  value: string
  color: string
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
        result: {
          key: string
          value: string
        }
      }
) => void

export type CallbackClearType = (cbk: { error: string | null }) => void

export type AuthedEvent = {
  authToken: string
}
