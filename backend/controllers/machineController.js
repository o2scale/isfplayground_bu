// controllers/machineController.js
const Machine = require('../models/machine');
const { getBalagruhaById } = require("../data-access/balagruha");
const { default: mongoose } = require('mongoose');
const { getMachineById, deleteMachine } = require('../data-access/machines')
// Register a new machine
// exports.registerMachine = async (req, res) => {
//     try {
//         const { machineId, macAddress, serialNumber, assignedBalagruha } = req.body;

//         // Check if machine already exists
//         const existingMachine = await Machine.findOne({ machineId });
//         if (existingMachine) {
//             return res.status(400).json({ message: 'Machine already exists' });
//         }

//         // Create new machine
//         const machine = new Machine({
//             machineId,
//             macAddress,
//             serialNumber,
//             assignedBalagruha
//         });

//         await machine.save();
//         res.status(201).json({ message: 'Machine registered successfully', machine });
//     } catch (error) {
//         res.status(500).json({ message: 'Error in registration', error: error.message });
//     }
// };

// // Get all machines
// exports.getAllMachines = async (req, res) => {
//     try {
//         const {
//             search,
//             assignedBalagruha,
//             sortBy = 'machineId',
//             sortOrder = 'asc',
//             page = 1,
//             limit = 10
//         } = req.query;

//         // Build query
//         let query = {};

//         if (search) {
//             query.$or = [
//                 { machineId: { $regex: search, $options: 'i' } },
//                 { macAddress: { $regex: search, $options: 'i' } },
//                 { assignedBalagruha: { $regex: search, $options: 'i' } }
//             ];
//         }

//         if (assignedBalagruha) {
//             query.assignedBalagruha = assignedBalagruha;
//         }

//         // Build sort options
//         const sortOptions = {};
//         sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const machines = await Machine.find(query)
//             .sort(sortOptions)
//             .skip((page - 1) * limit)
//             .limit(limit);

//         const total = await Machine.countDocuments(query);

//         res.status(200).json({
//             success: true,
//             data: {
//                 machines,
//                 total,
//                 page: parseInt(page),
//                 totalPages: Math.ceil(total / limit)
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching machines',
//             error: error.message
//         });
//     }
// };


// // Get machine by ID
// exports.getMachineById = async (req, res) => {
//     try {
//         const machine = await Machine.findOne({ machineId: req.params.id });
//         if (!machine) {
//             return res.status(404).json({ message: 'Machine not found' });
//         }
//         res.status(200).json(machine);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching machine', error: error.message });
//     }
// };

// // Update machine
// exports.updateMachine = async (req, res) => {
//     try {
//         const { machineId, macAddress, serialNumber, assignedBalagruha } = req.body;

//         const machine = await Machine.findOne({ machineId: req.params.id });
//         if (!machine) {
//             return res.status(404).json({ message: 'Machine not found' });
//         }

//         machine.machineId = machineId || machine.machineId;
//         machine.macAddress = macAddress || machine.macAddress;
//         machine.serialNumber = serialNumber || machine.serialNumber;
//         machine.assignedBalagruha = assignedBalagruha || machine.assignedBalagruha;

//         await machine.save();
//         res.status(200).json({ message: 'Machine updated successfully', machine });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating machine', error: error.message });
//     }
// };

// exports.getBalagruhaList = async (req, res) => {
//     try {
//         const balagruhas = await Balagruha.find()
//             .populate('assignedMachines');

//         res.status(200).json({
//             success: true,
//             data: balagruhas
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching balagruhas',
//             error: error.message
//         });
//     }
// };


// exports.assignMachine = async (req, res) => {
//     try {
//         const { machineId, balagruhaId } = req.body;

//         // Find the machine and balagruha
//         const machine = await Machine.findOne({ machineId });
//         const balagruha = await Balagruha.findById(balagruhaId);

//         if (!machine) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Machine not found'
//             });
//         }

//         if (!balagruha) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Balagruha not found'
//             });
//         }

//         // Update machine's assigned balagruha
//         machine.assignedBalagruha = balagruha.name;
//         await machine.save();

