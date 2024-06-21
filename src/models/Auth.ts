import { z } from 'zod';

export type Login = z.infer<typeof LoginSchema>;
export const LoginSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/)
});
