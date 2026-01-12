import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toPrintable(e: unknown): Error | string {
  if (e instanceof Error || typeof e === 'string') {
    return e
  }

  if (typeof e === 'object' && e && 'message' in e) {
    return String(e.message)
  }

  return JSON.stringify(e)
}

export function setHeaderToArrayHeaders(
  headers: [string, string][],
  name: string,
  value: string,
) {
  const loweredName = name.toLowerCase()
  const index = headers.findIndex(([x]) => x.toLowerCase() === loweredName)
  if (index !== -1) {
    headers[index] = [name, value]
  } else {
    headers.push([name, value])
  }
}

export interface ContentTypeJson {
  'Content-Type': 'application/json'
}

export async function parseErrorResponse(
  res: Response,
): Promise<{ message: string }> {
  try {
    return (await res.json()) as { message: string }
  } catch (_e) {
    return {
      message: 'Unknown error',
    }
  }
}
