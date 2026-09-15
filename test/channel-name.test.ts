import { describe, expect, it } from 'vitest'
import { buildOfflineChannelName, buildOnlineChannelName } from '../src/channel-name'

describe('buildOnlineChannelName', () => {
    it('formats the server label and player count', () => {
        expect(buildOnlineChannelName('Lite_v2', 5)).toBe('🟢[Lite_v2] Online: 5')
    })

    it('truncates names longer than 100 characters', () => {
        const longLabel = 'x'.repeat(200)
        expect(buildOnlineChannelName(longLabel, 1).length).toBe(100)
    })
})

describe('buildOfflineChannelName', () => {
    it('formats the offline label', () => {
        expect(buildOfflineChannelName('Lite_v2')).toBe('🔴[Lite_v2] Offline')
    })
})
