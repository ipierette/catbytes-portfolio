# Changelog
Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato segue as recomendações de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e este projeto adere ao [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2025-08-16
### Adicionado
- **ClampLines** para limitar o texto dos anúncios e evitar quebra em telas pequenas.
- **Badge reformulado do Score da IA** em escala de 1-10 com estilo moderno e responsivo.
- **Descrição global** no topo da listagem explicando o significado do score.
- **Tooltip custom interativo** para auxiliar interpretação do Score da IA.
- **Animação ripple** nos badges para dar feedback visual ao clique.

### Alterado
- Layout dos anúncios otimizado para UX mais profissional.
- Responsividade refinada para telas muito pequenas.

### Removido
- Ícone de interrogação nos badges (substituído por descrição global mais clara).

### BREAKING CHANGE
- Sistema anterior de badges foi substituído: agora o Score da IA é exibido apenas na escala de **1 a 10**, com tooltip explicativo e interação visual.
