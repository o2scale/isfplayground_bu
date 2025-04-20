const { errorLogger } = require('../config/pino-config');
const { UserTypes } = require('../constants/users');
const Student = require('./student');
const UserDataAccess = require('../data-access/User');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const path = require('path');

const canvas = require('canvas');
const faceapi = require('face-api.js');
const { default: mongoose } = require('mongoose');
const { getAllBalagruhaIds } = require('../data-access/balagruha');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Function for create User 
exports.createUser = async (payload) => {
    try {
        // Check the user role 
        let { role } = payload;
        switch (role) {
            case UserTypes.STUDENT:
                // return Student.registerStudent(payload);
                return await Student.registerStudentNew(payload);
                break;
            default:
                return this.registerUser(payload);
                break;
        }
    } catch (error) {
        console.log('error', error)
        throw error;
    }
}


// Function for register user 
exports.registerUser = async (payload) => {
    try {
        const { name, email, password, role, balagruhaIds } = payload;
        // separate the comma separated balagruhaIds
        let balagruhaId = [];
        if (balagruhaIds) {
            balagruhaId = balagruhaIds.split(',').map(id => id.trim());
        }
        const newUser = new User({
            name,
            email,
            password,
            role,
            balagruhaIds: balagruhaId || [],
        });

        let result = await newUser.save();
        if (result) {
            return {
                success: true,
                data: {
                    user: result,
                },
                message: 'User registered successfully'
            }
        } else {
            return {
                success: false,
                data: {
                    user: null
                },
                message: result?.message ? result.message : "Failed to register user"
            }
        }
    } catch (error) {
        console.log('error', error)
        errorLogger.error({ data: { error: error } }, `Error occurred during user registration: ${error.message}`);
        throw error;

    }
}


// Function for fetch the user overview details for user management 
exports.getUserManagementOverviewDetails = async () => {
    try {

    } catch (error) {
        console.log('error', error)
        throw error;
    }
}

// Function to find users by role and balagruhaId
exports.findUsersByRoleAndBalagruhaId = async (payload) => {
    try {
        const { role, balagruhaId } = payload;
        const result = await UserDataAccess.getUsersByRoleAndBalagruhaId({ role, balagruhaId });

        if (result.success) {
            return {
                success: true,
                data: {
                    users: result.data || []
                },
                message: "Users fetched successfully"
            };
        } else {
            return {
                success: false,
                data: { users: [] },
                message: "Failed to fetch users"
            };
        }
    } catch (error) {
        console.log('error', error);
        errorLogger.error({ data: { error: error } }, `Error occurred while fetching users by role and balagruhaId: ${error.message}`);
        throw error;
    }
}

// Function to get detailed user information by userId
exports.getUserInfo = async (userId) => {
    try {
        const result = await UserDataAccess.getUserDetailedInfoById({ userId });

        if (result.success && result.data) {
            return {
                success: true,
                data: {
                    user: result.data
                },
                message: "User details fetched successfully"
            };
        } else {
            return {
                success: false,
                data: { user: null },
                message: "User not found"
            };
        }
    } catch (error) {
        console.log('error', error);
        errorLogger.error({ data: { error: error } }, `Error occurred while fetching detailed user information: ${error.message}`);
        throw error;
    }
}

// Update user password
exports.updateUserPasswordByAdmin = async ({ userId, newPassword }) => {
    try {
        // check for the user is existing 
        const user = await UserDataAccess.getUserInfoById({ userId });
        if (!user.success || !user.data) {
            return {
                success: false,
                data: { user: null },
                message: "User not found"
            };
        } else {
            // hash the password
            const salt = await bcrypt.genSalt(10);
            newPassword = await bcrypt.hash(newPassword, salt);
            const result = await UserDataAccess.updateUserById({ userId, payload: { password: newPassword } });

            if (result.success) {
                return {
                    success: true,
                    data: {},
                    message: "User password updated successfully"
                };
            } else {
                return {
                    success: false,
                    data: { user: null },
                    message: "Failed to update user password"
                };
            }
        }
    } catch (error) {
        console.log('error', error)
        throw error;
    }
}

// Function to assign balagruha to the user
exports.assignBalagruhaToUser = async (payload) => {
    try {
        const { userId, balagruhaIds } = payload;
        // separate the comma separated balagruhaIds
        let balagruhaId = [];
        // check the balagruhaIds are array
        if (Array.isArray(balagruhaIds)) {
            balagruhaId = balagruhaIds.map(id => id.trim());
        } else {
            return {
                success: false,
                data: {},
                message: "Balagruha IDs should be an array"
            };
        }

        const result = await UserDataAccess.updateUserById({ userId, payload: { balagruhaIds: balagruhaId } });

        if (result.success) {
            return {
                success: true,
                data: {},
                message: "Balagruha assigned to user successfully"
            };
        } else {
            return {
                success: false,
                data: {},
                message: "Failed to assign balagruha to user"
            };
        }
    } catch (error) {
        console.log('error', error)
        throw error;
    }
}

