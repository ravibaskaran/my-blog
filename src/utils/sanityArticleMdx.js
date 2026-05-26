export function buildSanityArticleMdx(article, htmlBody) {
  const pubDatetime = article.pubDatetime;
  const modDatetime = article.modDatetime || article.pubDatetime;
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const lines = [
    "---",
    "title: " + JSON.stringify(article.title ?? ""),
    "description: " + JSON.stringify(article.description ?? ""),
    "pubDatetime: " + pubDatetime,
    "modDatetime: " + modDatetime,
    "author: " + JSON.stringify(article.author ?? "Ravi Baskaran"),
    "featured: " + Boolean(article.featured),
    "draft: false",
    "tags: " + JSON.stringify(tags),
  ];

  if (article.leadImage) {
    lines.push("leadImage: " + JSON.stringify(article.leadImage));
    if (article.leadImageAlt) {
      lines.push("leadImageAlt: " + JSON.stringify(article.leadImageAlt));
    }
  }

  if (article.ogImage) {
    lines.push("ogImage: " + JSON.stringify(article.ogImage));
  }

  if (article.articleSourceUrl) {
    lines.push("articleSourceUrl: " + JSON.stringify(article.articleSourceUrl));
  }

  lines.push("---", "", htmlBody ?? "");

  return lines.join("\n");
}
