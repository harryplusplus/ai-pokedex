'use client'

import { useUser } from '../contexts/user-context'

export default function UserSignOutIsland() {
  const { name, picture } = useUser()

  return <div>{name}</div>
}
