function json(res, status, body) {
  res.status(status).json(body);
}

function normalize(value) {
  return String(value || "").trim();
}

function getImageSize(format) {
  if (format === "Story") {
    return "1088x1920";
  }

  if (format === "Quadrado") {
    return "1024x1024";
  }

  return "1072x1344";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return json(res, 405, {
      error: "Método não permitido.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return json(res, 500, {
      error: "OPENAI_API_KEY não configurada.",
    });
  }

  const {
    businessName,
    product,
    format,
    style,
    text,
  } = req.body || {};

  const safeBusinessName =
    normalize(businessName) || "Minha Confeitaria";

  const safeProduct =
    normalize(product) || "produto de confeitaria";

  const safeFormat =
    normalize(format) || "Feed";

  const safeStyle =
    normalize(style) || "Elegante";

  const safeText =
    normalize(text) || "Momentos especiais";

  const size = getImageSize(safeFormat);

  const prompt = `
Crie uma arte profissional para uma confeitaria brasileira.

NEGÓCIO:
${safeBusinessName}

PRODUTO:
${safeProduct}

FORMATO:
${safeFormat}

ESTILO VISUAL:
${safeStyle}

TEXTO PRINCIPAL QUE DEVE APARECER NA ARTE:
"${safeText}"

DIREÇÃO CRIATIVA:
- aparência premium e profissional;
- composição sofisticada;
- fotografia ou composição visual de alta qualidade;
- destaque visual para o produto;
- iluminação bonita e profissional;
- estética de confeitaria moderna;
- composição adequada para Instagram;
- deixar espaço visual equilibrado para o texto;
- usar o estilo solicitado sem exageros;
- não criar informações adicionais, preços ou telefones;
- não inserir textos aleatórios;
- o texto principal deve aparecer de forma legível;
- não utilizar marcas d'água;
- não utilizar mockup de celular;
- criar uma peça pronta para divulgação nas redes sociais.

Gere somente a arte final.
`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt,
          size,
          quality: "medium",
          output_format: "png",
          n: 1,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("OpenAI image generation error:", data);

      return json(res, response.status, {
        error:
          data?.error?.message ||
          "Não foi possível gerar a imagem.",
      });
    }

    const imageBase64 = data?.data?.[0]?.b64_json;

    if (!imageBase64) {
      return json(res, 500, {
        error: "A OpenAI não retornou uma imagem.",
      });
    }

    return json(res, 200, {
      image: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error) {
    console.error("Generate image error:", error);

    return json(res, 500, {
      error:
        error?.message ||
        "Erro ao gerar a imagem.",
    });
  }
}
