import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per research project. The body holds the story (## Problem, ## Approach …);
// the frontmatter holds the structured parts the page lays out for you.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(['ongoing', 'done', 'planned']),
    statusLabel: z.string(),
    areas: z.array(z.string()).default([]),
    order: z.number().default(0),
    progress: z.number().min(0).max(100).default(0),
    example: z.boolean().default(false),          // shows the "placeholder content" banner
    meta: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string().optional() })).default([]),
    image: z.object({ src: z.string(), small: z.string().optional(), alt: z.string(), caption: z.string().optional() }).optional(),
    glance: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    chart: z.object({
      title: z.string(), unit: z.string(), note: z.string().optional(),
      rows: z.array(z.object({ name: z.string(), value: z.number(), highlight: z.boolean().default(false), accuracy: z.string().optional(), size: z.string().optional(), latency: z.string().optional() })),
    }).optional(),
    footprint: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    outputs: z.array(z.object({ title: z.string(), note: z.string(), label: z.string(), url: z.string().optional() })).default([]),
    people: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
    timeline: z.array(z.object({ date: z.string(), text: z.string(), state: z.enum(['done', 'now', 'next']).default('next') })).default([]),
    cite: z.string().optional(),
  }),
});

export const collections = { projects };
