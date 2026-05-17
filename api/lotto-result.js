export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { drwNo } = req.query;

  if (!drwNo) {
    return res.status(400).json({ error: 'drwNo is required' });
  }

  if (!/^\d+$/.test(String(drwNo))) {
    return res.status(400).json({ error: 'drwNo must be a number' });
  }

  const endpoint = `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${encodeURIComponent(drwNo)}`;

  try {
    const upstream = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    const html = await upstream.text();

    const winSection = html.match(/<div class="num win"[^>]*>([\s\S]*?)<\/div>/);
    const bonusSection = html.match(/<div class="num bonus"[^>]*>([\s\S]*?)<\/div>/);

    const extractNums = (section) =>
      [...section.matchAll(/<span[^>]*>\s*(\d+)\s*<\/span>/g)].map((m) => parseInt(m[1], 10));

    const winNums = winSection ? extractNums(winSection[1]) : [];
    const bonusNums = bonusSection ? extractNums(bonusSection[1]) : [];

    if (winNums.length < 6 || bonusNums.length < 1) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ returnValue: 'fail' });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      returnValue: 'success',
      drwNo: parseInt(drwNo, 10),
      drwtNo1: winNums[0],
      drwtNo2: winNums[1],
      drwtNo3: winNums[2],
      drwtNo4: winNums[3],
      drwtNo5: winNums[4],
      drwtNo6: winNums[5],
      bnusNo: bonusNums[0],
    });
  } catch (err) {
    return res.status(502).json({ error: 'Upstream fetch failed', detail: String(err) });
  }
}
