import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().trim().min(1, "Event name is required").max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A valid date is required"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "A valid time is required"),
  location: z.string().trim().min(1, "Location is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  major: z.string().trim().max(300).optional().or(z.literal("")),
  capacity: z
    .union([z.literal(""), z.coerce.number().int().positive()])
    .optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(200),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
