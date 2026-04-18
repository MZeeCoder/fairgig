import { z } from "zod";

export const openGrievancesQuerySchema = z.object({
  category: z.string().trim().min(2).optional(),
  platform: z.string().trim().min(2).optional(),
});

export const complaintIdParamSchema = z.object({
  complaint_id: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid complaint id"),
});

export const escalateGrievanceParamSchema = z.object({
  advocate_id: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid advocate id"),
  grievance_id: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid grievance id"),
});
