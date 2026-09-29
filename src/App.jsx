// ── SENHAS COM VALIDADE ANUAL ────────────────────────
// Adicione uma linha por venda realizada
// Formato: { senha, expira: 'AAAA-MM-DD', nome }
const SENHAS = [
  { senha: "confeasy-teste2025", expira: "2026-09-29", nome: "Teste" },
  // { senha: "confeasy-ana2025", expira: "2026-10-01", nome: "Ana" },
  // { senha: "confeasy-carol88", expira: "2026-10-15", nome: "Carol" },
];

function verificarSenha(pwd) {
  const hoje = new Date().toISOString().split("T")[0];
  const found = SENHAS.find((s) => s.senha === pwd);
  if (!found) return { ok: false, msg: "Senha incorreta." };
  if (hoje > found.expira)
    return { ok: false, msg: "Acesso expirado. Renove seu plano 💛" };
  return { ok: true, nome: found.nome };
}

// Substitui a linha: if (pwd === PASSWORD) onLogin();
// Por:
// const res = verificarSenha(pwd);
// if (res.ok) onLogin(); else setErr(res.msg);
