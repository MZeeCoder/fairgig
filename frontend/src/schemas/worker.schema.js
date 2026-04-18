import { z } from "zod";

export const shiftSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  city: z.string().min(1, "City is extremely important and required"),
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

export const dashboardFilterSchema = z.object({
  platform: z.string().min(1, "Please select a platform"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "Start Date cannot be after End Date.",
  path: ["endDate"],
});