import * as z from "zod";

export const settingsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Advert Schema

const dateSchema = z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
});

export const advertSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    description: z.string().optional(),
    ctaText: z.string().min(1, "CTA text is required"),
    ctaLink: z.string().url("Invalid URL").min(1, "CTA link is required"),
    backgroundColor: z.string().min(1, "Background color is required"),
    textColor: z.string().min(1, "Text color is required"),
    badge: z.string().nullable().optional(),
    badgeColor: z.string().nullable().optional(),
    discount: z.string().nullable().optional(),
    timerText: z.string().nullable().optional(),
    displayDuration: z.number().int().positive().default(10),
    startsAt: dateSchema.optional(), // Allows string or Date → becomes Date
    endsAt: dateSchema.nullable().optional(),
    priority: z.number().int().default(0),
    isActive: z.boolean().optional(),
    categoryIds: z.array(z.number().int().positive()).optional(),
});

export type AdvertFormData = z.infer<typeof advertSchema>;

// For updates — allow partial + id
export const updateAdvertSchema = advertSchema.partial().extend({
    id: z.number().int().positive(),
});

export type UpdateAdvertFormData = z.infer<typeof updateAdvertSchema>;

export const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, "Price must be a positive number"),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
    categoryId: z.coerce.number().min(1, "Please select a category"),
});

