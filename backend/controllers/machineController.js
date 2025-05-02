// controllers/machineController.js
const Machine = require('../models/machine');
const { getBalagruhaById, getBalagruhaByIdRowData, updateBalagruha } = require("../data-access/balagruha");
const { default: mongoose } = require('mongoose');
const { getMachineById, deleteMachine } = require('../data-access/machines')
const { isRequestFromLocalhost, generateRandomString } = require("../utils/helper");
const { createOfflineRequest } = require('../services/offlineRequestQueue');
const { OfflineReqNames } = require('../constants/general');


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
        req.body.generatedId = req.body?.generatedId || generateRandomString();
        const reqCpy = JSON.parse(JSON.stringify(req.body))


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
        // check if the request is offline 
        let isOfflineReq = isRequestFromLocalhost(req);

        // Create the machine
        const machine = new Machine({
            machineId,
            macAddress,
            serialNumber,
            assignedBalagruha,
            status: 'active', // Default status is active
            generatedId: req.body.generatedId,
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

        if (isOfflineReq) {

            let result = await createOfflineRequest({
                operation: OfflineReqNames.CREATE_MACHINE,
                apiPath: req.originalUrl,
                method: req.method,
                payload: JSON.stringify(reqCpy),
                attachments: [],
                attachmentString: "{}",
                token: req.headers['authorization'],
                generatedId: req.body.generatedId,
            })
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
        // check the req is offline 
        let isOfflineReq = isRequestFromLocalhost(req);
        // Find the machine
        const machine = await Machine.findOne({ _id: id });
        if (!machine) {
            return res.status(404).json({ success: false, message: 'Machine not found.', data: {} });
        }

        // Toggle the status
        machine.status = machine.status === 'active' ? 'inactive' : 'active';
        let result = await machine.save();
        if (result) {
            if (isOfflineReq) {
                let result = await createOfflineRequest({
                    operation: "toggle_machine_status",
                    apiPath: req.originalUrl,
                    method: req.method,
                    payload: "{}",
                    attachments: [],
                    attachmentString: "{}",
                    token: req.headers['authorization'],
                    generatedId: machine.generatedId,
                })
            }
        }

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
        const reqCpy = JSON.parse(JSON.stringify(req.body))
        // check the req is offline
        let isOfflineReq = isRequestFromLocalhost(req);
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

            // get the existing balagruha details and remove the machine id from the assigned machines list
            let existingBalagruhaItem = await getBalagruhaByIdRowData(machine.assignedBalagruha)
            if (existingBalagruhaItem && existingBalagruhaItem.success && existingBalagruhaItem.data) {
                let assignedMachines = existingBalagruhaItem.data.assignedMachines;
                console.log('assignedMachines', assignedMachines)
                let assignedMachinesIds = assignedMachines.map(id => id.toString());
                // check the assigned machine id is exist in the assigned machines list
                if (assignedMachinesIds.includes(machine._id.toString())) {
                    assignedMachines = assignedMachines.filter(id => id.toString() !== machine._id.toString());
                }
                // update the existing balagruha details
                existingBalagruhaItem.data.assignedMachines = assignedMachines;
                // update balagruha by id 
                let updateResult = await updateBalagruha(machine.assignedBalagruha, { assignedMachines: assignedMachines })
                console.log('updateResult', updateResult)
            }
            // update the existing balagruha details
            // Update the assigned Balagruha
            machine.assignedBalagruha = newBalagruha;
            let result = await machine.save();
            if (result) {
                // also update the machine id in the balagruha assigned machines list
                let balagruhaItem = await getBalagruhaByIdRowData(newBalagruha)
                if (balagruhaItem && balagruhaItem.success && balagruhaItem.data) {
                    let assignedMachines = balagruhaItem.data.assignedMachines;
                    let assignedMachinesIds = assignedMachines.map(id => id.toString());
                    if (!assignedMachinesIds.includes(machine._id.toString())) {
                        assignedMachines.push(machine._id);
                    }
                    // update balagruha by id 
                    let updateResult = await updateBalagruha(newBalagruha, { assignedMachines: assignedMachines })
                    console.log('updateResult', updateResult)
                }
                if (isOfflineReq) {
                    let result = await createOfflineRequest({
                        operation: OfflineReqNames.ASSIGN_MACHINE,
                        apiPath: req.originalUrl,
                        method: req.method,
                        payload: JSON.stringify(reqCpy),
                        attachments: [],
                        attachmentString: "{}",
                        token: req.headers['authorization'],
                        generatedId: machine.generatedId,
                    });
                }
            }

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
        // check the req is offline
        let isOfflineReq = isRequestFromLocalhost(req);

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
            if (isOfflineReq) {
                createOfflineRequest({
                    operation: OfflineReqNames.DELETE_MACHINE,
                    apiPath: req.originalUrl,
                    method: req.method,
                    payload: "{}",
                    attachments: [],
                    attachmentString: "{}",
                    token: req.headers['authorization'],
                    generatedId: result.data.generatedId,
                });
            }
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

// API for fetch the machine details by generatedId 
exports.getMachineDetailsByGeneratedId = async (req, res) => {
    try {
        const { generatedId } = req.params;
        // Find the machine by generatedId
        const machine = await Machine.findOne({ generatedId: generatedId });
        if (!machine) {
            return res.status(404).json({ success: false, message: 'Machine not found.' });
        }
        res.status(200).json({ success: true, data: { machine: machine }, message: "successfully fetched machine details" });
    } catch (error) {
        console.error('Error fetching machine details:', error);
        res.status(500).json({ success: false, data: {}, message: 'Internal server error' });
    }
}