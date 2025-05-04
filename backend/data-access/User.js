const { default: mongoose } = require("mongoose")
const User = require("../models/user")
const { dateToString } = require("../utils/helper")
const { UserTypes } = require("../constants/users")

// Create User 
exports.createUser = async (payload) => {

    return await User.create([payload]).then(result => {
        return {
            success: true,
            data: result,
            message: "User created successfully"
        }
    }).catch(error => {
        console.log('error', error);

        // Check if this is a duplicate key error (usually for email)
        if (error.code === 11000) {
            if (error.keyPattern.userId) {
                return {
                    success: false,
                    data: null,
                    message: "UserId already exists. Please use a different UserId"
                };
            } else if (error.keyPattern.email) {
                return {
                    success: false,
                    data: null,
                    message: "Email already exists. Please use a different email address."
                };
            }
        }

        if (error?.errors?.userId?.path == 'userId') {
            return {
                success: false,
                data: null,
                message: "UserId already exists. Please use a different UserId"
            }
        } else if (error?.errors?.email?.path == 'email') {
            return {
                success: false,
                data: null,
                message: "Email already exists. Please use a different email address."
            }
        }

        throw error;
    })
}

// Function for fetch the user overview details for user management
exports.getAllUserDetailsForOverview = async ({ balagruhaId }) => {
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$elemMatch': {
                        '$eq': mongoose.Types.ObjectId.createFromHexString(balagruhaId)
                    }
                }
            }
        },
        {
            '$lookup': {
                'from': 'medicalrecords',
                'localField': 'medicalRecords',
                'foreignField': '_id',
                'as': 'medicalRecords'
            }
        },
        {
            '$project': {
                'facialData': 0,
                'email': 0,
                'password': 0,
                'passwordResetToken': 0,
                'loginAttempts': 0,
                'createdAt': 0,
                '__v': 0
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the task list by balagruha id 
exports.getTasksByBalagruhaIdAndFilter = async ({ balagruhaId, status = ['pending', 'in progress', 'completed'],
    priority = ['low', 'medium', 'high'],
    createdBy = null,
    page = 1, limit = 10,
    currentUserId, userRole,
    assignedIds = [],
    type
}) => {

    // check the key balagruhaId is an array or string 
    if (typeof balagruhaId === 'string') {
        balagruhaId = [mongoose.Types.ObjectId.createFromHexString(balagruhaId)]
    } else if (Array.isArray(balagruhaId)) {
        balagruhaId = balagruhaId.map(item => mongoose.Types.ObjectId.createFromHexString(item))
    }
    // check the key balagruhaId is an array 
    // if (Array.isArray(balagruhaId)) {
    //     balagruhaId = balagruhaId.map(item => mongoose.Types.ObjectId.createFromHexString(item))
    // }
    // check the key assignedIds is an array
    // get the user role hierarchy

    page = parseInt(page);
    let skip = (page - 1) * limit;
    // let balagruhaIds = balagruhaIds.forEach(item => mongoose.Types.ObjectId.createFromHexString(item))
    return await User.aggregate([
        {
            '$match': {
                $or: [
                    {
                        balagruhaIds: {
                            $in: balagruhaId
                        }
                    },
                    { balagruhaIds: { $eq: [] } }
                ]
            }
        }, {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'userTasks'
            }
        }, {
            '$unwind': '$userTasks'
        },
        {
            '$match': {
                'userTasks.status': {
                    '$in': status
                },
                'userTasks.priority': {
                    '$in': priority
                },
                'userTasks.type': {
                    '$in': type

                } // Added filter for task type
            }
        },
        {
            '$match': {
                ...(assignedIds && assignedIds.length > 0 && {
                    'userTasks.assignedUser': {
                        '$in': assignedIds.map(id => id)
                    }
                })
            }
        },
        {
            '$match': {
                ...(createdBy && createdBy.length > 0 && {
                    'userTasks.createdBy': {
                        '$in': createdBy.map(id => mongoose.Types.ObjectId.createFromHexString(id))
                    }
                })
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'userTasks.createdBy',
                'foreignField': '_id',
                'as': 'createdByDetails'
            }
        }, {
            '$facet': {
                'documents': [
                    {
                        '$skip': skip
                    }, {
                        '$limit': limit
                    }, {
                        '$project': {
                            'email': 0,
                            'password': 0,
                            'lastLogin': 0,
                            'passwordResetToken': 0,
                            'loginAttempts': 0,
                            'parentalStatus': 0,
                            'guardianContact': 0,
                            'performanceReports': 0,
                            'attendanceRecords': 0,
                            'medicalRecords': 0,
                            '__v': 0,
                            'createdByDetails.email': 0,
                            'createdByDetails.password': 0,
                            'createdByDetails.status': 0,
                            'createdByDetails.loginAttempts': 0,
                            'createdByDetails.createdAt': 0,
                            'createdByDetails.updatedAt': 0,
                            'createdByDetails.__v': 0,
                            'createdByDetails.lastLogin': 0,
                            'createdByDetails.attendanceRecords': 0,
                            'createdByDetails.medicalRecords': 0,
                            'createdByDetails.parentalStatus': 0,
                            'createdByDetails.performanceReports': 0,
                            'createdByDetails.assignedMachines': 0
                        }
                    }
                ],
                'totalCount': [
                    {
                        '$count': 'total'
                    }
                ]
            }
        }, {
            '$project': {
                'documents': 1,
                'totalCount': {
                    '$arrayElemAt': [
                        '$totalCount.total', 0
                    ]
                }
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the user details by user id 
exports.getUserInfoById = async ({ userId }) => {
    return await User.findOne({ _id: userId })
        .populate({
            path: 'balagruhaIds',
            model: 'Balagruha'
        })
        .populate({
            path: 'assignedMachines',
            model: 'Machine'
        })
        .populate({
            path: 'medicalRecords',
            model: 'MedicalRecord'
        })
        .lean()
        .then(result => {
            return {
                success: true,
                data: result,
                message: "User details fetched successfully"
            }
        }).catch(error => {
            console.log('error', error)
            throw error;
        })
}

exports.getUserDetailsById = async ({ userId }) => {
    return await User.aggregate([
        {
            '$match': {
                '_id': userId
            }
        }, {
            '$lookup': {
                'from': 'balagruhas',
                'localField': 'balagruhaIds',
                'foreignField': '_id',
                'as': 'balagruhaIds'
            }
        }, {
            '$lookup': {
                'from': 'machines',
                'localField': 'assignedMachines',
                'foreignField': '_id',
                'as': 'assignedMachines'
            }
        }, {
            '$lookup': {
                'from': 'medicalrecords',
                'localField': 'medicalRecords',
                'foreignField': '_id',
                'as': 'medicalRecords'
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result[0] || null,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for update the user details by user id with comprehensive updates
exports.updateUserById = async ({ userId, payload }) => {
    try {
        // Handle special fields that might need preprocessing
        const updateData = { ...payload };

        // Handle nested fields like facial data if uploaded
        // if (updateData.facialData) {
        //     // If facialData is a file object, process it
        //     if (updateData.facialData.buffer) {
        //         // Store file paths or process as needed based on your application logic
        //         // This is just a placeholder - you'll need to customize this
        //         updateData.facialData = {
        //             faceDescriptor: [], // This should be processed appropriately
        //             createdAt: new Date()
        //         };
        //     }
        // }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: false }
        ).lean();

        if (!updatedUser) {
            return {
                success: false,
                data: null,
                message: "User not found"
            };
        }

        return {
            success: true,
            data: updatedUser,
            message: "User details updated successfully"
        };
    } catch (error) {
        console.log('error', error);
        throw error;
    }
}

// Function for fetch the task list by balagruha id 
exports.getUsersTaskDetailsByStatusAndBalagruhaIds = async ({ balagruhaId, page = 1, limit = 10 }) => {


    page = parseInt(page);
    let skip = (page - 1) * limit;


    let pipeline = [
        {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'userTasks'
            }
        }, {
            '$unwind': '$userTasks'
        }, {
            '$facet': {
                'documents': [
                    {
                        '$skip': skip
                    }, {
                        '$limit': limit
                    }, {
                        '$project': {
                            'email': 0,
                            'password': 0,
                            'lastLogin': 0,
                            'passwordResetToken': 0,
                            'loginAttempts': 0,
                            'parentalStatus': 0,
                            'guardianContact': 0,
                            'performanceReports': 0,
                            'attendanceRecords': 0,
                            'medicalRecords': 0,
                            '__v': 0,
                            'createdByDetails.email': 0,
                            'createdByDetails.password': 0,
                            'createdByDetails.status': 0,
                            'createdByDetails.loginAttempts': 0,
                            'createdByDetails.createdAt': 0,
                            'createdByDetails.updatedAt': 0,
                            'createdByDetails.__v': 0,
                            'createdByDetails.lastLogin': 0,
                            'createdByDetails.attendanceRecords': 0,
                            'createdByDetails.medicalRecords': 0,
                            'createdByDetails.parentalStatus': 0,
                            'createdByDetails.performanceReports': 0,
                            'createdByDetails.assignedMachines': 0
                        }
                    }
                ],
                'totalCount': [
                    {
                        '$count': 'total'
                    }
                ]
            }
        }, {
            '$project': {
                'documents': 1,
                'totalCount': {
                    '$arrayElemAt': [
                        '$totalCount.total', 0
                    ]
                }
            }
        }
    ]

    if (balagruhaIds.length == 0) {
        // add match condition to the start of the pipeline
        pipeline.unshift({
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': [
                        [mongoose.Types.ObjectId.createFromHexString(balagruhaIds)]
                    ]
                }
            }
        })
    }


    return await User.aggregate()
        .then(result => {
            return {
                success: true,
                data: result,
                message: "User details fetched successfully"
            }
        }).catch(error => {
            console.log('error', error)
            throw error;
        })
}

// Function for fetch the user ids by user roles list 
exports.getUserIdsByRoles = async ({ roles }) => {
    return await User.find({ role: { $in: roles } }, { _id: 1 }).lean().then(result => {

        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Fetch the student details with balagruha id with attendance by date 
exports.getStudentListByBalagruhaIdWithAttendance = async ({ balagruhaId, date }) => {
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': [
                        mongoose.Types.ObjectId.createFromHexString(balagruhaId)
                    ]
                }
            }
        }, {
            '$lookup': {
                'from': 'attendances',
                'localField': '_id',
                'foreignField': 'studentId',
                'as': 'attendance'
            }
        }, {
            '$set': {
                'attendance': {
                    '$filter': {
                        'input': '$attendance',
                        'as': 'att',
                        'cond': {
                            '$eq': [
                                '$$att.dateString', dateToString(new Date(date))
                            ]
                        }
                    }
                }
            }
        }, {
            '$project': {
                'password': 0,
                'passwordResetToken': 0,
                'loginAttempts': 0,
                'lockUntil': 0,
                'performanceReports': 0,
                'attendanceRecords': 0,
                'medicalRecords': 0
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Student details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the task overview count details by balagruha id
exports.getTasksOverviewCountByBalagruhaId = async ({ balagruhaId }) => {
    return await User.aggregate([
        {
            '$match': {
                'balagruhaIds': mongoose.Types.ObjectId.createFromHexString(balagruhaId)
            }
        }, {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'matchedTasks'
            }
        }, {
            '$unwind': '$matchedTasks'
        }, {
            '$group': {
                '_id': '$_id',
                'totalTasks': {
                    '$sum': 1
                },
                'completedTasks': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$matchedTasks.status', 'completed'
                                ]
                            }, 1, 0
                        ]
                    }
                },
                'pendingTasks': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$matchedTasks.status', 'pending'
                                ]
                            }, 1, 0
                        ]
                    }
                },
                'inProgressTasks': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$matchedTasks.status', 'in progress'
                                ]
                            }, 1, 0
                        ]
                    }
                }
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Task overview details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// API for fetch the user details by user role 
exports.findUsersByRole = async ({ role }) => {
    return await User.find({ role }).lean().then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the user object by user id 
exports.getUserObjectById = async ({ userId }) => {
    return await User.findOne({ _id: userId }).then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch users by role and balagruha id
exports.getUsersByRoleAndBalagruhaId = async ({ role, balagruhaId }) => {
    let query = {};
    if (role && role != ":role") {
        query.role = role;
    }
    if (balagruhaId) {
        query.balagruhaIds = {
            $in: [mongoose.Types.ObjectId.createFromHexString(balagruhaId)]
        };
    }

    return await User.find(query)
        .select('-password -passwordResetToken -loginAttempts -lockUntil -facialData -updatedAt -__v')
        .lean()
        .then(result => {
            return {
                success: true,
                data: result,
                message: "Users fetched successfully"
            }
        }).catch(error => {
            console.log('error', error)
            throw error;
        })
}

// Function for fetch detailed user information by userId with references
exports.getUserDetailedInfoById = async ({ userId }) => {
    return await User.aggregate([
        {
            '$match': {
                '_id': mongoose.Types.ObjectId.createFromHexString(userId)
            }
        },
        {
            '$lookup': {
                'from': 'balagruhas',
                'localField': 'balagruhaIds',
                'foreignField': '_id',
                'as': 'balagruhaDetails'
            }
        },
        {
            '$lookup': {
                'from': 'machines',
                'localField': 'assignedMachines',
                'foreignField': '_id',
                'as': 'assignedMachines'
            }
        },
        {
            '$project': {
                'password': 0,
                'passwordResetToken': 0,
                'loginAttempts': 0,
                'lockUntil': 0,
                '__v': 0,
                'updatedAt': 0,
                'facialData': 0,
                'balagruhaDetails.assignedMachines': 0,
                'balagruhaIds': 0,
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result[0] || null,
            message: result[0] ? "User details fetched successfully" : "User not found"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the sports tasks with pagination and filters
exports.getUserSportsTasksByFilters = async ({
    balagruhaId,
    status = ['pending', 'in progress', 'completed'],
    priority = ['low', 'medium', 'high'],
    createdBy = null,
    page = 1,
    limit = 10,
    currentUserId,
    userRole,
    assignedIds = [],
    drillOrExerciseType = []
}) => {
    page = parseInt(page);
    let skip = (page - 1) * limit;

    // check the key balagruhaId is an array or string 
    if (typeof balagruhaId === 'string') {
        balagruhaId = [mongoose.Types.ObjectId.createFromHexString(balagruhaId)]
    } else if (Array.isArray(balagruhaId)) {
        balagruhaId = balagruhaId.map(item => mongoose.Types.ObjectId.createFromHexString(item))
    }


    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    // '$in': [
                    //     mongoose.Types.ObjectId.createFromHexString(balagruhaId)
                    // ]
                    '$in': balagruhaId
                }
            }
        }, {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'userSportsTasks'
            }
        },
        {
            "$set": {
                "userSportsTasks": {
                    "$filter": {
                        "input": "$userSportsTasks",
                        "as": "task",
                        "cond": {
                            "$and": [
                                { "$in": ["$$task.priority", priority] },
                                { "$eq": ["$$task.type", "sports"] }
                            ]
                        }
                    }
                }
            }
        },
        // {
        //     '$match': {
        //         'userSportsTasks.priority': {
        //             '$in': priority
        //         }
        //     }
        // },

        // {
        //     '$match': {
        //         'userSportsTasks.status': {
        //             '$in': status
        //         }
        //     }
        // },
        {
            "$set": {
                "userSportsTasks": {
                    "$filter": {
                        "input": "$userSportsTasks",
                        "as": "task",
                        "cond": {
                            "$in": ["$$task.status", status]
                        }
                    }
                }
            }
        },

        ...(drillOrExerciseType && drillOrExerciseType.length > 0 ? [{
            '$set': {
                'userSportsTasks': {
                    '$filter': {
                        'input': '$userSportsTasks',
                        'as': 'task',
                        'cond': {
                            '$in': [
                                '$$task.drillOrExerciseType', drillOrExerciseType
                            ]
                        }
                    }
                }
            }
        }] : []),
        {
            '$match': {
                ...(assignedIds && assignedIds.length > 0 && {
                    '_id': {
                        '$in': assignedIds.map(id => id)
                    }
                })
            }
        }, {
            '$match': {}
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'userSportsTasks.createdBy',
                'foreignField': '_id',
                'as': 'createdByDetails'
            }
        },
        {
            '$match': {
                'userSportsTasks.0': {
                    '$exists': true
                }
            }
        },
        {
            '$facet': {
                'documents': [
                    {
                        '$skip': skip
                    }, {
                        '$limit': limit
                    }, {
                        '$project': {
                            'email': 0,
                            'password': 0,
                            'lastLogin': 0,
                            'passwordResetToken': 0,
                            'loginAttempts': 0,
                            'parentalStatus': 0,
                            'guardianContact': 0,
                            'performanceReports': 0,
                            'attendanceRecords': 0,
                            'medicalRecords': 0,
                            'facialData': 0,
                            '__v': 0,
                            'createdByDetails.email': 0,
                            'createdByDetails.password': 0,
                            'createdByDetails.status': 0,
                            'createdByDetails.loginAttempts': 0,
                            'createdByDetails.createdAt': 0,
                            'createdByDetails.updatedAt': 0,
                            'createdByDetails.__v': 0,
                            'createdByDetails.lastLogin': 0,
                            'createdByDetails.attendanceRecords': 0,
                            'createdByDetails.medicalRecords': 0,
                            'createdByDetails.parentalStatus': 0,
                            'createdByDetails.performanceReports': 0,
                            'createdByDetails.facialData': 0,
                            'createdByDetails.assignedMachines': 0
                        }
                    }
                ],
                'totalCount': [
                    {
                        '$count': 'total'
                    }
                ]
            }
        }, {
            '$project': {
                'documents': 1,
                'totalCount': {
                    '$arrayElemAt': [
                        '$totalCount.total', 0
                    ]
                }
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Sports tasks fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Find the total number of students by balagruha id 
exports.getTotalStudentsCountByBalagruhaId = async ({ balagruhaIds }) => {
    return await User.aggregate([
        {
            '$match': {
                'balagruhaIds': {
                    '$in': balagruhaIds
                },
                'role': UserTypes.STUDENT
            }
        }, {
            '$count': 'total'
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Total students fetched successfully"
        }
    }
    ).catch(error => {
        console.log('error', error)
        throw error;
    })

}

// Function for fetch the count of the sports tasks by balagruha ( active tasks )
exports.getSportsTasksCountByBalagruhaId = async ({ balagruhaIds }) => {
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': balagruhaIds
                }
            }
        }, {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'sportsTasks'
            }
        }, {
            '$unwind': '$sportsTasks'
        }, {
            '$match': {
                'sportsTasks.status': 'pending'
            }
        }, {
            '$group': {
                '_id': null,
                'totalSportsTasksCount': {
                    '$sum': 1
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'totalSportsTasksCount': 1
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Sports tasks count fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch all students users sports task by balagruhaId and given date 
exports.getStudentsWithSportsTaskByBalagruhaId = async ({ balagruhaIds, date }) => {
    // Convert input date to a Date object if it's a string
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': balagruhaIds
                }
            }
        }, {
            '$lookup': {
                'from': 'sports_tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'sportsTasks'
            }
        }, {
            '$unwind': '$sportsTasks'
        }, {
            '$match': {
                '$expr': {
                    '$and': [
                        {
                            '$eq': [
                                {
                                    '$year': '$sportsTasks.deadline'
                                }, year
                            ]
                        }, {
                            '$eq': [
                                {
                                    '$month': '$sportsTasks.deadline'
                                }, month
                            ]
                        }, {
                            '$eq': [
                                {
                                    '$dayOfMonth': '$sportsTasks.deadline'
                                }, day
                            ]
                        }
                    ]
                }
            }
        }, {
            '$project': {
                'password': 0,
                'passwordResetToken': 0,
                'loginAttempts': 0,
                'lockUntil': 0,
                'performanceReports': 0,
                'attendanceRecords': 0,
                'medicalRecords': 0,
                'facialData': 0,
                '__v': 0
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Students with sports task fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Find the given user ids are existing or not 
exports.checkUsersExistByIds = async ({ userIds }) => {
    return await User.find({ _id: { $in: userIds } }, { _id: 1 }).then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for delete user by ID
exports.deleteUserById = async ({ userId }) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return {
                success: false,
                data: null,
                message: "User not found"
            };
        }

        return {
            success: true,
            data: deletedUser,
            message: "User deleted successfully"
        };
    } catch (error) {
        console.log('error', error);
        throw error;
    }
};


// Function for fetch the task list by balagruha id 
exports.getSportsTasksByBalagruhaIdAndFilter = async ({ balagruhaId, status = ['pending', 'in progress', 'completed'],
    priority = ['low', 'medium', 'high'],
    createdBy = null,
    page = 1, limit = 10,
    currentUserId, userRole,
    assignedIds = []
}) => {

    // check the key balagruhaId is an array or string 
    if (typeof balagruhaId === 'string') {
        balagruhaId = [mongoose.Types.ObjectId.createFromHexString(balagruhaId)]
    } else if (Array.isArray(balagruhaId)) {
        balagruhaId = balagruhaId.map(item => mongoose.Types.ObjectId.createFromHexString(item))
    }
    // check the key balagruhaId is an array 
    // if (Array.isArray(balagruhaId)) {
    //     balagruhaId = balagruhaId.map(item => mongoose.Types.ObjectId.createFromHexString(item))
    // }
    // check the key assignedIds is an array
    // get the user role hierarchy

    page = parseInt(page);
    let skip = (page - 1) * limit;
    // let balagruhaIds = balagruhaIds.forEach(item => mongoose.Types.ObjectId.createFromHexString(item))
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    // '$in': [mongoose.Types.ObjectId.createFromHexString(balagruhaId)]
                    '$in': balagruhaId
                }
            }
        }, {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'userTasks'
            }
        },


        {
            '$unwind': '$userTasks'
        }, {
            '$match': {
                'userTasks.status': {
                    '$in': status
                },
                'userTasks.priority': {
                    '$in': priority
                }
            }
        },
        {
            '$match': {
                'userTasks.type': 'sports'
            }
        },
        {
            '$match': {
                ...(assignedIds && assignedIds.length > 0 && {
                    'userTasks.assignedUser': {
                        '$in': assignedIds.map(id => id)
                    }
                })
            }
        },
        {
            '$match': {
                ...(createdBy && createdBy.length > 0 && {
                    'userTasks.createdBy': {
                        '$in': createdBy.map(id => mongoose.Types.ObjectId.createFromHexString(id))
                    }
                })
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'userTasks.createdBy',
                'foreignField': '_id',
                'as': 'createdByDetails'
            }
        }, {
            '$facet': {
                'documents': [
                    {
                        '$skip': skip
                    }, {
                        '$limit': limit
                    }, {
                        '$project': {
                            'email': 0,
                            'password': 0,
                            'lastLogin': 0,
                            'passwordResetToken': 0,
                            'loginAttempts': 0,
                            'parentalStatus': 0,
                            'guardianContact': 0,
                            'performanceReports': 0,
                            'attendanceRecords': 0,
                            'medicalRecords': 0,
                            '__v': 0,
                            'createdByDetails.email': 0,
                            'createdByDetails.password': 0,
                            'createdByDetails.status': 0,
                            'createdByDetails.loginAttempts': 0,
                            'createdByDetails.createdAt': 0,
                            'createdByDetails.updatedAt': 0,
                            'createdByDetails.__v': 0,
                            'createdByDetails.lastLogin': 0,
                            'createdByDetails.attendanceRecords': 0,
                            'createdByDetails.medicalRecords': 0,
                            'createdByDetails.parentalStatus': 0,
                            'createdByDetails.performanceReports': 0,
                            'createdByDetails.assignedMachines': 0
                        }
                    }
                ],
                'totalCount': [
                    {
                        '$count': 'total'
                    }
                ]
            }
        }, {
            '$project': {
                'documents': 1,
                'totalCount': {
                    '$arrayElemAt': [
                        '$totalCount.total', 0
                    ]
                }
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}


// Function for fetch the count of the sports tasks by balagruha ( active tasks )
exports.getMusicTasksCountByBalagruhaId = async ({ balagruhaIds }) => {
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': balagruhaIds
                }
            }
        }, {
            '$lookup': {
                'from': 'tasks',
                'localField': '_id',
                'foreignField': 'assignedUser',
                'as': 'sportsTasks'
            }
        }, {
            '$unwind': '$sportsTasks'
        },
        {
            '$match': {
                'sportsTasks.type': 'music'
            }
        },
        {
            '$match': {
                'sportsTasks.status': 'pending'
            }
        }, {
            '$group': {
                '_id': null,
                'totalSportsTasksCount': {
                    '$sum': 1
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'totalSportsTasksCount': 1
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Sports tasks count fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Aggregation for fetch the list of balagruha details by user Id 
exports.getBalagruhaDetailsByUserId = async ({ userId }) => {
    return await User.aggregate([
        {
            '$match': {
                '_id': mongoose.Types.ObjectId.createFromHexString(userId)
            }
        }, {
            '$lookup': {
                'from': 'balagruhas',
                'localField': 'balagruhaIds',
                'foreignField': '_id',
                'as': 'balagruhas'
            }
        }, {
            '$project': {
                '_id': 0,
                'balagruhas': 1
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result[0] || null,
            message: result[0] ? "Balagruha details fetched successfully" : "Balagruha not found"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the details of all users by role and balagruha id
exports.getUsersByRoleAndBalagruhaIdList = async ({ role, balagruhaId }) => {
    let query = {};
    if (role && role != ":role") {
        query.role = role;
    }
    if (balagruhaId && balagruhaId != ":balagruhaId") {
        query.balagruhaIds = {
            $in: balagruhaId
        };
    }

    // Ensure that query matches both conditions if both are provided
    if (Object.keys(query).length === 0) {
        // Return empty if no valid filters are provided
        return {
            success: true,
            data: [],
            message: "No filters provided"
        };
    }

    return await User.find(query)
        .select('-password -passwordResetToken -loginAttempts -lockUntil -facialData -updatedAt -__v')
        .lean()
        .then(result => {
            return {
                success: true,
                data: result,
                message: "Users fetched successfully"
            }
        }).catch(error => {
            console.log('error', error)
            throw error;
        })
}

// Function for fetch the details of all users by role and balagruha id
exports.getUsersByRolesAndBalagruhaIdList = async ({ roles, balagruhaId, includeAdmin = false }) => {
    let query = {};
    if (roles && Array.isArray(roles) && roles.length > 0) {
        query.role = { $in: roles };
    } else if (roles && roles !== ":role") {
        query.role = roles;
    }

    if (balagruhaId && balagruhaId != ":balagruhaId") {
        query.balagruhaIds = {
            $in: balagruhaId
        };
    }

    // Ensure that query matches both conditions if both are provided
    if (Object.keys(query).length === 0) {
        // Return empty if no valid filters are provided
        return {
            success: true,
            data: [],
            message: "No filters provided"
        };
    }
    // also write query for fetch the users with role admin if includeAdmin is true without checking the balagruhaId

    return await User.find(query)
        .select('-password -passwordResetToken -loginAttempts -lockUntil -facialData -updatedAt -__v')
        .lean()
        .then(async (result) => {
            // also fetch the users with role admin if includeAdmin is true without checking the balagruhaId
            if (includeAdmin) {
                const adminQuery = {
                    role: 'admin',
                    balagruhaIds: { $exists: true }
                };
                const adminResult = await User.find(adminQuery)
                    .select('-password -passwordResetToken -loginAttempts -lockUntil -facialData -updatedAt -__v')
                    .lean();
                result.push(...adminResult);
            }

            return {
                success: true,
                data: result,
                message: "Users fetched successfully"
            }
        }).catch(error => {
            console.log('error', error)
            throw error;
        })
}

// Function for fetch the _id by the generatedId 
exports.getIdByGeneratedId = async ({ generatedId }) => {
    return await User.findOne({ generatedId }, { _id: 1 }).lean().then(result => {
        return {
            success: true,
            data: result,
            message: "User details fetched successfully"
        };
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the student list by assigned machines id 
exports.getStudentListByAssignedMachinesId = async ({ machineIds }) => {
    return await User.aggregate([
        {
            '$match': {
                'role': 'student'
            }
        }, {
            '$match': {
                'assignedMachines': {
                    '$in': machineIds
                }
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Student list fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the student mood tracker details by balagruhaIds list 
exports.getStudentMoodTrackerDetailsByBalagruhaIds = async ({ balagruhaIds }) => {
    // convert the balagruhaIds to array of object ids
    balagruhaIds = balagruhaIds.map(id => mongoose.Types.ObjectId.createFromHexString(id));
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': balagruhaIds
                }
            }
        }, {
            '$lookup': {
                'from': 'student_mood_trackers',
                'let': {
                    'userId': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$userId', '$$userId'
                                ]
                            }
                        }
                    }, {
                        '$sort': {
                            'date': -1
                        }
                    }, {
                        '$limit': 1
                    }
                ],
                'as': 'latestMoodTracker'
            }
        }, {
            '$addFields': {
                'latestMoodTracker.userName': '$name',
                'latestMoodTracker.userId': '$userId'
            }
        }, {
            '$project': {
                'latestMoodTracker': {
                    '$arrayElemAt': [
                        '$latestMoodTracker', 0
                    ]
                }
            }
        }, {
            '$match': {
                'latestMoodTracker': {
                    '$ne': null
                }
            }
        }, {
            '$limit': 100
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Student mood tracker details fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the student medical check-ins by balagruhaIds list 
exports.getStudentMedicalCheckInsByBalagruhaIds = async ({ balagruhaIds }) => {
    // convert the balagruhaIds to array of object ids if any of the balagruhaIds is a string
    balagruhaIds = balagruhaIds.map(id => mongoose.Types.ObjectId.createFromHexString(id));
    return await User.aggregate([
        {
            '$match': {
                'role': 'student',
                'balagruhaIds': {
                    '$in': balagruhaIds
                }
            }
        }, {
            '$lookup': {
                'from': 'medical_check_ins',
                'let': {
                    'userId': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$studentId', '$$userId'
                                ]
                            }
                        }
                    }, {
                        '$sort': {
                            'date': -1
                        }
                    }, {
                        '$limit': 1
                    }
                ],
                'as': 'medicalCheckIns'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'medicalCheckIns.createdBy',
                'foreignField': '_id',
                'as': 'createdByUser'
            }
        }, {
            '$unwind': {
                'path': '$createdByUser'
            }
        }, {
            '$addFields': {
                'medicalCheckIns.userName': '$name',
                'medicalCheckIns.userId': '$userId',
                'medicalCheckIns.createdByUser': '$createdByUser.name'
            }
        }, {
            '$project': {
                'medicalCheckIns': {
                    '$arrayElemAt': [
                        '$medicalCheckIns', 0
                    ]
                }
            }
        }, {
            '$match': {
                'medicalCheckIns': {
                    '$ne': null
                }
            }
        }, {
            '$limit': 100
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Student medical check-ins fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}