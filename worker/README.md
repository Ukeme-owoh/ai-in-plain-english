# Feedback worker

Tiny Cloudflare Worker that takes a feedback POST from `QuestionForm.astro`
and appends it as one JSONL line to a GitHub Gist. The Gist is the
persistence layer — anything that can read a Gist (Jira automation rules,
Zapier, a polling script, a personal dashboard) can ingest from there.

## Why a Worker

The site is statically hosted on GitHub Pages. There is no server runtime
on Pages, so anything that needs a server-side secret (a GitHub PAT for
writing to a Gist) has to live elsewhere. A free Cloudflare Worker is the
smallest piece of infra that does this job cleanly.

## One-time deploy

You will need:

- A GitHub fine-scoped PAT with **only** the `gist` scope.
- A Gist (create an empty one at <https://gist.github.com> first; copy
  its id from the URL — the part after `/<your-username>/`).
- A Cloudflare account and `wrangler` (`npm i -g wrangler`).

```bash
cd worker

# Authenticate wrangler if needed
wrangler login

# Edit wrangler.toml — change ALLOWED_ORIGIN to the live site origin
# if it differs from the default.

# Push the secrets (these never leave your machine + Cloudflare)
wrangler secret put GH_TOKEN   # paste the PAT
wrangler secret put GIST_ID    # paste the gist id

# Optional: rate-limit by IP. Create a KV namespace, then paste its id
# into wrangler.toml under the [[kv_namespaces]] block (uncomment first).
# wrangler kv:namespace create RATE_LIMIT_KV

# Deploy
wrangler deploy
```

`wrangler deploy` prints the live URL, e.g.
`https://aipe-feedback.<account>.workers.dev`. Set that as the
`PUBLIC_FEEDBACK_ENDPOINT` env var in the site's GitHub Pages workflow
(or in a local `.env` for development) and rebuild.

## How the gist looks

Each submission appends one JSON object on its own line to
`feedback.jsonl`:

```jsonl
{"ts":"2026-05-08T15:00:01Z","post":"Will the Price of Tokens Fall or Rise?","page":"/posts/policy-01-token-pricing/","name":"Anonymous","question":"How does Jevons paradox apply?"}
```

JSONL keeps the gist forever-appendable without races and is trivial to
parse from any consumer.

## Jira ingestion

Two options:

- **Jira automation** — schedule a daily web request to the Gist's
  raw URL (`https://gist.githubusercontent.com/<user>/<id>/raw/feedback.jsonl`),
  diff against the last-seen line count, create an issue per new line.
- **Zapier / Make** — the Gist raw URL is publicly readable if the gist
  is public. Watch for changes, parse JSONL, create Jira issues. Use a
  secret gist if you want the contents private — those still work via
  the API but require auth, in which case proxy through the Worker.

## Local development

`PUBLIC_FEEDBACK_ENDPOINT` is read at build time via Astro's standard
`import.meta.env`. To test locally:

```bash
# In the repo root
PUBLIC_FEEDBACK_ENDPOINT=https://aipe-feedback.<account>.workers.dev npm run dev
```

For staging without a Worker, point at a local `wrangler dev` run on
`http://127.0.0.1:8787` and set `ALLOWED_ORIGIN=http://localhost:4321`.

## Security notes

- The PAT lives only as a Worker secret. It never reaches the browser.
- The Worker rejects requests whose `Origin` header does not match
  `ALLOWED_ORIGIN` when that var is set to a real URL.
- A honeypot input in the form silently absorbs naive bots.
- KV-backed rate limit caps each IP at five submissions per minute when
  the binding is configured.
