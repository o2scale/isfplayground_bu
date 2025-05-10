import React, { useState, useEffect } from "react";
import "./PurchaseDashboard.css";
import { useAuth } from "../../contexts/AuthContext";
import MachineManagement from "../machineManagement/machineManagement";
import {
  createPurchase,
  createRepair,
  deletePurchase,
  deleteRepair,
  getAllPurchases,
  getAllRepairs,
  getBalagruha,
  getPurchaseOverView,
  updatePurchaseOrder,
  updateRepairRequest,
} from "../../api";
import TaskManagement from "../TaskManagement/taskmanagement";
import showToast from "../../utils/toast";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const PurchaseDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { logout } = useAuth();

  // Modal states
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [repairRequests, setRepairRequests] = useState([]);
  const [selectedBalagruha, setSelectedBalagruha] = useState();
  const [balagruhas, setBalagruhas] = useState([]);
  const [selectDate, setSelectDate] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectDatePurchase, setSelectDatePurchase] = useState(null);
  const [fromDatePurchase, setFromDatePurchase] = useState("");
  const [toDatePurchase, setToDatePurchase] = useState("");
  const [purchaseSearch, setPurchaseSearch] = useState()
  const [filterBalagruha, setFilterBalagruha] = useState("all");
  const [repairSearch, setRepairSearch] = useState();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStatusPurchase, setFilterStatusPurchase] = useState('all');
  const [selectedPurchaseStatus, setSelectedPurchaseStatus] = useState();
  const [filterBalagruhaPurchase, setFilterBalagruhaPurchase] = useState("all");
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

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showDeletePurchaseConfirmation, setShowDeletePurchaseConfirmation] =
    useState(false);
  const [deletePurchaseId, setDeletePurchaseId] = useState(null);

  // Update purchaseForm state
  const [purchaseForm, setPurchaseForm] = useState({
    balagruhaId: "",
    status: "",
    machineDetails: "",
    vendorDetails: "",
    costEstimate: "",
    requiredParts: "",
    attachments: [],
    existingAttachments: [],
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  const handleDeleteRepair = (id) => {
    setDeleteId(id);
    setShowDeleteConfirmation(true);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sportCoachMenu =
    localStorage.getItem("role") === "balagruha-incharge"
      ? [
          { id: 1, name: "Dashboard", activeTab: "dashboard" },
          { id: 4, name: "Machines", activeTab: "machines" },
          { id: 2, name: "Repairs", activeTab: "repairs" },
          { id: 3, name: "Purchases", activeTab: "purchases" },
          { id: 4, name: "Tasks", activeTab: "tasks", link: "/task" },
          // { id: 6, name: "Reports", activeTab: "reports" },
        ]
      : [
          { id: 1, name: "Dashboard", activeTab: "dashboard" },
          // { id: 4, name: "Machines", activeTab: "machines" },
          { id: 2, name: "Repairs", activeTab: "repairs" },
          { id: 3, name: "Purchases", activeTab: "purchases" },
          { id: 4, name: "Tasks", activeTab: "tasks", link: "/task" },
          // { id: 6, name: "Reports", activeTab: "reports" },
        ];

  const [dashboardData, setDashboardData] = useState({
    activeRepairs: 0,
    pendingOrders: 0,
    completedThisWeek: 0,
    budgetUsed: 0,
    repairStats: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
    purchaseStats: {
      total: 0,
      totalCost: 0,
      recentPurchases: [],
    },
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRepairRequests();
    fetchPurchaseOrders();
    fetchBalagruha();
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRepairRequests();
    fetchPurchaseOrders();
  }, [activeTab]);

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

  const handleDeletePurchase = (id) => {
    setDeletePurchaseId(id);
    setShowDeletePurchaseConfirmation(true);
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

  const handlePurchaseFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setPurchaseForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removePurchaseFile = (index) => {
    setPurchaseForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

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

  const calculateDashboardStats = (repairs, purchases) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      activeRepairs: repairs.filter((r) => r.status !== "completed").length,
      pendingOrders: purchases.filter((p) => p.status === "pending").length,
      completedThisWeek: repairs.filter(
        (r) => r.status === "completed" && new Date(r.dateReported) > weekAgo
      ).length,
      budgetUsed: purchases.reduce((sum, p) => sum + Number(p.costEstimate), 0),
      repairStats: {
        pending: repairs.filter((r) => r.status === "pending").length,
        inProgress: repairs.filter((r) => r.status === "in-progress").length,
        completed: repairs.filter((r) => r.status === "completed").length,
      },
      purchaseStats: {
        total: purchases.length,
        totalCost: purchases.reduce(
          (sum, p) => sum + Number(p.costEstimate),
          0
        ),
        recentPurchases: purchases.slice(0, 5), // Get 5 most recent purchases
      },
      recentActivities: [
        ...repairs.map((r) => ({
          type: "repair",
          title: r.issueName,
          status: r.status,
          date: new Date(r.dateReported),
          cost: r.estimatedCost,
        })),
        ...purchases.map((p) => ({
          type: "purchase",
          title: p.machineDetails,
          status: p.status,
          date: new Date(p.createdAt),
          cost: p.costEstimate,
        })),
      ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 10),
    };

    return stats;
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSelectedBalagruha();

    try {
      const formData = new FormData();
      formData.append("balagruhaId", purchaseForm.balagruhaId);
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setRepairForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeFile = (index) => {
    setRepairForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [repairsResponse, purchasesResponse] = await Promise.all([
        getAllRepairs(),
        getAllPurchases(),
        getPurchaseOverView(),
      ]);

      const repairs = repairsResponse.data.repairRequests || [];
      const purchases = purchasesResponse.data.purchaseOrders || [];

      const response = await getPurchaseOverView();
      const data = response.data;

      // Calculate repair statistics from recent activities
      const repairStats = {
        pending: data.recentActivities.filter((r) => r.status === "pending")
          .length,
        inProgress: data.recentActivities.filter(
          (r) => r.status === "in-progress"
        ).length,
        completed: data.recentActivities.filter((r) => r.status === "completed")
          .length,
      };

      // Format recent activities
      const formattedActivities = data.recentActivities.map((activity) => ({
        type: "repair",
        title: activity.issueName,
        status: activity.status,
        date: new Date(activity.dateReported),
        cost: activity.estimatedCost,
        urgency: activity.urgency,
        description: activity.description,
        attachments: activity.attachments,
        createdBy: activity.createdBy,
      }));

      setDashboardData({
        activeRepairs: data.activeRepairs,
        pendingOrders: data.pendingOrders,
        completedThisWeek: data.completedThisWeek,
        budgetUsed: data.budgetUsed,
        recentActivities: formattedActivities,
        repairStats,
      });
      setError(null);

      const dashboardStats = calculateDashboardStats(repairs, purchases);
      setDashboardData(dashboardStats);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("balagruhaId", repairForm.balagruhaId);
      formData.append("issueName", repairForm.issueName);
      formData.append("description", repairForm.description);
      formData.append("dateReported", repairForm.dateReported);
      formData.append("urgency", repairForm.urgency);
      formData.append("estimatedCost", repairForm.estimatedCost);
      formData.append("repairDetails", repairForm.repairDetails);

      if (editingItem) {
        formData.append("status", repairForm.status);
      }

      repairForm.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      if (editingItem) {
        await updateRepairRequest(editingItem._id, formData);
      } else {
        await createRepair(formData);
      }

      setShowRepairModal(false);
      fetchRepairRequests(); // Refresh the list
    } catch (error) {
      console.error("Error submitting repair:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalagruha = async () => {
    const response = await getBalagruha();
    if (response.success) {
      const balagruhaIdsFromStorage = localStorage
        .getItem("balagruhaIds")
        ?.split(",");

      const filteredBalagruhas = response.data.balagruhas.filter((balagruha) =>
        balagruhaIdsFromStorage.includes(balagruha._id)
      );
      console.log("User Balagruha Data: ", filteredBalagruhas);
      setBalagruhas(filteredBalagruhas);
    } else {
      showToast("Error fetching balagruha", "error");
    }
  };

  const balagruhaIdsFromStorage =
    localStorage.getItem("balagruhaIds")?.split(",") || [];

  const filteredRepairRequests = repairRequests.filter((bal) => {
    const reportedDate = dayjs(bal.dateReported);

    let passesDateFilter = true;

    if (selectDate === "today") {
      passesDateFilter = reportedDate.isSame(dayjs(), "day");
    } else if (selectDate === "thisWeek") {
      const startOfWeek = dayjs().startOf("week");
      const endOfWeek = dayjs().endOf("week");
      passesDateFilter =
        reportedDate.isSameOrAfter(startOfWeek) &&
        reportedDate.isSameOrBefore(endOfWeek);
    } else if (selectDate === "thisMonth") {
      passesDateFilter = reportedDate.isSame(dayjs(), "month");
    } else if (selectDate === "lastMonth") {
      const lastMonth = dayjs().subtract(1, "month");
      passesDateFilter = reportedDate.isSame(lastMonth, "month");
    } else if (selectDate === "custom" && fromDate && toDate) {
      passesDateFilter =
        reportedDate.isSameOrAfter(dayjs(fromDate)) &&
        reportedDate.isSameOrBefore(dayjs(toDate).endOf("day"));
    }

    let passesBalagruhaFilter =
      filterBalagruha === "all"
        ? balagruhaIdsFromStorage.includes(bal.balagruhaId)
        : bal.balagruhaId === filterBalagruha;

        
    const searchFilter = !repairSearch || repairSearch && bal?.issueName?.toLowerCase().includes(repairSearch?.toLowerCase())

    const statusFilter = filterStatus === "all" || bal.status === filterStatus;

    return passesDateFilter && passesBalagruhaFilter && searchFilter && statusFilter;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();

    // --- 1. Add Title & Date Filter Info ---
    doc.setFontSize(14);
    doc.text("Repair Requests Report", 14, 15);

    // Format filter info
    let filterInfo = "";
    const today = dayjs();

    if (selectDate === "custom" && fromDate && toDate) {
      filterInfo = `Date Range: ${dayjs(fromDate).format(
        "DD-MM-YYYY"
      )} to ${dayjs(toDate).format("DD-MM-YYYY")}`;
    } else if (selectDate === "today") {
      filterInfo = `Date: ${today.format("DD-MM-YYYY")}`;
    } else if (selectDate === "thisWeek") {
      const startOfWeek = today.startOf("week");
      // Adjust the end of the week: if today is before the week's Sunday, use today as the end date.
      const endOfWeek = today.isBefore(today.endOf("week"))
        ? today
        : today.endOf("week");
      filterInfo = `Date Range: ${startOfWeek.format(
        "DD-MM-YYYY"
      )} to ${endOfWeek.format("DD-MM-YYYY")}`;
    } else if (selectDate === "thisMonth") {
      const startOfMonth = today.startOf("month");
      const endOfMonth = today.endOf("month");
      filterInfo = `Date Range: ${startOfMonth.format(
        "DD-MM-YYYY"
      )} to ${endOfMonth.format("DD-MM-YYYY")}`;
    } else if (selectDate === "lastMonth") {
      const startOfLastMonth = today.subtract(1, "month").startOf("month");
      const endOfLastMonth = today.subtract(1, "month").endOf("month");
      filterInfo = `Date Range: ${startOfLastMonth.format(
        "DD-MM-YYYY"
      )} to ${endOfLastMonth.format("DD-MM-YYYY")}`;
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
      "Estimated Cost",
    ];

    const tableRows = filteredRepairRequests.map((req) => [
      req.issueName,
      req.description,
      dayjs(req.dateReported).format("DD-MM-YYYY"),
      req.urgency,
      req.balagruhaName,
      req.status,
      `₹${req.estimatedCost}`,
    ]);

    // Add table below date info
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [120, 153, 248] },
    });

    // --- 3. Total Cost Summary ---
    const totalCost = filteredRepairRequests.reduce(
      (acc, curr) => acc + (curr.estimatedCost || 0),
      0
    );
    const finalY = doc.lastAutoTable.finalY || 30;

    doc.setFontSize(11);
    doc.text(`Total Estimated Cost: ₹${totalCost}`, 14, finalY + 10);

    // --- 4. Save ---
    doc.save("RepairRequests.pdf");
  };

  // const filteredPurchaseOrders = purchaseOrders.filter((bal) => {
  //   console.log(filterBalagruhaPurchase, bal);
  //   if (filterBalagruhaPurchase !== "all") {
  //     return bal.balagruhaId === filterBalagruhaPurchase;
  //   } else {
  //     return balagruhaIdsFromStorage.includes(bal.balagruhaId);
  //   }
  // });

  const filteredPurchaseOrders = purchaseOrders.filter((bal) => {
    const createdDate = dayjs(bal.createdAt);
  
    let passesDateFilter = true;
  
    if (selectDatePurchase === 'today') {
      passesDateFilter = createdDate.isSame(dayjs(), 'day');
    } else if (selectDatePurchase === 'thisWeek') {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      passesDateFilter = createdDate.isSameOrAfter(startOfWeek) && createdDate.isSameOrBefore(endOfWeek);
    } else if (selectDatePurchase === 'thisMonth') {
      passesDateFilter = createdDate.isSame(dayjs(), 'month');
    } else if (selectDatePurchase === 'lastMonth') {
      const lastMonth = dayjs().subtract(1, 'month');
      passesDateFilter = createdDate.isSame(lastMonth, 'month');
    } else if (selectDatePurchase === 'custom' && fromDatePurchase && toDatePurchase) {
      passesDateFilter =
        createdDate.isSameOrAfter(dayjs(fromDatePurchase)) &&
        createdDate.isSameOrBefore(dayjs(toDatePurchase).endOf('day'));
    }
  
    let passesBalagruhaFilter =
      filterBalagruha === "all"
        ? balagruhaIdsFromStorage.includes(bal.balagruhaId)
        : bal.balagruhaId === filterBalagruha;

        const searchFilter = !purchaseSearch || purchaseSearch && bal?.machineDetails?.toLowerCase().includes(purchaseSearch?.toLowerCase()) ||  purchaseSearch && bal?.vendorDetails?.toLowerCase().includes(purchaseSearch?.toLowerCase()) ||  purchaseSearch && bal?.requiredParts?.toLowerCase().includes(purchaseSearch?.toLowerCase())

        const searchStatus = filterStatusPurchase === 'all' || bal.status === filterStatusPurchase
  
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
  
  if (selectDatePurchase === 'custom' && fromDatePurchase && toDatePurchase) {
    filterInfo = `Date Range: ${dayjs(fromDatePurchase).format('DD-MM-YYYY')} to ${dayjs(toDatePurchase).format('DD-MM-YYYY')}`;
  } else if (selectDatePurchase === 'today') {
    filterInfo = `Date: ${today.format('DD-MM-YYYY')}`;
  } else if (selectDatePurchase === 'thisWeek') {
    const startOfWeek = today.startOf('week');
    // Adjust the end of the week: if today is before the week's Sunday, use today as the end date.
    const endOfWeek = today.isBefore(today.endOf('week')) ? today : today.endOf('week');
    filterInfo = `Date Range: ${startOfWeek.format('DD-MM-YYYY')} to ${endOfWeek.format('DD-MM-YYYY')}`;
  } else if (selectDatePurchase === 'thisMonth') {
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month');
    filterInfo = `Date Range: ${startOfMonth.format('DD-MM-YYYY')} to ${endOfMonth.format('DD-MM-YYYY')}`;
  } else if (selectDatePurchase === 'lastMonth') {
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
    <div className="purchase-dashboard">
      {/* Collapsible Sidebar */}
      <div className="header">
        <div className="user-info" style={{ flexDirection: "row" }}>
          <h2>Hi {localStorage?.getItem("name")},</h2>
          <div className="avatar">
            {localStorage?.getItem("name")?.charAt(0)}
          </div>
        </div>

        {/* Top Menu */}
        <div className="top-menu scrollable-menu">
          {sportCoachMenu.map((menu) => (
            <div
              key={menu.id}
              className={`menu-item ${
                activeTab === menu.activeTab ? "active" : ""
              }`}
              onClick={() => setActiveTab(menu?.activeTab)}
            >
              {menu.name}
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="purchase-main-content">
        {/* Tab Content */}
        <div className="purchase-dashboard-content">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="purchase-dashboard-overview">
              {/* Stats Cards */}
              <div className="purchase-stats-cards">
                <div className="purchase-stat-card">
                  <div className="purchase-stat-icon">🔧</div>
                  <div className="purchase-stat-info">
                    <h3>{dashboardData.activeRepairs}</h3>
                    <p>Active Repairs</p>
                  </div>
                </div>
                <div className="purchase-stat-card">
                  <div className="purchase-stat-icon">🛒</div>
                  <div className="purchase-stat-info">
                    <h3>{dashboardData.pendingOrders}</h3>
                    <p>Pending Orders</p>
                  </div>
                </div>
                <div className="purchase-stat-card">
                  <div className="purchase-stat-icon">✅</div>
                  <div className="purchase-stat-info">
                    <h3>{dashboardData.completedThisWeek}</h3>
                    <p>Completed This Week</p>
                  </div>
                </div>
                <div className="purchase-stat-card">
                  <div className="purchase-stat-icon">💰</div>
                  <div className="purchase-stat-info">
                    <h3>₹{dashboardData.budgetUsed.toLocaleString()}</h3>
                    <p>Total Expenditure</p>
                  </div>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="dashboard-detailed-stats">
                {/* Repair Status Distribution */}
                <div className="dashboard-card repair-status">
                  <h3>Repair Status Distribution</h3>
                  <div className="status-bars">
                    <div className="status-bar">
                      <div className="bar-label">Pending</div>
                      <div className="bar-container">
                        <div
                          className="bar pending"
                          style={{
                            width: `${
                              (dashboardData.repairStats.pending /
                                (dashboardData.repairStats.pending +
                                  dashboardData.repairStats.inProgress +
                                  dashboardData.repairStats.completed)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="bar-value">
                        {dashboardData.repairStats.pending}
                      </div>
                    </div>
                    <div className="status-bar">
                      <div className="bar-label">In Progress</div>
                      <div className="bar-container">
                        <div
                          className="bar in-progress"
                          style={{
                            width: `${
                              (dashboardData.repairStats.inProgress /
                                (dashboardData.repairStats.pending +
                                  dashboardData.repairStats.inProgress +
                                  dashboardData.repairStats.completed)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="bar-value">
                        {dashboardData.repairStats.inProgress}
                      </div>
                    </div>
                    <div className="status-bar">
                      <div className="bar-label">Completed</div>
                      <div className="bar-container">
                        <div
                          className="bar completed"
                          style={{
                            width: `${
                              (dashboardData.repairStats.completed /
                                (dashboardData.repairStats.pending +
                                  dashboardData.repairStats.inProgress +
                                  dashboardData.repairStats.completed)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="bar-value">
                        {dashboardData.repairStats.completed}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="dashboard-card recent-activities">
                  <h3>Recent Activities</h3>
                  <div className="activity-list">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === "repair" ? "🔧" : "🛒"}
                        </div>
                        <div className="activity-details">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-meta">
                            <span
                              className={`activity-status ${activity.status}`}
                            >
                              {activity.status}
                            </span>
                            <span className="activity-date">
                              {activity.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="activity-cost">
                          ₹{Number(activity.cost).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "machines" && <MachineManagement />}

          {activeTab === "tasks" && <TaskManagement />}

          {/* Repairs Tab */}
          {activeTab === "repairs" && (
            <div className="purchase-repairs-section">
              <div className="date-container">
                <div className="date-picker">
                  <div>
                    <button
                      onClick={() => setSelectDate(null)}
                      className={`date-picker-button ${
                        selectDate === null ? "selected" : ""
                      }`}
                    >
                      All
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectDate("today")}
                      className={`date-picker-button ${
                        selectDate === "today" ? "selected" : ""
                      }`}
                    >
                      Today
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectDate("thisWeek")}
                      className={`date-picker-button ${
                        selectDate === "thisWeek" ? "selected" : ""
                      }`}
                    >
                      This week
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectDate("thisMonth")}
                      className={`date-picker-button ${
                        selectDate === "thisMonth" ? "selected" : ""
                      }`}
                    >
                      This month
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectDate("lastMonth")}
                      className={`date-picker-button ${
                        selectDate === "lastMonth" ? "selected" : ""
                      }`}
                    >
                      Last Month
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectDate("custom")}
                      className={`date-picker-button ${
                        selectDate === "custom" ? "selected" : ""
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>
                {selectDate === "custom" && (
                  <div className="custom-date-container">
                    <div className="from-to-container">
                      <div>
                        <label htmlFor="from">From date</label>
                        <input
                          type="date"
                          className="from-to-date-input"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="to">To date</label>
                        <input
                          type="date"
                          className="from-to-date-input"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                        />
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
                    style={{ marginLeft: "20px" }}
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
                          <td>
                            {new Date(
                              request.dateReported
                            ).toLocaleDateString()}
                          </td>
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
                              onClick={() => handleDeleteRepair(request._id)}
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
                      <p>
                        Are you sure you want to delete this repair request?
                      </p>
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
          )}

          {activeTab === "purchases" && (
            <div className="purchase-purchases-section">
             <div className="date-container">
          <div className="date-picker">
          <div>
              <button onClick={() => setSelectDatePurchase(null)} className={`date-picker-button ${selectDatePurchase === null ? 'selected' : ''}`}>All</button>
            </div>
            <div>
              <button onClick={() => setSelectDatePurchase('today')} className={`date-picker-button ${selectDatePurchase === 'today' ? 'selected' : ''}`}>Today</button>
            </div>
            <div>
              <button onClick={() => setSelectDatePurchase('thisWeek')} className={`date-picker-button ${selectDatePurchase === 'thisWeek' ? 'selected' : ''}`}>This week</button>
            </div>
            <div>
              <button onClick={() => setSelectDatePurchase('thisMonth')} className={`date-picker-button ${selectDatePurchase === 'thisMonth' ? 'selected' : ''}`}>This month</button>
            </div>
            <div>
              <button onClick={() => setSelectDatePurchase('lastMonth')} className={`date-picker-button ${selectDatePurchase === 'lastMonth' ? 'selected' : ''}`}>Last Month</button>
            </div>
            <div>
              <button onClick={() => setSelectDatePurchase('custom')} className={`date-picker-button ${selectDatePurchase === 'custom' ? 'selected' : ''}`}>Custom</button>
            </div>
          </div>
          {selectDate === 'custom' && (
             <div className="custom-date-container">
             <div className="from-to-container">
               <div>
                 <label htmlFor="from">From date</label>
                 <input type="date" className="from-to-date-input" value={fromDatePurchase} onChange={(e) => setFromDatePurchase(e.target.value)} />
               </div>
               <div>
                 <label htmlFor="to">To date</label>
                 <input type="date" className="from-to-date-input"  value={toDatePurchase} onChange={(e) => setToDatePurchase(e.target.value)} />
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
            style={{marginLeft: "20px"}}
            onClick={exportPurchaseOrdersToPDF}
          >
            Export Data
          </button>
         </div>
        </div>
              <div style={{ maxWidth: "700px", marginBottom: "20px", display: "flex", gap: "10px" }}>
                <input type="text" placeholder="Search Machine Details, Vendor Details, Required Materials" onChange={(e) => setPurchaseSearch(e.target.value)} style={{ borderRadius: "30px", border: "2px solid #7ed6df", fontWeight: "500", fontFamily: "'Patrick Hand', cursive", color: "black" }} />
                <select
                  value={filterBalagruhaPurchase}
                  onChange={(e) => setFilterBalagruhaPurchase(e.target.value)}
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
                  onChange={(e) => setFilterStatusPurchase(e.target.value)}
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
                          <td>{order.balagruhaName}</td>
                          <td>{order.status}</td>
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
                      <p>
                        Are you sure you want to delete this purchase order?
                      </p>
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
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="purchase-reports-section">
              <h2>Reports</h2>

              <div className="purchase-report-filters">
                <div className="purchase-filter-group">
                  <label>Report Type:</label>
                  <select>
                    <option>Repair Reports</option>
                    <option>Purchase Reports</option>
                    <option>Cost Analysis</option>
                  </select>
                </div>
                <div className="purchase-filter-group">
                  <label>Date Range:</label>
                  <select>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <button className="purchase-action-button">
                  Generate Report
                </button>
              </div>

              <div className="purchase-report-preview">
                {/* <div className="purchase-report-chart">
                                    <div className="purchase-placeholder-chart">
                                        <p>Chart Visualization Will Appear Here</p>
                                        <div className="purchase-chart-placeholder"></div>
                                    </div>
                                </div> */}

                <div className="purchase-report-summary">
                  <h3>Report Summary</h3>
                  <ul>
                    <li>Total Repairs: 8</li>
                    <li>Average Repair Time: 3.5 days</li>
                    <li>Total Purchase Orders: 5</li>
                    <li>Total Expenditure: ₹3,450</li>
                  </ul>
                  <button className="purchase-action-button">
                    Export Report (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Repair Request Modal */}
      {showRepairModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>
                {editingItem ? "Edit Repair Request" : "New Repair Request"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowRepairModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRepairSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Balagruha</label>
                  <select
                    value={repairForm.balagruhaId}
                    onChange={(e) => {
                      setSelectedBalagruha(e.target.value);
                      setRepairForm((prev) => ({
                        ...prev,
                        balagruhaId: e.target.value,
                      }));
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
                    onChange={(e) =>
                      setRepairForm((prev) => ({
                        ...prev,
                        issueName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={repairForm.description}
                    onChange={(e) =>
                      setRepairForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date Reported</label>
                  <input
                    type="datetime-local"
                    value={repairForm.dateReported.slice(0, 16)}
                    onChange={(e) =>
                      setRepairForm((prev) => ({
                        ...prev,
                        dateReported: new Date(e.target.value).toISOString(),
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Urgency:</label>
                  <select
                    value={repairForm.urgency}
                    onChange={(e) =>
                      setRepairForm((prev) => ({
                        ...prev,
                        urgency: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setRepairForm((prev) => ({
                        ...prev,
                        estimatedCost: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {editingItem && (
                  <div className="form-group">
                    <label>Status:</label>
                    <select
                      value={repairForm.status}
                      onChange={(e) =>
                        setRepairForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
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
                          <li
                            key={index}
                            onClick={() => window.open(file.fileUrl, "_blank")}
                          >
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
                                  setRepairForm((prev) => ({
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
                  {loading
                    ? "Processing..."
                    : editingItem
                    ? "Update Request"
                    : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      setSelectedBalagruha(e.target.value);
                      setPurchaseForm((prev) => ({
                        ...prev,
                        balagruhaId: e.target.value,
                      }));
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
                      setSelectedPurchaseStatus(e.target.value);
                      setPurchaseForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
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
};

export default PurchaseDashboard;
