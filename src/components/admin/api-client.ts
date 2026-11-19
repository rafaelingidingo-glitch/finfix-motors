"use client";

/**
 * Tiny central fetch helper for the admin dashboard.
 * - Always uses relative URLs.
 * - Parses JSON responses.
 * - Throws ApiError (with .status) using the server's { error } message.
 * - On 401 for protected endpoints, hard-redirects to the login page.
 */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Endpoints that must NOT trigger the automatic 401 redirect. */
const AUTH_FREE_PATHS = [
  "/api/admin/login",
  "/api/admin/setup",
  "/api/admin/setup-status",
  "/api/admin/logout",
];

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new ApiError("Network error. Please check your connection and try again.", 0);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed (${res.status}).`;
    if (res.status === 401 && !AUTH_FREE_PATHS.some((p) => input.startsWith(p))) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/admin/login?next=${next}`;
    }
    throw new ApiError(message, res.status);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Shared admin API types
// ---------------------------------------------------------------------------

export type VehicleStatus = "AVAILABLE" | "SOLD";
export type Transmission = "Automatic" | "Manual";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";
export type VehicleCondition = "Brand New" | "Foreign Used" | "Locally Used";
export type ServiceIconKey = "car" | "ship" | "truck" | "hand-coins";
export type AdminRole = "ADMIN" | "SUPERADMIN";

export interface AdminSessionInfo {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface UploadedImage {
  url: string;
  publicId: string | null;
  altText: string | null;
}

export interface VehicleImageRecord extends UploadedImage {
  id: string;
  sortOrder: number;
}

export interface AdminVehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  transmission: Transmission;
  fuelType: FuelType;
  condition: VehicleCondition;
  mileage: number | null;
  color: string | null;
  engine: string | null;
  description: string | null;
  status: VehicleStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: VehicleImageRecord[];
}

export interface VehicleListResponse {
  vehicles: AdminVehicle[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminInquiryVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  slug: string;
}

export interface AdminInquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  vehicleId: string | null;
  status: "NEW" | "READ";
  createdAt: string;
  vehicle: AdminInquiryVehicle | null;
}

export interface InquiryListResponse {
  inquiries: AdminInquiry[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminService {
  id: string;
  title: string;
  description: string;
  icon: ServiceIconKey;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceListResponse {
  services: AdminService[];
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  landmark: string;
  instagram: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  mapQuery: string;
}
