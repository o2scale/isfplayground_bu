import { useState, useEffect } from "react";

// Hook to get user role from local storage (integrating with existing auth system)
export const useUserRole = () => {
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    // Get role from localStorage (matches existing frontend implementation)
    const role = localStorage.getItem("role") || "student";
    setUserRole(role);
  }, []);

  const isStudent = userRole === "student";
  const isCoach = userRole === "coach";
  const isAdmin = userRole === "admin";

  return {
    userRole,
    isStudent,
    isCoach,
    isAdmin,
    setUserRole, // For demo purposes only
  };
};
