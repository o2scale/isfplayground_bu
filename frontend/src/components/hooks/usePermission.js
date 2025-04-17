import { useAuth } from "../../contexts/AuthContext";
import { useRBAC } from "../../contexts/RBACContext";


export const usePermission = () => {
    const {
        permissions,
        allRoles,
        hasPermission,
        hasModuleAccess,
        getAllModules,
        getModuleActions
    } = useRBAC();

    const { user } = useAuth();

    // Check if user can perform an action on a module
    const can = (action, module) => {
        const result = hasPermission(module, action);
        // if (module === "Role Management" && action === "Read") {
        console.log('dasdasd', module, hasPermission(module, action))
        // }

        console.log(`Permission check for ${user?.role} - ${module}:${action}`, {
            result,
            modulePermissions: permissions[module] || [],
            allPermissions: permissions
        });

        return result;
    };

    // Check if user has any permission for a module
    const canAccess = (module) => {
        return hasModuleAccess(module);
    };

    // Check if user can create in a module
    const canCreate = (module) => {
        return hasPermission(module, 'Create');
    };

    // Check if user can read in a module
    const canRead = (module) => {
        return hasPermission(module, 'Read');
    };

    // Check if user can update in a module
    const canUpdate = (module) => {
        return hasPermission(module, 'Update');
    };

    // Check if user can delete in a module
    const canDelete = (module) => {
        return hasPermission(module, 'Delete');
    };

    // Get all modules the user has access to
    const getAccessibleModules = () => {
        return getAllModules().filter(module => hasModuleAccess(module));
    };

    // Get all actions the user can perform on a module
    const getAvailableActions = (module) => {
        return getModuleActions(module);
    };

    return {
        permissions,
        allRoles,
        can,
        canAccess,
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        getAccessibleModules,
        getAvailableActions
    };
};