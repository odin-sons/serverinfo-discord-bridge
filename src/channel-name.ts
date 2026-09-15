const MAX_CHANNEL_NAME_LENGTH = 100

export function buildOnlineChannelName (serverLabel: string, playersCount: number): string {
    return truncate(`🟢[${serverLabel}] Online: ${playersCount}`)
}

export function buildOfflineChannelName (serverLabel: string): string {
    return truncate(`🔴[${serverLabel}] Offline`)
}

function truncate (name: string): string {
    return name.length > MAX_CHANNEL_NAME_LENGTH ? name.slice(0, MAX_CHANNEL_NAME_LENGTH) : name
}
