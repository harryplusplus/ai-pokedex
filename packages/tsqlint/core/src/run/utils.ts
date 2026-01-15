export function parseErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    return e.message
  }

  if (typeof e === 'object' && e && 'message' in e) {
    return String(e.message)
  }

  return JSON.stringify(e)
}
