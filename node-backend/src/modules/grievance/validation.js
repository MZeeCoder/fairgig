import { z } from "zod";

export const createGrievanceSchema = z.object({
  description: z.string().trim().min(3),
  category: z.string().trim().min(2),
  platform: z.string().trim().min(2),
});
