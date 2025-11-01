# 🔧 Lista de Correções Prioritárias - CatBytes 2.0

## ✅ Análise Completa do Site Antigo (Main Branch)

### 🐱 Analogias Felinas Originais

1. **Títulos e Textos:**
   - "Bem-vindo ao Mundo CatBytes"
   - "Conheça meus projetos miau"
   - "IA Felina" (menu)
   - "Feito com ❤️ e muito 🐱"

2. **Níveis de Miado (Skills):**
   - 🐱 **Ronronado Iniciante (Básico)**: 1%-40%
   - 😺 **Miado Intermediário (Mediano)**: 41%-70%
   - 😸 **Gato Mestre (Avançado)**: 71%-99%
   - 😻 **Miaucódigo Mestre (Especialista)**: 100%

3. **Ícones Font Awesome usados:**
   - `fas fa-paw` (patinha)
   - `fas fa-cat` (gato)
   - `fas fa-heart` (coração)
   - `fas fa-book` (livro para Skills)
   - `fas fa-arrow-up` (voltar ao topo)

### 🎨 Elementos Perdidos na Migração

1. **Hero:**
   - Particles.js (efeito de partículas no fundo)
   - Cat popup com typing effect
   - Tema claro/escuro dinâmico
   - Emojis nas palavras digitadas (REMOVER conforme pedido)

2. **Header:**
   - Logo desaparece no tema claro (precisa mudar para logo-desenvolvedora.png)
   - Links brancos somem em fundo branco

3. **Skills:**
   - Carrossel de skills com cards individuais
   - Explicação dos "Níveis de Miado"
   - Cada skill em card separado

4. **Footer:**
   - Versão do site
   - Informação de acessibilidade
   - Links sociais

5. **Curiosities:**
   - Imagem do Axel responsiva (agora está desproporcional)

---

## 🚀 CORREÇÕES PRIORITÁRIAS

### 1. ❌ CRÍTICO: Header no Tema Claro
**Problema:** Logo e links brancos desaparecem em fundo branco

**Solução:**
- Trocar logo para `logo-desenvolvedora.png` (colorida)
- Adicionar classe `text-gray-900 dark:text-white` nos links
- Adicionar `bg-white/90 dark:bg-gray-900/90` no header sticky

### 2. ❌ CRÍTICO: Imagem Axel Desproporcional
**Problema:** Imagem muito grande, não é responsiva

**Solução em `curiosities.tsx`:**
```tsx
<div className="relative w-full max-w-md mx-auto">
  <Image
    src="/images/axel-filhote.webp"
    alt="Axel filhote"
    width={400}
    height={400}
    className="rounded-lg object-cover"
  />
</div>
```

### 3. ❌ CRÍTICO: Favicon Não Aparece
**Solução:**
- Adicionar `favicon.ico` na raiz do `public/`
- Adicionar múltiplos tamanhos em `app/[locale]/layout.tsx`:
```tsx
icons: {
  icon: [
    { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/favicon.ico', sizes: 'any' }
  ],
  apple: [
    { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
  ]
}
```

### 4. ⚠️ IMPORTANTE: Hero sem Tema Claro/Escuro
**Solução em `hero.tsx`:**
- Adicionar classes: `bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900`
- Remover emojis das palavras digitadas no TypeAnimation
- Manter apenas texto simples

### 5. ⚠️ IMPORTANTE: Footer Não Profissional
**Criar `components/layout/footer.tsx`:**
```tsx
'use client'

import { useTranslations } from 'next-intl'
import { FaHeart, FaCat, FaLinkedin, FaGithub } from 'react-icons/fa'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © 2025 Izadora Pierette. {t('rights')}.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {t('madeWith')} <FaHeart className="inline text-red-500" /> {t('and')} <FaCat className="inline text-green-400" />
        </p>
        <p className="text-xs text-gray-500 mt-4">
          CatBytes v2.0 | {t('accessibility')}
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="https://linkedin.com/..." className="hover:text-purple-400">
            <FaLinkedin size={24} />
          </a>
          <a href="https://github.com/ipierette" className="hover:text-purple-400">
            <FaGithub size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}
```

**Adicionar traduções em `messages/pt-BR.json`:**
```json
"footer": {
  "rights": "Todos os direitos reservados",
  "madeWith": "Feito com",
  "and": "e muito",
  "accessibility": "Desenvolvido com foco em acessibilidade"
}
```