// Function to update user details by userId
exports.updateUserDetailsById = async (userId, payload) => {
    try {
        // Check if user exists
        const userExists = await UserDataAccess.getUserInfoById({ userId });
        if (!userExists.success || !userExists.data) {
            return {
                success: false,
                data: {},
                message: "User not found"
            };
        }

        // Handle special fields
        const updateData = { ...payload };

        // Don't update password this way - use dedicated password update function
        // delete updateData.password;

        // check the key balagruhaId is an array or string 
        if (typeof updateData.balagruhaIds === 'string') {
            // updateData.balagruhaIds = updateData.balagruhaIds.split(',').map(item => mongoose.Types.ObjectId.createFromHexString(item.trim()));
            updateData.balagruhaIds = updateData.balagruhaIds.split(',').map(item => item.trim());

        } else if (Array.isArray(updateData.balagruhaIds)) {
            // updateData.balagruhaIds = updateData.balagruhaIds.map(item => mongoose.Types.ObjectId.createFromHexString(item))
            updateData.balagruhaIds = updateData.balagruhaIds.map(item => item)

        }

        if (updateData.assignedMachines) {

            // check for assignedMachines is present 
            if (typeof updateData?.assignedMachines === 'string') {
                // convert the comma separated string to array
                updateData.assignedMachines = updateData.assignedMachines.split(",")
                assignedMachinesList = updateData.assignedMachines.map(item => mongoose.Types.ObjectId.createFromHexString(item))
                updateData.assignedMachines = assignedMachinesList;
            } else if (Array.isArray(updateData.assignedMachines)) {
                assignedMachinesList = updateData.assignedMachines.map(item => mongoose.Types.ObjectId.createFromHexString(item))
                updateData.assignedMachines = assignedMachinesList;
            }
        }

        // Handle balagruhaIds if present
        if (updateData.balagruhaIds && Array.isArray(updateData.balagruhaIds)) {
            // updateData.balagruhaIds = updateData.balagruhaIds.map(id => id.trim());
        } else if (updateData.balagruhaIds) {
            delete updateData.balagruhaIds;
        }

        // Process facial data if uploaded
        if (updateData.facialData) {
            // Process facial data here or let data access layer handle it
            let descriptorArray = null;
            if (updateData.facialData) {
                let imagePath = updateData.facialData.path;
                const img = await canvas.loadImage(path.join(process.cwd(), 'uploads', path.basename(imagePath)));
                const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!detection) {
                    return {
                        success: false,
                        data: {},
                        message: "Failed to detect face. Try uploading clear image ",
                        error: 'No face detected'
                    }
                };

                descriptorArray = Array.from(detection.descriptor);
            }
            if (descriptorArray) {
                updateData.facialData = {
                    faceDescriptor: descriptorArray,
                    createdAt: new Date(),
                }
            }
        }

        // Check for the password key is present with any value 
        if (updateData.password && updateData.password !== "") {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Update user
        const result = await UserDataAccess.updateUserById({
            userId,
            payload: updateData
        });

        if (result.success) {
            return {
                success: true,
                data: {
                    user: result.data
                },
                message: "User details updated successfully"
            };
        } else {
            return {
                success: false,
                data: {},
                message: "Failed to update user details"
            };
        }
    } catch (error) {
        console.log('error', error);
        errorLogger.error({ data: { error: error } }, `Error occurred while updating user details: ${error.message}`);
        throw error;
    }
};

// Function to delete user by userId
exports.deleteUserById = async (userId) => {
    try {
        // Check if user exists
        const userExists = await UserDataAccess.getUserInfoById({ userId });

        if (!userExists.success || !userExists.data) {
            return {
                success: false,
                data: {},
                message: "User not found"
            };
        }

        // Delete the user
        const result = await UserDataAccess.deleteUserById({ userId });

        if (result.success) {
            return {
                success: true,
                data: {},
                message: "User deleted successfully"
            };
        } else {
            return {
                success: false,
                data: {},
                message: result.message || "Failed to delete user"
            };
        }
    } catch (error) {
        console.log('error', error);
        errorLogger.error({ data: { error } }, `Error occurred while deleting user: ${error.message}`);
        throw error;
    }
};

// API for fetch the user list by role and assigned balagruha 
exports.getUserListByAssignedBalagruhaByRole = async ({ role, userId }) => {
    try {
        let balagruhaIds = []
        if (role === UserTypes.ADMIN) {
            // get all balagruhaIds 
            let balaIds = await getAllBalagruhaIds();
            if (balaIds.success) {
                balagruhaIds = balaIds.data.map(item => item._id);
                // get all users by the balagruhaIds 
                let result = await UserDataAccess.getUsersByRoleAndBalagruhaId({ role: null, balagruhaIds });
                if (result.success && result.data) {
                    return result.data || []
                } else {
                    return []
                }
            } else {
                return []
            }
        } else {
            let userInfo = await UserDataAccess.getUserInfoById({ userId })
            if (userInfo.success) {
                // get the balagruhaIds 
                balagruhaIds = userInfo.data.balagruhaIds.length > 0 ? userInfo.data.balagruhaIds.map(item => item._id) : [];
                if (balagruhaIds.length === 0) {
                    return []
                } else {
                    // get the users by balagruhaIds 
                    let result = await UserDataAccess.getUsersByRoleAndBalagruhaIdList({ role: UserTypes.STUDENT, balagruhaId: balagruhaIds });
                    if (result.success && result.data) {
                        return result.data || []
                    } else {
                        return []
                    }
                }
            } else {
                return []
            }
        }
    } catch (error) {
        console.log('error', error)
        errorLogger.error({ data: { error } }, `Error occurred while fetching user list by assigned balagruha and role: ${error.message}`);
        throw error;

    }
}


// Server request for fetch the user id by generated id 
exports.getUserIdFromGeneratedId = async ({ generatedId }) => {
    try {
        let userInfo = await UserDataAccess.getIdByGeneratedId({ generatedId: generatedId });
        if (userInfo.success && userInfo.data) {
            return {
                success: true,
                data: userInfo.data._id,
                message: "User ID fetched successfully"
            }
        } else {
            return {
                success: false,
                message: "User ID not found"
            }
        }
    } catch (error) {
        console.error('Error fetching user ID from generated ID:', error);
        throw error;
    }
}