import { clsx, type ClassValue } from 'clsx'
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
