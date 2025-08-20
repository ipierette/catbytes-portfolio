// netlify/functions/validate-email.js
// Validação extra: formato, limpeza, domínios descartáveis, typos (map + fuzzy) e MX (DNS)

import { promises as dns } from "dns";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

// Domínios descartáveis (exemplo curto — amplie conforme necessário)
const DISPOSABLE = new Set([
  "mailinator.com", "discard.email", "10minutemail.com", "tempmail.com",
  "guerrillamail.com", "yopmail.com", "trashmail.com", "getnada.com"
]);

// Typos comuns mapeados -> sugestão direta
const TYPO_MAP = new Map([
  ["gamil.com",   "gmail.com"],
  ["gnail.com",   "gmail.com"],
  ["gmil.com",    "gmail.com"],   // ⬅️ incluído
  ["gmai.com",    "gmail.com"],
  ["hotnail.com", "hotmail.com"],
  ["hotmial.com", "hotmail.com"],
  ["outlok.com",  "outlook.com"],
  ["yaho.com",    "yahoo.com"]
]);

// Provedores populares para fuzzy
const TOP_PROVIDERS = [
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
  "icloud.com", "live.com", "proton.me", "protonmail.com"
];

// Remove NBSP/zero-width e trim
function sanitize(str = "") {
  return String(str).replace(/[\u00A0\u200B-\u200D\uFEFF]/g, " ").trim();
}
function isEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function splitDomain(email) {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).toLowerCase();
}

// Levenshtein simples (Damerau opcional — aqui mantemos Levenshtein clássico)
function levenshtein(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // del
        dp[i][j - 1] + 1,      // ins
        dp[i - 1][j - 1] + cost // sub
      );
    }
  }
  return dp[m][n];
}

// Checa MX com timeout curto
async function hasMx(domain) {
  try {
    const mx = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, rej) => setTimeout(() => rej(new Error("DNS timeout")), 2500))
    ]);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
}

// Sugestão por fuzzy: se estiver a 1 "passo" (ou 2 em nomes > 10) de um provedor popular, sugerimos correção
function fuzzySuggestion(domain) {
  let best = null;
  let bestDist = Infinity;
  for (const prov of TOP_PROVIDERS) {
    const d = levenshtein(domain, prov);
    if (d < bestDist) {
      bestDist = d;
      best = prov;
    }
  }
  // tolerância: 1 para a maioria; 2 para strings mais longas
  const allow = domain.length > 10 ? 2 : 1;
  return bestDist <= allow && best !== domain ? best : null;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");
    const clean = sanitize(email);

    if (!clean) return ok({ valid: false, reason: "empty" });
    if (!isEmailFormat(clean)) return ok({ valid: false, reason: "format" });

    const domain = splitDomain(clean);
    if (!domain) return ok({ valid: false, reason: "domain" });

    // Descartáveis
    if (DISPOSABLE.has(domain)) return ok({ valid: false, reason: "disposable" });

    // Typos mapeados (bloqueia e sugere)
    if (TYPO_MAP.has(domain)) {
      return ok({ valid: false, reason: "typo", suggestion: TYPO_MAP.get(domain) });
    }

    // Typos fuzzy (bloqueia e sugere) — mesmo que tenha MX!
    const fuzzy = fuzzySuggestion(domain);
    if (fuzzy) {
      return ok({ valid: false, reason: "typo", suggestion: fuzzy });
    }

    // Checa MX (última etapa)
    const mxOk = await hasMx(domain);
    if (!mxOk) {
      return ok({ valid: false, reason: "mx" });
    }

    return ok({ valid: true });
  } catch (err) {
    console.error("[validate-email] error:", err);
    return ok({ valid: false, reason: "error" });
  }
}

function ok(body) {
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(body) };
}
