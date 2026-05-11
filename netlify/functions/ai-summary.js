exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { text } = JSON.parse(event.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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

    const data = await response.json();
    const result = data.content && data.content.length > 0
      ? data.content.map(b => b.text || '').join('')
      : '分析結果を取得できませんでした。';

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ result })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message, result: 'エラーが発生しました：' + e.message })
    };
  }
};
