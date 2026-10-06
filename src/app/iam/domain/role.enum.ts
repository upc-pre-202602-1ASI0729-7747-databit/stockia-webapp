// Enum del Bounded Context User & Access Management (ver Capítulo IV, 4.6.5 del informe)
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.EMPLOYEE]: 'Empleado',
};
