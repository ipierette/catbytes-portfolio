// js/modules/identifyCat.js

export function initIdentifyCat() {
  const form = document.querySelector('#identify-cat form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Identificador de gatinhos: em breve!');
  });
}
