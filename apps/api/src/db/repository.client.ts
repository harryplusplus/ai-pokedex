import { ApiKeyRepository } from '../api-key/api-key.repository.ts'
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository.ts'
import { UserRepository } from '../user/user.repository.ts'
import { Class } from '../utils.ts'
import { RawQueryClient } from './db.types.ts'
import { QueryClient } from './query.client.ts'

export class RepositoryClient<T extends RawQueryClient> {
  readonly #raw: T
  readonly #map = new Map<Class, InstanceType<Class>>()

  constructor(raw: T) {
    this.#raw = raw
  }

  #getOrCreate<T extends Class>(
    key: T,
    factory: () => InstanceType<T>,
  ): InstanceType<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let repository: InstanceType<T> | undefined = this.#map.get(key)

    if (!repository) {
      repository = factory()

      this.#map.set(key, repository)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return repository as InstanceType<T>
  }

  get refreshToken() {
    return this.#getOrCreate(
      RefreshTokenRepository,
      () => new RefreshTokenRepository(new QueryClient(this.#raw)),
    )
  }

  get user() {
    return this.#getOrCreate(
      UserRepository,
      () => new UserRepository(new QueryClient(this.#raw)),
    )
  }

  get apiKey() {
    return this.#getOrCreate(
      ApiKeyRepository,
      () => new ApiKeyRepository(new QueryClient(this.#raw)),
    )
  }
}
