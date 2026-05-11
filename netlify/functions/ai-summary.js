exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { text } = JSON.parse(event.body);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: '家族が共有する患者の医療記録を分析し、①現在の状況まとめ ②検査・治療の経過 ③注目すべきポイント ④家族へのアドバイス の4項目で簡潔にまとめてください。末尾に「※診断・治療方針は必ず医師にご相談ください」と添えてください。',
        messages: [{ role: 'user', content: '以下の記録を分析してください：\n' + text }]
      })
    });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ result: data.content.map(b => b.text || '').join('') })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};