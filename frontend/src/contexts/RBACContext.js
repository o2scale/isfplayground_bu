// src/contexts/RBACContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import config from "../config";

const RBACContext = createContext(null);

export const RBACProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [allRoles, setAllRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isAuthenticated || authLoading) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await axios.get(
          `${config.API_BASE_URL}/api/roles/getAllRolePermissions`
        );

        console.log("Roles API response:", response.data);

        // Check if the response has the expected format
        if (response.data) {
          // If the response is directly the permissions array
          if (Array.isArray(response.data)) {
            console.log("Direct permissions array detected");

            // Format the permissions into our expected structure
            const formattedPermissions = {};
            response.data.forEach((permission) => {
              formattedPermissions[permission.module] = permission.actions;
            });

            console.log("Formatted permissions:", formattedPermissions);
            setPermissions(formattedPermissions);
            setAllRoles([{ roleName: user.role, permissions: response.data }]);
          }
          // If the response has a success property and roles array
          else if (
            response.data.success &&
            Array.isArray(response.data.roles)
          ) {
            setAllRoles(response.data.roles);

            // Get user role from auth context
            const userRole = user.role.toLowerCase();
            console.log("User role:", userRole);
            console.log(
              "Available roles:",
              response.data.roles.map((r) => r.roleName.toLowerCase())
            );

            // Find matching role in API response
            const roleData = response.data.roles.find(
              (role) => role.roleName.toLowerCase() === userRole
            );

            console.log("Found role data:", roleData);

            if (roleData) {
              // Transform permissions to our format for easier access
              const formattedPermissions = {};

              roleData.permissions.forEach((permission) => {
                formattedPermissions[permission.module] = permission.actions;
              });

              console.log("Formatted permissions:", formattedPermissions);
              setPermissions(formattedPermissions);
            } else {
              console.warn(`Role '${userRole}' not found in permissions data`);
              setPermissions({});
            }
          } else {
            console.error("Unexpected API response format:", response.data);
            setPermissions({});
          }
        } else {
          console.error("API returned empty response");
          setPermissions({});
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        setError("Failed to load permissions");
        setPermissions({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user, isAuthenticated, authLoading]);

  const hasPermission = (module, action) => {
    console.log(`Checking permission for ${module}:${action}`, permissions);
    if (!permissions || !permissions[module]) return false;
    if (module === "Role Management" && action == "Read") {
      console.log(
        "black baccc",
        module,
        "-",
        action,
        ":",
        permissions[module].includes(action)
      );
    }
    return permissions[module].includes(action);
  };

  const hasModuleAccess = (module) => {
    return !!permissions[module] && permissions[module].length > 0;
  };

  const getAllModules = () => {
    return Object.keys(permissions);
  };

  const getModuleActions = (module) => {
    return permissions[module] || [];
  };

  const getRoles = () => {
    return allRoles;
  };

  const getRolePermissions = (roleName) => {
    const role = allRoles.find(
      (r) => r.roleName.toLowerCase() === roleName.toLowerCase()
    );
    return role ? role.permissions : [];
  };

  return (
    <RBACContext.Provider
      value={{
        permissions,
        allRoles,
        isLoading,
        error,
        hasPermission,
        hasModuleAccess,
        getAllModules,
        getModuleActions,
        getRoles,
        getRolePermissions,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};
