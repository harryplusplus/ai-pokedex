const Name = [
  'refresh_token_create',
  'refresh_token_revoke',
  'refresh_token_lock',
] as const
type Name = (typeof Name)[number]

export function prepare<T extends Name>(name: T): T {
  return name
}
