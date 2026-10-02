export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido'
    });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Mensagens não foram enviadas'
      });
    }

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://confeasy.vercel.app',
          'X-Title': 'Confeasy'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Erro ao consultar a IA'
      });
    }

    return res.status(200).json({
      message: data.choices?.[0]?.message?.content || ''
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno ao conectar com a IA'
    });
  }
}
