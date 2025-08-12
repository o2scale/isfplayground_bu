// src/components/PermissionGuard.js
import React from "react";
import { useRBAC } from "../contexts/RBACContext";

export const PermissionGuard = ({
  module,
  action,
  fallback = null,
  children,
}) => {
  const { hasPermission } = useRBAC();

  if (!hasPermission(module, action)) {
    return fallback;
  }

  return children;
};
