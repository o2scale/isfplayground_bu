const Role = require('../models/role');

const checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(403).json({ error: 'Access denied. User role is not defined.' });
            }

            const userRole = req.user.role;

            const role = await Role.findOne({ roleName: userRole });

            if (!role) {
                return res.status(403).json({ error: 'Access denied. Role not found.' });
            }

            const hasPermission = role.permissions.some((permission) => {
                return (
                    permission.module === module &&
                    permission.actions.includes(action)
                );
            });

            if (!hasPermission) {
                return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
            }

            next();
        } catch (error) {
            console.error('Error in checkPermission middleware:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

module.exports = checkPermission;