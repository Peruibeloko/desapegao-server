import { z } from 'zod';

export type Listing = z.infer<typeof ListingSchema>;
export const ListingSchema = z.object({
  productImage: z.string(),
  productName: z.string(),
  quality: z.enum(['novo', 'semiNovo', 'usadoBoaCondicao', 'usadoMarcasUso', 'usadoFaltaPartes', 'usadoQuebrado']),
  value: z.string().regex(/^\d+$/),
  location: z.string(),
  sellerName: z.string(),
  sellerPhone: z.string().length(11).regex(/^\d+$/),
  // groups: z.number().int().gt(0)
});