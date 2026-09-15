import { updateDiscordChannel } from './update-channel'
import { errorMessage } from './error-message'
import type { Env } from './types'

export default {
    async scheduled (_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
        ctx.waitUntil(
            updateDiscordChannel(env).catch((error: unknown) => {
                console.error('scheduled update failed:', errorMessage(error))
            })
        )
    },

    async fetch (request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)

        if (url.pathname === '/health') {
            return new Response('ok')
        }

        if (url.pathname === '/trigger' && request.method === 'POST') {
            if (env.TRIGGER_SECRET === undefined || request.headers.get('x-trigger-secret') !== env.TRIGGER_SECRET) {
                return new Response('unauthorized', { status: 401 })
            }

            try {
                const result = await updateDiscordChannel(env)
                return Response.json(result)
            } catch (error) {
                return new Response(`update failed: ${errorMessage(error)}`, { status: 500 })
            }
        }

        return new Response('not found', { status: 404 })
    }
} satisfies ExportedHandler<Env>
