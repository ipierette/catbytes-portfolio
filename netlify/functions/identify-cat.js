export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: "",
      };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return json(500, { error: "missing_api_key" });
    }

    const ct = event.headers["content-type"] || event.headers["Content-Type"] || "";
    const boundaryMatch = ct.match(/boundary=(.*)$/);
    if (!boundaryMatch) {
      return json(400, { error: "no_multipart_boundary" });
    }
    const boundary = boundaryMatch[1];

    const buf = Buffer.from(event.body || "", event.isBase64Encoded ? "base64" : "utf8");
    const raw = buf.toString("binary");

    const parts = raw.split(`--${boundary}`);
    const filePart = parts.find((p) => /name="data"/.test(p));
    if (!filePart) return json(400, { error: "no_file_field_data" });

    const mimeMatch = filePart.match(/Content-Type:\s*([^\r\n]+)/i);
    const mime = mimeMatch ? mimeMatch[1].trim() : "image/jpeg";

    const headerEnd = filePart.indexOf("\r\n\r\n");
    if (headerEnd === -1) return json(400, { error: "bad_part_format" });

    const binaryContent = filePart.slice(headerEnd + 4).replace(/\r\n--$/, "");
    const base64Data = Buffer.from(binaryContent, "binary").toString("base64");

    const body = {
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: mime, data: base64Data } },
          {
            text: 'Responda em pt-BR. Analise esta foto de gato e retorne SOMENTE JSON (sem Markdown) ' +
                  'exatamente neste formato: ' +
                  '{"idade":"~X meses/anos (intervalo)","racas":["..."],"personalidade":["..."],"observacoes":"..."} ' +
                  'Seja breve e conservador nas estimativas. Se não for um gato, diga {"observacoes":"imagem sem gato."}'
          }
        ]
      }]
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await resp.json();
    
    if (!resp.ok) {
      return json(resp.status, { error: "gemini_request_failed", detail: data });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const regex = /\{[\s\S]*\}/;
      const match = regex.exec(text);
      parsed = match ? JSON.parse(match[0]) : { observacoes: text || "sem dados" };
    }

    let racas = [];
    if (Array.isArray(parsed.racas)) {
      racas = parsed.racas;
    } else if (Array.isArray(parsed.breeds)) {
      racas = parsed.breeds;
    }
    
    let personalidade = [];
    if (Array.isArray(parsed.personalidade)) {
      personalidade = parsed.personalidade;
    } else if (Array.isArray(parsed.personality)) {
      personalidade = parsed.personality;
    }

    const normalized = {
      idade: parsed.idade || parsed.age || "--",
      racas,
      personalidade,
      observacoes: parsed.observacoes || parsed.notes || "",
    };

    return json(200, normalized, { "Access-Control-Allow-Origin": "*" });
  } catch (err) {
    return json(500, { error: "server_error", message: String(err?.message || err) });
  }
};

function json(status, obj, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(obj),
  };
}
