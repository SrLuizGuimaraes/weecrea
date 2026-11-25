// Status do painel: lê issues e PRs do GitHub UMA vez para todos os visitantes.
// A Vercel guarda a resposta por 2 minutos (s-maxage) e, se o GitHub falhar, continua servindo a última boa.
// Variáveis opcionais na Vercel:
//   GITHUB_TOKEN  token só de leitura (sobe o limite do GitHub de 60 para 5.000 consultas por hora)
//   PAINEL_REPO   dono/repositório (padrão: SrLuizGuimaraes/weecrea)
let ultimaBoa = null;

module.exports = async (req, res) => {
  const repo = process.env.PAINEL_REPO || 'SrLuizGuimaraes/weecrea';
  const api = `https://api.github.com/repos/${repo}`;
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'weecrea-painel' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const [ri, rp] = await Promise.all([
      fetch(`${api}/issues?labels=modulo&state=all&per_page=100`, { headers }),
      fetch(`${api}/pulls?state=open&per_page=100`, { headers }),
    ]);
    if (!ri.ok) throw new Error(`GitHub respondeu ${ri.status}`);
    const issues = (await ri.json()).filter((i) => !i.pull_request).map((i) => ({
      number: i.number, title: i.title, body: i.body, state: i.state, html_url: i.html_url, updated_at: i.updated_at,
      labels: i.labels.map((l) => ({ name: l.name })),
      assignees: i.assignees.map((a) => ({ login: a.login, avatar_url: a.avatar_url })),
    }));
    const prs = rp.ok ? (await rp.json()).map((p) => ({ number: p.number, html_url: p.html_url, head: { ref: p.head.ref } })) : [];
    ultimaBoa = { repo, issues, prs, lidoEm: new Date().toISOString() };
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600, stale-if-error=86400');
    res.status(200).json(ultimaBoa);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    if (ultimaBoa) return res.status(200).json({ ...ultimaBoa, aviso: 'GitHub indisponível; mostrando a última leitura.' });
    res.status(502).json({ erro: String(e.message || e) });
  }
};
