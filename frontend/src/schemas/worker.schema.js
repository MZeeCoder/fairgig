import { z } from "zod";

export const shiftSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  date: z.string().min(1, "Date is required"),
  hours: z.string().min(1, "Hours are required"),
  gross: z.string().min(1, "Gross earnings are required"),
  deductions: z.string().min(1, "Deductions are required"),
  net: z.string().min(1, "Net earnings are required"),
});


// ... existing shiftSchema ...

export const grievanceSchema = z.object({
  platform: z.string().min(1, "Please enter the platform name"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
});