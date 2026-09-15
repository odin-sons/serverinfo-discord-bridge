import type { Env } from './types'

export async function setChannelName (env: Env, name: string): Promise<void> {
    const response = await fetch(`https://discord.com/api/v10/channels/${env.DISCORD_CHANNEL_ID}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })

    if (response.ok) {
        return
    }

    if (response.status === 429) {
        const body = await response.json() as { retry_after?: number }
        throw new Error(`Discord rate limit hit, retry after ${body.retry_after ?? '?'}s`)
    }

    const text = await response.text()
    throw new Error(`Discord channel update failed: ${response.status} ${text}`)
}
