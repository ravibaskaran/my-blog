import assert from "node:assert/strict";
import { toHTML } from "@portabletext/to-html";
import { createPortableTextComponents } from "../src/utils/sanityPortableText.js";

const components = createPortableTextComponents({
  urlFor: value => ({
    url: () => `https://cdn.example.test/${value.asset._ref}.png`,
  }),
  siteUrl: "https://blog.tochops.in/",
});

const externalHtml = toHTML(
  [
    {
      _type: "block",
      _key: "a1",
      children: [
        { _type: "span", _key: "c1", text: "Example", marks: ["link1"] },
      ],
      markDefs: [{ _key: "link1", _type: "link", href: "https://example.com" }],
      style: "normal",
    },
  ],
  { components }
);

assert.match(externalHtml, /target="_blank"/);
assert.match(externalHtml, /rel="noopener noreferrer"/);

const internalHtml = toHTML(
  [
    {
      _type: "block",
      _key: "b1",
      children: [
        { _type: "span", _key: "c2", text: "About", marks: ["link2"] },
      ],
      markDefs: [{ _key: "link2", _type: "link", href: "/about/" }],
      style: "normal",
    },
  ],
  { components }
);

assert.ok(!internalHtml.includes('target="_blank"'));
assert.ok(!internalHtml.includes('rel="noopener noreferrer"'));

