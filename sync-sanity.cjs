const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@sanity/client');
const { toHTML } = require('@portabletext/to-html');

function loadImageUrlBuilder() {
  let imageUrlBuilder = require('@sanity/image-url');

  for (let i = 0; i < 5 && typeof imageUrlBuilder !== 'function'; i += 1) {
    imageUrlBuilder =
      imageUrlBuilder.default ??
      imageUrlBuilder.imageUrlBuilder ??
      imageUrlBuilder.urlBuilder ??
      imageUrlBuilder;
  }

  if (typeof imageUrlBuilder !== 'function') {
    throw new TypeError(
      'Failed to load @sanity/image-url as a function. Export keys: ' +
        Object.keys(imageUrlBuilder || {}).join(', ')
    );
  }

  return imageUrlBuilder;
}

const imageUrlBuilder = loadImageUrlBuilder();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  useCdn: true,
});

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

const myPortableTextComponents = {
  types: {
    image: ({ value }) =>
      '<img src="' + urlFor(value).url() + '" alt="' + (value.alt || ' ') + '" />',
  },
};

async function sync() {
  for (const key of ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_VERSION']) {
    if (!process.env[key]) {
      throw new Error('Missing required environment variable: ' + key);
    }
  }

  const query = '*[_type == "post" && (!defined(draft) || draft == false)] | order(pubDatetime desc)';
  const posts = await client.fetch(query);

  const blogDir = path.join(__dirname, 'src', 'content', 'posts', 'sanity');
  if (fs.existsSync(blogDir)) fs.rmSync(blogDir, { recursive: true, force: true });
  fs.mkdirSync(blogDir, { recursive: true });

  for (const post of posts) {
    const htmlBody = toHTML(post.body || [], { components: myPortableTextComponents });
    const tagsStr = (post.tags || []).map(t => '"' + t + '"').join(', ');
    const ogImg = post.ogImage ? urlFor(post.ogImage).url() : '';

    const lines = [
      '---',
      'title: "' + post.title + '"',
      'description: "' + post.description + '"',
      'pubDatetime: ' + post.pubDatetime,
      'modDatetime: ' + (post.modDatetime || post.pubDatetime),
      'author: "' + (post.author || 'Admin') + '"',
      'featured: ' + (post.featured || false),
      'draft: ' + (post.draft || false),
      'tags: [' + tagsStr + ']',
      'ogImage: "' + ogImg + '"',
      '---',
      '',
      htmlBody,
    ];

    const frontmatter = lines.join('\n');
    fs.writeFileSync(path.join(blogDir, post.slug.current + '.mdx'), frontmatter, 'utf8');
  }
  console.log('Synced ' + posts.length + ' posts from Sanity.');
}

sync().catch(error => {
  console.error(error);
  process.exit(1);
});
