import assert from "node:assert/strict";
import { resolveLeadImageContent } from "../src/utils/sanityLeadImage.js";

{
  const ogImage = { _type: "image", asset: { _ref: "image-og" } };
  const body = [
    { _type: "block", children: [] },
    { _type: "image", asset: { _ref: "image-body" }, alt: "Body image" },
  ];

  const result = resolveLeadImageContent({
    title: "Example post",
    ogImage,
    body,
  });

  assert.equal(result.leadImageSource, ogImage);
  assert.equal(result.leadImageAlt, "Example post");
  assert.equal(result.body, body);
}

{
  const leadImage = { _type: "image", asset: { _ref: "image-body" }, alt: "Lead image" };
  const body = [
    { _type: "block", children: [{ _type: "span", text: "Intro" }] },
    leadImage,
    { _type: "block", children: [{ _type: "span", text: "After image" }] },
  ];

  const result = resolveLeadImageContent({
    title: "Example post",
    body,
  });

  assert.equal(result.leadImageSource, leadImage);
  assert.equal(result.leadImageAlt, "Lead image");
  assert.deepEqual(result.body, [
    { _type: "block", children: [{ _type: "span", text: "Intro" }] },
    { _type: "block", children: [{ _type: "span", text: "After image" }] },
  ]);
}

{
  const body = [{ _type: "block", children: [{ _type: "span", text: "Only text" }] }];

  const result = resolveLeadImageContent({
    title: "Example post",
    body,
  });

  assert.equal(result.leadImageSource, null);
  assert.equal(result.leadImageAlt, "");
  assert.equal(result.body, body);
}

console.log("sanityLeadImage assertions passed");
