/* ============================================================
   obpc-apagar — apaga do Cloudinary o que já saiu do site
   Usado por: midia-estudio.html (limite de vagas) e pastor-midia.html

   COMO COLOCAR NO AR (Cloudflare, mesma conta do obpc-og):
   1. Workers & Pages > Create > Worker. Nome: obpc-apagar
   2. Cole este arquivo em Edit code e clique Deploy.
   3. Settings > Variables and Secrets. Crie (tipo Secret):
        CLOUD_NAME  = dvvxiri22
        API_KEY     = (a API Key do Cloudinary)
        API_SECRET  = (a API Secret do Cloudinary)
      A API Secret fica só aqui, nunca nas páginas.
   4. O endereço fica https://obpc-apagar.obpcsaofernando199.workers.dev
      (é o que já está em CFG.apagar nas duas páginas).

   TRAVAS DE SEGURANÇA
   - Só apaga arquivos da pasta obpc_midia/.
   - Só apaga se o arquivo NÃO estiver mais em nenhuma lista do site
     (galeria, videos, cultos, palavras, midia_ocultos).
   - Se não conseguir ler o Firebase, não apaga nada.
   ============================================================ */
const PASTA = 'obpc_midia';
const NOS = ['galeria', 'videos', 'cultos', 'palavras', 'midia_ocultos'];
const FB_PADRAO = 'https://obpc-saofernando-1d6f3-default-rtdb.firebaseio.com/obpc';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const resp = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/* url do Cloudinary -> { tipo, id } (id sem extensão), só se estiver na pasta do Estúdio */
function analisa(url) {
  const m = String(url || '').split('?')[0].match(/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(.+)$/);
  if (!m) return null;
  const segs = m[2].split('/');
  const i = segs.indexOf(PASTA);
  if (i < 0) return null;
  const id = segs.slice(i).join('/').replace(/\.[a-z0-9]+$/i, '');
  return { tipo: m[1], id: decodeURIComponent(id) };
}

async function sha1(txt) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(txt));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function emUso(env) {
  const base = env.FIREBASE_URL || FB_PADRAO;
  const partes = await Promise.all(NOS.map(async n => {
    const r = await fetch(`${base}/${n}.json`, { cache: 'no-store' });
    if (!r.ok) throw new Error('firebase ' + n + ' ' + r.status);
    return r.text();
  }));
  return partes.join('\n').replace(/\\\//g, '/');
}

async function destroy(env, a) {
  const ts = Math.floor(Date.now() / 1000);
  const assinatura = await sha1(`invalidate=true&public_id=${a.id}&timestamp=${ts}${env.API_SECRET}`);
  const fd = new FormData();
  fd.append('public_id', a.id);
  fd.append('timestamp', String(ts));
  fd.append('invalidate', 'true');
  fd.append('api_key', env.API_KEY);
  fd.append('signature', assinatura);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUD_NAME}/${a.tipo}/destroy`, { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  return j.result || (j.error && j.error.message) || ('HTTP ' + r.status);
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (req.method !== 'POST') return resp({ erro: 'use POST' }, 405);
    if (!env.CLOUD_NAME || !env.API_KEY || !env.API_SECRET) return resp({ erro: 'Worker sem CLOUD_NAME/API_KEY/API_SECRET' }, 500);

    let corpo;
    try { corpo = await req.json(); } catch (e) { return resp({ erro: 'JSON inválido' }, 400); }
    const urls = Array.isArray(corpo.urls) ? corpo.urls.slice(0, 20) : [];
    if (!urls.length) return resp({ erro: 'sem urls' }, 400);

    let vivo;
    try { vivo = await emUso(env); } catch (e) { return resp({ erro: 'não consegui conferir o site; nada foi apagado' }, 503); }

    const resultado = [];
    for (const u of urls) {
      const a = analisa(u);
      if (!a) { resultado.push({ url: u, status: 'ignorado (fora da pasta obpc_midia)' }); continue; }
      if (vivo.includes(a.id)) { resultado.push({ url: u, status: 'ainda em uso no site' }); continue; }
      try { resultado.push({ url: u, status: await destroy(env, a) }); }
      catch (e) { resultado.push({ url: u, status: 'erro' }); }
    }
    return resp({ resultado });
  },
};
