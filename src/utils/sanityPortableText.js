import { getExternalLinkAttrs } from "./externalLinks.js";

export function createPortableTextComponents({
  urlFor,
  siteUrl = "https://blog.tochops.in/",
}) {
  if (typeof urlFor !== "function") {
    throw new TypeError("urlFor must be a function");
  }

  return {
    types: {
      image: ({ value }) =>
        '<img src="' +
        urlFor(value).url() +
        '" alt="' +
        (value.alt || " ") +
        '" />',
    },
    marks: {
      link: ({ value, children }) => {
        const href = value?.href || "";
        const attrs = getExternalLinkAttrs(href, siteUrl);
        const attrString = Object.entries(attrs)
          .map(([key, val]) => `${key}="${val}"`)
          .join(" ");

        return (
          '<a href="' +
          href +
          '"' +
          (attrString ? " " + attrString : "") +
          ">" +
          children +
          "</a>"
        );
      },
    },
  };
}
