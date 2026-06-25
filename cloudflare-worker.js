// Şeyma 🦩 — Cloudflare Worker: günlük veriyi GitHub repoya commit eder.
// Kurulum adımları için WORKER_SETUP.md dosyasına bak.
//
// Gerekli ortam değişkenleri (Cloudflare > Worker > Settings > Variables):
//   GITHUB_TOKEN   (SECRET)  fine-grained PAT, repo: Contents = Read and write
//   GH_OWNER                 örn. mustafaras
//   GH_REPO                  örn. s
//   GH_BRANCH                örn. data   (Pages'i tetiklememek için ayrı branch önerilir)
//   ALLOWED_ORIGIN           örn. https://mustafaras.github.io  (CORS güvenliği)

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405, cors);

    let payload;
    try { payload = await request.json(); } catch { return json({ error: 'bad json' }, 400, cors); }

    const data = payload.data || payload;
    const date = String(payload.date || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, '');
    const owner = env.GH_OWNER, repo = env.GH_REPO, branch = env.GH_BRANCH || 'data', token = env.GITHUB_TOKEN;
    if (!owner || !repo || !token) return json({ error: 'worker not configured' }, 500, cors);

    const files = [
      { path: `data/seyma-${date}.json`, content: JSON.stringify({ date, savedAt: payload.savedAt || new Date().toISOString(), data }, null, 2) },
      { path: `data/latest.json`, content: JSON.stringify(data, null, 2) },
    ];
    try {
      for (const f of files) await putFile(owner, repo, branch, token, f.path, f.content);
      return json({ ok: true, date }, 200, cors);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 502, cors);
    }
  }
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

async function putFile(owner, repo, branch, token, path, content) {
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'seyma-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  let sha;
  const getRes = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers });
  if (getRes.status === 200) { const g = await getRes.json(); sha = g.sha; }
  const body = { message: `sync: ${path}`, content: b64(content), branch, ...(sha ? { sha } : {}) };
  const res = await fetch(api, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
}

function b64(str) {
  // unicode-safe base64
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}
