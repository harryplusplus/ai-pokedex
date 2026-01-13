import { Queryable } from '../pg/pg-utils.js'

const Name = [
  'refresh_token_create',
  'refresh_token_revoke',
  'refresh_token_lock',
] as const
type Name = (typeof Name)[number]

export type Query = Queryable<Name>
