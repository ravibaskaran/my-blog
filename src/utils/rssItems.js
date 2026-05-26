import slugify from "slugify";
import { authorProfile } from "../data/author.js";

function getPostPathSegments(filePath) {
  if (typeof filePath !== "string" || filePath.length === 0) {
    return [];
  }

  const normalizedPath = filePath.replaceAll("\\", "/");
  const postsIndex = normalizedPath.indexOf("/posts/");

  if (postsIndex === -1) {
    return [];
  }

  const afterPosts = normalizedPath.slice(postsIndex + "/posts/".length);
  return afterPosts
    .split("/")
    .filter(segment => segment !== "")
    .filter(segment => !segment.startsWith("_"))
    .slice(0, -1)
    .map(segment =>
      slugify(segment, { lower: true, strict: true, trim: true })
    );
}

function getSlug(id) {
  const parts = String(id).split("/");
  return parts.length > 0 ? String(parts[parts.length - 1]) : String(id);
}

function defaultGetPostUrl(id, filePath) {
  const pathSegments = getPostPathSegments(filePath);
  const slug = slugify(getSlug(id), { lower: true, strict: true, trim: true });
  const postPath =
    pathSegments.length > 0 ? [...pathSegments, slug].join("/") : slug;

  return `/posts/${postPath}/`;
}

function normalizeCategory(tag) {
  if (typeof tag !== "string") {
    return "";
  }

  return tag.replace(/^#\s*/, "").trim();
}

export function buildRssItems(posts, getPostUrl = defaultGetPostUrl) {
  const urlBuilder =
    typeof getPostUrl === "function" ? getPostUrl : defaultGetPostUrl;

  return posts.map(({ data, id, filePath, body }) => {
    const content = typeof body === "string" ? body.trim() : "";
    const categories = Array.isArray(data.tags)
      ? data.tags.map(normalizeCategory).filter(Boolean)
      : [];

    return {
      link: urlBuilder(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      content: content || undefined,
      categories,
      author: authorProfile.email,
    };
  });
}
