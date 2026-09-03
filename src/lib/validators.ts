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

const emailSchema = z.string().trim().email();
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-().\s]{7,20}$/, "Enter a valid phone number");

export const signupFormSchema = z
  .object({
    eventId: z.string().min(1),
    name: z.string().trim().min(1, "Full name is required").max(200),
    email: z.string().trim().optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const email = data.email?.trim() ?? "";
    const phone = data.phone?.trim() ?? "";

    if (!email && !phone) {
      ctx.addIssue({
        code: "custom",
        message: "Provide an email or phone number",
        path: ["email"],
      });
      return;
    }

    if (email && !emailSchema.safeParse(email).success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid email address",
        path: ["email"],
      });
    }

    if (phone && !phoneSchema.safeParse(phone).success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid phone number",
        path: ["phone"],
      });
    }
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;
