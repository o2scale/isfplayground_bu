const express = require('express');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     tags:
 *       - Users
 *     description: Retrieve a list of all users. Requires "Read" permission for "User Management".
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   status:
 *                     type: string
 *                   lastLogin:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Forbidden - User does not have the required permission
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     tags:
 *       - Users
 *     description: Retrieve a user's details by their ID. Requires "Read" permission for "User Management".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 status:
 *                   type: string
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Forbidden - User does not have the required permission
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     tags:
 *       - Users
 *     description: Create a new user. Requires "Create" permission for "User Management".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Forbidden - User does not have the required permission
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     tags:
 *       - Users
 *     description: Update a user's details by their ID. Requires "Update" permission for "User Management".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *               lastLogin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - User does not have the required permission
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     tags:
 *       - Users
 *     description: Delete a user by their ID. Requires "Delete" permission for "User Management".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden - User does not have the required permission
 *       401:
 *         description: Unauthorized - Authentication required
 */

router.get('/', authenticate, authorize('User Management', 'Read'), getAllUsers);
router.get('/:_id', authenticate, authorize('User Management', 'Read'), getUserById);
router.post('/', authenticate, authorize('User Management', 'Create'), createUser);
router.put('/:id', authenticate, authorize('User Management', 'Update'), updateUser);
router.delete('/:id', authenticate, authorize('User Management', 'Delete'), deleteUser);

module.exports = router;