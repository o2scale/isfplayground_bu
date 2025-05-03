import React, { useEffect, useState } from "react";
import { createRepair, deleteRepair, getAllRepairs, updateRepairRequest } from "../../api";

export default function RepairManagement() {
  const [loading, setLoading] = useState(true);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [repairRequests, setRepairRequests] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [repairForm, setRepairForm] = useState({
    issueName: "",
    description: "",
    dateReported: new Date().toISOString(),
    urgency: "medium",
    estimatedCost: "",
    attachments: [],
    existingAttachments: [],
    repairDetails: "",
    status: "pending",
  });

      useEffect(() => {
        //   fetchDashboardData();
          fetchRepairRequests();
        //   fetchPurchaseOrders();
      }, []);

  const openRepairModal = (repair = null) => {
    if (repair) {
      setRepairForm({
        issueName: repair.issueName,
        description: repair.description,
        dateReported: repair.dateReported,
        urgency: repair.urgency,
        estimatedCost: repair.estimatedCost,
        attachments: [], // New attachments
        existingAttachments: repair.attachments || [],
        repairDetails: repair.repairDetails || "",
        status: repair.status,
      });
      setEditingItem(repair);
    } else {
      setRepairForm({
        issueName: "",
        description: "",
        dateReported: new Date().toISOString(),
        urgency: "medium",
        estimatedCost: "",
        attachments: [], // New attachments
        existingAttachments: [],
        repairDetails: "",
        status: "pending",
      });
      setEditingItem(null);
    }
    setShowRepairModal(true);
  };

  const fetchRepairRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllRepairs();
      console.log(response, 'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll')
      setRepairRequests(response.data.repairRequests);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      await deleteRepair(deleteId);
      await fetchRepairRequests(); // Refresh the list
      setShowDeleteConfirmation(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting repair request:", error);
      // Optionally show error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setRepairForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
    }));
};

