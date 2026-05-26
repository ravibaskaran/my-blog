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
  perspective: 'published',
});

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function rmSyncWithRetry(target, options = {}, attempts = 12) {
  let lastError;

  for (let i = 0; i < attempts; i += 1) {
    try {
      fs.rmSync(target, options);
      return;
    } catch (error) {
      lastError = error;
      if (!["EPERM", "EACCES", "EBUSY"].includes(error.code)) {
        throw error;
      }

      if (i === attempts - 1) {
        break;
      }

      sleep(100 * (i + 1));
    }
  }

  throw lastError;
}

function removeDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  try {
    rmSyncWithRetry(
      dir,
      {
        recursive: true,
        force: true,
      },
      12
    );
    return;
  } catch (error) {
    if (error.code !== 'EPERM' && error.code !== 'EACCES' && error.code !== 'EBUSY') {
      throw error;
    }

    console.warn(
      "Skipping cleanup for " +
        dir +
        " because a file is locked. Existing generated files will be overwritten."
    );
  }
}

async function sync() {
  for (const key of ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_VERSION']) {
    if (!process.env[key]) {
      throw new Error('Missing required environment variable: ' + key);
    }
  }

  const { resolveLeadImageContent } = await import(
    pathToFileURL(path.join(__dirname, 'src', 'utils', 'sanityLeadImage.js')).href
  );
  const { createPortableTextComponents } = await import(
    pathToFileURL(path.join(__dirname, 'src', 'utils', 'sanityPortableText.js')).href
  );
  const { buildSanityArticleMdx } = await import(
    pathToFileURL(path.join(__dirname, 'src', 'utils', 'sanityArticleMdx.js')).href
  );

  const postQuery = '*[_type == "post"] | order(pubDatetime desc)';
  const posts = await client.fetch(postQuery);

  const generatedDirs = [
    { dir: path.join(__dirname, 'src', 'content', 'posts', 'sanity'), documents: posts },
  ];

  const myPortableTextComponents = createPortableTextComponents({
    urlFor,
    siteUrl: process.env.SITE_URL || 'https://blog.tochops.in/',
  });

  for (const { dir, documents } of generatedDirs) {
    removeDirectory(dir);
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
          author: document.author || 'Ravi Baskaran',
          featured: document.featured || false,
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
  console.log('Synced ' + posts.length + ' published posts from Sanity.');
}

sync().catch(error => {
  console.error(error);
  process.exit(1);
});
