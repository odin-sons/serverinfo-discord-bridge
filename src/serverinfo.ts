import type { ServerInfoResponse } from './types'

export async function fetchServerInfo (url: string, timeoutMs = 5000): Promise<ServerInfoResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await fetch(url, { signal: controller.signal })

        if (!response.ok) {
            throw new Error(`serverinfo request failed with status ${response.status}`)
        }

        return await response.json() as ServerInfoResponse
    } finally {
        clearTimeout(timeout)
    }
}
