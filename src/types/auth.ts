export type AccountStatus =
  | 'PENDING_PHONE_VERIFY'
  | 'PENDING_PARENTAL_CONSENT'
  | 'PENDING_ID_VERIFICATION'
  | 'ID_VERIFIED'
  | 'SUSPENDED'
  | 'DELETION_PENDING'
  | 'DELETED';

export type UserRole = 'USER' | 'ADMIN';

export type AdminRoleLevel =
  | 'STANDARD_ADMIN'
  | 'MASJID_SUPER_ADMIN'
  | 'PLATFORM_SUPER_ADMIN';

export interface AuthUser {
  id: string;
  status: AccountStatus;
  role: UserRole;
  masjidId: string;
  adminRole?: AdminRoleLevel;
  adminUserId?: string;
}
