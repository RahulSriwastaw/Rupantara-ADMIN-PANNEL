// Admin Panel Configuration
// Owner credentials - Change these in production!
import type { AdminPermissions } from "@/types/admin";

// FIX 1: Convert literal-locked permissions object into normal boolean-tolerant type
// FIX 2: Remove strict literal type locking (`as const`)
export const ADMIN_CONFIG = {
  OWNER: {
    email: "owner@rupantar.ai",
    password: "Owner@2025!Secure",
    name: "Rupantar AI Owner",
    role: "owner" as const,
  },

  // Default permissions for sub-admins
  DEFAULT_SUB_ADMIN_PERMISSIONS: {
    users: { view: true, edit: false, delete: false },
    templates: { view: true, edit: true, approve: false },
    creators: { view: true, approve: false },
    transactions: { view: true, refund: false },
    moderation: { view: true, action: true },
    wallet: { view: true, adjust: false },
    aiConfig: { view: false, edit: false },
    finance: { view: true, export: false },
    reports: { view: true, export: false },
    settings: { view: false, edit: false },
    admins: { view: false, create: false },
  } as AdminPermissions, // SAFE CAST → after fixing the type
};

export type AdminRole =
  | "owner"
  | "super_admin"
  | "admin"
  | "moderator"
  | "support";
