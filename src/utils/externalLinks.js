function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

export function isExternalHttpLink(href, siteUrl) {
  if (!isHttpUrl(href) || !siteUrl) return false;
  try {
    const url = new URL(href, siteUrl);
    const origin = new URL(siteUrl).origin;
    return url.origin !== origin;
  } catch {
    return false;
  }
}

export function getExternalLinkAttrs(href, siteUrl) {
  if (!isExternalHttpLink(href, siteUrl)) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

function visit(node, visitor) {
  if (!node || typeof node !== "object") return;
  visitor(node);
  const children = node.children;
  if (!Array.isArray(children)) return;
  for (const child of children) {
    visit(child, visitor);
  }
}

export function rehypeExternalLinks(options = {}) {
  const siteUrl = options.siteUrl;

  return tree => {
    visit(tree, node => {
      if (node?.type !== "element" || node.tagName !== "a") return;

      const href = node.properties?.href;
      if (!isExternalHttpLink(href, siteUrl)) return;

      node.properties = {
        ...node.properties,
        target: "_blank",
        rel: "noopener noreferrer",
      };
    });
  };
}
