// ── BANCO DE SENHAS ──────────────────────────────────
// Formato: { senha: 'XXXX', expira: 'AAAA-MM-DD', nome: 'Ana' }
const SENHAS = [
  { senha: 'confeasy-ana2025',     expira: '2026-09-29', nome: 'Ana Silva' },
  { senha: 'confeasy-carol88',     expira: '2026-10-15', nome: 'Carol M.' },
  { senha: 'confeasy-julia2025',   expira: '2027-01-10', nome: 'Julia R.' },
  // ← adicione uma linha por venda
];

// Lógica de verificação
function verificarSenha(pwd) {
  const hoje = new Date().toISOString().split('T')[0];
  const encontrada = SENHAS.find(s => s.senha === pwd);
  if (!encontrada) return { ok: false, msg: 'Senha incorreta.' };
  if (hoje > encontrada.expira) return { ok: false, msg: 'Acesso expirado. Renove seu plano.' };
  return { ok: true, nome: encontrada.nome };
}
