# Changelog
Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [1.2.0] - 2025-08-10
### Added
- Ícones com suporte a **modo claro/escuro** (gato, livro, lâmpada, coração, robô, caixa de papelão).
- Escala de amarelo personalizada para a lâmpada (modo claro/escuro).
- Melhorias visuais nos títulos principais e seções.

### Changed
- Ajuste de cores nos títulos e links para garantir melhor contraste em ambos os temas.
- Estilização consistente em toda a página.

---

## [1.3.0] - 2025-08-20
### Added
- **Contador de caracteres dinâmico** no campo de mensagem (2000 máx.), exibido ao lado do label "Mensagem:".
- **Texto auxiliar de preenchimento** abaixo do label de mensagem, que desaparece conforme o usuário digita.

### Changed
- **Layout do formulário de contato**: reposicionamento do contador de caracteres para a linha do label, melhorando legibilidade e alinhamento.
- **Estilo dos placeholders**: placeholder "Sua mensagem..." agora some ao digitar, evitando sobreposição com o conteúdo real.

### Fixed
- **Bloqueio de envio vazio ou apenas com espaços** no campo de mensagem.
- **Validação de e-mails inválidos** via Netlify Functions:
  - Checagem de formato e limpeza de caracteres invisíveis.
  - Bloqueio de domínios descartáveis conhecidos.
  - Correção automática para typos comuns (`gmil.com` → `gmail.com`, `gamil.com` → `gmail.com`, etc.).
  - Sugestão de provedores válidos com base em distância de Levenshtein (fuzzy matching).
  - Verificação de registros MX para domínios inexistentes.

### Security
- Reforço contra **envio automatizado/bots** com honeypot invisível (`_gotcha`).
- Prevenção de envio com e-mail malformado ou domínio inválido, reduzindo risco de spam e tentativas de XSS.
