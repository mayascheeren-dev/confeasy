import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSecret = process.env.CONFEASY_ADMIN_SECRET;

function json(res, status, body) {
  res.status(status).json(body);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function generatePassword(length = 16) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";

  while (password.length < length) {
    const byte = crypto.randomBytes(1)[0];

    if (byte < 250) {
      password += alphabet[byte % alphabet.length];
    }
  }

  return password;
}

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function maxDate(a, b) {
  return a >= b ? a : b;
}

async function findUserByEmail(supabaseAdmin, email) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) throw error;

    const user = data.users.find(
      (item) => normalizeEmail(item.email) === email
    );

    if (user) return user;

    if (data.users.length < perPage) return null;

    page += 1;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return json(res, 405, {
      error: "Método não permitido.",
    });
  }

  if (
    !adminSecret ||
    req.headers["x-confeasy-admin-secret"] !== adminSecret
  ) {
    return json(res, 401, {
      error: "Não autorizado.",
    });
  }

  if (!supabaseUrl || !supabaseSecretKey) {
    return json(res, 500, {
      error:
        "Configuração do Supabase ausente. Defina VITE_SUPABASE_URL e SUPABASE_SECRET_KEY.",
    });
  }

  const email = normalizeEmail(req.body?.email);

  const fullName = String(
    req.body?.full_name || ""
  ).trim();

  const businessName =
    String(
      req.body?.business_name ||
        "Minha Confeitaria"
    ).trim() || "Minha Confeitaria";

  const days = Number(req.body?.days);

  if (!email || !email.includes("@")) {
    return json(res, 400, {
      error: "E-mail inválido.",
    });
  }

  if (
    !Number.isInteger(days) ||
    ![30, 90, 365].includes(days)
  ) {
    return json(res, 400, {
      error: "days deve ser 30, 90 ou 365.",
    });
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const existingUser =
      await findUserByEmail(
        supabaseAdmin,
        email
      );

    const today = isoDateToday();

    /*
     * NOVO CLIENTE
     */
    if (!existingUser) {
      const password =
        generatePassword();

      const {
        data: created,
        error: createError,
      } =
        await supabaseAdmin.auth.admin.createUser(
          {
            email,
            password,
            email_confirm: true,

            user_metadata: {
              full_name: fullName,
              business_name:
                businessName,
            },
          }
        );

      if (createError) {
        throw createError;
      }

      const userId =
        created.user.id;

      const expiresAt =
        addDaysToDate(
          today,
          days
        );

      const {
        error: profileError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          email,
          full_name: fullName,
          business_name:
            businessName,
          active: true,
          expires_at:
            expiresAt,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      return json(res, 201, {
        ok: true,
        created: true,
        user_id: userId,
        email,
        password,
        expires_at:
          expiresAt,
        days_added: days,
      });
    }

    /*
     * CLIENTE EXISTENTE
     * Apenas estende o acesso.
     */
    const userId =
      existingUser.id;

    const {
      data: profile,
      error: profileReadError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "expires_at, full_name, business_name"
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileReadError) {
      throw profileReadError;
    }

    const currentExpiry =
      profile?.expires_at ||
      today;

    const baseDate =
      maxDate(
        currentExpiry,
        today
      );

    const expiresAt =
      addDaysToDate(
        baseDate,
        days
      );

    const {
      error: profileUpdateError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        email,
        full_name:
          fullName ||
          profile?.full_name ||
          "",
        business_name:
          businessName ||
          profile?.business_name ||
          "Minha Confeitaria",
        active: true,
        expires_at:
          expiresAt,
      })
      .eq("id", userId);

    if (profileUpdateError) {
      throw profileUpdateError;
    }

    return json(res, 200, {
      ok: true,
      created: false,
      user_id: userId,
      email,
      expires_at:
        expiresAt,
      days_added: days,

      /*
       * Não alteramos a senha
       * de um cliente existente.
       */
      password: null,
    });
  } catch (error) {
    console.error(
      "Confeasy provision-user error:",
      error
    );

    return json(res, 500, {
      error:
        "Não foi possível provisionar o usuário.",
      detail:
        error?.message ||
        "Erro desconhecido.",
    });
  }
}
