import { fetchServerInfo } from './serverinfo'
import { setChannelName } from './discord'
import { buildOfflineChannelName, buildOnlineChannelName } from './channel-name'
import type { Env } from './types'

const LAST_NAME_KEY = 'last-channel-name'

export interface UpdateResult {
    name: string
    changed: boolean
}

export async function updateDiscordChannel (env: Env): Promise<UpdateResult> {
    const serverLabel = env.SERVER_LABEL ?? 'Server'
    let name: string

    try {
        const info = await fetchServerInfo(env.SERVERINFO_URL)
        name = buildOnlineChannelName(env.SERVER_LABEL ?? info.name, info.playersCount)
    } catch (error) {
        console.error('serverinfo fetch failed:', error)
        name = buildOfflineChannelName(serverLabel)
    }

    const lastName = env.STATE_KV ? await env.STATE_KV.get(LAST_NAME_KEY) : null
    if (lastName === name) {
        return { name, changed: false }
    }

    await setChannelName(env, name)
    await env.STATE_KV?.put(LAST_NAME_KEY, name)
    return { name, changed: true }
}
