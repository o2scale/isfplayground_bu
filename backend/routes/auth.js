const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticate, authorize } = require('../middleware/auth');
const { UserTypes } = require('../constants/users');
const { fetchMachinesByIds } = require("../data-access/machines")
const upload = require('../middleware/upload');
const { facialLogin } = require('../controllers/userController');
const { ReqSource } = require('../constants/general');
// Register User

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 64f1c2e5b5d6c2a1b8e4f123
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         role:
 *                           type: string
 *                           example: admin
 *                         status:
 *                           type: string
 *                           example: active
 *       400:
 *         description: User already exists
 *       500:
 *         description: Error in registration
 */

// Login User

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 64f1c2e5b5d6c2a1b8e4f123
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         role:
 *                           type: string
 *                           example: admin
 *                         status:
 *                           type: string
 *                           example: active
 *       400:
 *         description: Invalid credentials
 *       423:
 *         description: Account is locked
 *       500:
 *         description: Error in login
 */

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'admin'
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error in registration',
            error: err.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;



        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is locked. Please try again later'
            });
        }

        // Check if user is active
        if (user.status === 'inactive') {
            return res.status(400).json({
                success: false,
                message: 'Account is inactive. Please contact administrator'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            if (user.role !== UserTypes.STUDENT) {

                await user.incrementLoginAttempts();

                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Check for the user role is a student 
        if (user.role === UserTypes.STUDENT) {
            // check the mac id from the header, 
            let macAddress = req.headers['mac-address'];
            // match the mac id from the assigned devices 
            // get the machines details from the users assigned machines 
            if (user.assignedMachines && user.assignedMachines.length > 0) {
                let machineIds = user.assignedMachines.map(item => item)
                console.log('machineIds', machineIds)
                let machines = await fetchMachinesByIds(machineIds)
                if (machines && machines.success) {
                    let machineMacAddressList = machines.data.map(item => item.macAddress)
                    if (machineMacAddressList.includes(macAddress)) {
                        // do nothing, continue the flow,
                    } else {
                        // return res.status(400).json({
                        //     success: false,
                        //     data: {},
                        //     message: "This machine is not assigned for this student. Contact Admin"
                        // })
                    }
                } else {
                    // return res.status(400).json({
                    //     success: false,
                    //     data: {},
                    //     message: "No machines are assigned for this student. Contact Admin"
                    // })
                }
            } else {
                // return res.status(400).json({
                //     success: false,
                //     data: {},
                //     message: "This machine is not assigned for this student. Contact Admin"
                // })
            }

        }


        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    balagruhaIds: user.balagruhaIds || [],
                }
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: err.message
        });
    }
});

router.post('/student/login', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || userId === '') {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find user
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID'
            });
        }
        // return false if the user type if not student
        if (user.role !== UserTypes.STUDENT) {
            return res.status(400).json({
                success: false,
                message: 'User Id login is only for students'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is locked. Please try again later'
            });
        }

        // Check if user is active
        if (user.status === 'inactive') {
            return res.status(400).json({
                success: false,
                message: 'Account is inactive. Please contact administrator'
            });
        }

        // Verify password
        // const isMatch = await user.comparePassword(password);
        // if (!isMatch) {
        // if (user.role !== UserTypes.STUDENT) {

        //     await user.incrementLoginAttempts();

        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid credentials'
        //     });
        // }
        // }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Check for the user role is a student 
        if (user.role === UserTypes.STUDENT) {
            // check the mac id from the header, 
            let macAddress = req.headers['mac-address'];
            // match the mac id from the assigned devices 
            // get the machines details from the users assigned machines 
            if (user.assignedMachines && user.assignedMachines.length > 0) {
                let machineIds = user.assignedMachines.map(item => item)
                console.log('machineIds', machineIds)
                let machines = await fetchMachinesByIds(machineIds)
                if (machines && machines.success) {
                    let machineMacAddressList = machines.data.map(item => item.macAddress)
                    if (machineMacAddressList.includes(macAddress)) {
                        // do nothing, continue the flow,
                    } else {
                        // return res.status(400).json({
                        //     success: false,
                        //     data: {},
                        //     message: "This machine is not assigned for this student. Contact Admin"
                        // })
                    }
                } else {
                    // return res.status(400).json({
                    //     success: false,
                    //     data: {},
                    //     message: "No machines are assigned for this student. Contact Admin"
                    // })
                }
            } else {
                // return res.status(400).json({
                //     success: false,
                //     data: {},
                //     message: "This machine is not assigned for this student. Contact Admin"
                // })
            }

        }


        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    balagruhaIds: user.balagruhaIds || [],

                }
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: err.message
        });
    }
});

router.post('/student/login', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || userId === '') {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find user
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID'
            });
        }
        // return false if the user type if not student
        if (user.role !== UserTypes.STUDENT) {
            return res.status(400).json({
                success: false,
                message: 'User Id login is only for students'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is locked. Please try again later'
            });
        }

        // Check if user is active
        if (user.status === 'inactive') {
            return res.status(400).json({
                success: false,
                message: 'Account is inactive. Please contact administrator'
            });
        }

        // Verify password
        // const isMatch = await user.comparePassword(password);
        // if (!isMatch) {
        // if (user.role !== UserTypes.STUDENT) {

        //     await user.incrementLoginAttempts();

        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid credentials'
        //     });
        // }
        // }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Check for the user role is a student 
        if (user.role === UserTypes.STUDENT) {
            // check the mac id from the header, 
            let macAddress = req.headers['mac-address'];
            let reqSource = req.headers['req-source'];
            // match the mac id from the assigned devices 
            // get the machines details from the users assigned machines 
            if (user.assignedMachines && user.assignedMachines.length > 0) {
                let machineIds = user.assignedMachines.map(item => item)
                console.log('machineIds', machineIds)
                let machines = await fetchMachinesByIds(machineIds)
                if (machines && machines.success) {
                    let machineMacAddressList = machines.data.map(item => item.macAddress)
                    if (machineMacAddressList.includes(macAddress)) {
                        // do nothing, continue the flow,
                    } else {
                        // if (reqSource == ReqSource.ELECTRON) {
                        //     return res.status(400).json({
                        //         success: false,
                        //         data: {},
                        //         message: "This machine is not assigned for this student. Contact Admin"
                        //     })
                        // }
                    }
                } else {
                    // if (reqSource == ReqSource.ELECTRON) {
                    //     return res.status(400).json({
                    //         success: false,
                    //         data: {},
                    //         message: "No machines are assigned for this student. Contact Admin"
                    //     })
                    // }
                }
            } else {
                // if (reqSource == ReqSource.ELECTRON) {
                //     return res.status(400).json({
                //         success: false,
                //         data: {},
                //         message: "This machine is not assigned for this student. Contact Admin"
                //     })
                // }
            }
        }


        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: err.message
        });
    }
});

// Get User Profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: err.message
        });
    }
});

// Update User Profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: err.message
        });
    }
});

// Change Password
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: err.message
        });
    }
});

// API for facial login 
router.post('/student/facial/login',
    upload.fields([
        { name: 'facialData', maxCount: 5 }, // Up to 5 files for facialData
    ]),
    facialLogin
);
module.exports = router;