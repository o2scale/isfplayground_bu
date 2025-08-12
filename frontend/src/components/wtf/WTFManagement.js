import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  Heart,
  ThumbsUp,
  Filter,
  Search,
  Bell,
  Archive,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  ExternalLink,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import CreateNewPinModal from "./CreateNewPinModal";
import PinEditModal from "./PinEditModal";
import ReviewModal from "./ReviewModal";
import CoachSuggestionReviewModal from "./CoachSuggestionReviewModal";
import { useAuth } from "../../contexts/AuthContext";
import BackgroundSettings from "./BackgroundSettings";
import {
  useWtfBackground,
  WtfBackgroundProvider,
} from "../../contexts/WtfBackgroundContext";
import {
  createWtfPin,
  getActiveWtfPins,
  updateWtfPin,
  deleteWtfPin,
  changeWtfPinStatus,
  getSubmissionsForReview,
  reviewSubmission,
  getWtfAnalytics,
  getWtfDashboardCounts,
  getCoachSuggestions,
} from "../../api";

const WTFManagementContent = ({ onToggleView }) => {
  const { user } = useAuth();
  const { getBackgroundStyle, refreshBackgroundSettings } = useWtfBackground();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [submissionTab, setSubmissionTab] = useState("voice");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedCoachSuggestion, setSelectedCoachSuggestion] = useState(null);
  const [showCoachSuggestionModal, setShowCoachSuggestionModal] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Coach suggestions pagination
  const [coachSuggestionsPage, setCoachSuggestionsPage] = useState(1);
  const [coachSuggestionsPerPage, setCoachSuggestionsPerPage] = useState(10);

  // Student submissions pagination
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsPerPage, setSubmissionsPerPage] = useState(10);

  // Real data from API
  const [activePins, setActivePins] = useState([]);
  const [pendingSuggestions, setPendingSuggestions] = useState([]); // legacy; kept for metrics fallback only
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [dashboardMetrics, setDashboardMetrics] = useState({
    activePins: 0,
    coachSuggestions: 0,
    studentSubmissions: 0,
    totalEngagement: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchWtfData();
  }, []);

  const fetchWtfData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch active pins
      const pinsResponse = await getActiveWtfPins({
        page: 1,
        limit: 20,
        type: filterType === "all" ? null : filterType,
      });
      const fetchedPins =
        pinsResponse.success && pinsResponse.data && pinsResponse.data.pins
          ? pinsResponse.data.pins
          : [];
      setActivePins(fetchedPins);

      // Fetch submissions for review
      let fetchedSubmissions = [];
      try {
        const submissionsResponse = await getSubmissionsForReview({
          page: 1,
          limit: 20,
          type: submissionTab,
        });
        if (submissionsResponse.success) {
          fetchedSubmissions =
            (submissionsResponse.data && submissionsResponse.data.submissions) || [];
          setStudentSubmissions(fetchedSubmissions);
        } else {
          setStudentSubmissions([]);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setStudentSubmissions([]);
      }

      // Fetch coach suggestions
      let fetchedSuggestions = [];
      try {
        const coachSuggestionsResponse = await getCoachSuggestions({
          page: 1,
          limit: 20,
        });
        if (coachSuggestionsResponse.success) {
          fetchedSuggestions = coachSuggestionsResponse.data || [];
          // Use the real coach suggestions for the table
          setCoachSuggestions(fetchedSuggestions);
          // Keep legacy state for fallback metrics (optional)
          setPendingSuggestions(fetchedSuggestions);
        } else {
          setCoachSuggestions([]);
          setPendingSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching coach suggestions:", error);
        setCoachSuggestions([]);
        setPendingSuggestions([]);
      }

      // Fetch analytics
      const analyticsResponse = await getWtfAnalytics();
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data || {});
      }

      // Calculate dashboard metrics after all data is fetched
      const calculateDashboardMetrics = (pins, suggestions, submissions) => {
        return {
          activePins: Array.isArray(pins)
            ? pins.filter((p) => p.status === "active").length
            : 0,
          coachSuggestions: Array.isArray(suggestions) ? suggestions.length : 0,
          studentSubmissions: Array.isArray(submissions)
            ? submissions.filter((s) => s.status === "pending").length
            : 0,
          totalEngagement: Array.isArray(pins)
            ? pins.reduce(
                (acc, pin) => acc + (pin.engagementMetrics?.seen || 0),
                0
              )
            : 0,
        };
      };

      // Try to fetch unified dashboard counts from the new API
      try {
        const dashboardCountsResponse = await getWtfDashboardCounts();

        if (dashboardCountsResponse.success) {
          const counts = dashboardCountsResponse.data;
          setDashboardMetrics({
            activePins: counts.activePins || 0,
            coachSuggestions: counts.coachSuggestions || 0,
            studentSubmissions: counts.studentSubmissions || 0,
            totalEngagement: counts.totalEngagement || 0,
          });
        } else {
          throw new Error("Dashboard counts API returned success: false");
        }
      } catch (metricsError) {
        console.error("Error fetching dashboard counts:", metricsError);
        console.log("Using fallback calculations...");
        // Fallback to local calculations using the fetched data
        setDashboardMetrics(
          calculateDashboardMetrics(
            fetchedPins,
            fetchedSuggestions,
            fetchedSubmissions
          )
        );
      }
    } catch (error) {
      console.error("Error fetching WTF data:", error);
      setError("Failed to load WTF data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "audio":
        return <Volume2 className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      case "link":
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleUnpin = async (pinId) => {
    if (window.confirm("Are you sure you want to unpin this content?")) {
      try {
        const response = await changeWtfPinStatus(pinId, "unpinned");
        if (response.success) {
          setActivePins((prev) =>
            prev.map((pin) =>
              pin._id === pinId ? { ...pin, status: "unpinned" } : pin
            )
          );

          // Refresh dashboard counts so the Active Pins card updates immediately
          try {
            const countsResp = await getWtfDashboardCounts();
            if (countsResp.success) {
              setDashboardMetrics(countsResp.data);
            } else {
              // Fallback optimistic update
              setDashboardMetrics((prev) => ({
                ...prev,
                activePins: Math.max(0, (prev.activePins || 1) - 1),
              }));
            }
          } catch (e) {
            setDashboardMetrics((prev) => ({
              ...prev,
              activePins: Math.max(0, (prev.activePins || 1) - 1),
            }));
          }
        }
      } catch (error) {
        console.error("Error unpinning pin:", error);
        setError("Failed to unpin content. Please try again.");
      }
    }
  };

  const handleDelete = async (pinId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this pin? This action cannot be undone."
      )
    ) {
      try {
        const response = await deleteWtfPin(pinId);
        if (response.success) {
          setActivePins((prev) => prev.filter((pin) => pin._id !== pinId));
          // Refresh dashboard counts so the Active Pins card updates immediately
          try {
            const countsResp = await getWtfDashboardCounts();
            if (countsResp.success) {
              setDashboardMetrics(countsResp.data);
            } else {
              // Fallback optimistic update
              setDashboardMetrics((prev) => ({
                ...prev,
                activePins: Math.max(0, (prev.activePins || 1) - 1),
              }));
            }
          } catch (e) {
            setDashboardMetrics((prev) => ({
              ...prev,
              activePins: Math.max(0, (prev.activePins || 1) - 1),
            }));
          }
        }
      } catch (error) {
        console.error("Error deleting pin:", error);
        setError("Failed to delete pin. Please try again.");
      }
    }
  };

  const handleEdit = (pin) => {
    setSelectedPin(pin);
    setShowEditModal(true);
  };

  const handleCreatePin = async (newPin) => {
    const response = await createWtfPin(newPin);
    if (!response.success) {
      throw new Error(response.message || "Failed to create pin");
    }
    setActivePins((prev) => [response.data, ...prev]);
    setShowCreateModal(false);

    // Refresh dashboard counts so the Active Pins card updates immediately
    try {
      const countsResp = await getWtfDashboardCounts();
      if (countsResp.success) {
        setDashboardMetrics(countsResp.data);
      } else {
        setDashboardMetrics((prev) => ({
          ...prev,
          activePins: (prev.activePins || 0) + 1,
        }));
      }
    } catch (e) {
      setDashboardMetrics((prev) => ({
        ...prev,
        activePins: (prev.activePins || 0) + 1,
      }));
    }
  };

  const handleUpdatePin = async (updatedPin) => {
    try {
      const response = await updateWtfPin(updatedPin._id, updatedPin);
      if (response.success) {
        setActivePins((prev) =>
          prev.map((p) => (p._id === updatedPin._id ? response.data : p))
        );
        setShowEditModal(false);
        setSelectedPin(null);
      }
    } catch (error) {
      console.error("Error updating pin:", error);
      setError("Failed to update pin. Please try again.");
    }
  };

  const handleReviewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
  };

  const handlePinToWTF = async (submission) => {
    try {
      // First approve the submission
      const reviewResponse = await reviewSubmission(submission._id, {
        action: "approve",
        notes: "Approved and pinned to WTF",
      });

      if (reviewResponse.success) {
        // Create a new pin from the approved submission
        const pinType = submission.type === "voice" ? "audio" : "text";
        const newPin = {
          title: submission.title,
          content: submission.content,
          type: pinType, // Backend expects 'type' not 'contentType'
          author: user?.name || "Unknown User", // Backend expects 'author'
          isOfficial: false,
          status: "active", // Backend expects lowercase enum values
          language: "english", // Default language
          tags: [], // Default empty tags
          // For audio submissions, include the file/audioUrl if available
          ...(pinType === "audio" &&
            submission.audioUrl && {
              content: submission.audioUrl, // Let backend handle proper S3 upload
            }),
        };

        const pinResponse = await createWtfPin(newPin);
        if (pinResponse.success) {
          setActivePins((prev) => [pinResponse.data, ...prev]);
          setStudentSubmissions((prev) =>
            prev.filter((s) => s._id !== submission._id)
          );
          setShowReviewModal(false);
          setSelectedSubmission(null);
        }
      }
    } catch (error) {
      console.error("Error pinning submission to WTF:", error);
      setError("Failed to pin submission to WTF. Please try again.");
    }
  };

  const handleArchiveSubmission = async (submissionId) => {
    try {
      const response = await reviewSubmission(submissionId, {
        action: "reject",
        notes: "Archived by admin",
      });

      if (response.success) {
        setStudentSubmissions((prev) =>
          prev.filter((s) => s._id !== submissionId)
        );
        setShowReviewModal(false);
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error archiving submission:", error);
      setError("Failed to archive submission. Please try again.");
    }
  };

  // Coach Suggestions Data
  const [coachSuggestions, setCoachSuggestions] = useState([]);
  const archivedCoachSuggestions = coachSuggestions.filter(
    (s) => s.status && s.status !== "PENDING"
  );

  const handleReviewCoachSuggestion = (suggestion) => {
    setSelectedCoachSuggestion(suggestion);
    setShowCoachSuggestionModal(true);
  };

  const handlePinCoachSuggestion = async (suggestion) => {
    try {
      // Approve (pin) via backend; this also creates the WTF pin server-side
      const response = await reviewSubmission(suggestion.id, {
        action: "approve",
        notes: "Approved and pinned to WTF",
      });

      if (response && response.success) {
        // Remove the suggestion from the pending list
        setCoachSuggestions((prev) =>
          prev.filter((s) => s.id !== suggestion.id)
        );

        // If backend returned the created pin, prepend it; else refetch active pins
        const approvedPin = response.data?.approvedPin;
        if (approvedPin) {
          setActivePins((prev) => [approvedPin, ...prev]);
        } else {
          try {
            const pinsResp = await getActiveWtfPins();
            if (pinsResp.success && pinsResp.data?.pins) {
              setActivePins(pinsResp.data.pins);
            }
          } catch (e) {
            console.error("Failed to refresh active pins:", e);
          }
        }

        // Refresh dashboard counts using the unified counts API
        try {
          const countsResp = await getWtfDashboardCounts();
          if (countsResp.success) setDashboardMetrics(countsResp.data);
        } catch (e) {
          // Fallback update if counts API fails
          setDashboardMetrics((prev) => ({
            ...prev,
            activePins: (prev.activePins || 0) + 1,
            coachSuggestions: Math.max(0, (prev.coachSuggestions || 1) - 1),
          }));
        }
      }
    } catch (error) {
      console.error("Error pinning coach suggestion:", error);
    } finally {
      setShowCoachSuggestionModal(false);
      setSelectedCoachSuggestion(null);
    }
  };

  const handleArchiveCoachSuggestion = async (suggestionId) => {
    try {
      // Use the existing review API to reject (archive) the suggestion
      const response = await reviewSubmission(suggestionId, {
        action: "reject",
        notes: "Archived by admin",
      });

      if (response && response.success) {
        // Remove from pending queue
        setCoachSuggestions((prev) =>
          prev.filter((s) => s.id !== suggestionId)
        );
        // Update badge metric locally
        setDashboardMetrics((prev) => ({
          ...prev,
          coachSuggestions: Math.max(0, (prev.coachSuggestions || 1) - 1),
        }));
      }
    } catch (error) {
      console.error("Error archiving coach suggestion:", error);
    } finally {
      setShowCoachSuggestionModal(false);
      setSelectedCoachSuggestion(null);
    }
  };

  const filteredPins = Array.isArray(activePins)
    ? activePins.filter((pin) => {
        const matchesSearch =
          pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pin.caption?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "all" || pin.type === filterType;
        return matchesSearch && matchesFilter && pin.status === "active";
      })
    : [];

  // Pagination logic
  const paginatedPins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPins.slice(startIndex, endIndex);
  }, [filteredPins, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPins.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Update total items when filtered pins change
  useEffect(() => {
    setTotalItems(filteredPins.length);
  }, [filteredPins]);

  // Coach suggestions pagination logic
  const paginatedCoachSuggestions = useMemo(() => {
    if (!Array.isArray(coachSuggestions)) return [];
    const pendingSuggestions = coachSuggestions.filter(
      (s) => s.status === "PENDING"
    );
    const startIndex = (coachSuggestionsPage - 1) * coachSuggestionsPerPage;
    const endIndex = startIndex + coachSuggestionsPerPage;
    return pendingSuggestions.slice(startIndex, endIndex);
  }, [coachSuggestions, coachSuggestionsPage, coachSuggestionsPerPage]);

  const totalCoachSuggestionsPages = Math.ceil(
    (Array.isArray(coachSuggestions)
      ? coachSuggestions.filter((s) => s.status === "PENDING").length
      : 0) / coachSuggestionsPerPage
  );

  // Student submissions pagination logic
  const paginatedStudentSubmissions = useMemo(() => {
    if (!Array.isArray(studentSubmissions)) return [];
    const startIndex = (submissionsPage - 1) * submissionsPerPage;
    const endIndex = startIndex + submissionsPerPage;
    return studentSubmissions.slice(startIndex, endIndex);
  }, [studentSubmissions, submissionsPage, submissionsPerPage]);

  const totalSubmissionsPages = Math.ceil(
    (Array.isArray(studentSubmissions) ? studentSubmissions.length : 0) /
      submissionsPerPage
  );

  const newSubmissionsCount = Array.isArray(studentSubmissions)
    ? studentSubmissions.filter((s) => s.status === "pending").length
    : 0;
  const pendingCoachSuggestionsCount = Array.isArray(coachSuggestions)
    ? coachSuggestions.filter((s) => s.status === "PENDING").length
    : 0; // Real data from API

  return (
    <div
      className="min-h-screen p-6 w-full pb-8 transition-all duration-300"
      style={getBackgroundStyle()}
    >
      <div className="max-w-screen-xl mx-auto pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              WTF Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Curate and manage Wall of Fame content
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onToggleView && (
              <Button
                onClick={onToggleView}
                variant="outline"
                className="text-gray-600 hover:text-gray-900"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Wall of Fame
              </Button>
            )}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Pin
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Pins</p>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardMetrics.activePins}
                </div>
                <p className="text-xs text-gray-500 mt-1">of 20 maximum</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Coach Suggestions
                </p>
                <div className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                  {dashboardMetrics.coachSuggestions}
                  {dashboardMetrics.coachSuggestions > 0 && (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">from coaches</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Student Submissions
                </p>
                <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                  {dashboardMetrics.studentSubmissions}
                  {dashboardMetrics.studentSubmissions > 0 && (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">awaiting review</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Engagement
                </p>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardMetrics.totalEngagement}
                </div>
                <p className="text-xs text-gray-500 mt-1">total views</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <ThumbsUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border">
          <div className="border-b">
            <div className="flex space-x-8 p-6">
              {[
                { id: "dashboard", label: "Pin Management", count: null },
                {
                  id: "coach-suggestions",
                  label: "Coach Suggestions",
                  count:
                    pendingCoachSuggestionsCount > 0
                      ? pendingCoachSuggestionsCount
                      : null,
                },
                {
                  id: "submissions",
                  label: "Student Submissions",
                  count: newSubmissionsCount > 0 ? newSubmissionsCount : null,
                },
                {
                  id: "background-settings",
                  label: "Background Settings",
                  count: null,
                },
                { id: "analytics", label: "Analytics", count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count && tab.count > 0 && (
                    <Badge
                      className={`text-xs ${
                        tab.id === "coach-suggestions"
                          ? "bg-orange-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "dashboard" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Active WTF Pins</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search pins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-14 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        style={{
                          width: "300px",
                          minWidth: "300px",
                          textIndent: "28px",
                        }}
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-32"
                    >
                      <option value="all">All Types</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Content
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Author
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Pinned Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Expires
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Engagement
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPins.map((pin) => (
                        <tr
                          key={pin._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {pin.thumbnail && (
                                <img
                                  src={pin.thumbnail}
                                  alt=""
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {pin.title}
                                </div>
                                {pin.caption && (
                                  <div className="text-sm text-gray-500">
                                    {pin.caption}
                                  </div>
                                )}
                                {pin.isOfficial && (
                                  <Badge className="mt-1 bg-purple-100 text-purple-800">
                                    ISF Official
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getContentTypeIcon(pin.type)}
                              <span className="capitalize text-gray-700">
                                {pin.type}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {pin.author?.name || "Admin"}
                              </div>
                              <div className="text-sm text-gray-500">
                                by {pin.author?.name || "Admin"}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            {new Date(pin.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-orange-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">
                                {new Date(pin.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">
                                  {pin.engagementMetrics?.seen || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-gray-700">
                                  {pin.engagementMetrics?.shares || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-700">
                                  {pin.engagementMetrics?.likes || 0}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(pin)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnpin(pin._id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(pin._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {filteredPins.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                          {totalItems} results
                        </div>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1"
                        >
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="px-3 py-1 min-w-[40px]"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* No Data State */}
                  {filteredPins.length === 0 && (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                        <div className="text-6xl mb-4">📌</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No Active Pins Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          The Wall of Fame is waiting for amazing content!
                          Create the first pin to get started, or review pending
                          submissions to add them to the Wall of Fame.
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Pin
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("coach-suggestions")}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review Submissions
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500 mt-4">
                          💡 Tip: You can also review student submissions and
                          coach suggestions to add content to the Wall of Fame
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "coach-suggestions" && (
              <div className="space-y-6">
                {/* Coach Suggestions Queue */}
                <div className="bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">
                      Coach Suggestions for WTF (
                      {
                        coachSuggestions.filter((s) => s.status === "PENDING")
                          .length
                      }{" "}
                      Pending)
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Review student work suggested by coaches for the Wall of
                    Fame
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Student Work
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Work Type
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Student & Balagruha
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Suggested By
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCoachSuggestions.map((suggestion) => (
                          <tr
                            key={suggestion.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-start gap-3">
                                {suggestion.thumbnail && (
                                  <img
                                    src={suggestion.thumbnail}
                                    alt=""
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">
                                    {suggestion.title}
                                  </div>
                                  <div className="text-sm text-gray-500 line-clamp-2">
                                    {suggestion.content.length > 100
                                      ? `${suggestion.content.substring(
                                          0,
                                          100
                                        )}...`
                                      : suggestion.content}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                                <FileText className="w-3 h-3" />
                                {suggestion.workType}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="font-medium flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {suggestion.studentName}
                                </div>
                                <div className="text-gray-500">
                                  {suggestion.balagruha}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {suggestion.coachName}
                                </div>
                                <div className="text-gray-500">Coach</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  suggestion.suggestedDate
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() =>
                                    handleReviewCoachSuggestion(suggestion)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review & Pin
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleArchiveCoachSuggestion(suggestion.id)
                                  }
                                >
                                  <Archive className="w-4 h-4 mr-1" />
                                  Archive
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Coach Suggestions Pagination Controls */}
                    {Array.isArray(coachSuggestions) &&
                      coachSuggestions.filter((s) => s.status === "PENDING")
                        .length > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-700">
                              Showing{" "}
                              {(coachSuggestionsPage - 1) *
                                coachSuggestionsPerPage +
                                1}{" "}
                              to{" "}
                              {Math.min(
                                coachSuggestionsPage * coachSuggestionsPerPage,
                                coachSuggestions.filter(
                                  (s) => s.status === "PENDING"
                                ).length
                              )}{" "}
                              of{" "}
                              {
                                coachSuggestions.filter(
                                  (s) => s.status === "PENDING"
                                ).length
                              }{" "}
                              results
                            </div>
                            <select
                              value={coachSuggestionsPerPage}
                              onChange={(e) => {
                                setCoachSuggestionsPerPage(
                                  Number(e.target.value)
                                );
                                setCoachSuggestionsPage(1);
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value={5}>5 per page</option>
                              <option value={10}>10 per page</option>
                              <option value={20}>20 per page</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCoachSuggestionsPage(
                                  coachSuggestionsPage - 1
                                )
                              }
                              disabled={coachSuggestionsPage === 1}
                              className="px-3 py-1"
                            >
                              Previous
                            </Button>

                            <div className="flex items-center gap-1">
                              {totalCoachSuggestionsPages > 0 &&
                                Array.from(
                                  { length: totalCoachSuggestionsPages },
                                  (_, i) => i + 1
                                ).map((page) => (
                                  <Button
                                    key={page}
                                    variant={
                                      coachSuggestionsPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      setCoachSuggestionsPage(page)
                                    }
                                    className="px-3 py-1 min-w-[40px]"
                                  >
                                    {page}
                                  </Button>
                                ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCoachSuggestionsPage(
                                  coachSuggestionsPage + 1
                                )
                              }
                              disabled={
                                coachSuggestionsPage ===
                                totalCoachSuggestionsPages
                              }
                              className="px-3 py-1"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}

                    {/* No Coach Suggestions State */}
                    {coachSuggestions.filter((s) => s.status === "PENDING")
                      .length === 0 && (
                      <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                          <div className="text-6xl mb-4">🎯</div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Coach Suggestions Yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Coaches haven't suggested any student work for the
                            Wall of Fame yet. When they do, you'll see them here
                            for review.
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => setShowCreateModal(true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Pin Manually
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab("submissions")}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Check Student Submissions
                            </Button>
                          </div>
                          <div className="text-sm text-gray-500 mt-4">
                            💡 Tip: Coaches can suggest exceptional student work
                            to be featured on the Wall of Fame
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                {archivedCoachSuggestions.length > 0 && (
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold">
                        Recent Coach Suggestion Activity
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {archivedCoachSuggestions
                        .slice(0, 5)
                        .map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  suggestion.status === "PINNED"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                              <div>
                                <span className="font-medium">
                                  {suggestion.title}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                  by {suggestion.studentName} • suggested by{" "}
                                  {suggestion.coachName}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={
                                suggestion.status === "PINNED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {suggestion.status === "PINNED"
                                ? "Pinned"
                                : "Archived"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">
                      How Coach Suggestions Work
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      • Coaches can suggest student work by clicking the
                      "Suggest for WTF" button while reviewing assignments
                    </div>
                    <div>
                      • Suggested content appears here for admin review and
                      approval
                    </div>
                    <div>
                      • Clicking "Review & Pin" will feature the content on the
                      Wall of Fame
                    </div>
                    <div>
                      • Both the student and suggesting coach receive
                      notifications when content is pinned
                    </div>
                    <div>
                      • Students earn ISF coins when their work is featured
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-6">
                {/* Student Submissions Queue */}
                <div className="bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">
                      Student Submissions Queue
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Review student-submitted voice notes and articles for
                    potential WTF featuring
                  </p>

                  {/* Sub-tabs */}
                  <div className="flex space-x-1 mb-6">
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        submissionTab === "voice"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setSubmissionTab("voice")}
                    >
                      ▷ Voice Notes
                      {(() => {
                        const voiceCount = Array.isArray(studentSubmissions)
                          ? studentSubmissions.filter(
                              (s) => s.status === "pending" && s.type === "voice"
                            ).length
                          : 0;
                        return voiceCount > 0 ? (
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            {voiceCount}
                          </Badge>
                        ) : null;
                      })()}
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        submissionTab === "article"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setSubmissionTab("article")}
                    >
                      Articles
                      {(() => {
                        const articleCount = Array.isArray(studentSubmissions)
                          ? studentSubmissions.filter(
                              (s) => s.status === "pending" && s.type === "article"
                            ).length
                          : 0;
                        return articleCount > 0 ? (
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            {articleCount}
                          </Badge>
                        ) : null;
                      })()}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {submissionTab === "voice" ? (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Voice Note
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Balagruha
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Submitted
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(studentSubmissions)
                           ? studentSubmissions.filter(
                               (s) => s.status === "pending" && s.type === "voice"
                              )
                            : []
                          ).map((submission) => (
                            <tr
                              key={submission.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-medium">
                                    {submission.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {submission.studentName}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm">
                                  {submission.balagruha}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    submission.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-green-100 text-green-800">
                                  {submission.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() =>
                                      handleReviewSubmission(submission)
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleArchiveSubmission(submission.id)
                                    }
                                  >
                                    <Archive className="w-4 h-4 mr-1" />
                                    Archive
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Article
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Balagruha
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Submitted
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(studentSubmissions)
                           ? studentSubmissions.filter(
                                (s) =>
                                  s.status === "pending" && s.type === "article"
                              )
                            : []
                          ).map((submission) => (
                            <tr
                              key={submission.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-medium">
                                    {submission.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {submission.studentName}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm">
                                  {submission.balagruha}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    submission.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-green-100 text-green-800">
                                  {submission.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() =>
                                      handleReviewSubmission(submission)
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleArchiveSubmission(submission.id)
                                    }
                                  >
                                    <Archive className="w-4 h-4 mr-1" />
                                    Archive
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Student Submissions Pagination Controls */}
                    {Array.isArray(studentSubmissions) &&
                      studentSubmissions.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-700">
                              Showing{" "}
                              {(submissionsPage - 1) * submissionsPerPage + 1}{" "}
                              to{" "}
                              {Math.min(
                                submissionsPage * submissionsPerPage,
                                studentSubmissions.length
                              )}{" "}
                              of {studentSubmissions.length} results
                            </div>
                            <select
                              value={submissionsPerPage}
                              onChange={(e) => {
                                setSubmissionsPerPage(Number(e.target.value));
                                setSubmissionsPage(1);
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value={5}>5 per page</option>
                              <option value={10}>10 per page</option>
                              <option value={20}>20 per page</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSubmissionsPage(submissionsPage - 1)
                              }
                              disabled={submissionsPage === 1}
                              className="px-3 py-1"
                            >
                              Previous
                            </Button>

                            <div className="flex items-center gap-1">
                              {totalSubmissionsPages > 0 &&
                                Array.from(
                                  { length: totalSubmissionsPages },
                                  (_, i) => i + 1
                                ).map((page) => (
                                  <Button
                                    key={page}
                                    variant={
                                      submissionsPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setSubmissionsPage(page)}
                                    className="px-3 py-1 min-w-[40px]"
                                  >
                                    {page}
                                  </Button>
                                ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSubmissionsPage(submissionsPage + 1)
                              }
                              disabled={
                                submissionsPage === totalSubmissionsPages
                              }
                              className="px-3 py-1"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}

                    {/* No Student Submissions State */}
                    {(Array.isArray(studentSubmissions)
                      ? studentSubmissions.filter((s) => s.status === "pending")
                          .length
                      : 0) === 0 && (
                      <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                          <div className="text-6xl mb-4">📝</div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Student Submissions Yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Students haven't submitted any voice notes or
                            articles for review yet. When they do, you'll see
                            them here to potentially feature on the Wall of
                            Fame.
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => setShowCreateModal(true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Pin Manually
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab("coach-suggestions")}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Check Coach Suggestions
                            </Button>
                          </div>
                          <div className="text-sm text-gray-500 mt-4">
                            💡 Tip: Students can submit voice notes and articles
                            through their learning interfaces
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Process */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Student Submission Review Process
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>
                      • Students can submit voice notes and articles through
                      their learning interfaces
                    </div>
                    <div>
                      • All submissions appear here for admin review and
                      approval
                    </div>
                    <div>
                      • Use the embedded players/readers to experience the
                      content as students intended
                    </div>
                    <div>
                      • Pin exceptional content to the WTF or archive
                      submissions that don't meet criteria
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "background-settings" && (
              <div className="p-6">
                <BackgroundSettings
                  onSettingsChange={(newSettings) => {
                    // Refresh background settings when they change
                    refreshBackgroundSettings();
                  }}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">
                    WTF Analytics & Insights
                  </h3>
                </div>
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Analytics dashboard coming soon...
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Track engagement, popular content types, and user
                    interactions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create New Pin Modal */}
      <CreateNewPinModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePin={handleCreatePin}
      />

      {/* Edit Pin Modal */}
      <PinEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPin(null);
        }}
        pin={selectedPin}
        onUpdatePin={handleUpdatePin}
      />

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onPinToWTF={handlePinToWTF}
        onArchive={handleArchiveSubmission}
      />

      {/* Coach Suggestion Review Modal */}
      <CoachSuggestionReviewModal
        isOpen={showCoachSuggestionModal}
        onClose={() => {
          setShowCoachSuggestionModal(false);
          setSelectedCoachSuggestion(null);
        }}
        suggestion={selectedCoachSuggestion}
        onPinToWTF={handlePinCoachSuggestion}
        onArchive={handleArchiveCoachSuggestion}
      />
    </div>
  );
};

// Wrapper component with background provider
const WTFManagement = (props) => {
  return (
    <WtfBackgroundProvider>
      <WTFManagementContent {...props} />
    </WtfBackgroundProvider>
  );
};

export default WTFManagement;
