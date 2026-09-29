# Confeasy — base comercial para GitHub + Vercel + Supabase

Esta versão foi reconstruída do zero e não depende do código do Claude.

## Arquitetura
- Frontend: React + Vite
- Auth/banco: Supabase
- Hospedagem: Vercel
- Login: e-mail + senha individual
- Validade: `profiles.expires_at`
- Provisionamento de cliente: `api/provision-user.js`

## IMPORTANTE SOBRE SENHAS
A senha individual **não deve ficar escrita no `App.jsx`** e não deve existir um banco de senhas hardcoded no frontend. O `App.jsx` apenas executa o login. O Supabase Auth armazena/verifica a credencial, e o endpoint protegido da Vercel cria cada novo usuário e gera uma senha aleatória.

## 1. Supabase
1. Crie um projeto no Supabase.
2. Abra SQL Editor.
3. Execute `supabase/schema.sql`.
4. Em Project Settings > API, copie a URL e a Publishable Key.

## 2. GitHub
Suba todos os arquivos mantendo a estrutura.

## 3. Vercel
Importe o repositório.
Configure:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CONFEASY_ADMIN_SECRET`

NUNCA coloque `SUPABASE_SERVICE_ROLE_KEY` em uma variável `VITE_*`.

## 4. Primeiro cliente
Depois do deploy, você poderá chamar a função protegida:

POST `/api/provision-user`
Authorization: `Bearer SEU_CONFEASY_ADMIN_SECRET`
Content-Type: `application/json`

Body:
```json
{
  "email":"cliente@email.com",
  "full_name":"Nome da Cliente",
  "business_name":"Nome da Confeitaria",
  "days":365
}
```

A função cria o usuário, gera uma senha aleatória e devolve a senha uma única vez na resposta. O passo seguinte é conectar isso ao webhook do pagamento e ao e-mail transacional.

## 5. Login
A cliente entra com o e-mail e a senha recebidos. O app consulta o perfil e bloqueia o acesso se `active=false` ou se `expires_at` estiver no passado.

## 6. Próxima etapa comercial
Integrar o gateway de pagamento (ex.: Asaas) ao webhook que chama o provisionamento. Assim o fluxo pode ser:

compra aprovada -> criar conta -> gerar senha -> enviar e-mail -> liberar 365 dias.

## Observação
O projeto está preparado para essa arquitetura, mas pagamento e envio automático de e-mail ainda não estão ligados nesta etapa.
