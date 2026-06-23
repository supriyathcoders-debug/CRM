import { z } from 'zod';

export const updateCompanyBrandingSchema = z.object({
  name: z.string().min(2).max(120).optional(),
});
