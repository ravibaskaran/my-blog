const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
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
  useCdn: false,
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

  const { resolveLeadImageContent } = await import(
    pathToFileURL(path.join(__dirname, 'src', 'utils', 'sanityLeadImage.js')).href
  );
  const { buildSanityArticleMdx } = await import(
    pathToFileURL(path.join(__dirname, 'src', 'utils', 'sanityArticleMdx.js')).href
  );

  const postQuery = '*[_type == "post" && (!defined(draft) || draft == false)] | order(pubDatetime desc)';
  const linkedinQuery = '*[_type == "linkedinArticle" && (!defined(draft) || draft == false)] | order(pubDatetime desc)';
  const [posts, linkedinArticles] = await Promise.all([
    client.fetch(postQuery),
    client.fetch(linkedinQuery),
  ]);

  const generatedDirs = [
    { dir: path.join(__dirname, 'src', 'content', 'posts', 'sanity'), documents: posts },
    { dir: path.join(__dirname, 'src', 'content', 'posts', 'linkedin'), documents: linkedinArticles },
  ];

  for (const { dir, documents } of generatedDirs) {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    for (const document of documents) {
      if (!document.slug?.current) {
        throw new Error('Missing slug for ' + document._type);
      }

      const { leadImageSource, leadImageAlt, body } = resolveLeadImageContent(document);
      const htmlBody = toHTML(body || [], { components: myPortableTextComponents });
      const leadImage = leadImageSource ? urlFor(leadImageSource).url() : '';
      const ogImg = document.ogImage ? urlFor(document.ogImage).url() : '';

      const frontmatter = buildSanityArticleMdx(
        {
          title: document.title,
          description: document.description,
          pubDatetime: document.pubDatetime,
          modDatetime: document.modDatetime || document.pubDatetime,
          author: document.author || 'Admin',
          featured: document.featured || false,
          draft: document.draft || false,
          tags: document.tags || [],
          leadImage,
          leadImageAlt,
          ogImage: ogImg,
          articleSourceUrl: document.articleSourceUrl,
        },
        htmlBody
      );

      fs.writeFileSync(path.join(dir, document.slug.current + '.mdx'), frontmatter, 'utf8');
    }
  }
  console.log('Synced ' + posts.length + ' posts and ' + linkedinArticles.length + ' LinkedIn articles from Sanity.');
}

sync().catch(error => {
  console.error(error);
  process.exit(1);
});
