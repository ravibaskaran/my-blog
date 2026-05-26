import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/getSortedPosts";
import config from "@/config";
import { buildRssItems } from "@/utils/rssItems.js";
import { getPostUrl } from "@/utils/getPostPaths";

export async function GET() {
  const posts = await getCollection("posts");
  const sortedPosts = getSortedPosts(posts);

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    items: buildRssItems(sortedPosts, (id, filePath) =>
      getPostUrl(id, filePath, config.site.lang)
    ),
  });
}