const removeFile = (index) => {
    setRepairForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
    }));
};

  const handleRepairSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
  
          try {
              const formData = new FormData();
              formData.append('issueName', repairForm.issueName);
              formData.append('description', repairForm.description);
              formData.append('dateReported', repairForm.dateReported);
              formData.append('urgency', repairForm.urgency);
              formData.append('estimatedCost', repairForm.estimatedCost);
              formData.append('repairDetails', repairForm.repairDetails);
  
              if (editingItem) {
                  formData.append('status', repairForm.status);
              }
  
              repairForm.attachments.forEach(file => {
                  formData.append('attachments', file);
              });
  
              if (editingItem) {
                  await updateRepairRequest(editingItem._id, formData);
              } else {
                  await createRepair(formData);
              }
  
              setShowRepairModal(false);
              fetchRepairRequests(); // Refresh the list
          } catch (error) {
              console.error('Error submitting repair:', error);
          } finally {
              setLoading(false);
          }
      };

      const FilePreview = ({ file }) => {
              const [preview, setPreview] = useState('');
      
              useEffect(() => {
                  if (file) {
                      if (file instanceof File) {
                          // For new files
                          const reader = new FileReader();
                          reader.onloadend = () => {
                              setPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                      } else {
                          // For existing files from server
                          setPreview(file.fileUrl || file.url);
                      }
                  }
              }, [file]);
      
              const isImage = (file) => {
                  const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
                  const extension = file.name
                      ? file.name.split('.').pop().toLowerCase()
                      : (file.fileUrl || file.url)?.split('.').pop().toLowerCase();
                  return imageTypes.includes(extension);
              };
      
              return (
                  <div className="file-preview">
                      {isImage(file) ? (
                          <img src={preview} alt="preview" className="preview-image" />
                      ) : (
                          <div className="preview-document">
                              <i className="fas fa-file-pdf"></i>
                              <span>{file.name || 'Document'}</span>
                          </div>
                      )}
                  </div>
              );
          };

  return (
    <div style={{ width: "100%", margin: "20px" }}>
        <div className="purchase-repairs-section">
      <div className="purchase-section-header">
        <h2>Repair Requests</h2>
        <button
          className="purchase-action-button"
          onClick={() => openRepairModal()}
          disabled={loading}
        >
          + New Repair Request
        </button>
      </div>

      <div className="purchase-data-table">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Issue Name</th>
                <th>Description</th>
                <th>Date</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Est. Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repairRequests?.map((request) => (
                <tr key={request._id}>
                  <td>{request._id}</td>
                  <td>{request.issueName}</td>
                  <td>{request.description}</td>
                  <td>{new Date(request.dateReported).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`purchase-tag purchase-${request.urgency.toLowerCase()}`}
                    >
                      {request.urgency}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`purchase-tag purchase-status-${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>₹{request.estimatedCost}</td>
                  <td className="action-buttons">
                    <button
                      className="purchase-icon-button edit"
                      onClick={() => openRepairModal(request)}
                      disabled={loading}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="purchase-icon-button delete"
                    //   onClick={() => handleDeleteRepair(request._id)}
                      disabled={loading}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this repair request?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {showRepairModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>{editingItem ? 'Edit Repair Request' : 'New Repair Request'}</h3>
                            <button className="modal-close" onClick={() => setShowRepairModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleRepairSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Issue Name</label>
                                    <input
                                        type="text"
                                        value={repairForm.issueName}
                                        onChange={(e) => setRepairForm(prev => ({ ...prev, issueName: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea
                                        value={repairForm.description}
                                        onChange={(e) => setRepairForm(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date Reported</label>
                                    <input
                                        type="datetime-local"
                                        value={repairForm.dateReported.slice(0, 16)}
                                        onChange={(e) => setRepairForm(prev => ({
                                            ...prev,
                                            dateReported: new Date(e.target.value).toISOString()
                                        }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Urgency:</label>
                                    <select
                                        value={repairForm.urgency}
                                        onChange={(e) => setRepairForm(prev => ({ ...prev, urgency: e.target.value }))}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estimated Cost</label>
                                    <input
                                        type="number"
                                        value={repairForm.estimatedCost}
                                        onChange={(e) => setRepairForm(prev => ({
                                            ...prev,
                                            estimatedCost: e.target.value
                                        }))}
                                        required
                                    />
                                </div>
                                {editingItem && (
                                    <div className="form-group">
                                        <label>Status:</label>
                                        <select
                                            value={repairForm.status}
                                            onChange={(e) => setRepairForm(prev => ({
                                                ...prev,
                                                status: e.target.value
                                            }))}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Attachments:</label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                        />
                                        <label htmlFor="file-upload" className="file-upload-label">
                                            Choose Files (PDF, Images)
                                        </label>
                                    </div>

                                    {repairForm.attachments.length > 0 && (
                                        <div className="uploaded-files">
                                            <h4>Selected Files:</h4>
                                            <ul>

                                                {repairForm.attachments.map((file, index) => (
                                                    <li key={index} onClick={() => window.open(file.fileUrl, "_blank")}>
                                                        {file.name}
                                                        <button
                                                            type="button"
                                                            className="remove-file"
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            ×
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {editingItem && repairForm.existingAttachments.length > 0 && (
                                        <div className="existing-attachments">
                                            <h4>Existing Attachments:</h4>
                                            <div className="attachments-grid">
                                                {repairForm.existingAttachments.map((file, index) => (
                                                    <div key={`existing-${index}`} className="attachment-item">
                                                        <FilePreview file={file} />
                                                        <div className="attachment-actions">
                                                            <a
                                                                href={file.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="view-button"
                                                            >
                                                                View
                                                            </a>
                                                            <button
                                                                type="button"
                                                                className="remove-file"
                                                                onClick={() => {
                                                                    setRepairForm(prev => ({
                                                                        ...prev,
                                                                        existingAttachments: prev.existingAttachments.filter((_, i) => i !== index)
                                                                    }));
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowRepairModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : (editingItem ? 'Update Request' : 'Submit Request')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
    </div>
  );
}
