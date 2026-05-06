import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    week: z.number(),
    category: z.enum(['tech', 'strategy', 'policy']),
    theme: z.enum(['lavender', 'sky', 'coral', 'amber', 'mint', 'magenta']).optional(),
    previewLabel: z.string().optional(),
    previewCaption: z.string().optional(),
  }),
});

export const collections = { posts };
