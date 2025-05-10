import React, { useEffect, useState } from "react";
import {
  createPurchase,
  deletePurchase,
  getAllPurchases,
  getBalagruha,
  updatePurchaseOrder,
} from "../../api";
import showToast from '../../utils/toast';

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './PurchaseManagement.css';


dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function PurchaseManagement() {
  const [purchaseForm, setPurchaseForm] = useState({
    balagruhaId: '',
    status: '',
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
  const [balagruhas, setBalagruhas] = useState([]);
  const [selectDate, setSelectDate] = useState(null);
  const [purchaseSearch, setPurchaseSearch] = useState()
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterBalagruha, setFilterBalagruha] = useState("all");
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBalagruha, setSelectedBalagruha] = useState();
  const [selectedStatus, setSelectedStatus] = useState();

  useEffect(() => {
    fetchPurchaseOrders();
    fetchBalagruha();
  }, []);

  const openPurchaseModal = (purchase = null) => {
    if (purchase) {
      setPurchaseForm({
        balagruhaId: purchase.balagruhaId,
        status: purchase.status,
        machineDetails: purchase.machineDetails,
        vendorDetails: purchase.vendorDetails,
        costEstimate: purchase.costEstimate,
        requiredParts: purchase.requiredParts,
        attachments: [],
        existingAttachments: purchase.attachments || [],
      });
      setEditingItem(purchase);
      // const select = balagruhas.filter((item) => {
      //   return item._id === purchase.balagruhaId
      // })
      // setSelectedBalagruha(select[0].name)
    } else {
      setPurchaseForm({
        balagruhaId: "",
        status: "",
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
    setSelectedBalagruha();

    try {
      const formData = new FormData();
      formData.append('balagruhaId', purchaseForm.balagruhaId);
      formData.append("status", purchaseForm.status);
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

  const fetchBalagruha = async () => {
    const response = await getBalagruha();
    if (response.success) {
      // const role = localStorage.getItem('role');
      // if(role === 'admin') {
      setBalagruhas(response.data.balagruhas);
      // } else {
      //   const balagruhaIdsFromStorage = localStorage.getItem('balagruhaIds')?.split(',');

      //   const filteredBalagruhas = response.data.balagruhas.filter(balagruha =>
      //     balagruhaIdsFromStorage.includes(balagruha._id)
      //   );
      //   console.log("User Balagruha Data: ", filteredBalagruhas);
      //   setBalagruhas(filteredBalagruhas);
      // }
    } else {
      showToast("Error fetching balagruha", "error");
    }

  }

  // const filteredBalagruhas = purchaseOrders.filter((bal) => {
  //   console.log(purchaseOrders)
  //   console.log(bal.balagruhaId, filterBalagruha)
  //   if(filterBalagruha !== "all") {
  //       return bal.balagruhaId === filterBalagruha
  //   }
  //   return purchaseOrders;
  // })

  const filteredPurchaseOrders = purchaseOrders.filter((bal) => {
    const createdDate = dayjs(bal.createdAt);

    let passesDateFilter = true;

    if (selectDate === 'today') {
      passesDateFilter = createdDate.isSame(dayjs(), 'day');
    } else if (selectDate === 'thisWeek') {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      passesDateFilter = createdDate.isSameOrAfter(startOfWeek) && createdDate.isSameOrBefore(endOfWeek);
    } else if (selectDate === 'thisMonth') {
      passesDateFilter = createdDate.isSame(dayjs(), 'month');
    } else if (selectDate === 'lastMonth') {
      const lastMonth = dayjs().subtract(1, 'month');
      passesDateFilter = createdDate.isSame(lastMonth, 'month');
    } else if (selectDate === 'custom' && fromDate && toDate) {
      passesDateFilter =
        createdDate.isSameOrAfter(dayjs(fromDate)) &&
        createdDate.isSameOrBefore(dayjs(toDate).endOf('day'));
    }

    const passesBalagruhaFilter = filterBalagruha === "all" || bal.balagruhaId === filterBalagruha;

    const searchFilter = !purchaseSearch || purchaseSearch && bal?.machineDetails?.toLowerCase().includes(purchaseSearch?.toLowerCase()) ||  purchaseSearch && bal?.vendorDetails?.toLowerCase().includes(purchaseSearch?.toLowerCase()) ||  purchaseSearch && bal?.requiredParts?.toLowerCase().includes(purchaseSearch?.toLowerCase())

    const searchStatus = filterStatus === "all" || bal.status === filterStatus;

    return passesDateFilter && passesBalagruhaFilter && searchFilter && searchStatus;
  });

  const exportPurchaseOrdersToPDF = () => {
    const doc = new jsPDF();

    // --- 1. Add Title & Date Filter Info ---
    doc.setFontSize(14);
    doc.text("Purchase Order Report", 14, 15);

    // Format filter info
    let filterInfo = "";
    const today = dayjs();

    if (selectDate === 'custom' && fromDate && toDate) {
      filterInfo = `Date Range: ${dayjs(fromDate).format('DD-MM-YYYY')} to ${dayjs(toDate).format('DD-MM-YYYY')}`;
    } else if (selectDate === 'today') {
      filterInfo = `Date: ${today.format('DD-MM-YYYY')}`;
    } else if (selectDate === 'thisWeek') {
      const startOfWeek = today.startOf('week');
      // Adjust the end of the week: if today is before the week's Sunday, use today as the end date.
      const endOfWeek = today.isBefore(today.endOf('week')) ? today : today.endOf('week');
      filterInfo = `Date Range: ${startOfWeek.format('DD-MM-YYYY')} to ${endOfWeek.format('DD-MM-YYYY')}`;
    } else if (selectDate === 'thisMonth') {
      const startOfMonth = today.startOf('month');
      const endOfMonth = today.endOf('month');
      filterInfo = `Date Range: ${startOfMonth.format('DD-MM-YYYY')} to ${endOfMonth.format('DD-MM-YYYY')}`;
    } else if (selectDate === 'lastMonth') {
      const startOfLastMonth = today.subtract(1, 'month').startOf('month');
      const endOfLastMonth = today.subtract(1, 'month').endOf('month');
      filterInfo = `Date Range: ${startOfLastMonth.format('DD-MM-YYYY')} to ${endOfLastMonth.format('DD-MM-YYYY')}`;
    } else {
      filterInfo = "Date Filter: All";
    }

    doc.setFontSize(10);
    doc.text(filterInfo, 14, 25);



    // --- 2. Table Data ---
    const tableColumn = [
      "Machine Details",
      "Vendor Details",
      "Required Materials",
      "Balagruha",
      "Cost Estimate",
      "Date",
      "Status"
    ];

    const tableRows = filteredPurchaseOrders.map((req) => [
      req.machineDetails,
      req.vendorDetails,
      req.requiredParts,
      req.balagruhaName,
      `₹${req.costEstimate}`,
      dayjs(req.createdAt).format('DD-MM-YYYY'),
      req.status,
    ]);

    // Add table below date info
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [120, 153, 248] }
    });

    // --- 3. Total Cost Summary ---
    const totalCost = filteredPurchaseOrders.reduce((acc, curr) => acc + (curr.costEstimate || 0), 0);
    const finalY = doc.lastAutoTable.finalY || 30;

    doc.setFontSize(11);
    doc.text(`Total Estimated Cost: ₹${totalCost}`, 14, finalY + 10);

    // --- 4. Save ---
    doc.save('PurchaseOrders.pdf');
  };


  return (
    <div style={{ width: "100%", margin: "20px" }}>
      <div className="purchase-purchases-section">
        <div className="date-container">
          <div className="date-picker">
            <div>
              <button onClick={() => setSelectDate(null)} className={`date-picker-button ${selectDate === null ? 'selected' : ''}`}>All</button>
            </div>
            <div>
              <button onClick={() => setSelectDate('today')} className={`date-picker-button ${selectDate === 'today' ? 'selected' : ''}`}>Today</button>
            </div>
            <div>
              <button onClick={() => setSelectDate('thisWeek')} className={`date-picker-button ${selectDate === 'thisWeek' ? 'selected' : ''}`}>This week</button>
            </div>
            <div>
              <button onClick={() => setSelectDate('thisMonth')} className={`date-picker-button ${selectDate === 'thisMonth' ? 'selected' : ''}`}>This month</button>
            </div>
            <div>
              <button onClick={() => setSelectDate('lastMonth')} className={`date-picker-button ${selectDate === 'lastMonth' ? 'selected' : ''}`}>Last Month</button>
            </div>
            <div>
              <button onClick={() => setSelectDate('custom')} className={`date-picker-button ${selectDate === 'custom' ? 'selected' : ''}`}>Custom</button>
            </div>
          </div>
          {selectDate === 'custom' && (
            <div className="custom-date-container">
              <div className="from-to-container">
                <div>
                  <label htmlFor="from">From date</label>
                  <input type="date" className="from-to-date-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="to">To date</label>
                  <input type="date" className="from-to-date-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="purchase-section-header">
          <h2>Purchase Orders</h2>
          <div>
            <button
              className="purchase-action-button"
              onClick={() => openPurchaseModal()}
              disabled={loading}
            >
              + New Purchase Request
            </button>
            <button
              className="purchase-action-button"
              style={{ marginLeft: "20px" }}
              onClick={exportPurchaseOrdersToPDF}
            >
              Export Data
            </button>
          </div>
        </div>
        <div style={{ maxWidth: "700px", marginBottom: "20px", display: "flex", gap: "10px" }}>
          <input type="text" placeholder="Search Machine Details, Vendor Details, Required Materials" onChange={(e) => setPurchaseSearch(e.target.value)} style={{ borderRadius: "30px", border: "2px solid #7ed6df", fontWeight: "500", fontFamily: "'Patrick Hand', cursive", color: "black" }} />
          <select
            value={filterBalagruha}
            onChange={(e) => setFilterBalagruha(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Balagruhas</option>
            {balagruhas.map((bg, index) => (
              <option key={index} value={bg._id}>
                {bg.name}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="in-progress">In progress</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
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
                  <th>Required Materials</th>
                  <th>Balagruha</th>
                  <th>Status</th>
                  <th>Cost Estimate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchaseOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.machineDetails}</td>
                    <td>{order.vendorDetails}</td>
                    <td>{order.requiredParts}</td>
                    <td>{order?.balagruhaName}</td>
                    <td>{order?.status}</td>
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
                  <label>Balagruha</label>
                  <select
                    value={purchaseForm.balagruhaId}
                    onChange={(e) => {
                      setSelectedBalagruha(e.target.value)
                      setPurchaseForm(prev => ({ ...prev, balagruhaId: e.target.value }))
                    }}
                    required
                  >
                    <option value="">Select Balagruha</option>
                    {balagruhas.map((bal) => (
                      <option key={bal.id} value={bal._id}>
                        {bal.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={purchaseForm.status}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value)
                      setPurchaseForm(prev => ({ ...prev, status: e.target.value }))
                    }}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="in-progress">In progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
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
                  <label>Required Materials:</label>
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
