# 🚀 Deploy no Vercel - CatBytes Portfolio

## ✅ PRÉ-REQUISITOS

O projeto **já está 100% configurado** para deploy no Vercel! Não precisa de ajustes adicionais.

### Por que Vercel é ideal para este projeto:
- ✅ Suporte nativo ao Next.js 15
- ✅ API Routes viram Serverless Functions automaticamente
- ✅ Edge Network global (CDN)
- ✅ Deploy automático via Git
- ✅ Preview deployments para cada commit
- ✅ Melhor performance que Netlify para Next.js

---

## 📋 PASSO A PASSO

### 1. Fazer Push da Branch

```bash
# Verificar se está tudo commitado
git status

# Se houver mudanças não commitadas
git add .
git commit -m "feat: preparar projeto para deploy no Vercel"

# Push da branch
git push -u origin claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
```

### 2. Acessar Vercel Dashboard

1. Acesse: https://vercel.com/
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**

### 3. Importar o Repositório

1. Selecione **"Import Git Repository"**
2. Procure por: `ipierette/catbytes-portfolio`
3. Clique em **"Import"**

### 4. Configurar o Projeto

**Framework Preset:** Next.js (detectado automaticamente)

**Build Settings:**
- Build Command: `npm run build` (já detectado)
- Output Directory: `.next` (já detectado)
- Install Command: `npm install` (já detectado)

**Root Directory:** `.` (raiz do projeto)

**Branch:** `claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu`

### 5. Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `GEMINI_API_KEY` | `sua_chave_aqui` | Chave da API do Google Gemini |
| `SERPAPI_KEY` | `sua_chave_aqui` | Chave da API do SerpAPI |

**IMPORTANTE:**
- Marque as variáveis para todos os ambientes: Production, Preview, Development
- Não compartilhe essas chaves publicamente

### 6. Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (leva ~2-3 minutos)
3. 🎉 Seu site estará no ar!

---

## 🌐 APÓS O DEPLOY

### URL do Projeto

Seu projeto estará disponível em:
- **Production:** `https://catbytes-portfolio.vercel.app` (ou domínio customizado)
- **Preview:** `https://catbytes-portfolio-git-<branch>.vercel.app`

### Verificar Funcionalidades

Teste cada funcionalidade de IA:

1. **🏠 Adotar Gato** (`/pt-BR#ai-features`)
   - Testar busca: idade, cor, localização
   - Verificar se retorna anúncios com scores
   - Verificar cache (⚡ no segundo request)

2. **📸 Identificar Gato** (`/pt-BR#ai-features`)
   - Upload de foto de gato
   - Verificar análise: idade, raças, personalidade
   - Verificar cache (⚡ na mesma imagem)

3. **❤️ Doar Gato** (`/pt-BR#ai-features`)
   - Descrever gato para doação
   - Verificar anúncio gerado: título, texto, hashtags, plano
   - Verificar cache (⚡ na mesma descrição)

### Monitorar Performance

1. Acesse **"Analytics"** no dashboard da Vercel
2. Verifique métricas:
   - Core Web Vitals (LCP, FID, CLS)
   - Tempo de resposta das API Routes
   - Taxa de erro

---

## 🔧 CONFIGURAÇÕES OPCIONAIS

### Domínio Customizado

1. Vá em **"Settings" → "Domains"**
2. Adicione seu domínio: `catbytes.com.br`
3. Configure DNS conforme instruções

### Variáveis de Ambiente Adicionais

Se quiser adicionar mais configurações:

```bash
# Opcional: modelo do Gemini
GEMINI_MODEL=gemini-2.5-flash

# Opcional: ambiente
NODE_ENV=production
```

### Build & Development Settings

Já configurado no `vercel.json`:
- **Region:** São Paulo (gru1) - menor latência no Brasil
- **Framework:** Next.js
- **Auto-deploy:** Ativado

---

## 🐛 TROUBLESHOOTING

### Build falha com erro TypeScript

**Solução:** Já corrigimos todos os erros de tipo! Se aparecer novo erro:
```bash
# Rodar build localmente para verificar
npm run build
```

### API Routes retornam 500

**Causas possíveis:**
1. ❌ Variáveis de ambiente não configuradas
2. ❌ Chave API inválida ou sem créditos

**Solução:**
1. Verificar variáveis em **"Settings" → "Environment Variables"**
2. Testar chaves API manualmente
3. Verificar logs em **"Deployment" → "Function Logs"**

### Redirect não funciona

**Solução:** O middleware do `next-intl` já faz o redirect de `/` para `/pt-BR` automaticamente.

Se não funcionar:
1. Verificar arquivo `middleware.ts`
2. Verificar `i18n/routing.ts` (defaultLocale deve ser 'pt-BR')

### Cache não funciona

**Nota:** O cache atual é **em memória** (Map).

**Limitações:**
- Cache é perdido entre deploys
- Cada serverless function tem seu próprio cache
- Para cache persistente, usar Vercel KV ou Redis

**Solução futura:**
```bash
# Instalar Vercel KV
npm install @vercel/kv

# Atualizar API Routes para usar KV em vez de Map
```

---

## 📊 COMPARAÇÃO: VERCEL vs NETLIFY

| Recurso | Vercel | Netlify |
|---------|--------|---------|
| **Next.js Support** | ✅ Nativo (criadores) | ⚠️ Via plugin |
| **API Routes** | ✅ Serverless Functions | ✅ Netlify Functions |
| **Edge Network** | ✅ Global | ✅ Global |
| **Build Time** | ✅ Mais rápido | ⚠️ Mais lento |
| **Cold Start** | ✅ <100ms | ⚠️ ~300ms |
| **Preview Deploys** | ✅ Automático | ✅ Automático |
| **Analytics** | ✅ Grátis (Web Vitals) | ⚠️ Pago |
| **Free Tier** | ✅ 100GB bandwidth | ✅ 100GB bandwidth |
| **Região BR** | ✅ São Paulo (gru1) | ❌ Não tem |

**Recomendação:** Use Vercel para melhor performance no Brasil! 🇧🇷

---

## ✅ CHECKLIST FINAL

Antes de fazer deploy:

- [x] ✅ Código commitado e pushed
- [x] ✅ Branch correta selecionada
- [ ] ⚠️ Variáveis de ambiente configuradas
- [ ] ⚠️ Build testado localmente (`npm run build`)
- [ ] ⚠️ Chaves API válidas e com créditos

Após deploy:

- [ ] ⚠️ Testar todas as funcionalidades AI
- [ ] ⚠️ Verificar i18n (PT-BR e EN-US)
- [ ] ⚠️ Verificar responsividade (mobile/desktop)
- [ ] ⚠️ Verificar Core Web Vitals
- [ ] ⚠️ Configurar domínio customizado (opcional)

---

## 🎯 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

1. **Performance:**
   - [ ] Implementar Vercel KV para cache persistente
   - [ ] Implementar rate limiting com Upstash
   - [ ] Adicionar analytics de uso das funcionalidades AI

2. **Features:**
   - [ ] Adicionar mais funcionalidades AI
   - [ ] Implementar sistema de favoritos
   - [ ] Adicionar compartilhamento social

3. **SEO:**
   - [ ] Configurar Google Search Console
   - [ ] Adicionar sitemap.xml ao Google
   - [ ] Verificar Open Graph tags

---

## 📚 RECURSOS

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Última atualização:** 2025-11-01
**Autor:** Claude Code + @ipierette
**Status:** ✅ Pronto para deploy
