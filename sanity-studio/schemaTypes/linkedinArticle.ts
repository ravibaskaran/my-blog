import { defineField, defineType } from 'sanity'
import {
  LINKEDIN_ARTICLE_TARGET_AUDIENCE,
  LINKEDIN_ARTICLE_TONE_NOTES,
  LINKEDIN_ARTICLE_WRITING_BRIEF,
} from './linkedinArticleBrief'

export default defineType({
  name: 'linkedinArticle',
  title: 'LinkedIn Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'pubDatetime',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'modDatetime',
      type: 'datetime',
    }),
    defineField({
      name: 'author',
      type: 'string',
      initialValue: 'Ravi',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'draft',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'articleSourceUrl',
      type: 'url',
      validation: rule =>
        rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'writingBrief',
      title: 'Writing Brief',
      type: 'text',
      initialValue: LINKEDIN_ARTICLE_WRITING_BRIEF,
      description:
        'Reusable prompt guidance for Sanity AI Assist or Content Agent. Keep this as the source brief when generating articles.',
      rows: 16,
    }),
    defineField({
      name: 'targetAudience',
      type: 'string',
      initialValue: LINKEDIN_ARTICLE_TARGET_AUDIENCE,
      description: 'Who this article is written for.',
    }),
    defineField({
      name: 'toneNotes',
      type: 'text',
      initialValue: LINKEDIN_ARTICLE_TONE_NOTES,
      description: 'Editing notes for style, structure, and pacing.',
      rows: 6,
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Content',
      of: [{ type: 'block' }, { type: 'image' }],
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'ogImage',
    },
  },
})
