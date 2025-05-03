import React, { useEffect, useState } from "react";
import {
  createPurchase,
  deletePurchase,
  getAllPurchases,
  updatePurchaseOrder,
} from "../../api";

export default function PurchaseManagement() {
  const [purchaseForm, setPurchaseForm] = useState({
    machineDetails: "",
    vendorDetails: "",
    costEstimate: "",
    requiredParts: "",
    attachments: [],
    existingAttachments: [],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [deletePurchaseId, setDeletePurchaseId] = useState(null);
  const [showDeletePurchaseConfirmation, setShowDeletePurchaseConfirmation] =
    useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const openPurchaseModal = (purchase = null) => {
    if (purchase) {
      setPurchaseForm({
        machineDetails: purchase.machineDetails,
        vendorDetails: purchase.vendorDetails,
        costEstimate: purchase.costEstimate,
        requiredParts: purchase.requiredParts,
        attachments: [],
        existingAttachments: purchase.attachments || [],
      });
      setEditingItem(purchase);
    } else {
      setPurchaseForm({
        machineDetails: "",
        vendorDetails: "",
        costEstimate: "",
        requiredParts: "",
        attachments: [],
        existingAttachments: [],
      });
      setEditingItem(null);
    }
    setShowPurchaseModal(true);
  };

  const FilePreview = ({ file }) => {
    const [preview, setPreview] = useState("");

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
      const imageTypes = ["jpg", "jpeg", "png", "gif"];
      const extension = file.name
        ? file.name.split(".").pop().toLowerCase()
        : (file.fileUrl || file.url)?.split(".").pop().toLowerCase();
      return imageTypes.includes(extension);
    };

    return (
      <div className="file-preview">
        {isImage(file) ? (
          <img src={preview} alt="preview" className="preview-image" />
        ) : (
          <div className="preview-document">
            <i className="fas fa-file-pdf"></i>
            <span>{file.name || "Document"}</span>
          </div>
        )}
      </div>
    );
  };

  const handleDeletePurchase = (id) => {
    setDeletePurchaseId(id);
    setShowDeletePurchaseConfirmation(true);
  };

  const handlePurchaseFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setPurchaseForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const confirmDeletePurchase = async () => {
    if (!deletePurchaseId) return;

    try {
      setLoading(true);
      await deletePurchase(deletePurchaseId);
      await fetchPurchaseOrders();
      setShowDeletePurchaseConfirmation(false);
      setDeletePurchaseId(null);
    } catch (error) {
      console.error("Error deleting purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllPurchases();
      setPurchaseOrders(response.data.purchaseOrders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("machineDetails", purchaseForm.machineDetails);
      formData.append("vendorDetails", purchaseForm.vendorDetails);
      formData.append("costEstimate", purchaseForm.costEstimate);
      formData.append("requiredParts", purchaseForm.requiredParts);

      purchaseForm.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      if (editingItem) {
        await updatePurchaseOrder(editingItem._id, formData);
      } else {
        await createPurchase(formData);
      }

      setShowPurchaseModal(false);
      fetchPurchaseOrders();
    } catch (error) {
      console.error("Error submitting purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  const removePurchaseFile = (index) => {
    setPurchaseForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
    }));
};

  return (
    <div style={{ width: "100%", margin: "20px"}}>
      <div className="purchase-purchases-section">
        <div className="purchase-section-header">
          <h2>Purchase Orders</h2>
          <button
            className="purchase-action-button"
            onClick={() => openPurchaseModal()}
            disabled={loading}
          >
            + New Purchase Order
          </button>
        </div>

        <div className="purchase-data-table">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Machine Details</th>
                  <th>Vendor Details</th>
                  <th>Required Parts</th>
                  <th>Cost Estimate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.machineDetails}</td>
                    <td>{order.vendorDetails}</td>
                    <td>{order.requiredParts}</td>
                    <td>₹{order.costEstimate}</td>
                    <td className="action-buttons">
                      <button
                        className="purchase-icon-button edit"
                        onClick={() => openPurchaseModal(order)}
                        disabled={loading}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="purchase-icon-button delete"
                        onClick={() => handleDeletePurchase(order._id)}
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

        {/* Delete Confirmation Modal */}
        {showDeletePurchaseConfirmation && (
          <div className="modal-overlay">
            <div className="modal-container confirmation-modal">
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowDeletePurchaseConfirmation(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this purchase order?</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-button"
                  onClick={() => setShowDeletePurchaseConfirmation(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="delete-button"
                  onClick={confirmDeletePurchase}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPurchaseModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>
                {editingItem ? "Edit Purchase Order" : "New Purchase Order"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowPurchaseModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePurchaseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Machine Details</label>
                  <input
                    type="text"
                    value={purchaseForm.machineDetails}
                    onChange={(e) =>
                      setPurchaseForm((prev) => ({
                        ...prev,
                        machineDetails: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vendor Details:</label>
                  <input
                    type="text"
                    value={purchaseForm.vendorDetails}
                    onChange={(e) =>
                      setPurchaseForm((prev) => ({
                        ...prev,
                        vendorDetails: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost Estimate (₹):</label>
                  <input
                    type="number"
                    value={purchaseForm.costEstimate}
                    onChange={(e) =>
                      setPurchaseForm((prev) => ({
                        ...prev,
                        costEstimate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Required Parts:</label>
                  <textarea
                    value={purchaseForm.requiredParts}
                    onChange={(e) =>
                      setPurchaseForm((prev) => ({
                        ...prev,
                        requiredParts: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Attachments:</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="purchase-file-upload"
                      onChange={handlePurchaseFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                    />
                    <label
                      htmlFor="purchase-file-upload"
                      className="file-upload-label"
                    >
                      <i className="fas fa-cloud-upload-alt"></i>
                      Choose Files (PDF, Images)
                    </label>
                  </div>

                  {/* Existing Attachments */}
                  {editingItem &&
                    purchaseForm.existingAttachments.length > 0 && (
                      <div className="existing-attachments">
                        <h4>Existing Attachments:</h4>
                        <div className="attachments-grid">
                          {purchaseForm.existingAttachments.map(
                            (file, index) => (
                              <div
                                key={`existing-${index}`}
                                className="attachment-item"
                              >
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
                                      setPurchaseForm((prev) => ({
                                        ...prev,
                                        existingAttachments:
                                          prev.existingAttachments.filter(
                                            (_, i) => i !== index
                                          ),
                                      }));
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* New Attachments */}
                  {purchaseForm.attachments.length > 0 && (
                    <div className="new-attachments">
                      <h4>New Files:</h4>
                      <div className="attachments-grid">
                        {purchaseForm.attachments.map((file, index) => (
                          <div key={`new-${index}`} className="attachment-item">
                            <FilePreview file={file} />
                            <div className="attachment-actions">
                              <button
                                type="button"
                                className="remove-file"
                                onClick={() => removePurchaseFile(index)}
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
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : editingItem
                    ? "Update Order"
                    : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
