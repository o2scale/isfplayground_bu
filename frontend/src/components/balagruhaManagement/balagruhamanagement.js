import React, { useState, useEffect } from 'react';
import './balagruhamanagement.css';
import { getBalagruha, addBalagruha, updateBalagruha, deleteBalagruha, getMachines, assignMachineToAnotherBalagruha, getUnAssigned } from '../../api';
import { usePermission } from '../hooks/usePermission';

const BalagruhaManagement = () => {
    const [balagruhas, setBalagruhas] = useState([]);
    const [machines, setMachines] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'update'
    const [selectedBalagruha, setSelectedBalagruha] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        assignedMachines: []
    });
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [metrics, setMetrics] = useState({
        totalBalagruhas: 0,
        totalMachines: 0,
        assignedMachines: 0,
        unassignedMachines: 0
    });

    const {
        canCreate,
        canRead,
        canUpdate,
        canDelete
    } = usePermission();
    const [unassigned, setUnassigned] = useState([])

    const canCreateBalagruha = canCreate('Balagruha Management');
    const canReadBalagruha = canRead('Balagruha Management');
    const canUpdateBalagruha = canUpdate('Balagruha Management');
    const canDeleteBalagruha = canDelete('Balagruha Management');

    useEffect(() => {
        getBalagruhas();
        fetchMachines();
    }, []);

    useEffect(() => {
        calculateMetrics();
    }, [balagruhas, machines]);

    const getBalagruhas = async () => {
        try {
            const response = await getBalagruha();
            console.log('Balagruhas fetched:', response);
            setBalagruhas(response?.data?.balagruhas || []);
        } catch (error) {
            console.error('Error fetching balagruhas:', error);
        }
    };

    const fetchMachines = async () => {
        try {
            const response = await getMachines();
            console.log('Machines fetched:', response);
            setMachines(response?.data?.machines || []);
            getUnAssignedMachines()
        } catch (error) {
            console.error('Error fetching machines:', error);
        }
    };

    const getUnAssignedMachines = async () => {
        try {
            const response = await getUnAssigned()
            console.log('reosnbasd', response.data)
            setUnassigned(response.data.machines || [])
        } catch (error) {
            console.error("Erro in fetching machines", error)
        }
    }

    const calculateMetrics = () => {
        // Count total balagruhas
        const totalBalagruhas = balagruhas.length;

        // Count total machines
        const totalMachines = machines.length;

        // Count assigned machines (machines that are assigned to any balagruha)
        const assignedMachinesCount = machines.filter(
            machine => machine.assignedBalagruha && Object.keys(machine.assignedBalagruha).length > 0
        ).length

        // Count unassigned machines
        const unassignedMachinesCount = totalMachines - assignedMachinesCount;

        setMetrics({
            totalBalagruhas,
            totalMachines,
            assignedMachines: assignedMachinesCount,
            unassignedMachines: unassignedMachinesCount
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    const handleMachineSelection = (selectedMachine) => {
        setFormData(prevState => {
            const isAlreadySelected = prevState.assignedMachines.some(m => m._id === selectedMachine._id);

            const updatedMachines = isAlreadySelected
                ? prevState.assignedMachines.filter(m => m._id !== selectedMachine._id)
                : [...prevState.assignedMachines, selectedMachine._id];

            return {
                ...prevState,
                assignedMachines: updatedMachines
            };
        });
    };



    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.location.trim()) {
            errors.location = 'Location is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (modalMode === 'create') {
                const response = await addBalagruha(formData);
                console.log('Balagruha added:', response);
                setConfirmationMessage('Balagruha added successfully!');
                console.log('formtt', formData)

            } else {

                const submissionData = {
                    name: formData.name,
                    location: formData.location,
                    assignedMachines: formData.assignedMachines.map(machine =>
                        typeof machine === 'object' ? machine._id : machine
                    )
                }

                const response = await updateBalagruha(selectedBalagruha._id, submissionData);
                console.log('Balagruha updated:', response);
                setConfirmationMessage('Balagruha updated successfully!');

                // Handle machine assignments
                const currentAssignedMachines = selectedBalagruha.assignedMachines || [];

                // Machines to add (in formData but not in currentAssignedMachines)
                const machinesToAdd = formData.assignedMachines.filter(
                    machineId => !currentAssignedMachines.includes(machineId)
                );

                // Machines to remove (in currentAssignedMachines but not in formData)
                const machinesToRemove = currentAssignedMachines.filter(
                    machineId => !formData.assignedMachines.includes(machineId)
                );
            }

            setShowConfirmation(true);
            setShowModal(false);
            getBalagruhas();
            fetchMachines();
            getUnAssignedMachines();

            // Reset form
            setFormData({
                name: '',
                location: '',
                assignedMachines: []
            });

            setTimeout(() => {
                setShowConfirmation(false);
            }, 2000);
        } catch (error) {
            console.error('Error processing balagruha:', error);
            setConfirmationMessage('Failed to process balagruha. Please try again.');
            setShowConfirmation(true);
            setTimeout(() => {
                setShowConfirmation(false);
            }, 2000);
        }
    };

    const handleDeleteBalagruha = async () => {
        if (selectedBalagruha) {
            try {
                const response = await deleteBalagruha(selectedBalagruha._id);
                console.log('Balagruha deleted:', response);

                setBalagruhas(balagruhas.filter(bg => bg._id !== selectedBalagruha._id));
                setShowDeleteModal(false);
                setConfirmationMessage('Balagruha deleted successfully!');
                setShowConfirmation(true);

                // Refresh machines data
                fetchMachines();

                setTimeout(() => {
                    setShowConfirmation(false);
                }, 2000);
            } catch (error) {
                console.error('Error deleting balagruha:', error);
                setConfirmationMessage('Failed to delete balagruha. Please try again.');
                setShowConfirmation(true);
                setTimeout(() => {
                    setShowConfirmation(false);
                }, 2000);
            }
        }
    };

    // Filter balagruhas based on search term
    const filteredBalagruhas = balagruhas.filter(balagruha =>
        balagruha.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balagruha.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get machine name by ID
    const getMachineName = (machineId) => {
        console.log('machine', machineId)
        const machine = machines.find(m => m._id === machineId._id);
        return machine ? machine.machineId : machine?.serialNumber;
    };

    return (
        <div className="balagruha-management">
            <div className="balagruha-header">
                <h2>Balagruha Management</h2>
                <div className="header-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search balagruhas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    {/* {canCreateBalagruha && ( */}
                    <button
                        className="add-button"
                        onClick={() => {
                            setModalMode('create');
                            setFormData({
                                name: '',
                                location: '',
                                assignedMachines: []
                            });
                            setFormErrors({});
                            setShowModal(true);
                        }}
                    >
                        ➕ Add Balagruha
                    </button>
                    {/* )} */}
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-cards">
                <div className="metric-card">
                    <div className="metric-icon">🏠</div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.totalBalagruhas}</div>
                        <div className="metric-label">Total Balagruhas</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">⚙️</div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.totalMachines}</div>
                        <div className="metric-label">Total Machines</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.assignedMachines}</div>
                        <div className="metric-label">Assigned Machines</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">❓</div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.unassignedMachines}</div>
                        <div className="metric-label">Unassigned Machines</div>
                    </div>
                </div>
            </div>

            <div className="balagruha-table-container">
                <table className="balagruha-table">
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Assigned Machines</th>
                            <th>Actions</th>
                            {/* {(canUpdateBalagruha || canDeleteBalagruha) && <th>Actions</th>} */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBalagruhas.map((balagruha, index) => (
                            <tr key={balagruha._id}>
                                <td>{index + 1}</td>
                                <td>{balagruha.name}</td>
                                <td>{balagruha.location}</td>
                                <td>
                                    <div className="machine-tags">
                                        {balagruha.assignedMachines && balagruha.assignedMachines.length > 0 ? (
                                            balagruha.assignedMachines.map((machineId, idx) => (
                                                <span key={idx} className="machine-tag">
                                                    {getMachineName(machineId)}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="no-machines">No machines assigned</span>
                                        )}
                                    </div>
                                </td>
                                {/* {(canUpdateBalagruha || canDeleteBalagruha) && ( */}
                                <td>
                                    <div className="action-buttons">
                                        {/* {canUpdateBalagruha && ( */}
                                        <button
                                            className="action-button edit"
                                            onClick={() => {
                                                setSelectedBalagruha(balagruha);
                                                setFormData({
                                                    name: balagruha.name,
                                                    location: balagruha.location,
                                                    assignedMachines: balagruha.assignedMachines || []
                                                });
                                                setFormErrors({});
                                                setModalMode('update');
                                                setShowModal(true);
                                            }}
                                            title="Edit Balagruha"
                                        >
                                            ✏️
                                        </button>
                                        {/* )} */}

                                        {/* {canDeleteBalagruha && ( */}
                                        <button
                                            className="action-button delete"
                                            onClick={() => {
                                                setSelectedBalagruha(balagruha);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Delete Balagruha"
                                        >
                                            🗑️
                                        </button>
                                        {/* )} */}
                                    </div>
                                </td>
                                {/* )} */}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredBalagruhas.length === 0 && (
                    <div className="no-balagruhas">
                        <div className="no-data-icon">🏠</div>
                        <div className="no-data-message">No balagruhas found</div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? 'Add New Balagruha' : 'Edit Balagruha'}</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={formErrors.name ? 'error' : ''}
                                />
                                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={formErrors.location ? 'error' : ''}
                                />
                                {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                            </div>

                            <div className="form-group">
                                <label>Assigned Machines</label>
                                <div className="machine-selection">
                                    {machines.filter(machine => formData.assignedMachines.some(m => m._id === machine._id)).length > 0 ? (
                                        machines.map((machine) => {
                                            const isChecked = formData.assignedMachines.some(m => m._id === machine._id);

                                            return isChecked && (
                                                <div key={machine._id} className="machine-option">
                                                    <input
                                                        type="checkbox"
                                                        id={`machine-${machine._id}`}
                                                        checked={isChecked}
                                                        onChange={() => handleMachineSelection(machine)}
                                                    />
                                                    <label htmlFor={`machine-${machine._id}`}>{machine.machineId}</label>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="no-machines-message">No machines assigned</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Unassigned Machines</label>
                                <div className="machine-selection">
                                    {unassigned.length > 0 ? (
                                        unassigned.map((machine) => {
                                            // const isChecked = formData.assignedMachines.some(m => m._id === machine._id);

                                            return (
                                                <div key={machine._id} className="machine-option">
                                                    <input
                                                        type="checkbox"
                                                        id={`machine-${machine._id}`}
                                                        // checked={ }
                                                        onChange={() => handleMachineSelection(machine)}
                                                    />
                                                    <label htmlFor={`machine-${machine._id}`}>{machine.machineId}</label>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="no-machines-message">No machines available</div>
                                    )}
                                </div>
                            </div>



                            <div className="modal-actions">
                                <button type="submit" className="submit-button">
                                    {modalMode === 'create' ? 'Add Balagruha' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content delete-modal">
                        <div className="modal-header">
                            <div className="modal-icon">⚠️</div>
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete the balagruha <strong>{selectedBalagruha.name}</strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="delete-confirm-button"
                                onClick={handleDeleteBalagruha}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Message */}
            {showConfirmation && (
                <div className="confirmation-message">
                    <div className="confirmation-icon">✅</div>
                    <div className="confirmation-text">{confirmationMessage}</div>
                </div>
            )}
        </div>
    );
};

export default BalagruhaManagement;