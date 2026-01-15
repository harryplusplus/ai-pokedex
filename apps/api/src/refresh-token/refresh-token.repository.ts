import camelcaseKeys from 'camelcase-keys'

import { prepare } from '../db/db.types.ts'
import { sql } from '../db/db.utils.ts'
import { QueryClient } from '../db/query.client.ts'
import { UserId } from '../user/user.schema.ts'

export class RefreshTokenRepository {
  constructor(private readonly queryClient: QueryClient) {}

  async create(input: {
    userId: UserId
    token: string
    expiresAt: Date
  }): Promise<void> {
    const { userId, token, expiresAt } = input

    const result = await this.queryClient.query(
      sql`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
          VALUES (${userId}, ${token}, ${expiresAt})
      `,
      {
        name: prepare('refresh_token_create'),
      },
    )

    if (result.rowCount !== 1) {
      throw new Error('Invalid refresh token creation.')
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.queryClient.query(
      sql`
        UPDATE
          refresh_tokens
        SET
          revoked_at = now(),
          updated_at = now()
        WHERE
          token = ${refreshToken}
          AND revoked_at IS NULL
      `,
      {
        name: prepare('refresh_token_revoke'),
      },
    )
  }

  async lock(refreshToken: string): Promise<{ expiresAt: string } | null> {
    const result = await this.queryClient.query<{ expires_at: string }>(
      sql`
        SELECT
          expires_at
        FROM
          refresh_tokens
        WHERE
          token = ${refreshToken}
          AND revoked_at IS NULL
        FOR UPDATE
      `,
      {
        name: prepare('refresh_token_lock'),
      },
    )

    if (result.rows.length !== 1) {
      return null
    }

    return camelcaseKeys(result.rows[0])
  }
}
