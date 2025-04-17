const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const Machine = require('../models/machine');
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || user.status === 'inactive') {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive',
            });
        }

        const macAddress = req.header('MAC-Address');

        // if (!macAddress) {
        if (false) {

            return res.status(403).json({
                success: false,
                message: 'MAC Address is required',
            });
        }

        const machine = await Machine.findOne({
            macAddress: macAddress,
            status: 'active',
        });

        // mac id temp comment
        // if (!machine) {
        if (false) {

            return res.status(403).json({
                success: false,
                message: 'Access denied: Invalid or inactive machine',
            });
        }

        if (user.role === 'Student') {
            if (String(user.balagruhaId) !== String(machine.AssignedBalagruha)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Student is not in the same Balagruha as the machine',
                });
            }
        }

        req.user = user;
        req.machine = machine;

        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({
            success: false,
            message: 'Invalid token or MAC Address',
        });
    }
};



exports.authorize = (module, action) => {
    return async (req, res, next) => {
        try {
            console.log('auth res: ', req.user)
            const userRole = req.user.role;

            const role = await Role.findOne({ roleName: userRole });

            if (!role) {
                return res.status(403).json({
                    success: false,
                    message: `Role ${userRole} not found`,
                });
            }

            const hasPermission = role.permissions.some((permission) => {
                return (
                    permission.module === module &&
                    permission.actions.includes(action)
                );
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Role ${userRole} is not authorized to perform ${action} on ${module}`,
                });
            }

            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
};