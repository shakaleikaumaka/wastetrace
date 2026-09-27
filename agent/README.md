# 📣 TRACEY — the wastetrace.org kitchen desk agent

TRACEY is the communicator of the Trace Zero Waste family — she answers the live chat
on wastetrace.org. This folder is her complete, deployable source:

- `worker.js` — Cloudflare Worker chat hub (one Durable Object, visitor `/send` + `/poll`
  long-poll, agent `/agent/reply` behind a Bearer key). No database, no accounts, no tracking.
- `wrangler.toml` — deploy config (add your own `account_id`; set the `AGENT_KEY` secret
  with `wrangler secret put AGENT_KEY`).
- The widget that talks to it is `/tracey-talk.js` at the repo root.

The "agent" behind the hub is any process you like: ours is an AI agent that wakes when
a bell rings, reads `/poll`, and answers with `/agent/reply`. Yours could be a human on
a laptop with `curl`. That's the point — the loop works without our infrastructure.

Fork it for your camp: rename the worker, deploy, point the widget's `HUB` constant at
your URL, and your camp has a kitchen desk. Gift economy: this is CC0 — no permission needed.
