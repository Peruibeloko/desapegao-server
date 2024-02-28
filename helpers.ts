import { HTTPException, z } from 'deps';

export function validateWith<T extends z.ZodTypeAny>(data: unknown, schema: T) {
  const result = schema.safeParse(data);

  if (!result.success) throw new HTTPException(400);
  const validData = result.data as z.infer<typeof schema>;
  return validData;
}
