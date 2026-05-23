import { defineField, defineType } from 'sanity'

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
})
