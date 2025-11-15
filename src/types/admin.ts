export type AdminRole = "owner" | "super_admin" | "admin" | "moderator" | "support";

export interface AdminPermissions {
  users: { view: boolean; edit: boolean; delete: boolean };
  templates: { view: boolean; edit: boolean; approve: boolean };
  creators: { view: boolean; approve: boolean };
  transactions: { view: boolean; refund: boolean };
  moderation: { view: boolean; action: boolean };
  wallet: { view: boolean; adjust: boolean };
  aiConfig: { view: boolean; edit: boolean };
  finance: { view: boolean; export: boolean };
  reports: { view: boolean; export: boolean };
  settings: { view: boolean; edit: boolean };
  admins: { view: boolean; create: boolean };
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions?: AdminPermissions; // For sub-admins
  createdAt: string;
  createdBy?: string; // ID of admin who created this sub-admin
  isActive: boolean;
}

export interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface DashboardStats {
  totalUsers: number;
  totalTemplates: number;
  activeCreators: number;
  totalRevenue: number;
  pendingApprovals: number;
  supportTickets: number;
  userGrowth: { date: string; count: number }[];
  revenueTrends: { date: string; amount: number }[];
  templateUsage: { templateId: string; templateName: string; uses: number }[];
  topCreators: { creatorId: string; creatorName: string; earnings: number }[];
}

export interface UserFilters {
  search?: string;
  status?: "active" | "banned" | "verified";
  role?: "user" | "creator";
  sortBy?: "date" | "points" | "name";
}

export interface TemplateFilters {
  status?: "approved" | "pending" | "rejected";
  category?: string;
  creatorId?: string;
  search?: string;
}

export interface CreatorFilters {
  status?: "active" | "pending" | "banned";
  verified?: boolean;
  earningsMin?: number;
}

export interface TransactionFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
}

