import { Sql } from 'postgres'

export class RefreshTokenRepo {
  constructor(private readonly sql: Sql) {}
}
