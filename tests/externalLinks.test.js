import assert from "node:assert/strict";
import {
  getExternalLinkAttrs,
  isExternalHttpLink,
} from "../src/utils/externalLinks.js";

{
  assert.equal(
    isExternalHttpLink("https://example.com", "https://blog.tochops.in/"),
    true
  );
  assert.equal(
    isExternalHttpLink("/about/", "https://blog.tochops.in/"),
    false
  );
  assert.equal(
    isExternalHttpLink("#section", "https://blog.tochops.in/"),
    false
  );
  assert.equal(
    isExternalHttpLink("mailto:ravi@tochops.in", "https://blog.tochops.in/"),
    false
  );
}

{
  assert.deepEqual(
    getExternalLinkAttrs("https://example.com", "https://blog.tochops.in/"),
    {
      target: "_blank",
      rel: "noopener noreferrer",
    }
  );
  assert.deepEqual(getExternalLinkAttrs("/about/", "https://blog.tochops.in/"), {});
}

console.log("externalLinks assertions passed");
