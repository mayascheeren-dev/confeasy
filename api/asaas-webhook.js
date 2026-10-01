import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const asaasApiKey = process.env.ASAAS_API_KEY;
const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
const adminSecret = process.env.CONFEASY_ADMIN_SECRET;

const asaasBaseUrl =
  process.env.ASAAS_API_BASE_URL || "https://api.asaas.com/v3";

const paymentLink30 = process.env.ASAAS_PAYMENT_LINK_30D;
const paymentLink90 = process.env.ASAAS_PAYMENT_LINK_90D;
const paymentLink365 = process.env.ASAAS_PAYMENT_LINK_365D;

function json(res, status, body) {
  res.status(status).json(body);
}

function normalize(value) {
  return String(value || "").trim();
}

function getDaysFromPaymentLink(paymentLink) {
  const link = normalize(paymentLink);

  if (link && link === normalize(paymentLink30)) return 30;
  if (link && link === normalize(paymentLink90)) return 90;
  if (link && link === normalize(paymentLink365)) return 365;

  return null;
}

async function asaasGet(path) {
  const response = await fetch(`${asaasBaseUrl}${path}`, {
    headers: {
      access_token: asaasApiKey,
      "User-Agent": "Confeasy/1.0",
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.errors?.[0]?.description ||
        data?.message ||
        "Erro ao consultar a API do Asaas."
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

async function reserveEvent(supabase, eventId) {
  const { error } = await supabase
    .from("asaas_webhook_events")
    .insert({
      event_id: eventId,
    });

  if (!error) return true;

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
    .from("asaas_webhook_events")
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

  if (
    !webhookToken ||
    req.headers["asaas-access-token"] !== webhookToken
  ) {
    return json(res, 401, {
      error: "Não autorizado.",
    });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(res, 500, {
      error: "Configuração do Supabase ausente.",
    });
  }

  if (!asaasApiKey || !adminSecret) {
    return json(res, 500, {
      error: "Configuração do Asaas/Confeasy ausente.",
    });
  }

  const event = req.body || {};
  const eventType = normalize(event.event);
  const payment = event.payment || {};
  const eventId = normalize(event.id);
  const paymentId = normalize(payment.id);

  if (!eventId) {
    return json(res, 400, {
      error: "Evento sem id.",
    });
  }

  // O acesso só é liberado quando o pagamento foi efetivamente recebido.
  if (eventType !== "PAYMENT_RECEIVED") {
    return json(res, 200, {
      ok: true,
      ignored: true,
      event: eventType || null,
    });
  }

  if (!paymentId) {
    return json(res, 400, {
      error: "Evento PAYMENT_RECEIVED sem payment.id.",
    });
  }

  const days = getDaysFromPaymentLink(payment.paymentLink);

  if (!days) {
    console.error(
      "Link de pagamento não reconhecido:",
      payment.paymentLink
    );

    return json(res, 400, {
      error: "Link de pagamento não reconhecido.",
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
    reserved = await reserveEvent(supabase, eventId);

    if (!reserved) {
      return json(res, 200, {
        ok: true,
        duplicate: true,
        event_id: eventId,
      });
    }

    const customerId = normalize(payment.customer);

    if (!customerId) {
      throw new Error("Pagamento sem customer.");
    }

    const customer = await asaasGet(
      `/customers/${encodeURIComponent(customerId)}`
    );

    const email = normalize(customer.email).toLowerCase();

    if (!email || !email.includes("@")) {
      throw new Error("Cliente Asaas sem e-mail válido.");
    }

    const response = await fetch(
      "https://confeasy.vercel.app/api/provision-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-confeasy-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          email,
          full_name: normalize(customer.name),
          business_name: "Confeasy",
          days,
        }),
      }
    );

    const provisionResult = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        provisionResult?.detail ||
          provisionResult?.error ||
          "Falha ao provisionar o usuário."
      );
    }

    console.log("Pagamento processado:", {
      eventId,
      paymentId,
      email,
      days,
      created: provisionResult.created,
    });

    return json(res, 200, {
      ok: true,
      event_id: eventId,
      payment_id: paymentId,
      email,
      days_added: days,
      created: Boolean(provisionResult.created),
    });
  } catch (error) {
    if (reserved) {
      await releaseEvent(supabase, eventId);
    }

    console.error("Confeasy Asaas webhook error:", error);

    return json(res, 500, {
      error: "Não foi possível processar o webhook.",
      detail: error?.message || "Erro desconhecido.",
    });
  }
}
