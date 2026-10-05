export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "RESEND_API_KEY não configurada.",
    });
  }

  try {
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Confeasy <onboarding@resend.dev>",
          to: ["delivered@resend.dev"],
          subject: "Teste de e-mail — Confeasy",
          html: `
            <h1>Confeasy</h1>
            <p>Este é um teste de envio de e-mail pelo Resend.</p>
            <p>Se você está vendo este registro no Resend, a integração está funcionando.</p>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data?.message || "Erro ao enviar e-mail.",
        details: data,
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Teste enviado com sucesso!",
      resend_id: data?.id || null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Erro ao conectar com o Resend.",
      details: error?.message || "Erro desconhecido.",
    });
  }
}
