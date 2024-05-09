import { ZodError, z } from 'zod';

export type Listing = z.infer<typeof ListingSchema>;
export const ListingSchema = z.object({
  listingImage: z.string(),
  productName: z.string(),
  quality: z.enum(['novo', 'semiNovo', 'usadoBoaCondicao', 'usadoMarcasUso', 'usadoFaltaPartes', 'usadoQuebrado']),
  value: z.string().regex(/^\d+$/),
  location: z.string(),
  sellerName: z.string(),
  sellerPhone: z.string().length(11).regex(/^\d+$/)
  // groups: z.number().int().gt(0)
});

export function formatError(error: ZodError) {
  return error.issues.reduce(
    (result, el) => ({
      ...result,
      [el.path.join('.')]: el.message
    }),
    {}
  );
}