### 6. ⚠️ IMPORTANTE: Skills sem Cores e Ícones
**Refazer `skills.tsx` com cards coloridos:**
```tsx
const skills = [
  { name: 'React', level: 85, color: 'bg-blue-500', icon: <SiReact /> },
  { name: 'TypeScript', level: 80, color: 'bg-blue-600', icon: <SiTypescript /> },
  { name: 'Node.js', level: 75, color: 'bg-green-600', icon: <SiNodedotjs /> },
  // ... mais skills
]

return (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {skills.map((skill) => (
      <div key={skill.name} className={`${skill.color} p-6 rounded-lg text-white`}>
        <div className="text-4xl mb-2">{skill.icon}</div>
        <h3 className="font-bold">{skill.name}</h3>
        <p className="text-sm">{skill.level}%</p>
      </div>
    ))}
  </div>
)
```

### 7. 🐛 BUG: AdoptCat Erro na Avaliação
**Problema:** Erro ao avaliar anúncios

**Verificar em `app/api/adopt-cat/route.ts`:**
- Verificar se `getAIScore()` está funcionando
- Adicionar try/catch nos loops
- Verificar se `GEMINI_KEY` está definida

### 8. 🐛 BUG: IdentifyCat Modal Sumiu
**Problema:** Modal "como funciona" desapareceu

**Solução em `ai-features.tsx`:**
- Adicionar modal de explicação antes do form
- Usar `<dialog>` HTML5 ou componente modal

### 9. 🎨 UI: Remover Todos os Emojis
**Arquivos a modificar:**
- `hero.tsx` - remover emojis do TypeAnimation
- `about.tsx` - trocar emojis por React Icons
- `skills.tsx` - trocar emojis por React Icons
- `projects.tsx` - trocar emojis por React Icons
- `curiosities.tsx` - trocar emojis por React Icons
- `ai-features.tsx` - trocar emojis por React Icons

**Mapeamento de substituições:**
```tsx
🎯 → <FaTarget />
📚 → <FaBook />
💻 → <FaLaptop />
🚀 → <FaRocket />
🐱 → <FaCat />
❤️ → <FaHeart />
📧 → <FaEnvelope />
📱 → <FaMobile />
🏠 → <FaHome />
📸 → <FaCamera />
```

### 10. 🎨 UI: Galeria de Projetos
**Problema:** Não está boa

**Solução:**
- Usar grid em vez de carousel manual
- Cards com hover effects
- Thumbnails clicáveis
- Links externos visíveis

---

## 📋 ORDEM DE IMPLEMENTAÇÃO

1. ✅ Header (logo + tema claro)
2. ✅ Footer profissional
3. ✅ Curiosities (Axel responsivo)
4. ✅ Skills (cards coloridos com ícones)
5. ✅ Hero (remover emojis, adicionar tema)
6. ✅ Remover emojis de todas as seções
7. ✅ Projects (melhorar galeria)
8. ✅ Fix AdoptCat bug
9. ✅ Fix IdentifyCat modal
10. ✅ Favicon (múltiplos tamanhos)

---

## 🐱 TEXTO ORIGINAL DAS ANALOGIAS

Para referência ao implementar:

**Níveis de Miado:**
- **Ronronado Iniciante (Básico):** Conhecimento fundamental, capaz de realizar tarefas simples e aprender rapidamente, nível de aprendizagem entre 1%-40%

- **Miado Intermediário (Mediano):** Boa compreensão e capacidade de aplicar conceitos em projetos mais complexos, com alguma autonomia, nível de aprendizagem entre 41%-70%.

- **Gato Mestre (Avançado):** Sólida experiência, capaz de resolver problemas desafiadores e otimizar soluções, nível de aprendizagem entre 71%-99%.

- **Miaucódigo Mestre (Especialista):** Expertise na área, apto a liderar projetos, inovar e atuar como referência, nível de aprendizagem de 100%

**Frase do Footer:**
"Assim como um gato aprende e aprimora suas habilidades de caça e socialização, eu busco constantemente evoluir no mundo do desenvolvimento!"

---

**Status:** Documento de referência criado
**Próximo passo:** Implementar correções em ordem de prioridade
