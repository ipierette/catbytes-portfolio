// js/main.js
import { initUI } from './modules/ui.js';
import { initScrollAnimations, initCatPopup } from './modules/animations.js';
import { initProjectsGallery } from './modules/projectsGallery.js';
import { initSkillsCarousel } from './modules/skillsCarousel.js';
import { initContactForm } from './modules/contactForm.js';
import { initIATabs } from './modules/iaTabs.js';
import { initAdoptCat } from './modules/adoptCat.js';
import { initGenerateAd } from './modules/generateAd.js';
import { initIdentifyCat } from './modules/identifyCat.js';
import { initLazyLoad } from './modules/lazyLoad.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initScrollAnimations();
  initCatPopup();
  initProjectsGallery();
  initSkillsCarousel();

  initIATabs();
  initAdoptCat();
  initGenerateAd();
  initIdentifyCat();

  initLazyLoad();
  initContactForm();
});

// WhatsApp floating button tooltip behavior
document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('whatsapp-fab');
  const tooltip = document.getElementById('whatsapp-tooltip');
  const container = document.getElementById('whatsapp-container');

  if (!fab || !tooltip || !container) return;

  let touchToggle = false;
  let hideTimeout = null;

  const showTooltip = () => {
    clearTimeout(hideTimeout);
    tooltip.setAttribute('aria-hidden', 'false');
  };

  const hideTooltip = () => {
    tooltip.setAttribute('aria-hidden', 'true');
  };

  // mouse interactions
  fab.addEventListener('mouseenter', showTooltip);
  fab.addEventListener('focus', showTooltip);
  fab.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(hideTooltip, 220);
  });
  fab.addEventListener('blur', () => {
    hideTimeout = setTimeout(hideTooltip, 220);
  });

  // tooltip should keep visible while hovered/focused
  tooltip.addEventListener('mouseenter', showTooltip);
  tooltip.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(hideTooltip, 220);
  });

  // touch / tap: toggle tooltip on touchstart for mobile users
  fab.addEventListener('touchstart', (e) => {
    // On first tap, prevent immediate navigation and show tooltip
    if (!touchToggle) {
      e.preventDefault();
      touchToggle = true;
      showTooltip();
      // If user doesn't interact further, hide after 6s
      hideTimeout = setTimeout(() => { touchToggle = false; hideTooltip(); }, 6000);
    }
    // second tap will proceed to link (native behavior)
  }, { passive: false });

  // Clicking anywhere outside should hide tooltip
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      touchToggle = false;
      hideTooltip();
    }
  });

  // Escape key hides
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      touchToggle = false;
      hideTooltip();
      fab.blur();
    }
  });
});

// WhatsApp open/copy handler (attempt app -> web -> copy)
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('whatsapp-fab');
  if (!btn) return;

  const buildUrls = (phone, text) => {
    const encoded = encodeURIComponent(text);
    return {
      app: `whatsapp://send?phone=${phone}&text=${encoded}`,
      web: `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`,
      waMe: `https://wa.me/${phone}?text=${encoded}`
    };
  };


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Log the failure for debugging; continue with graceful fallback
      // (some browsers or contexts block clipboard access)
      console.warn('clipboard write failed', err);
      return false;
    }
  };

  let popupTimeout = null;

  const showFallbackPopup = (urls) => {
    const popup = document.getElementById('link-popup');
    const msg = document.getElementById('link-popup-message');
    const openBtn = document.getElementById('link-popup-open');
    const copyBtn = document.getElementById('link-popup-copy');
    const closeBtn = document.getElementById('link-popup-close');

    if (!popup || !msg || !openBtn || !copyBtn || !closeBtn) return;
    msg.textContent = 'Não foi possível abrir o WhatsApp automaticamente. Você pode abrir o link manualmente ou copiá-lo.';
    // prefer web on desktop, wa.me otherwise
    openBtn.href = urls.web || urls.waMe;
  popup.setAttribute('aria-hidden', 'false');

  const cleanup = () => { popup.setAttribute('aria-hidden', 'true'); };

    copyBtn.onclick = async () => {
      const copied = await copyToClipboard(urls.waMe);
      copyBtn.textContent = copied ? 'Copiado ✓' : 'Falha ao copiar';
      setTimeout(() => { copyBtn.textContent = 'Copiar link'; }, 2500);
    };

    closeBtn.onclick = cleanup;
    openBtn.onclick = cleanup;
  };

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const phone = btn.dataset.phone;
    const text = btn.dataset.text || '';
    const urls = buildUrls(phone, text);

  // Clear any previous timeout
    if (popupTimeout) { clearTimeout(popupTimeout); popupTimeout = null; }

    // Simplified strategy per user request: try wa.me for both mobile and desktop
    // Single navigation attempt to wa.me; if we remain on the page after the timeout,
    // show the non-blocking fallback popup. This avoids multiple open() calls.
    if (popupTimeout) { clearTimeout(popupTimeout); popupTimeout = null; }

    // Try to open wa.me in a new tab/window using _blank.
    // This uses a single window.open call triggered by the user's click.
    const newWin = window.open(urls.waMe, '_blank');
    if (newWin) {
      // Attempt to focus the new window/tab.
  try { newWin.focus(); } catch (err) { console.debug('focus blocked', err); }
      // No popup necessary.
    } else {
      // Window was blocked: show the non-blocking fallback popup.
      showFallbackPopup(urls);
    }
  });
});
