# serverinfo-discord-bridge

A small Cloudflare Worker that keeps a Discord voice channel's name in sync
with a live Valheim server: `🟢[Lite_v2] Online: 3` while the server is
reachable, `🔴[Lite_v2] Offline` when it isn't. It reads player counts from
the [ServerInfo](https://github.com/odin-sons/serverinfo) BepInEx plugin's
`/serverinfo` HTTP endpoint and pushes the result to Discord on a schedule.

## Who this is for

Server admins running a Valheim dedicated server with the ServerInfo plugin
installed, who want their Discord to show "is the server up, and how many
people are on it" at a glance — without a bot appearing online, and without
running or maintaining a backend of their own.

## Why a Cloudflare Worker

- **No server to host.** Runs on Cloudflare's free tier, triggered by a Cron
  Trigger — no VPS, no always-on process, nothing to patch.
- **No new attack surface on the game server.** The Worker only makes
  outbound calls: it fetches the already-public `/serverinfo` endpoint and
  pushes to Discord's API. Nothing new needs to be opened, port-forwarded,
  or proxied on the Valheim server.
- **The Discord bot token never touches the game server.** It lives only in
  the Worker's secrets, isolated from the machine that's actually exposed to
  players.

## How it works

1. A Cron Trigger fires every 10 minutes (Discord allows only ~2 channel
   renames per 10 minutes per channel, so there's no benefit to polling more
   often).
2. The Worker fetches `SERVERINFO_URL`.
   - Reachable → channel name becomes `🟢[SERVER_LABEL] Online: N`.
   - Unreachable (timeout, non-2xx, connection error) → channel name becomes
     `🔴[SERVER_LABEL] Offline`.
3. If a `STATE_KV` namespace is bound, the computed name is compared against
   the last one written; a PATCH to Discord is only sent when it changed, to
   avoid burning the rate limit on no-op renames.
4. A `POST /trigger` endpoint (guarded by a shared secret) lets you force an
   update on demand, e.g. while testing.

## Configuration

Set as plain variables in `wrangler.toml` under `[vars]`, or as secrets via
`wrangler secret put <NAME>` (never commit real values for these):

| Name | Kind | Required | Meaning |
|---|---|---|---|
| `SERVERINFO_URL` | secret | yes | Full URL of the ServerInfo plugin's `/serverinfo` endpoint, e.g. `http://203.0.113.10:8880/serverinfo`. Not a credential, but kept as a secret so the public template isn't tied to one server. |
| `DISCORD_CHANNEL_ID` | secret | yes | ID of the voice channel to rename. Not a credential, kept as a secret for the same reason. |
| `SERVER_LABEL` | var | no | Fixed label shown in the channel name (e.g. `Lite_v2`). Falls back to the `name` field from `/serverinfo` when unset. |
| `DISCORD_BOT_TOKEN` | secret | yes | Bot token with `Manage Channels` permission on the target channel. |
| `TRIGGER_SECRET` | secret | no | If set, enables `POST /trigger` with header `X-Trigger-Secret: <value>` for manual runs. Endpoint is otherwise disabled (401). |
| `STATE_KV` | KV binding | no | Namespace used to remember the last channel name and skip redundant Discord calls. |

See [`.dev.vars.example`](.dev.vars.example) for local development.

## Discord bot setup

1. Create an application and bot at the
   [Discord Developer Portal](https://discord.com/developers/applications).
2. Invite it to your server with the `Manage Channels` permission (no other
   permissions are needed — it never joins voice or posts messages).
3. Copy the bot token into `DISCORD_BOT_TOKEN`, and the target voice
   channel's ID (right-click the channel → Copy Channel ID, with Developer
   Mode enabled) into `DISCORD_CHANNEL_ID`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run, test, and deploy this
project.

## License

[GNU General Public License v3.0 or later](LICENSE).
