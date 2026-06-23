"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import compStyles from "@/styles/components.module.css";
import { User, Role } from "@/lib/db";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  // Manage Roles Modal
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [managingUser, setManagingUser] = useState<User | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Effective Permissions Modal
  const [isPermsOpen, setIsPermsOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [effectivePerms, setEffectivePerms] = useState<Record<string, string[]>>({});

  // Toast State
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then(res => res.json()),
      fetch("/api/roles").then(res => res.json()),
      fetch("/api/permissions").then(res => res.json()),
    ]).then(([usersData, rolesData, matrixData]) => {
      setUsers(usersData);
      setRoles(rolesData);
      setMatrix(matrixData);
      setLoading(false);
    });
  }, []);

  const openManageModal = (user: User) => {
    setManagingUser(user);
    setSelectedRoleIds([...user.roleIds]);
    setIsManageOpen(true);
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const saveRoles = async () => {
    if (!managingUser) return;
    
    const res = await fetch(`/api/users/${managingUser.id}/roles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleIds: selectedRoleIds })
    });

    if (res.ok) {
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsManageOpen(false);
      showToast(`Roles updated for ${managingUser.name}`);
    }
  };

  const openPermsModal = (user: User) => {
    setViewingUser(user);
    
    // Calculate effective permissions (Additive Union)
    const combined: Record<string, Set<string>> = {};
    
    user.roleIds.forEach(roleId => {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        Object.entries(role.permissions).forEach(([resource, actions]) => {
          if (!combined[resource]) combined[resource] = new Set();
          actions.forEach(action => combined[resource].add(action));
        });
      }
    });

    // Convert Sets back to Arrays
    const resolved: Record<string, string[]> = {};
    Object.keys(combined).forEach(resource => {
      resolved[resource] = Array.from(combined[resource]);
    });
    
    setEffectivePerms(resolved);
    setIsPermsOpen(true);
  };

  if (loading) return (
    <div className={compStyles.spinnerWrapper}>
      <div className={compStyles.spinner}></div>
    </div>
  );

  return (
    <div>
      <div className={compStyles.pageHeader}>
        <h1 className={compStyles.pageTitle}>Users</h1>
      </div>

      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>User</th>
            <th>Assigned Roles</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
              </td>
              <td>
                <div className={styles.rolesWrapper}>
                  {user.roleIds.length === 0 && <span className={compStyles.textSecondary}>No roles</span>}
                  {user.roleIds.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? <span key={roleId} className={styles.roleTag}>{role.name}</span> : null;
                  })}
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    className={`${compStyles.button} ${compStyles.buttonSecondary}`}
                    onClick={() => openManageModal(user)}
                  >
                    Manage Roles
                  </button>
                  <button 
                    className={`${compStyles.button} ${compStyles.buttonSecondary}`}
                    onClick={() => openPermsModal(user)}
                  >
                    View Permissions
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Manage Roles Modal */}
      {isManageOpen && managingUser && (
        <div className={compStyles.modalOverlay}>
          <div className={compStyles.modalContent}>
            <div className={compStyles.modalHeader}>
              <h2 className={compStyles.cardTitle}>Manage Roles for {managingUser.name}</h2>
              <button onClick={() => setIsManageOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>×</button>
            </div>
            <div className={compStyles.modalBody}>
              <p className={compStyles.textSecondary} style={{ marginBottom: '1rem' }}>
                Select the roles you want to assign to this user. Their final permissions will be a combination of all selected roles.
              </p>
              <div className={styles.roleSelect}>
                {roles.map(role => (
                  <label key={role.id} className={styles.roleOption}>
                    <input 
                      type="checkbox" 
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRoleSelection(role.id)}
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{role.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className={compStyles.modalFooter}>
              <button className={`${compStyles.button} ${compStyles.buttonSecondary}`} onClick={() => setIsManageOpen(false)}>Cancel</button>
              <button className={`${compStyles.button} ${compStyles.buttonPrimary}`} onClick={saveRoles}>Save Roles</button>
            </div>
          </div>
        </div>
      )}

      {/* View Effective Permissions Modal */}
      {isPermsOpen && viewingUser && (
        <div className={compStyles.modalOverlay}>
          <div className={compStyles.modalContent}>
            <div className={compStyles.modalHeader}>
              <h2 className={compStyles.cardTitle}>Effective Permissions: {viewingUser.name}</h2>
              <button onClick={() => setIsPermsOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>×</button>
            </div>
            <div className={compStyles.modalBody}>
              <p className={compStyles.textSecondary} style={{ marginBottom: '1.5rem' }}>
                This is the combined list of permissions resulting from all assigned roles.
              </p>
              
              <table className={styles.matrixTable}>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Allowed Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(matrix).map(resource => {
                    const allowedActions = effectivePerms[resource] || [];
                    
                    return (
                      <tr key={resource}>
                        <td className={styles.resourceName}>{resource}</td>
                        <td>
                          {allowedActions.length === 0 ? (
                            <span className={compStyles.textSecondary} style={{ fontSize: '0.875rem' }}>None</span>
                          ) : (
                            <div className={styles.actionsGroup}>
                              {allowedActions.map(action => (
                                <span key={action} className={styles.permBadge}>{action}</span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className={compStyles.toast}>
          ✓ {toastMsg}
        </div>
      )}
    </div>
  );
}
