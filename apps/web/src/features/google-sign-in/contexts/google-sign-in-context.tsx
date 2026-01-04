'use client'

import { createContext, ReactNode, useEffect, useState } from 'react'

const GoogleSignInContext = createContext(null)

export function GoogleSingInProvider({ children }: { children?: ReactNode }) {
  const [] = useState()

  useEffect(() => {}, [])

  return <GoogleSignInContext value={null}>{children}</GoogleSignInContext>
}
