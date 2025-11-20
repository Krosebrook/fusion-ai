import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [role, setRole] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
    initialData: []
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const assignments = await base44.entities.UserRole.filter({ 
        user_email: currentUser.email,
        active: true 
      });
      
      if (assignments.length > 0) {
        setUserRole(assignments[0]);
        const userRoleData = roles.find(r => r.id === assignments[0].role_id);
        setRole(userRoleData);
      } else {
        // Default viewer role if none assigned
        const viewerRole = roles.find(r => r.slug === 'viewer');
        if (viewerRole) setRole(viewerRole);
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    }
  };

  const hasPermission = (resource, action, resourceId = null) => {
    if (!role) return false;
    
    // Check if user has the specific permission
    const resourcePerms = role.permissions?.[resource];
    if (!resourcePerms || !resourcePerms[action]) return false;

    // Check scope restrictions
    if (userRole?.scope && resourceId) {
      if (resource === 'repositories' && userRole.scope.repository_ids) {
        return userRole.scope.repository_ids.includes(resourceId);
      }
      if (resource === 'environments' && userRole.scope.environment_ids) {
        return userRole.scope.environment_ids.includes(resourceId);
      }
    }

    return true;
  };

  const isAdmin = () => role?.slug === 'administrator';

  return (
    <PermissionContext.Provider value={{ user, role, userRole, hasPermission, isAdmin, loadUser }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
}

export function PermissionGuard({ resource, action, resourceId, children, fallback = null }) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(resource, action, resourceId)) {
    return fallback;
  }
  
  return children;
}