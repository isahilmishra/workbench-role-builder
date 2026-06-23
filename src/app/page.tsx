"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import compStyles from "@/styles/components.module.css";
import { Role } from "@/lib/db";

type PermissionsMatrix = Record<string, string[]>;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [matrix, setMatrix] = useState<PermissionsMatrix>({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Toast State
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };
  
  // Form State
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPerms, setFormPerms] = useState<PermissionsMatrix>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/roles").then(res => res.json()),
      fetch("/api/permissions").then(res => res.json())
    ]).then(([rolesData, matrixData]) => {
      setRoles(rolesData);
      setMatrix(matrixData);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormName(role.name);
      setFormDesc(role.description);
      setFormPerms(JSON.parse(JSON.stringify(role.permissions)));
    } else {
      setEditingRole(null);
      setFormName("");
      setFormDesc("");
      
      // Initialize empty permissions based on matrix
      const emptyPerms: PermissionsMatrix = {};
      Object.keys(matrix).forEach(resource => {
        emptyPerms[resource] = [];
      });
      setFormPerms(emptyPerms);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleTogglePermission = (resource: string, action: string) => {
    if (editingRole?.isSystem) return; // Prevent editing system roles

    setFormPerms(prev => {
      const updated = { ...prev };
      if (!updated[resource]) updated[resource] = [];
      
      if (updated[resource].includes(action)) {
        updated[resource] = updated[resource].filter(a => a !== action);
      } else {
        updated[resource] = [...updated[resource], action];
      }
      return updated;
    });
  };

  const handleSaveRole = async () => {
    if (!formName.trim()) return alert("Role name is required");

    const payload = {
      name: formName,
      description: formDesc,
      permissions: formPerms
    };

    if (editingRole) {
      // Update
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setRoles(roles.map(r => r.id === updated.id ? updated : r));
      }
    } else {
      // Create
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        setRoles([...roles, created]);
        showToast("Role created successfully!");
      }
    }
    handleCloseModal();
  };

  const handleDeleteRole = async (roleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this role? It will be removed from all assigned users.")) return;
    
    const res = await fetch(`/api/roles/${roleId}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setRoles(roles.filter(r => r.id !== roleId));
      showToast("Role deleted successfully!");
    }
  };

  if (loading) return (
    <div className={compStyles.spinnerWrapper}>
      <div className={compStyles.spinner}></div>
    </div>
  );

  return (
    <div>
      <div className={compStyles.pageHeader}>
        <h1 className={compStyles.pageTitle}>Roles & Permissions</h1>
        <button 
          className={`${compStyles.button} ${compStyles.buttonPrimary}`}
          onClick={() => handleOpenModal()}
        >
          Create Custom Role
        </button>
      </div>

      <div className={styles.rolesGrid}>
        {roles.map(role => {
          const permCount = Object.values(role.permissions).reduce((acc, curr) => acc + curr.length, 0);
          
          return (
            <div key={role.id} className={compStyles.card}>
              <div className={compStyles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 className={compStyles.cardTitle}>{role.name}</h3>
                  {role.isSystem && <span className={`${compStyles.badge} ${compStyles.badgeSystem}`}>System</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`${compStyles.button} ${compStyles.buttonSecondary}`}
                    onClick={() => handleOpenModal(role)}
                  >
                    {role.isSystem ? 'View' : 'Edit'}
                  </button>
                  {!role.isSystem && (
                    <button 
                      className={`${compStyles.button} ${compStyles.buttonDanger}`}
                      onClick={(e) => handleDeleteRole(role.id, e)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div className={compStyles.cardBody}>
                <p className={styles.roleDesc}>{role.description}</p>
                <div className={styles.roleStats}>
                  <span>{permCount} permissions</span>
                  <span>·</span>
                  <span>{Object.keys(role.permissions).filter(k => role.permissions[k].length > 0).length} resources</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className={compStyles.modalOverlay}>
          <div className={compStyles.modalContent}>
            <div className={compStyles.modalHeader}>
              <h2 className={compStyles.cardTitle}>
                {editingRole ? (editingRole.isSystem ? 'View Role' : 'Edit Role') : 'Create Custom Role'}
              </h2>
              <button onClick={handleCloseModal} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>×</button>
            </div>
            
            <div className={compStyles.modalBody}>
              <div className={compStyles.formGroup}>
                <label className={compStyles.label}>Role Name</label>
                <input 
                  type="text" 
                  className={compStyles.input}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={editingRole?.isSystem}
                  placeholder="e.g. Marketing Contractor"
                />
              </div>
              
              <div className={compStyles.formGroup}>
                <label className={compStyles.label}>Description</label>
                <textarea 
                  className={compStyles.input}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  disabled={editingRole?.isSystem}
                  placeholder="Briefly describe what this role is for..."
                  rows={2}
                />
              </div>

              <div className={compStyles.formGroup} style={{ marginTop: '2rem' }}>
                <label className={compStyles.label}>Permissions</label>
                <table className={styles.matrixTable}>
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(matrix).map(([resource, actions]) => (
                      <tr key={resource}>
                        <td className={styles.resourceName}>{resource}</td>
                        <td>
                          <div className={styles.actionsGroup}>
                            {actions.map(action => {
                              const isChecked = formPerms[resource]?.includes(action);
                              return (
                                <label key={action} className={styles.checkboxLabel}>
                                  <input 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                    checked={isChecked || false}
                                    disabled={editingRole?.isSystem}
                                    onChange={() => handleTogglePermission(resource, action)}
                                  />
                                  <span style={{ textTransform: 'capitalize' }}>{action}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={compStyles.modalFooter}>
              <button 
                className={`${compStyles.button} ${compStyles.buttonSecondary}`}
                onClick={handleCloseModal}
              >
                {editingRole?.isSystem ? 'Close' : 'Cancel'}
              </button>
              {!editingRole?.isSystem && (
                <button 
                  className={`${compStyles.button} ${compStyles.buttonPrimary}`}
                  onClick={handleSaveRole}
                >
                  Save Role
                </button>
              )}
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
