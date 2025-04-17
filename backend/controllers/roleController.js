const Role = require('../models/role');

exports.createRole = async (req, res) => {
    try {
        const { roleName, permissions } = req.body;

        if (!roleName || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Role name and permissions are required, and permissions must be an array' });
        }

        // Check if the role already exists
        const existingRole = await Role.findOne({ roleName: roleName.trim() });
        if (existingRole) {
            return res.status(400).json({ error: 'Role already exists' });
        }

        // Create the new role
        const role = new Role({ roleName: roleName.trim(), permissions });
        await role.save();

        res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body;

        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Permissions must be an array of modules with actions' });
        }

        // Find the role by ID
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Iterate through the permissions array and update each module
        permissions.forEach((permission) => {
            const { module, actions } = permission;

            if (!module || !Array.isArray(actions)) {
                throw new Error('Each permission must have a module name and an array of actions');
            }

            // Check if the module already exists in the permissions array
            const moduleIndex = role.permissions.findIndex((perm) => perm.module === module);

            if (moduleIndex !== -1) {
                // If the module exists, update its actions
                role.permissions[moduleIndex].actions = actions;
            } else {
                // If the module does not exist, add it to the permissions array
                role.permissions.push({ module, actions });
            }
        });

        // Save the updated role
        await role.save();

        res.status(200).json({ message: 'Permissions updated successfully', role });
    } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();

        if (!roles || roles.length === 0) {
            return res.status(404).json({ error: 'No roles found' });
        }

        res.status(200).json({ success: true, roles });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.status(200).json({ success: true, role });
    } catch (error) {
        console.error('Error fetching role by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findByIdAndDelete(roleId);
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllRolePermissions = async (req, res) => {
    try {
        const roles = await Role.find();

        if (!roles || roles.length === 0) {
            return res.status(404).json({ error: 'No roles found' });
        }

        res.status(200).json({ success: true, roles });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};