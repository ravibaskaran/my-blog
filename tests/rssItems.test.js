import assert from "node:assert/strict";
import { buildRssItems } from "../src/utils/rssItems.js";

const samplePost = {
  id: "sample-post",
  filePath: "src/content/posts/sanity/sample-post.mdx",
  data: {
    title: "Sample post",
    description: "A post about engineering and AI",
    pubDatetime: "2026-05-25T12:00:00.000Z",
    modDatetime: "2026-05-26T12:00:00.000Z",
    tags: ["#AI strategy", "platform architecture", ""],
  },
  body: "<h2>Body</h2><p>Full article content.</p>",
};

const injectedItems = buildRssItems([samplePost], (id, filePath) =>
  `/posts/sanity/${id}/${filePath ? "via-endpoint" : "missing"}/`
);

assert.equal(injectedItems.length, 1);
assert.equal(
  injectedItems[0].link,
  "/posts/sanity/sample-post/via-endpoint/"
);
assert.equal(injectedItems[0].author, "ravi@tochops.in");
assert.equal(
  injectedItems[0].content,
  "<h2>Body</h2><p>Full article content.</p>"
);

const fallbackItems = buildRssItems([samplePost]);

assert.deepEqual(fallbackItems[0], {
  link: "/posts/sanity/sample-post/",
  title: "Sample post",
  description: "A post about engineering and AI",
  pubDate: new Date("2026-05-26T12:00:00.000Z"),
  content: "<h2>Body</h2><p>Full article content.</p>",
  categories: ["AI strategy", "platform architecture"],
  author: "ravi@tochops.in",
});

console.log("rssItems assertions passed");
