import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateDiscordChannel } from '../src/update-channel'
import type { Env } from '../src/types'

function makeEnv (overrides: Partial<Env> = {}): Env {
    return {
        SERVERINFO_URL: 'http://example.test/serverinfo',
        DISCORD_CHANNEL_ID: '123',
        DISCORD_BOT_TOKEN: 'token',
        SERVER_LABEL: 'Lite_v2',
        ...overrides
    }
}

function jsonResponse (body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status })
}

describe('updateDiscordChannel', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('renames the channel to the online format when serverinfo is reachable', async () => {
        const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ name: 'MyWorld', playersCount: 3, players: [] }))
            .mockResolvedValueOnce(jsonResponse({ id: '123', name: '🟢[Lite_v2] Online: 3' }))

        const result = await updateDiscordChannel(makeEnv())

        expect(result).toEqual({ name: '🟢[Lite_v2] Online: 3', changed: true })
        expect(fetchMock).toHaveBeenCalledTimes(2)
        const discordCall = fetchMock.mock.calls.at(1)
        expect(discordCall?.[0]).toBe('https://discord.com/api/v10/channels/123')
        expect(discordCall?.[1]).toMatchObject({ method: 'PATCH' })
    })

    it('falls back to the offline format when serverinfo is unreachable', async () => {
        const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
        fetchMock
            .mockRejectedValueOnce(new Error('connect ECONNREFUSED'))
            .mockResolvedValueOnce(jsonResponse({ id: '123', name: '🔴[Lite_v2] Offline' }))

        const result = await updateDiscordChannel(makeEnv())

        expect(result).toEqual({ name: '🔴[Lite_v2] Offline', changed: true })
    })

    it('skips the Discord call when the computed name matches the cached one', async () => {
        const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
        fetchMock.mockResolvedValueOnce(jsonResponse({ name: 'MyWorld', playersCount: 3, players: [] }))

        const kv = {
            get: vi.fn().mockResolvedValue('🟢[Lite_v2] Online: 3'),
            put: vi.fn()
        }

        const result = await updateDiscordChannel(makeEnv({ STATE_KV: kv as unknown as KVNamespace }))

        expect(result).toEqual({ name: '🟢[Lite_v2] Online: 3', changed: false })
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(kv.put).not.toHaveBeenCalled()
    })
})
