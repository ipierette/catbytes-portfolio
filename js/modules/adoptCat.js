// js/modules/adoptCat.js

// --- Utils DOM ---
const $ = (s) => document.querySelector(s);

// --- Normaliza/valida URL ---
// Aceita anuncio.url OU anuncio.link; adiciona https:// se faltar; valida.
// Retorna string URL válida OU null.
function normalizeUrl(anuncio) {
  let raw = anuncio?.url || anuncio?.link || "";

  if (!raw || typeof raw !== "string") return null;
  // casos chatos
  raw = raw.trim();
  if (!raw || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") return null;

  // Se vier sem protocolo, tenta adicionar https
  if (!/^https?:\/\//i.test(raw)) {
    raw = "https://" + raw;
  }

  try {
    // Valida
    const u = new URL(raw);
    // Evita anchors vazios/irregulares
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// --- Render dos resultados ---
function renderAdoptionResults(container, data) {
  container.innerHTML = "";

  const msg = document.createElement("div");
  msg.className = "mb-4 font-semibold text-green-700 text-center";
  msg.textContent = data.mensagem || "Veja os melhores anúncios para adoção perto de você!";
  container.appendChild(msg);

  const anuncios = Array.isArray(data?.anuncios) ? data.anuncios : [];
  if (!anuncios.length) {
    const empty = document.createElement("div");
    empty.className = "text-gray-500 italic text-center";
    empty.textContent = "Nenhum anúncio encontrado para sua busca.";
    empty.setAttribute("role", "status");
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "space-y-6";

  anuncios.forEach((anuncio) => {
    const url = normalizeUrl(anuncio);
    const fonteHost = url ? hostFromUrl(url) : null;

    const item = document.createElement("li");
    // Volta para o layout “badge à esquerda / conteúdo à direita”
    item.className =
      "flex items-center bg-white rounded-lg shadow p-4 hover:shadow-lg transition group";

    // Coluna do badge
    const badgeWrap = document.createElement("div");
    badgeWrap.className = "flex flex-col items-center mr-4";

    const scoreLabel = document.createElement("div");
    scoreLabel.className = "text-xs font-semibold text-yellow-700 mb-1 text-center";
    scoreLabel.textContent = "Score da IA";

    const badge = document.createElement("span");
    badge.className =
      "inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white font-bold text-lg shadow border-2 border-yellow-500";
    badge.textContent = anuncio?.score ? Math.round(anuncio.score * 100) : 0;

    badgeWrap.appendChild(scoreLabel);
    badgeWrap.appendChild(badge);

    // Coluna do conteúdo
    const content = document.createElement("div");
    content.className = "flex-1 text-left";

    const titleRow = document.createElement("div");
    titleRow.className = "mb-1";

    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className =
        "text-lg font-bold text-blue-700 group-hover:underline break-words";
      a.textContent = anuncio?.titulo || "Anúncio de Adoção";
      a.setAttribute("aria-label", `Abrir anúncio: ${a.textContent}`);
      titleRow.appendChild(a);
    } else {
      const span = document.createElement("span");
      span.className = "text-lg font-bold text-gray-800 break-words";
      span.textContent = (anuncio?.titulo || "Anúncio de Adoção") + " (sem link)";
      titleRow.appendChild(span);
    }

    const desc = document.createElement("p");
    desc.className = "text-gray-700 text-sm mb-1";
    desc.textContent = anuncio?.descricao || "";

    const fonte = document.createElement("div");
    fonte.className = "text-xs text-gray-500";
    fonte.textContent = "Fonte: " + (fonteHost || anuncio?.fonte || "desconhecida");

    content.appendChild(titleRow);
    if (desc.textContent) content.appendChild(desc);
    content.appendChild(fonte);

    // Monta item
    item.appendChild(badgeWrap);
    item.appendChild(content);
    list.appendChild(item);
  });

  container.appendChild(list);
}

// --- Chamador genérico do webhook ---
async function callN8nWebhook(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro na API (${res.status}): ${txt || res.statusText}`);
  }
  return res.json();
}

// --- Setup do formulário ---
export function initAdoptCat() {
  const form = document.querySelector("#adopt-cat form");
  if (!form) return;

  let resultsContainer = document.querySelector("#adopt-results-container");
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.id = "adopt-results-container";
    resultsContainer.setAttribute("aria-live", "polite");
    resultsContainer.className = "mt-8";
    form.parentNode.appendChild(resultsContainer);
  }

  // Habilita o botão (caso estivesse desativado no HTML)
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML =
      '<div class="text-gray-500 text-sm text-center">Buscando anúncios...</div>';

    const payload = {
      age: $("#cat-age")?.value || "",
      color: $("#cat-color")?.value || "",
      localizacao: $("#cat-location")?.value || "",
    };

    try {
      const webhookUrl =
        "https://ipierette-cloud.app.n8n.cloud/webhook/adote-gatinho";
      const results = await callN8nWebhook(webhookUrl, payload);
      renderAdoptionResults(resultsContainer, results);
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML =
        '<div class="text-red-600 text-center" role="alert">Erro ao buscar anúncios. Tente novamente.</div>';
    }
  });
}
