import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2),
  password: z.string().min(8),
  role: z
    .enum(["worker", "verifier", "advocate", "admin"])
    .optional()
    .default("worker"),
  phone: z.string().trim().min(7),
  city: z.string().trim().min(2),
  platforms: z.array(z.string().trim().min(1)).optional().default([]),
  verificationDocuments: z.array(z.string().url()).optional().default([]),
});
