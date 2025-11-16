// Admin Panel Configuration
// Owner credentials - Change these in production!

export const ADMIN_CONFIG = {
  // Owner credentials (hardcoded for security)
  OWNER: {
    email: "owner@rupantar.ai",
    password: "Owner@2025!Secure", // Change this in production!
    name: "Rupantar AI Owner",
    role: "owner" as const,
  },
  
  // Firebase config will be loaded from environment variables
  // Make sure to set these in .env.local:
  // NEXT_PUBLIC_FIREBASE_API_KEY=...
  // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  // etc.
  
  // Sub-admin default permissions
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
  },
};

export type AdminRole = "owner" | "super_admin" | "admin" | "moderator" | "support";