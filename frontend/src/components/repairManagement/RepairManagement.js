import React, { useEffect, useState } from "react";
import { createRepair, deleteRepair, getAllRepairs, getBalagruha, updateRepairRequest } from "../../api";
import showToast from '../../utils/toast';
import './RepairManagement.css';
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);



export default function RepairManagement() {
  const [loading, setLoading] = useState(true);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [repairRequests, setRepairRequests] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filterBalagruha, setFilterBalagruha] = useState("all");
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBalagruha, setSelectedBalagruha] = useState();
  const [balagruhas, setBalagruhas] = useState([]);
  const [repairSearch, setRepairSearch] = useState();
  const [selectDate, setSelectDate] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [repairForm, setRepairForm] = useState({
    balagruhaId: "",
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
    fetchBalagruha();
    //   fetchPurchaseOrders();
  }, []);

  const openRepairModal = (repair = null) => {
    if (repair) {
      setRepairForm({
        balagruhaId: repair.balagruhaId,
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
        balagruhaId: "",
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
    setSelectedBalagruha();

    try {
      const formData = new FormData();
      formData.append('balagruhaId', repairForm.balagruhaId);
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
      showToast("Error fetching balagruha", "error")
    }

  }

  // const filteredRepairRequests = repairRequests.filter((bal) => {

  //   if(selectDate === 'today') {

  //   }

  //   if (filterBalagruha !== "all") {
  //     return bal.balagruhaId === filterBalagruha
  //   }
  //   return repairRequests;
  // })

  const filteredRepairRequests = repairRequests.filter((bal) => {
    const reportedDate = dayjs(bal.dateReported);
  
    let passesDateFilter = true;
  
    if (selectDate === 'today') {
      passesDateFilter = reportedDate.isSame(dayjs(), 'day');
    } else if (selectDate === 'thisWeek') {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      passesDateFilter = reportedDate.isSameOrAfter(startOfWeek) && reportedDate.isSameOrBefore(endOfWeek);
    } else if (selectDate === 'thisMonth') {
      passesDateFilter = reportedDate.isSame(dayjs(), 'month');
    } else if (selectDate === 'lastMonth') {
      const lastMonth = dayjs().subtract(1, 'month');
      passesDateFilter = reportedDate.isSame(lastMonth, 'month');
    } else if (selectDate === 'custom' && fromDate && toDate) {
      passesDateFilter =
        reportedDate.isSameOrAfter(dayjs(fromDate)) &&
        reportedDate.isSameOrBefore(dayjs(toDate).endOf('day'));
    }
  
    let passesBalagruhaFilter = filterBalagruha === "all" || bal.balagruhaId === filterBalagruha;

    const searchFilter = !repairSearch || repairSearch && bal?.issueName?.toLowerCase().includes(repairSearch?.toLowerCase())

    const statusFilter = filterStatus === "all" || bal.status === filterStatus;
  
    return passesDateFilter && passesBalagruhaFilter && searchFilter && statusFilter;
  });

  // const exportToPDF = () => {
  //   const doc = new jsPDF();
  
  //   // Define table column titles
  //   const tableColumn = [
  //     "Issue Name", 
  //     "Description", 
  //     "Date Reported", 
  //     "Urgency", 
  //     "Status", 
  //     "Estimated Cost"
  //   ];
  
  //   // Define rows from filteredRepairRequests
  //   const tableRows = filteredRepairRequests.map((req) => [
  //     req.issueName,
  //     req.description,
  //     new Date(req.dateReported).toLocaleDateString(),
  //     req.urgency,
  //     req.status,
  //     req.estimatedCost
  //   ]);
  
  //   // Create table
  //   autoTable(doc, {
  //     head: [tableColumn],
  //     body: tableRows,
  //     styles: { fontSize: 9 },
  //     headStyles: { fillColor: [120, 153, 248] }
  //   });
  
  //   // Save the PDF
  //   doc.save('RepairRequests.pdf');
  // };

const exportToPDF = () => {
  const doc = new jsPDF();

  // --- 1. Add Title & Date Filter Info ---
  doc.setFontSize(14);
  doc.text("Repair Requests Report", 14, 15);

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
    "Issue Name",
    "Description",
    "Date Reported",
    "Urgency",
    "Balagruha",
    "Status",
    "Estimated Cost"
  ];

  const tableRows = filteredRepairRequests.map((req) => [
    req.issueName,
    req.description,
    dayjs(req.dateReported).format('DD-MM-YYYY'),
    req.urgency,
    req.balagruhaName,
    req.status,
    `₹${req.estimatedCost}`
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
  const totalCost = filteredRepairRequests.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
  const finalY = doc.lastAutoTable.finalY || 30;

  doc.setFontSize(11);
  doc.text(`Total Estimated Cost: ₹${totalCost}`, 14, finalY + 10);

  // --- 4. Save ---
  doc.save('RepairRequests.pdf');
};


  return (
    <div style={{ width: "100%", margin: "20px" }}>
      <div className="purchase-repairs-section">
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
                 <input type="date" className="from-to-date-input"  value={toDate} onChange={(e) => setToDate(e.target.value)} />
               </div>
             </div>
           </div>
          )}
        </div>
        <div className="purchase-section-header">
          <h2>Repair Requests</h2>
         <div>
         <button
            className="purchase-action-button"
            onClick={() => openRepairModal()}
            disabled={loading}
          >
            + New Repair Request
          </button>
          <button
            className="purchase-action-button"
            style={{marginLeft: "20px"}}
            onClick={exportToPDF}
          >
            Export Data
          </button>
         </div>
        </div>
        <div style={{ maxWidth: "700px", marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input type="text" placeholder="Search Issue Name" onChange={(e) => setRepairSearch(e.target.value)} style={{ borderRadius: "30px", border: "2px solid #7ed6df", fontWeight: "500", fontFamily: "'Patrick Hand', cursive", color: "black" }} />
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
                  <th>Request ID</th>
                  <th>Issue Name</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Urgency</th>
                  <th>Balagruha</th>
                  <th>Status</th>
                  <th>Est. Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairRequests?.map((request) => (
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
                    <td>{request.balagruhaName}</td>
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
                  <label>Balagruha</label>
                  <select
                    value={repairForm.balagruhaId}
                    onChange={(e) => {
                      setSelectedBalagruha(e.target.value)
                      setRepairForm(prev => ({ ...prev, balagruhaId: e.target.value }))
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
