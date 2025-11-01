# 🚀 GUIA DE DEPLOY NO NETLIFY (Next.js)

## 📋 PRÉ-REQUISITOS

- ✅ Conta no Netlify (https://app.netlify.com)
- ✅ Repositório no GitHub com o código
- ✅ Branch `claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu` pronta

---

## 🔧 PASSO 1: INSTALAR O PLUGIN NEXT.JS

### **Opção A: Via package.json (Recomendado)**

O plugin já está configurado no `netlify.toml`, mas você precisa garantir que o Netlify vai instalá-lo automaticamente.

**Não precisa fazer nada!** O Netlify detecta automaticamente o `[[plugins]]` no `netlify.toml` e instala o plugin.

### **Opção B: Via UI do Netlify (Manual)**

1. Acesse seu site no Netlify Dashboard
2. Vá em **Integrations** → **Plugins**
3. Procure por **"Next.js Runtime"**
4. Clique em **Install**

---

## 🌐 PASSO 2: CONFIGURAR O SITE NO NETLIFY

### **Método 1: Deploy Automático (GitHub)**

1. **Login no Netlify:**
   - Acesse https://app.netlify.com
   - Faça login com GitHub

2. **Novo Site:**
   - Clique em **"Add new site"** → **"Import an existing project"**
   - Escolha **GitHub**
   - Autorize o Netlify a acessar seus repositórios

3. **Selecione o Repositório:**
   - Procure por `ipierette/catbytes-portfolio`
   - Clique no repositório

4. **Configurações de Build:**
   ```
   Branch to deploy: claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
   Build command: npm run build
   Publish directory: .next
   ```

5. **Variáveis de Ambiente (se necessário):**
   - Clique em **"Advanced settings"**
   - Adicione:
     ```
     GOOGLE_GEMINI_API_KEY=sua-chave-aqui
     SERPAPI_KEY=sua-chave-aqui
     ```

6. **Deploy:**
   - Clique em **"Deploy site"**
   - Aguarde o build (3-5 minutos)

---

### **Método 2: Deploy via CLI**

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Inicializar (na pasta do projeto)
netlify init

# 4. Seguir o wizard:
# - Create & configure a new site
# - Choose team
# - Site name: catbytes-portfolio
# - Build command: npm run build
# - Publish directory: .next

# 5. Deploy
netlify deploy --prod
```

---

## ⚙️ PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

### **Via UI:**

1. Acesse seu site no Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Adicione:

```bash
NODE_VERSION=18
GOOGLE_GEMINI_API_KEY=sua-chave-aqui
SERPAPI_KEY=sua-chave-aqui
NEXT_PUBLIC_SITE_URL=https://catbytes.netlify.app
```

### **Via CLI:**

```bash
netlify env:set NODE_VERSION "18"
netlify env:set GOOGLE_GEMINI_API_KEY "sua-chave"
netlify env:set SERPAPI_KEY "sua-chave"
```

---

## 📝 PASSO 4: VERIFICAR netlify.toml

O arquivo `netlify.toml` já está configurado corretamente:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

✅ **Nada a fazer!** Já está configurado.

---

## 🔍 PASSO 5: VERIFICAR O BUILD

### **Logs do Build:**

1. Acesse **Deploys** no Netlify Dashboard
2. Clique no deploy mais recente
3. Veja os logs

### **Possíveis Erros:**

#### **Erro: "Plugin @netlify/plugin-nextjs not found"**

**Solução:**
```bash
# Adicione como devDependency
npm install -D @netlify/plugin-nextjs
git add package.json package-lock.json
git commit -m "fix: add netlify next.js plugin"
git push
```

#### **Erro: "Build failed: npm ERR!"**

**Solução:**
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build  # Teste local primeiro
```

#### **Erro: "Module not found"**

**Solução:**
```bash
# Verifique se todas as dependências estão em package.json
npm install
npm run build
```

---

## 🎨 PASSO 6: CONFIGURAR DOMÍNIO CUSTOMIZADO (Opcional)

### **Domínio Netlify Gratuito:**
- Seu site estará em: `https://seu-site-nome.netlify.app`

### **Domínio Customizado:**

1. **Comprar domínio** (se ainda não tiver)
   - Sugestão: Namecheap, Google Domains, Registro.br

2. **Adicionar no Netlify:**
   - **Domain settings** → **Add custom domain**
   - Digite: `catbytes.com`

3. **Configurar DNS:**
   ```
   Tipo: A
   Nome: @
   Valor: 75.2.60.5 (Netlify Load Balancer)

   Tipo: CNAME
   Nome: www
   Valor: seu-site.netlify.app
   ```

4. **Ativar HTTPS:**
   - Netlify faz isso automaticamente com Let's Encrypt
   - Aguarde 1-2 minutos

---

## 🚀 PASSO 7: DEPLOY CONTÍNUO

### **Automático:**

Agora, **toda vez que você fizer push** para a branch configurada, o Netlify vai:

1. ✅ Detectar o push
2. ✅ Rodar `npm install`
3. ✅ Rodar `npm run build`
4. ✅ Fazer deploy automaticamente

### **Preview Deploys:**

- Toda PR vai gerar um **preview deploy** automático
- URL: `https://deploy-preview-123--seu-site.netlify.app`

---

## 📊 PASSO 8: VERIFICAR PERFORMANCE

### **Lighthouse Score:**

```bash
# Instalar
npm install -g lighthouse

# Rodar
lighthouse https://seu-site.netlify.app --view
```

### **Netlify Analytics (Pago):**

- **Site settings** → **Analytics**
- $9/mês - mostra visitantes, pageviews, etc

### **Alternativa Gratuita - Plausible:**

```bash
# Adicionar script ao <head>
# app/[locale]/layout.tsx
<script defer data-domain="catbytes.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🔧 TROUBLESHOOTING

### **Build está lento**

**Solução:** Ativar cache de build

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.processing]
  skip_processing = false
```

### **Imagens não carregam**

**Solução:** Verificar paths

```tsx
// Usar path absoluto
<Image src="/images/foto.jpg" ... />

// NÃO usar path relativo
<Image src="./images/foto.jpg" ... />
```

### **i18n não funciona**

**Solução:** Verificar middleware

```bash
# Certifique-se que middleware.ts está na raiz do projeto
ls -la middleware.ts
```

### **Dark mode não funciona no primeiro load**

**Solução:** Já implementado! O `ThemeProvider` tem `suppressHydrationWarning`

---

## ✅ CHECKLIST FINAL

Antes do deploy:

- [ ] `npm install` rodou sem erros
- [ ] `npm run build` funciona localmente
- [ ] Variáveis de ambiente configuradas
- [ ] `netlify.toml` configurado
- [ ] `.nvmrc` com Node 18
- [ ] Imagens estão em `/public/images/`
- [ ] Teste em localhost:3000/pt-BR e /en-US

---

## 🎉 PRONTO!

Seu portfólio Next.js está no ar! 🚀

**URL:** https://seu-site.netlify.app

---

## 📚 RECURSOS ÚTEIS

- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Netlify Plugin Next.js](https://github.com/netlify/netlify-plugin-nextjs)

---

## 🆘 PRECISA DE AJUDA?

1. **Netlify Support:** https://answers.netlify.com/
2. **Next.js Discord:** https://nextjs.org/discord
3. **Documentação:** Veja `NEXT_SETUP.md`

---

**🐱 Deploy com sucesso! | CatBytes**
