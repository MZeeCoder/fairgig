import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email().trim(),
  password: z.string().min(3),
  role: z
    .enum(["worker", "verifier", "advocate", "admin"])
    .optional()
    .default("worker"),
  phone: z.string().trim().min(7),
  city: z.string().trim().min(2),
  platforms: z.array(z.string().trim().min(1)).optional().default([]),
  verificationDocuments: z.array(z.string().url()).optional().default([]),
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(3)
})
