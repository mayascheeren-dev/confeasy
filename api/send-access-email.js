export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

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

  const {
    email,
    full_name,
    password,
    expires_at,
  } = req.body || {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      error: "E-mail inválido.",
    });
  }

  const name = String(full_name || "Confeiteira").trim();

  const loginUrl = "https://confeasy.vercel.app/app";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      
      <div style="background: #d7ff11; padding: 28px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CONFEASY</h1>
        <p style="margin: 8px 0 0;">Gestão simples para sua confeitaria</p>
      </div>

      <div style="padding: 32px 24px;">
        <h2>Seu acesso está pronto! 🎂</h2>

        <p>
          Olá, <strong>${name}</strong>!
        </p>

        <p>
          Seu acesso ao Confeasy foi criado com sucesso.
          Agora você pode organizar pedidos, receitas, ingredientes,
          estoque, custos e muito mais em um só lugar.
        </p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 24px 0;">
          <p style="margin: 0 0 10px;">
            <strong>E-mail:</strong> ${email}
          </p>

          <p style="margin: 0 0 10px;">
            <strong>Senha:</strong> ${password || "A senha será enviada separadamente."}
          </p>

          <p style="margin: 0;">
            <strong>Acesso até:</strong> ${expires_at || "Consulte seu plano"}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${loginUrl}"
            style="
              display: inline-block;
              background: #111;
              color: #fff;
              text-decoration: none;
              padding: 15px 28px;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            ACESSAR O CONFEASY →
          </a>
        </div>

        <p style="font-size: 13px; color: #777;">
          Guarde este e-mail para consultar seus dados de acesso quando precisar.
        </p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777;">
        Confeasy — Gestão para Confeiteiras
      </div>

    </div>
  `;

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
          to: [email],
          subject: "Seu acesso ao Confeasy está pronto! 🎂",
          html,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.message ||
          data?.error ||
          "Erro ao enviar e-mail.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "E-mail enviado com sucesso.",
      id: data?.id || null,
    });
  } catch (error) {
    console.error(
      "Confeasy send-access-email error:",
      error
    );

    return res.status(500).json({
      error: "Erro interno ao enviar o e-mail.",
      detail: error?.message || "Erro desconhecido.",
    });
  }
}
