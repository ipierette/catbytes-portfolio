# 🚀 Deploy de Branch Separada no Vercel

## 📌 SITUAÇÃO

Você quer:
- ✅ Manter o site antigo rodando na branch `main`
- ✅ Fazer deploy do novo site na branch `claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu`
- ✅ Ter duas URLs diferentes (uma para cada versão)

**Isso é TOTALMENTE possível no Vercel!** Aqui estão as 2 opções:

---

## 🎯 OPÇÃO 1: Criar Novo Projeto no Vercel (RECOMENDADO)

Esta é a forma mais fácil e te dá controle total.

### Passo a Passo:

1. **Acesse Vercel Dashboard**
   - Vá em: https://vercel.com/
   - Login com GitHub
   - Clique em **"Add New Project"**

2. **Importar o MESMO Repositório**
   - Selecione: `ipierette/catbytes-portfolio`
   - Clique em **"Import"**

3. **Configurar o Projeto com Nome Diferente**
   ```
   Project Name: catbytes-portfolio-new
   Framework: Next.js (detectado automaticamente)
   Root Directory: ./
   ```

4. **IMPORTANTE: Configurar a Branch de Produção**

   Na seção **"Build and Output Settings"**, clique em **"Git"** (ou role para baixo):

   ```
   Production Branch: claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
   ```

   ⚠️ **ATENÇÃO:** Por padrão, o Vercel usa `main`. Você DEVE mudar para sua branch!

5. **Adicionar Variáveis de Ambiente**

   Clique em **"Environment Variables"**:

   | Nome | Valor |
   |------|-------|
   | `GEMINI_API_KEY` | sua_chave_gemini |
   | `SERPAPI_KEY` | sua_chave_serpapi |

6. **Deploy!**
   - Clique em **"Deploy"**
   - Aguarde 2-3 minutos

### Resultado:

- 🌐 **Site Antigo (main):** `https://catbytes-portfolio.vercel.app`
- 🌐 **Site Novo (branch):** `https://catbytes-portfolio-new.vercel.app`

### Vantagens:
- ✅ Dois projetos independentes
- ✅ Controle total de cada um
- ✅ Pode testar o novo sem afetar o antigo
- ✅ Quando estiver pronto, pode fazer merge na main e deletar o projeto novo

---

## 🎯 OPÇÃO 2: Deploy via Vercel CLI

Esta opção usa linha de comando e deploy manual.

### Instalação:

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Fazer login
vercel login
```

### Deploy:

```bash
# Navegue até o diretório do projeto
cd /home/user/catbytes-portfolio

# Certifique-se de estar na branch correta
git checkout claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu

# Fazer deploy
vercel --prod

# Seguir as instruções:
# - Set up and deploy? Yes
# - Which scope? Seu usuário/organização
# - Link to existing project? No (para criar novo)
# - Project name? catbytes-portfolio-new
# - Directory? ./
# - Override settings? No
```

### Configurar Variáveis de Ambiente:

```bash
# Adicionar variáveis de ambiente
vercel env add GEMINI_API_KEY
# Cole sua chave quando solicitado

vercel env add SERPAPI_KEY
# Cole sua chave quando solicitado

# Re-deploy com as variáveis
vercel --prod
```

### Vantagens:
- ✅ Controle via CLI
- ✅ Deploy rápido
- ✅ Automatização futura via scripts

### Desvantagens:
- ⚠️ Precisa ter Node.js instalado localmente
- ⚠️ Mais complexo que a UI

---

## 🎯 OPÇÃO 3: Preview Deployment (Temporário)

Se você só quer testar rapidamente:

1. Vá no dashboard do projeto existente
2. Na aba **"Deployments"**
3. O Vercel automaticamente cria preview deployments para cada branch
4. Procure por: `claude-portfolio-professionalization-plan-...`
5. Clique para ver a URL de preview

**Exemplo de URL:**
```
https://catbytes-portfolio-git-claude-portfolio-prof-ipierette.vercel.app
```

### Limitações:
- ⚠️ URL longa e feia
- ⚠️ Não é considerada "produção"
- ⚠️ Pode expirar eventualmente

---

## 🏆 RECOMENDAÇÃO FINAL

**Use a OPÇÃO 1** (Novo Projeto no Vercel via UI)

**Por quê?**
- ✅ Mais fácil e visual
- ✅ Dois ambientes independentes
- ✅ URLs limpas e profissionais
- ✅ Controle total de cada versão
- ✅ Pode fazer testes sem medo

**Fluxo de Trabalho Ideal:**

```
1. Criar projeto "catbytes-portfolio-new" → branch nova
2. Testar tudo na URL nova
3. Quando estiver perfeito:
   - Fazer merge da branch → main
   - Deletar projeto "catbytes-portfolio-new"
   - Manter apenas "catbytes-portfolio" (agora com código novo)
```

---

## 📋 CHECKLIST - OPÇÃO 1 (Novo Projeto)

Siga esta ordem:

- [ ] 1. Acessar https://vercel.com/
- [ ] 2. Clicar em "Add New Project"
- [ ] 3. Selecionar repositório `ipierette/catbytes-portfolio`
- [ ] 4. Mudar "Project Name" para `catbytes-portfolio-new`
- [ ] 5. ⚠️ **IMPORTANTE:** Configurar Production Branch para `claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu`
- [ ] 6. Adicionar variável `GEMINI_API_KEY`
- [ ] 7. Adicionar variável `SERPAPI_KEY`
- [ ] 8. Marcar variáveis para: Production, Preview, Development
- [ ] 9. Clicar em "Deploy"
- [ ] 10. Aguardar build (~2-3 min)
- [ ] 11. Testar URL do site novo
- [ ] 12. Verificar funcionalidades AI

---

## 🐛 TROUBLESHOOTING

### Erro: "Production Branch not found"

**Causa:** A branch não está no repositório remoto.

**Solução:**
```bash
# Verificar se branch existe remotamente
git branch -r

# Se não aparecer, fazer push:
git push -u origin claude/portfolio-professionalization-plan-011CUfyfHSeKcJXgDvN2CQpu
```

### Erro: "Build failed - Environment variables"

**Causa:** Variáveis de ambiente não configuradas.

**Solução:**
1. Vá em "Settings" → "Environment Variables"
2. Adicione `GEMINI_API_KEY` e `SERPAPI_KEY`
3. Clique em "Redeploy" na última deployment

### Site não carrega / Error 404

**Causa:** Configuração incorreta da Production Branch.

**Solução:**
1. Vá em "Settings" → "Git"
2. Verifique "Production Branch"
3. Mude para sua branch completa
4. Faça redeploy

---

## 📚 RECURSOS

- [Vercel Git Integration](https://vercel.com/docs/concepts/git)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Production Branches](https://vercel.com/docs/concepts/git/branches)

---

**Última atualização:** 2025-11-01
**Recomendação:** OPÇÃO 1 (Novo Projeto via UI)
**Tempo estimado:** 5 minutos ⏱️
