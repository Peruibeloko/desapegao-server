import { z } from 'zod';

export type Pix = z.infer<typeof PixSchema>;
export const PixSchema = z.object({
  status: z.enum(['success', 'failiure']),
  qrbase64: z.string(),
  qrstring: z.string(),
  idfatura: z.string(),
  urlpixae: z.string()
});