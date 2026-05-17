export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'KAKAO_REST_API_KEY not configured' });
  }

  const { query, x, y, radius, category_group_code, page, size, rect, sort } = req.query;

  if (!query && !category_group_code) {
    return res.status(400).json({ error: 'query or category_group_code is required' });
  }

  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (category_group_code) params.set('category_group_code', category_group_code);
  if (x) params.set('x', x);
  if (y) params.set('y', y);
  if (radius) params.set('radius', radius);
  if (rect) params.set('rect', rect);
  if (sort) params.set('sort', sort);
  params.set('page', page || '1');
  params.set('size', size || '15');

  const endpoint = query
    ? 'https://dapi.kakao.com/v2/local/search/keyword.json'
    : 'https://dapi.kakao.com/v2/local/search/category.json';

  try {
    const upstream = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { Authorization: `KakaoAK ${key}` },
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    return res.status(502).json({ error: 'Upstream fetch failed', detail: String(err) });
  }
}
