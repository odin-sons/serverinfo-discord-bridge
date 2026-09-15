import type { Env } from './types'

async function discordGet (env: Env, path: string): Promise<{ status: number, body: unknown }> {
    const response = await fetch(`https://discord.com/api/v10${path}`, {
        headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
    })
    const body = await response.json().catch(() => null)
    return { status: response.status, body }
}

export async function runDiagnostics (env: Env): Promise<unknown> {
    const [me, guilds, channel] = await Promise.all([
        discordGet(env, '/users/@me'),
        discordGet(env, '/users/@me/guilds'),
        discordGet(env, `/channels/${env.DISCORD_CHANNEL_ID}`)
    ])

    const botId = (me.body as { id?: string } | null)?.id
    const guildList = Array.isArray(guilds.body) ? guilds.body as Array<{ id: string }> : []
    const guildChannels = await Promise.all(
        guildList.map(async (guild) => ({
            guildId: guild.id,
            channels: await discordGet(env, `/guilds/${guild.id}/channels`),
            botMember: botId !== undefined ? await discordGet(env, `/guilds/${guild.id}/members/${botId}`) : null
        }))
    )

    return { bot: me, guilds, channel, guildChannels }
}
