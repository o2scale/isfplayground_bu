const { logger, errorLogger } = require("../config/pino-config");
const User = require("../models/user");
const {
  createUser,
  findUsersByRoleAndBalagruhaId,
  getUserInfo,
  updateUserPasswordByAdmin,
  assignBalagruhaToUser,
  updateUserDetailsById,
  deleteUserById,
  getUserListByAssignedBalagruhaByRole,
} = require("../services/user");
const Student = require("../services/student");
const Attendance = require("../services/attendenance");
const { UserTypes } = require("../constants/users");
const { updateNextActionDate } = require("../data-access/medicalRecords");
const { isRequestFromLocalhost } = require("../utils/helper");

exports.getAllUsers = async (_, res) => {
  try {
    let users = await User.find()
      .lean()
      .select("-facialData -password")
      .populate("balagruhaIds")
      .populate("assignedMachines")
      .populate("medicalRecords");
    if (users) {
      users = users.map((item) => {
        let medicalHistoryItem = [];
        let nextActionDate = null;
        if (item?.medicalRecords?.length > 0) {
          let medicalRecords = item?.medicalRecords.map((record) => {
            if (record.nextActionDate && record.nextActionDate !== null) {
              nextActionDate = record.nextActionDate;
            }
            return record.medicalHistory;
          });
          medicalRecords.forEach((item) => {
            if (item.length > 0) {
              item.forEach((medItem) => {
                medicalHistoryItem.push(medItem);
              });
            }
          });
        }
        item.nextActionDate = nextActionDate;
        item.medicalHistory = medicalHistoryItem;
        delete item.medicalRecords;
        return item;
      });
    }
    res.status(200).json(users);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const newUser = new User({
      name,
      email,
      password,
      role,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name, email, password, role, status, lastLogin } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password, role, status, lastLogin },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API for create User
exports.createUserV1 = async (req, res) => {
  try {
    const logData = { ...req.body };
    delete logData.password;
    req.body.createdBy = req.user._id;
    let data = req.file;
    // req.body.facialData = req.files['facialData']
    req.body.facialData = req.files.filter(
      (file) => file.fieldname === "facialData"
    )[0];
    // req.body.medicalHistory = req.files['medicalHistory']

    const medicalHistory = extractMedicalHistory(req);
    req.body.medicalHistory = medicalHistory;
    // res.status(201).json({ success: true, data: {}, message: "", });
    // return
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: logData,
      },
      `Request received for user registration`
    );
    // check the request if from localhost/ offline case
    let isOfflineReq = isRequestFromLocalhost(req);
    req.body.isOfflineReq = isOfflineReq;
    let result = await createUser(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: logData,
        },
        `User registered successfully`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: logData,
        },
        `Error occurred while user registration: ${result.message}`
      );
      res
        .status(400)
        .json({ success: false, data: {}, message: result.message });
    }
  } catch (error) {
    res.status(400).json({ success: false, data: {}, message: error.message });
  }
};

