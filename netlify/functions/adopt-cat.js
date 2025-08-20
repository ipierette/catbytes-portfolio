// ...runQueryAndParse...
.filter(a =>
  a.descricao && a.descricao.length >= 20 &&
  !BAD_WORDS.some(w => a.descricao.toLowerCase().includes(w)) &&
  a.url && isValidUrl(a.url)
)
// ...handler...
for (const query of queries) {
  if (allResults.size >= 30) break;
  const newAds = await runQueryAndParse(query, SERPAPI_KEY);
  newAds.forEach(ad => {
    if (ad.url && !allResults.has(ad.url)) {
      allResults.set(ad.url, ad);
    }
  });
}
// ...score...
if (aiResult && typeof aiResult.score === 'number') {
  anuncio.score = Math.max(0.1, aiResult.score / 10);
  anuncio.is_adopted = aiResult.is_adopted || false;
} else {
  anuncio.score = Math.max(0.1, getSimpleScore(anuncio, body) / 10);
  anuncio.is_adopted = false;
}
// ...ONG override...
const isTopTierNgo = [
  'adoteumgatinho.org.br', 'catland.org.br'
].includes(anuncio.fonte.replace(/^www\./, ''));