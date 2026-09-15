export interface ServerInfoPlayer {
    Name: string
    SteamID: string
    AvatarUrl?: string | null
}

export interface ServerInfoResponse {
    name: string
    playersCount: number
    players: ServerInfoPlayer[]
    mods?: unknown[]
}

export interface Env {
    SERVERINFO_URL: string
    DISCORD_CHANNEL_ID: string
    DISCORD_BOT_TOKEN: string
    SERVER_LABEL?: string
    TRIGGER_SECRET?: string
    STATE_KV?: KVNamespace
}
