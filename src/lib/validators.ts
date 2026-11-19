/**
 * Zod validation schemas — shared by API routes and forms.
 */
import { z } from "zod";

export const TRANSMISSIONS = ["Automatic", "Manual"] as const;
export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const CONDITIONS = ["Brand New", "Foreign Used", "Locally Used"] as const;
export const VEHICLE_STATUSES = ["AVAILABLE", "SOLD"] as const;

export const vehicleImageInput = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Image URL is required")
    .max(600)
    .refine(
      (value) => value.startsWith("/") || z.url().safeParse(value).success,
      "Image URL must be an absolute path or a valid URL"
    ),
  publicId: z.string().nullable().optional(),
  altText: z.string().max(200).nullable().optional(),
});

export const vehicleCreateSchema = z.object({
  make: z.string().trim().min(1, "Make is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(80),
  year: z
    .number("Year is required")
    .int("Year must be a whole number")
    .min(1950, "Year must be 1950 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  price: z
    .number("Price is required")
    .int("Price must be a whole number of TZS")
    .min(100000, "Price must be at least TZS 100,000")
    .max(10_000_000_000),
  transmission: z.enum(TRANSMISSIONS),
  fuelType: z.enum(FUEL_TYPES),
  condition: z.enum(CONDITIONS),
  mileage: z.number().int().min(0).max(3_000_000).nullable().optional(),
  color: z.string().trim().max(40).nullable().optional(),
  engine: z.string().trim().max(30).nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  status: z.enum(VEHICLE_STATUSES).default("AVAILABLE"),
  isFeatured: z.boolean().default(false),
  images: z.array(vehicleImageInput).max(12, "Maximum 12 images per vehicle").default([]),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const setupSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[a-zA-Z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+0-9()\s-]+$/, "Phone number can only contain digits and + ( ) -"),
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  vehicleId: z.string().optional(),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(["NEW", "READ"]),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(80),
  description: z.string().trim().min(10, "Description is required").max(1000),
  icon: z.enum(["car", "ship", "truck", "hand-coins"]),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceSchema.partial();

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160),
  phone: z.string().trim().min(7).max(20),
  whatsappNumber: z.string().trim().min(7).max(20),
  email: z.string().trim().max(120),
  address: z.string().trim().min(2).max(160),
  landmark: z.string().trim().max(160),
  instagram: z.string().trim().max(200),
  heroTitle: z.string().trim().min(1).max(120),
  heroSubtitle: z.string().trim().max(200),
  aboutTitle: z.string().trim().min(1).max(120),
  aboutText: z.string().trim().max(4000),
  mapQuery: z.string().trim().min(2).max(200),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
