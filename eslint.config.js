import neostandard from 'neostandard'

export default [
    {
        ignores: ['node_modules/**', 'dist/**', '.wrangler/**', 'coverage/**']
    },
    ...neostandard({ ts: true, globals: ['serviceworker'] }),
    {
        rules: {
            '@stylistic/indent': ['error', 4]
        }
    }
]
