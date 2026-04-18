import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});


export const registerSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  city: z.string().min(2, "City is required."),
});

export const workerSchema = registerSchema.extend({
  platforms: z.string().min(2, "Please enter your platforms (e.g., Foodpanda)."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const staffSchema = registerSchema.extend({
  role: z.enum(["Verifier", "Advocate"], {
    errorMap: () => ({ message: "Please select a valid staff role." }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


export const authSchemas = {
  login: loginSchema,
  register: {
    worker: workerSchema,
    staff: staffSchema
  }
};