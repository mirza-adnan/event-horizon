import { z } from "zod";

export const stepOneSchema = z
    .object({
        name: z.string().min(3, "Organization name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Please confirm your password"),
        phoneCode: z.string().min(1, "Country code is required"),
        phoneNumber: z.string().regex(/^[0-9]{6,15}$/, "Invalid phone number"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const stepTwoSchema = z.object({
    country: z.string().min(1, "Country is required"),
    address: z.string().optional(),
    city: z.string().optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    description: z.string().optional(),
});