//         // Add machine to balagruha's assignedMachines array
//         if (!balagruha.assignedMachines.includes(machine._id)) {
//             balagruha.assignedMachines.push(machine._id);
//             await balagruha.save();
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Machine assigned successfully',
//             data: {
//                 machine,
//                 balagruha
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error assigning machine',
//             error: error.message
//         });
//     }
// };

// exports.reassignMachine = async (req, res) => {
//     try {
//         const { machineId, newBalagruhaId } = req.body;

//         // Find the machine and new balagruha
//         const machine = await Machine.findOne({ machineId });
//         const newBalagruha = await Balagruha.findById(newBalagruhaId);

//         if (!machine) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Machine not found'
//             });
//         }

//         if (!newBalagruha) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'New Balagruha not found'
//             });
//         }

//         // Find old balagruha
//         const oldBalagruha = await Balagruha.findOne({ name: machine.assignedBalagruha });

//         if (oldBalagruha) {
//             // Remove machine from old balagruha's assignedMachines
//             oldBalagruha.assignedMachines = oldBalagruha.assignedMachines.filter(
//                 id => id.toString() !== machine._id.toString()
//             );
//             await oldBalagruha.save();
//         }

//         // Update machine's assigned balagruha
//         machine.assignedBalagruha = newBalagruha.name;
//         await machine.save();

//         // Add machine to new balagruha's assignedMachines
//         if (!newBalagruha.assignedMachines.includes(machine._id)) {
//             newBalagruha.assignedMachines.push(machine._id);
//             await newBalagruha.save();
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Machine reassigned successfully',
//             data: {
//                 machine,
//                 newBalagruha
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error reassigning machine',
//             error: error.message
//         });
//     }
// };


// exports.getMachineDetails = async (req, res) => {
//     try {
//         const { machineId } = req.params;

//         const machine = await Machine.findOne({ machineId });
//         if (!machine) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Machine not found'
//             });
//         }

//         const balagruha = await Balagruha.findOne({ name: machine.assignedBalagruha });

//         res.status(200).json({
//             success: true,
//             data: {
//                 machine,
//                 balagruha
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching machine details',
//             error: error.message
//         });
//     }
// };

exports.getAllMachines = async (req, res) => {
    try {
        const { status, assignedBalagruha, search } = req.query; // Optional filters

        // Build the query object
        const query = {};
        if (status) query.status = status; // Filter by status
        if (assignedBalagruha) query.assignedBalagruha = assignedBalagruha; // Filter by assigned Balagruha
        if (search) {
            query.$or = [
                { machineId: { $regex: search, $options: 'i' } },
                { macAddress: { $regex: search, $options: 'i' } },
                { serialNumber: { $regex: search, $options: 'i' } },
            ];
        }

        // Fetch machines from the database
        const machines = await Machine.find(query)
            .populate('assignedBalagruha', 'name') // Populate Balagruha details
            .sort({ createdAt: -1 }); // Sort by creation date (most recent first)

        res.status(200).json({ success: true, data: { machines: machines }, message: "successfully fetched machines list" });
    } catch (error) {
        console.error('Error fetching machines:', error);
        res.status(500).json({ success: false, data: {}, message: 'Internal server error' });
    }
};

