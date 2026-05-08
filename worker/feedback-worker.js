// Cloudflare Worker. Receives POST {name, question, post, page, ts}
// from the QuestionForm, appends the entry to a GitHub Gist (one
// JSONL file per post), and returns 200 on success.
//
// Required Worker secrets (set with `wrangler secret put`):
//   GH_TOKEN — fine-scoped PAT with the `gist` scope
//   GIST_ID  — id of the gist to append to (create an empty gist
//              first, copy the id from the URL)
//
// Required Worker var:
//   ALLOWED_ORIGIN — the public origin of the site, e.g.
//                    https://ukeme-owoh.github.io
//
// Optional Worker var:
//   GIST_FILENAME — filename inside the gist. Defaults to feedback.jsonl
//
// The gist accumulates feedback as JSONL (one JSON object per line),
// which Jira automation, Zapier, or a polling script can ingest.

const MAX_QUESTION_LEN = 2000;
const MAX_NAME_LEN = 200;
const MAX_FIELD_LEN = 500;
const RATE_LIMIT_PER_MINUTE = 5; // per IP

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
});

function jsonResponse(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

function clip(str, max) {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function escapeJsonl(value) {
  // Single-line JSON, no trailing newline issues
  return JSON.stringify(value).replace(/[\r\n]/g, ' ');
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const reqOrigin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigin === '*' ? '*'
      : (reqOrigin === allowedOrigin ? reqOrigin : allowedOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'Method not allowed' }, corsOrigin);
    }

    if (allowedOrigin !== '*' && reqOrigin && reqOrigin !== allowedOrigin) {
      return jsonResponse(403, { error: 'Origin not allowed' }, corsOrigin);
    }

    // Lightweight per-IP rate limit using KV if bound; otherwise skip
    if (env.RATE_LIMIT_KV) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const minuteKey = `rl:${ip}:${Math.floor(Date.now() / 60000)}`;
      const count = parseInt((await env.RATE_LIMIT_KV.get(minuteKey)) || '0', 10);
      if (count >= RATE_LIMIT_PER_MINUTE) {
        return jsonResponse(429, { error: 'Too many requests' }, corsOrigin);
      }
      await env.RATE_LIMIT_KV.put(minuteKey, String(count + 1), { expirationTtl: 90 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON' }, corsOrigin);
    }

    const question = clip(body?.question, MAX_QUESTION_LEN);
    if (question.length < 3) {
      return jsonResponse(400, { error: 'Question is required' }, corsOrigin);
    }

    const entry = {
      ts:       clip(body?.ts, 40) || new Date().toISOString(),
      post:     clip(body?.post, MAX_FIELD_LEN),
      page:     clip(body?.page, MAX_FIELD_LEN),
      name:     clip(body?.name, MAX_NAME_LEN) || 'Anonymous',
      question,
      ip:       request.headers.get('CF-Connecting-IP') || '',
      ua:       clip(request.headers.get('User-Agent') || '', MAX_FIELD_LEN),
    };

    if (!env.GH_TOKEN || !env.GIST_ID) {
      return jsonResponse(500, { error: 'Server not configured' }, corsOrigin);
    }

    const filename = env.GIST_FILENAME || 'feedback.jsonl';
    const gistUrl = `https://api.github.com/gists/${env.GIST_ID}`;
    const headers = {
      'Authorization': `Bearer ${env.GH_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'feedback-worker',
    };

    // Read current content
    const getRes = await fetch(gistUrl, { headers });
    if (!getRes.ok) {
      return jsonResponse(502, { error: 'Could not read gist' }, corsOrigin);
    }
    const gist = await getRes.json();
    const existing = gist?.files?.[filename]?.content || '';

    // Append as JSONL
    const next = existing + (existing && !existing.endsWith('\n') ? '\n' : '') +
                 escapeJsonl(entry) + '\n';

    const patchRes = await fetch(gistUrl, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: { [filename]: { content: next } } }),
    });

    if (!patchRes.ok) {
      const text = await patchRes.text().catch(() => '');
      return jsonResponse(502, { error: 'Could not write gist', detail: text.slice(0, 200) }, corsOrigin);
    }

    return jsonResponse(200, { ok: true }, corsOrigin);
  },
};
