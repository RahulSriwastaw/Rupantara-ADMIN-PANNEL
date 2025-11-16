import type { AdminPermissions } from "@/types/admin";

export const ADMIN_CONFIG = {
  OWNER: {
      email: "owner@rupantar.ai",
          password: "Owner@2025!Secure",
              name: "Rupantar AI Owner",
                  role: "owner" as const,
                    },

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
                                                                    } satisfies AdminPermissions,
                                                                    };

                                                                    export type AdminRole =
                                                                      | "owner"
                                                                        | "super_admin"
                                                                          | "admin"
                                                                            | "moderator"
                                                                              | "support";