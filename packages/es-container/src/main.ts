import { Container } from './container.ts'
import { inject, onCreate, onDestroy, type } from './symbols.ts'
import { token } from './token.ts'
import { dependency, type Injected } from './types.ts'

interface IBar {
  a: 1
}

class Bar implements IBar {
  static [inject] = {}

  a!: 1
}

interface Baz {
  a: 1
}

interface OnCreatable {
  [onCreate](): void
}

interface OnDestroyable {
  [onDestroy](): void
}

class Foo implements OnCreatable, OnDestroyable {
  static [inject] = {
    bar: Bar,
    baz: dependency<Baz>('baz'),
    ibar: dependency<IBar>(Bar),
  }

  constructor(_deps: Injected<typeof Foo>) {}

  [onCreate](): void {
    //
  }

  [onDestroy](): void {
    //
  }
}

const container = new Container()

container.provide(Foo)
container.provide('a', Foo)

const cc = Symbol()

container.provide(cc, Foo)

const dd = token<Foo>('dd')

container.provide(dd, Foo)

const foo: Foo = container.resolve(Foo)

const baz: Baz = container.resolve<Baz>('baz')

const baz2Token = token<Baz>('baz2')

const baz2: Baz = container.resolve(baz2Token)

const a = container.resolve<() => void>('')

type Token2<T> = string & { [type]?: T }

function ab<T>(token: string): Token2<T> {
  return token
}

const aa = ab<Baz>('baz2')