// API for create User Medical Records
exports.createStudentMedicalRecords = async (req, res) => {
  try {
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for user registration`
    );
    let result = await Student.createStudentMedicalRecords(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `User registered successfully`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while user registration: ${error.message}`
      );
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// API for fetch the user overview details for the user management
exports.getUserManagementOverviewDetails = async (req, res) => {
  try {
    let balagruhaId = req.params.balagruhaId;
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for fetching the user overview for user management`
    );
    let result = await Student.getStudentListByBalagruhaId({ balagruhaId });
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for fetching the user overview for user management`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while fetching the user overview for user management: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for fetching the user overview details: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for fetch the student list by balagruha id
exports.getStudentListByBalagruhaId = async (req, res) => {
  try {
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for fetching the student list by balagruha id`
    );
    let result = await Student.getStudentListByBalagruhaId(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for fetching the student list by balagruha id`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while fetching the student list by balagruha id: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for fetching the student list by balagruha id: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for create attendance for the student
exports.createStudentAttendance = async (req, res) => {
  try {
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for creating attendance for the student`
    );
    let result = await Attendance.saveAttendance(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for creating attendance for the student`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while creating attendance for the student: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for creating attendance for the student: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for fetch the student list in balagruha with the attendance by given date (pass date as query )
exports.getStudentListByBalagruhaIdWithAttendance = async (req, res) => {
  try {
    let date = req.query.date;
    if (!date || date == "") {
      date = new Date();
    }
    let balagruhaId = req.params.balagruhaId;
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for fetching the student list in balagruha with the attendance by given date`
    );
    let result = await Student.getStudentListByBalagruhaIdWithAttendance({
      balagruhaId,
      date,
    });
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for fetching the student list in balagruha with the attendance by given date`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while fetching the student list in balagruha with the attendance by given date: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for fetching the student list in balagruha with the attendance by given date: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for facial login
exports.facialLogin = async (req, res) => {
  try {
    let macAddress = req.headers["mac-address"];
    req.body.facialData = req.files["facialData"];
    req.body.macAddress = macAddress;
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for facial login`
    );
    let result = await Student.faceLogin(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for facial login`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while facial login`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    console.log("error", error);
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for facial login: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for find users by role and balagruha id
exports.getUsersByRoleAndBalagruhaId = async (req, res) => {
  try {
    const { role } = req.params;
    const { balagruhaId } = req.query;

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: { role, balagruhaId },
      },
      `Request received for finding users by role: ${role} and balagruhaId: ${
        balagruhaId || "not specified"
      }`
    );

    let result = await findUsersByRoleAndBalagruhaId({ role, balagruhaId });

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Successfully fetched users by role and balagruhaId`
      );
      res.status(200).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Error occurred while fetching users by role and balagruhaId`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: { error: error.message },
      },
      `Error occurred while processing the request for finding users by role and balagruhaId: ${error.message}`
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for fetch detailed user information by userId
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || userId == ":userId") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
      },
      `Request received for fetching detailed user information by ID: ${userId}`
    );

    const result = await getUserInfo(userId);

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Successfully fetched detailed user information`
      );
      return res.status(200).json(result);
    } else {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `User not found with ID: ${userId}`
      );
      return res.status(404).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: { error: error.message },
      },
      `Error occurred while fetching detailed user information: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const extractMedicalHistory = (req) => {
  const medicalHistory = [];

  Object.keys(req.body).forEach((key) => {
    const match = key.match(/^medicalHistory\[(\d+)\](?:\.(.+))?$/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2];

      if (!medicalHistory[index]) {
        medicalHistory[index] = {
          prescriptions: [],
          otherAttachments: [],
          currentStatus: {},
        };
      }

      if (field.startsWith("currentStatus.")) {
        medicalHistory[index].currentStatus[
          field.replace("currentStatus.", "")
        ] = req.body[key];
      } else {
        medicalHistory[index][field] = req.body[key];
      }
    }
  });

  // Handling file uploads
  if (req.files) {
    // Iterating through files array instead of using req.files as an object with keys
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const match = file.fieldname.match(
        /^medicalHistory\[(\d+)\]\.(prescriptions|otherAttachments)$/
      );

      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];

        // Initialize the array if it doesn't exist
        if (!medicalHistory[index]) {
          medicalHistory[index] = {
            prescriptions: [],
            otherAttachments: [],
            currentStatus: {},
          };
        }

        // Add the filename to the appropriate array
        medicalHistory[index][field].push(file);
      }
    }
  }

  return medicalHistory;
};

// API for update user password by admin
exports.updateUserPassword = async (req, res) => {
  try {
    // get the current user role
    const role = req.user.role;
    // check the role is admin, otherwise return the error
    if (role !== UserTypes.ADMIN) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to perform this action. Only admin users can update passwords.",
      });
    }
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for updating user password`
    );
    let result = await updateUserPasswordByAdmin(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for updating user password`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while updating user password: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for updating user password: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for assign balagruha to the user
exports.assignBalagruhaToUser = async (req, res) => {
  try {
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for assigning balagruha to the user`
    );
    let result = await assignBalagruhaToUser(req.body);
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for assigning balagruha to the user`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while assigning balagruha to the user: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for assigning balagruha to the user: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};

// API for update user details by userId
exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || userId === ":userId") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    req.body.updatedBy = req.user._id;
    // check the request if from localhost/ offline case
    let isOfflineReq = isRequestFromLocalhost(req);
    req.body.isOfflineReq = isOfflineReq;
    // Handle facial data if uploaded
    if (req.files && req.files.length > 0) {
      req.body.facialData = req.files.filter(
        (file) => file.fieldname === "facialData"
      )[0];

      // Handle any other file uploads if needed
      const medicalHistory = extractMedicalHistory(req);
      if (medicalHistory.length > 0) {
        req.body.medicalHistory = medicalHistory;
        req.body.medicalHistory =
          await Student.handleStudentMedicalRecordUpdate(req.body);
      }
    }

    if (req.body.nextActionDate && req.body.nextActionDate !== "") {
      updateNextActionDate(userId, req.body.nextActionDate);
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for updating user details for ID: ${userId}`
    );

    const result = await updateUserDetailsById(userId, req.body);

    if (result.success) {
      if (req.body.nextActionDate) {
        result.data.user.nextActionDate = req.body.nextActionDate;
      }
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Successfully updated user details for ID: ${userId}`
      );
      return res.status(200).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Error occurred while updating user details: ${result.message}`
      );
      return res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: { error: error.message },
      },
      `Error occurred while processing the request for updating user details: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// API for delete user by userId
exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || userId === ":userId") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check permission (only admin can delete users)
    const role = req.user.role;
    if (role !== UserTypes.ADMIN) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to perform this action. Only admin users can delete users.",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: { userId },
      },
      `Request received for deleting user with ID: ${userId}`
    );

    const result = await deleteUserById(userId);

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Successfully deleted user with ID: ${userId}`
      );
      return res.status(200).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
        },
        `Error occurred while deleting user: ${result.message}`
      );
      return res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: { error: error.message },
      },
      `Error occurred while processing the request for deleting user: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// API for assign balagruha to the user
exports.getUserListByAssignedBalagruhaByRole = async (req, res) => {
  try {
    // get user id and role from token
    const userId = req.user._id;
    const role = req.user.role;
    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Request received for assigning balagruha to the user`
    );
    let result = await getUserListByAssignedBalagruhaByRole({ userId, role });
    res.status(201).json(result);
    return;
    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Successfully processed the request for assigning balagruha to the user`
      );
      res.status(201).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          data: req.body,
        },
        `Error occurred while assigning balagruha to the user: ${error.message}`
      );
      res.status(400).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        data: req.body,
      },
      `Error occurred while processing the request for assigning balagruha to the user: ${error.message}`
    );
    res.status(400).json({ message: error.message });
  }
};
