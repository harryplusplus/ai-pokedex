import type { Rule } from 'eslint'
import psqlformat from 'psqlformat'

interface Options {
  tags: string[]
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce TODO',
      recommended: true,
      url: '',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: "default: `['sql']`",
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      {
        tags: ['sql'],
      } satisfies Options,
    ],
    messages: {
      notFormatted: 'SQL is not formatted',
    },
  },
  create: (context) => {
    const { sourceCode } = context
    const { tags } = context.options[0] as Options

    return {
      TaggedTemplateExpression: (node) => {
        const { tag, quasi } = node

        if (tag.type === 'Identifier') {
          if (tags.includes(tag.name)) {
            const { quasis, expressions } = quasi

            let sql = ''
            for (let i = 0; i < quasis.length; ++i) {
              sql += quasis[i].value.raw

              if (i < expressions.length) {
                const expr = sourceCode.getText(expressions[i])
                sql += '${' + expr + '}'
              }
            }

            const formatted = psqlformat.formatSql(sql, {
              placeholder: '\\$\\{[^}]+\\}',
            })

            const current = '`' + sql + '`'
            const next = '`\n' + formatted + '`'
            if (current !== next) {
              context.report({
                node: quasi,
                messageId: 'notFormatted',
                fix: (fixer) => {
                  return fixer.replaceText(quasi, next)
                },
              })
            }
          }
        }
      },
    }
  },
}

export default rule