exports.registerMachine = async (req, res) => {
    try {
        const { machineId, macAddress, serialNumber, assignedBalagruha } = req.body;

        // Validation: Ensure required fields are provided
        if (!machineId || !macAddress || !serialNumber || !assignedBalagruha) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Check for unique Machine ID, MAC Address, and Serial Number
        const existingMachine = await Machine.findOne({
            $or: [{ machineId }, { macAddress }, { serialNumber }],
        });
        if (existingMachine) {
            return res.status(400).json({ success: false, message: 'Machine ID, MAC Address, or Serial Number already exists.' });
        }

        // Create the machine
        const machine = new Machine({
            machineId,
            macAddress,
            serialNumber,
            assignedBalagruha,
            status: 'active', // Default status is active
        });

        let result = await machine.save();
        if (result && result._id) {
            // add the machine id to the balagruha 
            // get balagruha details by balagruha id
            let balagruhaItem = await getBalagruhaById(assignedBalagruha)
            if (balagruhaItem && balagruhaItem.success && balagruhaItem.data) {
                // check if the machine id is already exist in the assigned machines list
                let assignedMachines = balagruhaItem.data.assignedMachines;
                if (!assignedMachines.includes(result._id)) {
                    assignedMachines.push(result._id);
                    let addResult = await balagruhaItem.data.save();
                }
            }
        }

        res.status(201).json({ success: true, message: 'Machine registered successfully', data: { machine: machine } });
    } catch (error) {
        console.error('Error registering machine:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.toggleMachineStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the machine
        const machine = await Machine.findOne({ _id: id });
        if (!machine) {
            return res.status(404).json({ success: false, message: 'Machine not found.', data: {} });
        }

        // Toggle the status
        machine.status = machine.status === 'active' ? 'inactive' : 'active';
        await machine.save();

        res.status(200).json({ success: true, message: `Machine status updated to ${machine.status}`, data: { machine: machine } });
    } catch (error) {
        console.error('Error toggling machine status:', error);
        res.status(500).json({ success: false, data: {}, message: 'Internal server error' });
    }
};

exports.assignMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { newBalagruha } = req.body;

        // Find the machine
        const machine = await Machine.findOne({ _id: id });
        if (!machine) {
            return res.status(404).json({ success: false, message: 'Machine not found.' });
        }
        // Check if the new Balagruha is valid
        if (!newBalagruha) {
            return res.status(400).json({ success: false, message: 'New Balagruha is required.' });
        }
        // Check balagruha is exist with the id 
        let balagruhaItem = await getBalagruhaById(newBalagruha)
        if (balagruhaItem && balagruhaItem.success && balagruhaItem.data) {

            // Log the previous assignment
            // machine.allocationHistory.push({
            //     previousBalagruha: machine.assignedBalagruha,
            //     newBalagruha,
            //     assignedBy: req.user._id, // Admin who performed the action
            // });

            // Update the assigned Balagruha
            machine.assignedBalagruha = newBalagruha;
            await machine.save();

            res.status(200).json({ success: true, message: 'Machine assigned successfully', data: { machine: machine } });
        } else {
            return res.status(400).json({ success: false, message: 'New Balagruha is required.' });

        }
    } catch (error) {
        console.error('Error assigning machine:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getMachineHistory = async (req, res) => {
    try {
        const { machineId } = req.params;

        // Find the machine
        const machine = await Machine.findOne({ machineId }).populate('allocationHistory.newBalagruha', 'name');
        if (!machine) {
            return res.status(404).json({ success: false, message: 'Machine not found.' });
        }

        res.status(200).json({ success: true, history: machine.allocationHistory });
    } catch (error) {
        console.error('Error fetching machine history:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;
        let macIdOnHeader = req.headers['mac-address'];
        // Find the machine
        let result = await getMachineById(id)
        const stringId = id.toString();
        if (!result.success) {

            return res.status(404).json({ success: false, message: 'Machine not found.' });
        }
        // check the machine mac address and mac address on the header is same. then don't allow delete 
        if (result.data.macAddress == macIdOnHeader) {
            return res.status(400).json({ success: false, message: 'You are not allowed to delete current machine.' });
        }

        // Delete the machine
        deleteMachine({ _id: stringId }).then(() => {
            res.status(200).json({ success: true, message: 'Machine deleted successfully' });
        }).catch(error => {
            console.error('Error deleting machine:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });

    } catch (error) {
        console.log('error', error)
        res.status(500).json({ success: false, message: 'Internal server error' });

    }
}

exports.getUnassignedMachines = async (req, res) => {
    try {
        // Find machines with assignedBalagruha set to null
        const machines = await Machine.find({ assignedBalagruha: null })
            .sort({ createdAt: -1 }); // Sort by creation date (most recent first)

        res.status(200).json({
            success: true,
            data: { machines: machines },
            message: "Successfully fetched unassigned machines list"
        });
    } catch (error) {
        console.error('Error fetching unassigned machines:', error);
        res.status(500).json({
            success: false,
            data: {},
            message: 'Internal server error'
        });
    }
};