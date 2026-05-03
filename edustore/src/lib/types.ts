export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone: string;
  createdAt: number;
}

export interface Chapter {
  title: string;
  content: string; // Q&A format
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  chapters: Chapter[]; // max 2
  status: "available" | "unavailable";
  createdAt: number;
  updatedAt: number;
  viewCount: number;
  orderCount: number;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  type: "ribbon" | "redirect" | "popup";
  icon: string; // lucide icon name
  link: string;
  isActive: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface AdApplication {
  id: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  adType: "ribbon" | "redirect" | "popup" | "in-book";
  description: string;
  status: "pending" | "approved" | "rejected";
  includeInBooks: boolean;
  createdAt: number;
}

export interface Settings {
  id: string;
  adminPhone: string;
  adminWhatsApp: string;
}
