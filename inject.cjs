const fs = require('fs');
const path = require('path');

const envContent = 'SANITY_PROJECT_ID="REPLACE_WITH_YOUR_PROJECT_ID"\nSANITY_DATASET="production"\nSANITY_API_VERSION="2023-10-01"';

const syncContent = `require('dotenv').config();
const { createClient } = require('@sanity/client');
const { toHTML } = require('@portabletext/to-html');
const imageUrlBuilder = require('@sanity/image-url');
const fs = require('fs');
const path = require('path');

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
    image: ({ value }) => '<img src="' + urlFor(value).url() + '" alt="' + (value.alt || ' ') + '" />',
  },
};

async function sync() {
  const query = '*[_type == "post" && (!defined(draft) || draft == false)] | order(pubDatetime desc)';
  const posts = await client.fetch(query);
  
  const blogDir = path.join(__dirname, 'src', 'content', 'blog');
  if (fs.existsSync(blogDir)) fs.rmSync(blogDir, { recursive: true, force: true });
  fs.mkdirSync(blogDir, { recursive: true });

  for (const post of posts) {
    const htmlBody = toHTML(post.body || [], { components: myPortableTextComponents });
    
    const tagsStr = (post.tags || []).map(t => '"' + t + '"').join(', ');
    const ogImg = post.ogImage ? urlFor(post.ogImage).url() : '';
    
    const frontmatter = '---\n' +
      'title: "' + post.title + '"\n' +
      'description: "' + post.description + '"\n' +
      'pubDatetime: ' + post.pubDatetime + '\n' +
      'modDatetime: ' + (post.modDatetime || post.pubDatetime) + '\n' +
      'author: "' + (post.author || 'Admin') + '"\n' +
      'featured: ' + (post.featured || false) + '\n' +
      'draft: ' + (post.draft || false) + '\n' +
      'tags: [' + tagsStr + ']\n' +
      'ogImage: "' + ogImg + '"\n' +
      '---\n\n' +
      htmlBody;

    fs.writeFileSync(path.join(blogDir, post.slug.current + '.mdx'), frontmatter, 'utf8');
  }
  console.log('Synced ' + posts.length + ' posts from Sanity.');
}

sync().catch(console.error);`;

const schemaContent = `import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'description', type: 'text', validation: r => r.required() }),
    defineField({ name: 'pubDatetime', type: 'datetime', initialValue: () => new Date().toISOString(), validation: r => r.required() }),
    defineField({ name: 'modDatetime', type: 'datetime' }),
    defineField({ name: 'author', type: 'string', initialValue: 'Ravi' }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'draft', type: 'boolean', initialValue: false }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'ogImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image' }], title: 'Content' })
  ]
})`;

fs.writeFileSync('.env', envContent, 'utf8');
console.log('Injected: .env');

fs.writeFileSync('sync-sanity.cjs', syncContent, 'utf8');
console.log('Injected: sync-sanity.cjs');

const schemaDir = path.join(__dirname, 'sanity-studio', 'schemaTypes');
if (!fs.existsSync(schemaDir)) fs.mkdirSync(schemaDir, { recursive: true });
fs.writeFileSync(path.join(schemaDir, 'post.ts'), schemaContent, 'utf8');
console.log('Injected: sanity-studio/schemaTypes/post.ts');

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts.build = "node sync-sanity.cjs && astro build";
pkg.scripts.dev = "node sync-sanity.cjs && astro dev";
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('Patched package.json build scripts.');