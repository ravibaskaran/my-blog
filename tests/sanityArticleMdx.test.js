import assert from "node:assert/strict";
import {buildSanityArticleMdx} from "../src/utils/sanityArticleMdx.js";

{
  const mdx = buildSanityArticleMdx(
    {
      title: "Why typed languages still matter",
      description: "A LinkedIn-ready article about AI and code",
      pubDatetime: "2026-05-21T12:00:00.000Z",
      modDatetime: "2026-05-22T12:00:00.000Z",
      author: "Ravi",
      featured: false,
      draft: true,
      tags: ["ai", "leadership"],
      leadImage: "https://cdn.example.com/lead.jpg",
      leadImageAlt: "Lead image",
      ogImage: "https://cdn.example.com/og.jpg",
      articleSourceUrl: "https://medium.com/example/story",
    },
    "<h2>Section</h2><p>Body text</p>"
  );

  assert.match(mdx, /leadImage: "https:\/\/cdn\.example\.com\/lead\.jpg"/);
  assert.match(mdx, /leadImageAlt: "Lead image"/);
  assert.match(mdx, /ogImage: "https:\/\/cdn\.example\.com\/og\.jpg"/);
  assert.match(mdx, /draft: false/);
  assert.match(mdx, /articleSourceUrl: "https:\/\/medium\.com\/example\/story"/);
  assert.match(mdx, /<h2>Section<\/h2><p>Body text<\/p>$/);
}

{
  const mdx = buildSanityArticleMdx(
    {
      title: "Plain post",
      description: "No source URL",
      pubDatetime: "2026-05-21T12:00:00.000Z",
      tags: [],
    },
    "<p>Body</p>"
  );

  assert.match(mdx, /author: "Ravi Baskaran"/);
  assert.ok(!mdx.includes("articleSourceUrl:"));
}

console.log("sanityArticleMdx assertions passed");
