# 🚀 Como Fazer Deploy de Branch Específica no Vercel

## ⚠️ PROBLEMA

O Vercel **não deixa escolher a branch** durante a importação do projeto. Ele sempre importa a branch `main` primeiro.

## ✅ SOLUÇÃO: Mudar a Branch DEPOIS da Importação

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ IMPORTAR O PROJETO (vai usar main temporariamente)

1. Acesse: https://vercel.com/
2. Clique em **"Add New Project"**
3. Selecione: `ipierette/catbytes-portfolio`
4. Clique em **"Import"**
5. **IMPORTANTE:** Mude o nome do projeto:
   ```
   Project Name: catbytes-portfolio-new
   ```
   (Isso evita conflito com o projeto existente)

6. **Adicione as variáveis de ambiente:**
   - `GEMINI_API_KEY` = sua_chave
   - `SERPAPI_KEY` = sua_chave

7. Clique em **"Deploy"**

**Neste ponto:** O Vercel vai fazer deploy da branch `main` (site antigo). Não se preocupe, vamos mudar agora!

---

### 2️⃣ MUDAR A PRODUCTION BRANCH

Assim que o deploy terminar:

1. No dashboard do projeto `catbytes-portfolio-new`, clique em **"Settings"** (no topo)

2. No menu lateral, clique em **"Git"**

3. Procure a seção: **"Production Branch"**

4. Você verá:
   ```
   Production Branch: main
   ```

5. Clique no **ícone de lápis** (editar) ou campo de texto

6. Mude para sua branch:
   ```
   claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
   ```

7. Clique em **"Save"**

---

### 3️⃣ FAZER REDEPLOY DA BRANCH CORRETA

1. Volte para a aba **"Deployments"** (no topo)

2. Clique nos **3 pontinhos** (⋯) do último deployment

3. Clique em **"Redeploy"**

4. Confirme

5. Aguarde ~2-3 minutos

**Pronto!** Agora o site novo (branch separada) está no ar! 🎉

---

## 🎯 RESULTADO FINAL

Você terá:

| Projeto | Branch | URL |
|---------|--------|-----|
| `catbytes-portfolio` (antigo) | `main` | `https://catbytes-portfolio.vercel.app` |
| `catbytes-portfolio-new` (novo) | `claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu` | `https://catbytes-portfolio-new.vercel.app` |

---

## 🔄 ALTERNATIVA: Deploy via CLI (Mais Direto)

Se preferir fazer tudo em um comando:

### Instalar Vercel CLI:

```bash
npm install -g vercel
```

### Fazer Login:

```bash
vercel login
```

Siga as instruções no terminal (vai abrir no navegador).

### Deploy da Branch:

```bash
# Certifique-se de estar na branch correta
git checkout claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu

# Deploy
vercel --prod
```

### Responda as perguntas:

```
? Set up and deploy "~/catbytes-portfolio"? [Y/n] Y
? Which scope do you want to deploy to? <seu-usuario>
? Link to existing project? [y/N] N
? What's your project's name? catbytes-portfolio-new
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

### Adicionar Variáveis de Ambiente:

```bash
# Adicionar GEMINI_API_KEY
vercel env add GEMINI_API_KEY production
# Cole sua chave quando solicitado

# Adicionar SERPAPI_KEY
vercel env add SERPAPI_KEY production
# Cole sua chave quando solicitado
```

### Fazer Redeploy com as Variáveis:

```bash
vercel --prod
```

**Pronto!** A URL será exibida no terminal.

---

## 🎯 QUAL OPÇÃO ESCOLHER?

| Método | Vantagens | Desvantagens |
|--------|-----------|--------------|
| **UI (Dashboard)** | ✅ Visual e fácil<br>✅ Não precisa instalar nada | ⚠️ Precisa mudar branch depois |
| **CLI (Terminal)** | ✅ Deploy direto da branch<br>✅ Automatizável | ⚠️ Precisa instalar CLI<br>⚠️ Linha de comando |

---

## 📸 GUIA VISUAL (UI)

### Passo 2.3 - Onde encontrar "Production Branch":

```
Settings (topo)
  └─ Git (menu lateral)
      └─ Production Branch
          └─ [main] ← Clicar aqui para editar
          └─ Mudar para: claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
          └─ Save
```

### Passo 3.2 - Redeploy:

```
Deployments (topo)
  └─ Último deployment
      └─ ⋯ (3 pontinhos)
          └─ Redeploy
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Branch not found"

**Causa:** A branch não existe no repositório remoto.

**Solução:**
```bash
# Verificar se existe remotamente
git ls-remote --heads origin

# Se não aparecer, fazer push
git push -u origin claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
```

### Erro: "Build failed" após redeploy

**Causa:** Variáveis de ambiente não configuradas.

**Solução:**
1. Vá em "Settings" → "Environment Variables"
2. Verifique se `GEMINI_API_KEY` e `SERPAPI_KEY` estão lá
3. Se não, adicione
4. Redeploy novamente

### Site mostra código antigo após redeploy

**Causa:** Cache do navegador.

**Solução:**
1. Limpe o cache (Ctrl+Shift+R)
2. Ou abra em modo anônimo
3. Ou verifique se a Production Branch foi salva corretamente

---

## 📋 CHECKLIST COMPLETO

### Via Dashboard (UI):

- [ ] 1. Acessar https://vercel.com/
- [ ] 2. Add New Project
- [ ] 3. Importar `ipierette/catbytes-portfolio`
- [ ] 4. Mudar nome para `catbytes-portfolio-new`
- [ ] 5. Adicionar `GEMINI_API_KEY`
- [ ] 6. Adicionar `SERPAPI_KEY`
- [ ] 7. Deploy (vai usar main - ok por enquanto)
- [ ] 8. Aguardar build terminar
- [ ] 9. Ir em Settings → Git
- [ ] 10. Mudar Production Branch para `claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu`
- [ ] 11. Save
- [ ] 12. Ir em Deployments
- [ ] 13. ⋯ → Redeploy no último deployment
- [ ] 14. Aguardar novo build (~2-3 min)
- [ ] 15. Testar URL do novo site
- [ ] 16. Verificar funcionalidades AI

### Via CLI:

- [ ] 1. Instalar: `npm install -g vercel`
- [ ] 2. Login: `vercel login`
- [ ] 3. Checkout: `git checkout claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu`
- [ ] 4. Deploy: `vercel --prod`
- [ ] 5. Responder perguntas (nome: catbytes-portfolio-new)
- [ ] 6. Adicionar env: `vercel env add GEMINI_API_KEY production`
- [ ] 7. Adicionar env: `vercel env add SERPAPI_KEY production`
- [ ] 8. Redeploy: `vercel --prod`
- [ ] 9. Copiar URL do terminal
- [ ] 10. Testar site

---

## 🎉 RESUMO

**Método Dashboard:**
1. Importa projeto (usa main)
2. Muda Production Branch nas Settings
3. Redeploy

**Método CLI:**
1. `vercel --prod` já faz tudo de uma vez

**Ambos funcionam perfeitamente!** Escolha o que preferir.

---

**Última atualização:** 2025-11-01
**Recomendação:** Dashboard UI (mais visual) ou CLI (mais rápido)
