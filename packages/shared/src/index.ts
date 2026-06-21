import { z } from 'zod';

export const tierEnum = z.enum(['free', 'pro']);
export type Tier = z.infer<typeof tierEnum>;

export const FREE_TIER_DAILY_LIMIT = 10;
export const PRO_TIER_DAILY_LIMIT = 200;
export const FREE_TIER_RPM = 3;
export const PRO_TIER_RPM = 30;

export const RegisterDtoSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
});

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
