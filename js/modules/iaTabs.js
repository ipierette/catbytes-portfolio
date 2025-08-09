// js/modules/iaTabs.js
// Recria a lógica das abas da seção "IA Felina"

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => root.querySelectorAll(sel);

export function initIATabs() {
  const tabButtons  = $$('.tab-button');
  const tabContents = $$('.tab-content');

  if (!tabButtons.length || !tabContents.length) return;

  const activateTab = (tabId) => {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active-tab', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    tabContents.forEach((content) => {
      const isActive = content.id === tabId;
      content.classList.toggle('hidden', !isActive);
      content.classList.toggle('active-content', isActive);
    });
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    // acessibilidade via teclado
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(btn.dataset.tab);
      }
    });
  });

  // Ativa a primeira aba visível como padrão (ou uma via hash no URL)
  const hash = location.hash?.replace('#', '');
  const targetFromHash = hash && $(`.tab-button[data-tab="${hash}"]`) ? hash : null;
  const firstBtn = tabButtons[0];
  activateTab(targetFromHash || firstBtn?.dataset.tab);
}
