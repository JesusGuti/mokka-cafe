export const USER_ROLES = ["MESERO", "CAJERO", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  MESERO: "Mesero",
  CAJERO: "Cajero",
  ADMIN: "Administrador",
};
