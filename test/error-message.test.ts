import { describe, expect, it } from 'vitest'
import { errorMessage } from '../src/error-message'

describe('errorMessage', () => {
    it('returns the message of an Error', () => {
        expect(errorMessage(new Error('boom'))).toBe('boom')
    })

    it('stringifies non-Error values', () => {
        expect(errorMessage('boom')).toBe('boom')
        expect(errorMessage({ code: 42 })).toBe('[object Object]')
    })
})
