import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const hotmartHottok = process.env.HOTMART_HOTTOK;

const adminSecret = process.env.CONFEASY_ADMIN_SECRET;

const productId = "8652869";

function json(res, status, body) {
  res.status(status).json(body);
}

function normalize(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return normalize(value).toLowerCase();
}

function getDaysFromOffer(offerName) {
  const name = normalize(offerName).toLowerCase();

  if (name.includes("30 dias")) return 30;
  if (name.includes("90 dias")) return 90;
  if (name.includes("365 dias")) return 365;

  return null;
}

async function reserveEvent(
  supabase,
  eventId,
  eventType,
  transactionId
) {
  const { error } = await supabase
    .from("hotmart_webhook_events")
    .insert({
      event_id: eventId,
      event_type: eventType,
      transaction_id: transactionId || null,
    });

  if (!error) {
    return true;
  }

  if (
    error.code === "23505" ||
    /duplicate|unique/i.test(error.message || "")
  ) {
    return false;
  }

  throw error;
}

async function releaseEvent(supabase, eventId) {
  await supabase
    .from("hotmart_webhook_events")
    .delete()
    .eq("event_id", eventId);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return json(res, 405, {
      error: "Método não permitido.",
    });
  }

  if (!hotmartHottok) {
    return json(res, 500, {
      error: "HOTMART_HOTTOK não configurado.",
    });
  }

  const receivedHottok =
    req.headers["x-hotmart-hottok"];

  if (receivedHottok !== hotmartHottok) {
    return json(res, 401, {
      error: "Não autorizado.",
    });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(res, 500, {
      error: "Configuração do Supabase ausente.",
    });
  }

  if (!adminSecret) {
    return json(res, 500, {
      error: "CONFEASY_ADMIN_SECRET não configurado.",
    });
  }

  const event = req.body || {};

  const eventId = normalize(event.id);
  const eventType = normalize(event.event);
  const version = normalize(event.version);

  const data = event.data || {};

  const product = data.product || {};
  const buyer = data.buyer || {};
  const purchase = data.purchase || {};

  const transactionId =
    normalize(purchase.transaction);

  if (!eventId) {
    return json(res, 400, {
      error: "Evento Hotmart sem id.",
    });
  }

  if (String(product.id) !== productId) {
    return json(res, 200, {
      ok: true,
      ignored: true,
      reason: "Produto diferente do Confeasy.",
    });
  }

  /*
   * Neste primeiro momento,
   * somente compras aprovadas
   * liberam o acesso.
   */
  if (eventType !== "PURCHASE_APPROVED") {
    return json(res, 200, {
      ok: true,
      ignored: true,
      event: eventType || null,
    });
  }

  const offerName =
    purchase.offer?.name ||
    "";

  const days =
    getDaysFromOffer(offerName);

  if (!days) {
    return json(res, 400, {
      error:
        "Oferta Hotmart não reconhecida.",
      offer: offerName,
    });
  }

  const email =
    normalizeEmail(buyer.email);

  const fullName =
    normalize(buyer.name);

  if (!email || !email.includes("@")) {
    return json(res, 400, {
      error:
        "Comprador sem e-mail válido.",
    });
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  let reserved = false;

  try {
    reserved = await reserveEvent(
      supabase,
      eventId,
      eventType,
      transactionId
    );

    if (!reserved) {
      return json(res, 200, {
        ok: true,
        duplicate: true,
        event_id: eventId,
      });
    }

    const response = await fetch(
      "https://confeasy.vercel.app/api/provision-user",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-confeasy-admin-secret":
            adminSecret,
        },

        body: JSON.stringify({
          email,
          full_name: fullName,
          business_name:
            "Minha Confeitaria",
          days,
        }),
      }
    );

    const provisionResult =
      await response.json().catch(
        () => ({})
      );

    if (!response.ok) {
      throw new Error(
        provisionResult?.detail ||
          provisionResult?.error ||
          "Falha ao criar o acesso."
      );
    }
    const priceValue = Number(
      purchase.price?.value
    );

    const currency =
      normalize(
        purchase.price?.currency_value
      ) || "BRL";

    const purchaseDate =
      purchase.order_date
        ? new Date(
            Number(purchase.order_date)
          ).toISOString()
        : null;

    const approvedAt =
      purchase.approved_date
        ? new Date(
            Number(purchase.approved_date)
          ).toISOString()
        : new Date().toISOString();

    const { error: saleError } =
      await supabase
        .from("hotmart_sales")
        .upsert(
          {
            transaction_id:
              transactionId,
            event_id:
              eventId,
            event_type:
              eventType,
            product_id:
              productId,
            product_name:
              normalize(product.name),
            offer_code:
              normalize(
                purchase.offer?.code
              ),
            offer_name:
              offerName,
            buyer_email:
              email,
            buyer_name:
              fullName,
            amount:
              Number.isFinite(priceValue)
                ? priceValue
                : null,
            currency,
            days,
            status: "approved",
            user_id:
              provisionResult.user_id ||
              null,
            expires_at:
              provisionResult.expires_at ||
              null,
            purchase_date:
              purchaseDate,
            approved_at:
              approvedAt,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "transaction_id",
          }
        );

    if (saleError) {
      throw saleError;
    }
    console.log(
      "Hotmart purchase processed:",
      {
        eventId,
        eventType,
        version,
        transactionId,
        email,
        offerName,
        days,
        created:
          provisionResult.created,
      }
    );

    return json(res, 200, {
      ok: true,
      event_id: eventId,
      transaction_id:
        transactionId,
      email,
      offer:
        offerName,
      days_added:
        days,
      created:
        Boolean(
          provisionResult.created
        ),
    });
  } catch (error) {
    if (reserved) {
      await releaseEvent(
        supabase,
        eventId
      );
    }

    console.error(
      "Confeasy Hotmart webhook error:",
      error
    );

    return json(res, 500, {
      error:
        "Não foi possível processar o webhook.",
      detail:
        error?.message ||
        "Erro desconhecido.",
    });
  }
}
