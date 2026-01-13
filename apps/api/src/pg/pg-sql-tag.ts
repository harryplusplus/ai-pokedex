type JsonPrimitive = string | number | boolean | null
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]
type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type Value =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Buffer
  | Value[]
  | JsonObject

export interface QueryConfig {
  text: string
  values?: Value[]
}

export function sql(
  strings: TemplateStringsArray,
  ...args: Value[]
): Readonly<QueryConfig> {
  let text = ''
  const values: Value[] = []

  for (let i = 0; i < strings.length; i++) {
    text += strings[i]

    if (i < args.length) {
      values.push(args[i])
      text += `$${values.length}`
    }
  }

  if (values.length > 0) {
    return {
      text,
      values,
    }
  }

  return {
    text,
  }
}
