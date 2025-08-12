
import { useState, useEffect } from 'react';

// Mock user role hook - in real app this would come from auth context
export const useUserRole = () => {
  const [userRole, setUserRole] = useState<'student' | 'coach' | 'admin'>('student');
  
  // For demo purposes, we'll simulate different roles
  // In production, this would come from your authentication system
  useEffect(() => {
    // You can change this to test different roles
    // For now, let's make it admin to see the admin controls
    setUserRole('admin');
  }, []);

  const isStudent = userRole === 'student';
  const isCoach = userRole === 'coach';
  const isAdmin = userRole === 'admin';

  return {
    userRole,
    isStudent,
    isCoach,
    isAdmin,
    setUserRole // For demo purposes only
  };
};
