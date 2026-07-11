import { z } from "zod";

export const updateSettingsZodSchema = z.object({
  siteTitle: z.string().optional(),
  tagline: z.string().optional(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
  resumeLink: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  latestNewsCount: z.number().int().min(1).max(100).optional(),
});
