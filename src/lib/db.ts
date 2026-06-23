export type Resource = 'Projects' | 'Tasks' | 'Members' | 'Billing' | 'Settings';
export type Action = 'view' | 'create' | 'edit' | 'delete' | 'archive' | 'assign' | 'invite' | 'remove' | 'update role' | 'update' | 'download invoices';

export const PERMISSION_MATRIX: Record<Resource, Action[]> = {
  Projects: ['view', 'create', 'edit', 'delete', 'archive'],
  Tasks: ['view', 'create', 'edit', 'delete', 'assign'],
  Members: ['view', 'invite', 'remove', 'update role'],
  Billing: ['view', 'update', 'download invoices'],
  Settings: ['view', 'update'],
};

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // Indicates if the role is a default system role that shouldn't be edited/deleted
  permissions: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
}

// In-memory global store
const globalStore = global as unknown as {
  db: {
    roles: Role[];
    users: User[];
  }
};

if (!globalStore.db) {
  globalStore.db = {
    roles: [
      {
        id: 'r_owner',
        name: 'Owner',
        description: 'Full access to all resources',
        isSystem: true,
        permissions: {
          Projects: ['view', 'create', 'edit', 'delete', 'archive'],
          Tasks: ['view', 'create', 'edit', 'delete', 'assign'],
          Members: ['view', 'invite', 'remove', 'update role'],
          Billing: ['view', 'update', 'download invoices'],
          Settings: ['view', 'update'],
        }
      },
      {
        id: 'r_editor',
        name: 'Editor',
        description: 'Can edit content but cannot delete resources',
        isSystem: false,
        permissions: {
          Projects: ['view', 'create', 'edit'],
          Tasks: ['view', 'create', 'edit', 'assign'],
          Members: ['view'],
          Billing: ['view'],
          Settings: ['view'],
        }
      },
      {
        id: 'r_viewer',
        name: 'Viewer',
        description: 'Read-only access across the platform',
        isSystem: false,
        permissions: {
          Projects: ['view'],
          Tasks: ['view'],
          Members: ['view'],
          Billing: ['view'],
          Settings: ['view'],
        }
      }
    ],
    users: [
      {
        id: 'u_1',
        name: 'Alice Admin',
        email: 'alice@workbench.com',
        roleIds: ['r_owner'],
      },
      {
        id: 'u_2',
        name: 'Bob Contractor',
        email: 'bob@workbench.com',
        roleIds: ['r_editor', 'r_viewer'], // Example of multiple roles
      },
      {
        id: 'u_3',
        name: 'Charlie Spectator',
        email: 'charlie@workbench.com',
        roleIds: ['r_viewer'],
      }
    ]
  };
}

export const db = globalStore.db;
