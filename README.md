# Isca Perguntas — Manda tua pergunta

Página de captura de perguntas do público para o canal **Bruno Medeiros**. A pessoa
informa nome, email, cidade e pergunta — e as perguntas entram na fila pra serem
respondidas em vídeo.

## Funcionalidades

- **Landing** (`/`) com formulário de 4 campos + contador de caracteres
- **`POST /api/pergunta`** — validação Zod; grava no Supabase (email **não** é único:
  a mesma pessoa pode mandar várias perguntas)
- **Página de obrigado** — "sua pergunta pode ser respondida no próximo vídeo"
- **Design dark** self-hosted (Space Grotesk / Inter / JetBrains Mono)
- **RLS ativado** — anon/authenticated não leem a tabela; só `service_role` (server)
- SEO born-in (title, description, canonical, JSON-LD) + a11y (labels, `aria-invalid`,
  `aria-busy`, skip-link, reduced-motion)

## Stack

| Camada | Escolha |
|---|---|
| App | Astro 5 (SSR) + `@astrojs/cloudflare` |
| Deploy | Cloudflare Pages (Git integration — push = deploy) |
| Banco | Supabase (tabela `questions`) |
| Env | leitura via `locals.runtime.env` (middleware) — compatível com Pages |

## Deploy no Cloudflare Pages

1. Create > Pages > Connect to Git > este repo
2. Framework preset `Astro` · Build command `npm run build` · Output `dist` · Root vazio · Deploy command **vazio**
3. **Environment variables** (Settings > Environment variables > Production):

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

4. Deploy → testar: `/` → enviar pergunta → `/obrigado`

## Estrutura

```
src/
├── pages/
│   ├── index.astro          # formulário
│   ├── obrigado.astro       # confirmação
│   └── api/pergunta.ts      # POST com zod
├── lib/
│   ├── supabase.ts          # service_role lazy
│   └── runtime-env.ts       # vars de runtime CF (não import.meta.env)
├── middleware.ts            # captura locals.runtime.env
└── supabase/migrations/     # tabela questions + RLS
```

## Testes

```bash
npm install
npm test        # 7/7 (validação, gravação, 500 sem vazar detalhe)
npm run build
```

## Pendência de produto

- Entrega das perguntas pro Bruno (email/painel/webhook) — **a definir** (anotado no plano mestre)

Feito para **Bruno Medeiros** | Operação 8Links
