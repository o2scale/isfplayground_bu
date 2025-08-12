import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Heart,
  ThumbsUp,
  Play,
  Volume2,
  FileText,
  Camera,
  Settings,
  Plus,
  Palette,
  Upload,
  Check,
  Loader,
} from "lucide-react";
import { useUserRole } from "../../hooks/useUserRole";
import { useSidebar } from "../Layout";
import {
  useWtfBackground,
  WtfBackgroundProvider,
} from "../../contexts/WtfBackgroundContext";

import CategoryButtons from "./CategoryButtons";
import LevelIndicators from "./LevelIndicators";
import CoursesSection from "./CoursesSection";
import CreateNewPinModal from "./CreateNewPinModal";
import ImageViewer from "./modals/ImageViewer";
import VideoPlayer from "./modals/VideoPlayer";
import AudioPlayer from "./modals/AudioPlayer";
import TextReader from "./modals/TextReader";
import {
  getActiveWtfPins,
  likeWtfPin,
  markWtfPinAsSeen,
  createWtfPin,
  createCoachSuggestion,
  getWtfSubmissionStats,
  getPendingSubmissionsCount,
  getCoachSuggestionsCount,
  submitVoiceNote,
  submitArticle,
  updateWtfSettings,
  uploadWtfBackgroundImage,
} from "../../api";

const WallOfFameContent = ({ onToggleView }) => {
  const { isSidebarCollapsed } = useSidebar();
  const { backgroundSettings: contextBgSettings, updateBackgroundSettings } =
    useWtfBackground();
  const [selectedContent, setSelectedContent] = useState(null);
  const [content, setContent] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [modalType, setModalType] = useState(null);
  const [adminCounts, setAdminCounts] = useState({
    pendingSuggestions: 0,
    newSubmissions: 0,
    reviewQueue: 0,
  });

  // Background customization state
  const [backgroundSettings] = useState({
    color: "from-green-400 via-green-500 to-green-600",
    image: null,
    opacity: 100,
  });

  // Monthly theme state
  const [monthlyTheme] = useState({
    id: "classroom",
    name: "Classic Classroom",
    emoji: "🎓",
    title: "January Learning Goals",
    subtitle: "New Year, New Knowledge!",
  });

  const { isAdmin, isCoach, isStudent } = useUserRole();

  // Remove this when role detection is working properly
  const forceShowAdminControls = false; // Set to false to use real role detection

  // Use context background settings for compact card (not used directly but kept for future)

  // Preview settings (applied immediately) vs saved settings (saved to backend)
  const [previewBgSettings, setPreviewBgSettings] = useState({
    backgroundType: "color",
    backgroundColor: "#f8fafc",
    backgroundImage: null,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bgSuccess, setBgSuccess] = useState("");
  const [bgError, setBgError] = useState("");

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: null, y: null });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

  // Sync preview settings with context settings
  useEffect(() => {
    if (contextBgSettings && !contextBgSettings.isLoading) {
      setPreviewBgSettings({
        backgroundType: contextBgSettings.backgroundType || "color",
        backgroundColor: contextBgSettings.backgroundColor || "#f8fafc",
        backgroundImage: contextBgSettings.backgroundImage || null,
      });
    }
  }, [contextBgSettings]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await getActiveWtfPins();
        if (response.success && response.data && response.data.pins) {
          setContent(response.data.pins);
        } else {
          setContent([]);
        }
      } catch (error) {
        console.error("Error fetching pins:", error);
        setContent([]);
      }
    };

    const fetchAdminCounts = async () => {
      if (isAdmin) {
        try {
          const [coachCountResp, studentPendingResp] = await Promise.all([
            getCoachSuggestionsCount(),
            getPendingSubmissionsCount(),
          ]);

          const coachPending = coachCountResp?.data?.pendingCount || 0;
          const studentPending = studentPendingResp || 0;

          setAdminCounts({
            // As per requirement: show combined totals everywhere
            pendingSuggestions: coachPending + studentPending,
            newSubmissions: coachPending + studentPending,
            reviewQueue: coachPending + studentPending,
          });
        } catch (error) {
          console.error("Error fetching admin counts:", error);
        }
      }
    };

    fetchPins();
    fetchAdminCounts();

    const interval = setInterval(() => {
      fetchPins();
      fetchAdminCounts();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [isAdmin]);

  const handlePinClick = (item) => {
    setSelectedContent(item);
    // Map backend types to frontend modal types
    const modalTypeMap = {
      image: "photo",
      video: "video",
      audio: "audio",
      text: "text",
      link: "text", // Links can be displayed in text modal
    };
    setModalType(modalTypeMap[item.type] || "text");
  };

  const closeModal = () => {
    setSelectedContent(null);
    setModalType(null);
  };

  // Background settings functions
  const predefinedColors = [
    "#f8fafc",
    "#f1f5f9",
    "#e0f2fe",
    "#dcfce7",
    "#fef3c7",
    "#fed7d7",
    "#e0e7ff",
    "#f3e8ff",
    "#ffedd5",
    "#fce7f3",
    "#ffffff",
    "#1e293b",
  ];

  const handleColorChange = (color) => {
    // Only apply preview, don't save to backend yet
    const settings = {
      backgroundType: "color",
      backgroundColor: color,
      backgroundImage: null,
    };
    setPreviewBgSettings(settings);
    setHasUnsavedChanges(true);
    setBgError(""); // Clear any previous errors
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setBgError("");
      console.log("Saving background settings:", previewBgSettings);

      const response = await updateWtfSettings(previewBgSettings);
      console.log("Save response:", response);

      // Update the context with saved settings
      updateBackgroundSettings(previewBgSettings);
      setHasUnsavedChanges(false);
      setBgSuccess("Background saved successfully!");
      setTimeout(() => setBgSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving background:", error);
      console.error("Error details:", error.response?.data || error.message);
      setBgError(
        `Failed to save background: ${
          error.response?.data?.message || error.message
        }`
      );
      setTimeout(() => setBgError(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Dragging functions
  const handleMouseDown = (e) => {
    setIsDragging(true);

    // If this is the first drag, use the current computed position
    const currentX =
      dragPosition.x !== null ? dragPosition.x : window.innerWidth - 320 - 24;
    const currentY = dragPosition.y !== null ? dragPosition.y : 385;

    setInitialPosition({
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        setDragPosition({
          x: e.clientX - initialPosition.x,
          y: e.clientY - initialPosition.y,
        });
      }
    },
    [isDragging, initialPosition.x, initialPosition.y]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Custom background style that uses preview settings
  const getPreviewBackgroundStyle = () => {
    if (
      previewBgSettings.backgroundType === "image" &&
      previewBgSettings.backgroundImage
    ) {
      return {
        backgroundImage: `url(${previewBgSettings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      };
    } else {
      return {
        backgroundColor: previewBgSettings.backgroundColor,
      };
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("Selected file:", file.name, file.size, file.type);

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setBgError(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
      );
      setTimeout(() => setBgError(""), 3000);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setBgError("File size too large. Maximum size is 5MB");
      setTimeout(() => setBgError(""), 3000);
      return;
    }

    try {
      setIsUploadingBg(true);
      setBgError("");

      console.log("Starting image upload...");
      const uploadResponse = await uploadWtfBackgroundImage(file);
      console.log("Upload response:", uploadResponse);

      const imageUrl = uploadResponse.data?.imageUrl || uploadResponse.imageUrl;
      console.log("Image URL:", imageUrl);

      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      const settings = {
        backgroundType: "image",
        backgroundColor: "#f8fafc",
        backgroundImage: imageUrl,
      };

      // Only set as preview, don't save yet
      setPreviewBgSettings(settings);
      setHasUnsavedChanges(true);
      setBgSuccess("Image uploaded! Click Save to apply.");
      setTimeout(() => setBgSuccess(""), 3000);
    } catch (error) {
      console.error("Image upload error:", error);
      console.error("Error details:", error.response?.data || error.message);
      setBgError(
        `Failed to upload image: ${
          error.response?.data?.message || error.message
        }`
      );
      setTimeout(() => setBgError(""), 5000);
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleCreatePin = async (newPin) => {
    console.log("Creating new pin:", newPin);

    if (isCoach && newPin.studentId) {
      // This is a coach suggestion
      const suggestionData = {
        title: newPin.title,
        content: newPin.content,
        type: newPin.contentType,
        studentName: newPin.studentName,
        studentId: newPin.studentId,
        balagruha: newPin.balagruha,
        reason: newPin.reason,
        file: newPin.file,
      };
      const response = await createCoachSuggestion(suggestionData);
      if (!response.success) {
        throw new Error(response.message || "Failed to submit suggestion");
      }
      alert("Suggestion submitted successfully! Admin will review it soon.");
      setShowCreateModal(false);
    } else if (isStudent) {
      // This is a student submission
      const submissionData = {
        title: newPin.title,
        content: newPin.content || newPin.title,
        type: newPin.contentType,
        file: newPin.file,
        language: "english",
        tags: newPin.tags || [],
      };

      // Call appropriate submission API based on content type
      let response;
      if (newPin.contentType === "audio") {
        response = await submitVoiceNote(submissionData);
      } else {
        response = await submitArticle(submissionData);
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to submit article");
      }

      alert(
        "Submission created successfully! It will be reviewed for the Wall of Fame."
      );
      setShowCreateModal(false);
    } else {
      // This is an admin pin creation
      const response = await createWtfPin(newPin);
      if (!response.success) {
        throw new Error(response.message || "Failed to create pin");
      }
      setContent((prev) => [response.data, ...prev]);
      setShowCreateModal(false);
    }
  };

  const handleLikePin = async (pinId) => {
    try {
      await likeWtfPin(pinId);
      setContent((prev) =>
        prev.map((pin) =>
          pin.id === pinId ? { ...pin, likes: pin.likes + 1 } : pin
        )
      );
    } catch (error) {
      console.error("Error liking pin:", error);
    }
  };

  const handleHeartPin = async (pinId) => {
    try {
      await likeWtfPin(pinId); // Assuming likeWtfPin handles hearts too
      setContent((prev) =>
        prev.map((pin) =>
          pin.id === pinId ? { ...pin, hearts: pin.hearts + 1 } : pin
        )
      );
    } catch (error) {
      console.error("Error hearting pin:", error);
    }
  };

  const handleMarkAsSeen = async (pinId) => {
    try {
      await markWtfPinAsSeen(pinId);
      setContent((prev) =>
        prev.map((pin) => (pin.id === pinId ? { ...pin, isSeen: true } : pin))
      );
    } catch (error) {
      console.error("Error marking pin as seen:", error);
    }
  };

  const renderTypeIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case "photo":
      case "image":
        return <Camera className={`${iconClass} text-blue-600`} />;
      case "video":
        return <Play className={`${iconClass} text-blue-600`} />;
      case "audio":
        return <Volume2 className={`${iconClass} text-blue-600`} />;
      case "text":
        return <FileText className={`${iconClass} text-blue-600`} />;
      default:
        return null;
    }
  };

  const getCardBackground = (type, thumbnail, mediaUrl) => {
    switch (type) {
      case "photo":
      case "image":
        // Use thumbnail first, then mediaUrl, or default to gray background
        const imageUrl = thumbnail || mediaUrl;
        console.log(
          "Card background - Type:",
          type,
          "Thumbnail:",
          thumbnail,
          "MediaUrl:",
          mediaUrl,
          "Using:",
          imageUrl
        );
        return imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#f3f4f6" };
      case "video":
        return { backgroundColor: "#dbeafe" };
      case "audio":
        return { backgroundColor: "#fce7f3" };
      case "text":
        return { backgroundColor: "#f0fdf4" };
      default:
        return { backgroundColor: "#f3f4f6" };
    }
  };

  const getPostageStampStyle = () => ({
    backgroundImage: `
      radial-gradient(circle at 0% 50%, transparent 3px, #fefce8 3px),
      radial-gradient(circle at 100% 50%, transparent 3px, #fefce8 3px),
      radial-gradient(circle at 50% 0%, transparent 3px, #fefce8 3px),
      radial-gradient(circle at 50% 100%, transparent 3px, #fefce8 3px)
    `,
    backgroundSize: "8px 100%, 8px 100%, 100% 8px, 100% 8px",
    backgroundPosition: "left center, right center, center top, center bottom",
    backgroundRepeat: "repeat-y, repeat-y, repeat-x, repeat-x",
    border: "2px solid #d1d5db",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  });

  const renderCard = (item) => (
    <div
      key={item.id}
      className="bg-yellow-50 p-4 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl relative"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePinClick(item);
      }}
      style={{
        transform: `rotate(${Math.random() * 6 - 3}deg)`,
        ...getPostageStampStyle(),
      }}
    >
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-red-600 shadow-lg z-10"></div>

      <div
        className="w-full h-32 mb-3 rounded border-2 border-gray-300 overflow-hidden flex items-center justify-center"
        style={getCardBackground(item.type, item.thumbnailUrl, item.mediaUrl)}
      >
        {(item.type === "photo" || item.type === "image") &&
        (item.thumbnailUrl || item.mediaUrl) ? null : (
          <div className="text-center">
            <div className="mb-2 flex justify-center opacity-60">
              {renderTypeIcon(item.type)}
            </div>
            <p className="text-xs text-gray-600 font-medium">{item.title}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 mb-2 text-xs">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-gray-600" />
          <span className="text-gray-700 font-medium">{item.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-red-500" />
          <span className="text-gray-700 font-medium">{item.hearts}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3 text-pink-500" />
          <span className="text-gray-700 font-medium">{item.likes}</span>
        </div>
      </div>

      {item.type === "photo" && (
        <h3 className="text-center text-sm font-bold text-gray-800 line-clamp-2 leading-tight">
          {item.title}
        </h3>
      )}
    </div>
  );

  // Dynamic background style based on settings
  const backgroundStyle = backgroundSettings.image
    ? {
        backgroundImage: `linear-gradient(to bottom right, rgba(34, 197, 94, ${
          backgroundSettings.opacity / 100
        }), rgba(34, 197, 94, ${backgroundSettings.opacity / 100})), url(${
          backgroundSettings.image
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `linear-gradient(to bottom right, ${backgroundSettings.color
          .replace("from-", "")
          .replace("via-", "")
          .replace("to-", "")
          .split(" ")
          .join(", ")})`,
      };

  return (
    <div
      className="min-h-screen flex w-full h-screen transition-all duration-300"
      style={getPreviewBackgroundStyle()}
    >
      {/* Left Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r flex-shrink-0 transition-all duration-300`}
      >
        <CoursesSection isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Main content area */}
      <div className="flex-1 relative">
        {/* Admin Controls - Only show for admins */}
        {(isAdmin || forceShowAdminControls) && (
          <div className="fixed top-24 right-6 z-40 bg-white rounded-lg shadow-xl border-2 border-purple-200 p-6 w-80">
            <div className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Controls
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-base px-4 py-3 rounded-md flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Create New Pin
              </button>

              {onToggleView && (
                <button
                  onClick={onToggleView}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white text-base px-4 py-3 rounded-md flex items-center gap-2 font-medium"
                >
                  <Settings className="w-5 h-5" />
                  Full Management
                </button>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Pending Suggestions:</span>
                    <span className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded font-medium">
                      {adminCounts.pendingSuggestions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Submissions:</span>
                    <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-medium">
                      {adminCounts.newSubmissions}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Review Queue ({adminCounts.reviewQueue})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Background Settings Card - Only show for admins */}
        {(isAdmin || forceShowAdminControls) && (
          <div
            className={`fixed z-40 bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4 w-80 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              top: dragPosition.y !== null ? dragPosition.y : 385, // default to top-96 equivalent (384px)
              left:
                dragPosition.x !== null
                  ? dragPosition.x
                  : window.innerWidth - 320 - 24, // default to right-6
              transition: isDragging ? "none" : "all 0.2s ease",
            }}
          >
            <div
              className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2 cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
            >
              <Palette className="w-4 h-4" />
              Quick Background Settings
              <div className="ml-auto text-xs text-gray-500">Drag me!</div>
            </div>

            {/* Success/Error Messages */}
            {bgSuccess && (
              <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-xs">
                {bgSuccess}
              </div>
            )}
            {bgError && (
              <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
                {bgError}
              </div>
            )}

            <div className="space-y-3">
              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Background Colors
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                        previewBgSettings.backgroundColor === color
                          ? "border-blue-500 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {previewBgSettings.backgroundColor === color && (
                        <Check className="w-3 h-3 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                <div className="border border-dashed border-gray-300 rounded p-3 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="bg-image-upload-compact"
                    disabled={isUploadingBg}
                  />
                  <label
                    htmlFor="bg-image-upload-compact"
                    className={`cursor-pointer flex flex-col items-center ${
                      isUploadingBg ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {isUploadingBg ? (
                      <Loader className="w-5 h-5 animate-spin text-blue-600 mb-1" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs text-gray-600">
                      {isUploadingBg ? "Uploading..." : "Upload Image"}
                    </span>
                  </label>
                </div>

                {/* Image Controls */}
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      const testImageUrl =
                        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop";
                      const settings = {
                        backgroundType: "image",
                        backgroundColor: "#f8fafc",
                        backgroundImage: testImageUrl,
                      };
                      setPreviewBgSettings(settings);
                      setHasUnsavedChanges(true);
                      setBgSuccess("Test image applied! Click Save to apply.");
                      setTimeout(() => setBgSuccess(""), 3000);
                    }}
                    className="w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                  >
                    Test with Sample Image
                  </button>

                  {/* Remove Image Button - only show if image is applied */}
                  {previewBgSettings.backgroundType === "image" &&
                    previewBgSettings.backgroundImage && (
                      <button
                        onClick={() => {
                          const settings = {
                            backgroundType: "color",
                            backgroundColor: "#f8fafc", // Default color
                            backgroundImage: null,
                          };
                          setPreviewBgSettings(settings);
                          setHasUnsavedChanges(true);
                          setBgSuccess("Background image removed!");
                          setTimeout(() => setBgSuccess(""), 2000);
                        }}
                        className="w-full text-xs py-1 px-2 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove Image
                      </button>
                    )}
                </div>
              </div>

              {/* Save Button and Status */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        Unsaved changes
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      hasUnsavedChanges && !isSaving
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      "Save Background"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col h-screen w-full">
          {/* Fixed Header */}
          <div className="p-6 space-y-6 bg-white flex-shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex-1 overflow-hidden">
                <CategoryButtons />
              </div>
            </div>
            <div className="overflow-hidden">
              <LevelIndicators />
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div
            className="flex-1 p-6 relative overflow-y-auto"
            style={backgroundStyle}
          >
            {/* Decorative icons scattered around */}
            <div className="absolute top-8 left-8 opacity-30">
              <div className="w-8 h-8 border-4 border-green-700 rounded-full"></div>
            </div>
            <div className="absolute top-12 right-12 opacity-30">
              <div className="w-6 h-6 border-3 border-green-700 rounded"></div>
            </div>
            <div className="absolute bottom-8 left-12 opacity-30">
              <Camera className="w-8 h-8 text-green-700" />
            </div>
            <div className="absolute bottom-12 right-8 opacity-30">
              <FileText className="w-6 h-6 text-green-700" />
            </div>

            <div className="text-center mb-8">
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-yellow-200 bg-opacity-70 rotate-3 rounded-sm shadow-md"></div>

              {/* Monthly Theme Display */}
              <div className="mb-4">
                <div className="text-6xl mb-2">{monthlyTheme.emoji}</div>
                <h3 className="text-green-100 text-lg font-medium">
                  {monthlyTheme.title}
                </h3>
                <p className="text-green-200 text-sm">
                  {monthlyTheme.subtitle}
                </p>
              </div>

              <h2 className="text-green-800 text-4xl font-bold mb-2 relative z-10">
                {isAdmin ? "Admin " : isCoach ? "Coach " : ""}Wall of{" "}
                <span
                  className="text-pink-600 bg-pink-200 px-2 py-1 rounded transform -rotate-1 inline-block border-4 border-purple-600 shadow-lg"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  FAME
                </span>
              </h2>
              <p className="text-green-100 text-lg">
                {isAdmin
                  ? "Manage and curate amazing content from our community"
                  : isCoach
                  ? "Discover and suggest amazing content from our community"
                  : "Discover amazing content from our community"}
              </p>
            </div>

            <div className="w-full mx-auto px-4 mb-8">
              {content.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center pb-8">
                    {content.map((item, index) => (
                      <div
                        key={item.id}
                        className="w-[180px]"
                        style={{
                          marginTop: `${(index % 4) * 10}px`,
                        }}
                      >
                        {renderCard(item)}
                      </div>
                    ))}
                  </div>

                  {/* Floating Action Button for Coaches */}
                  {isCoach && (
                    <div className="fixed bottom-8 right-8 z-50">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        title="Suggest student work for the Wall of Fame"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {/* Floating Action Button for Students */}
                  {isStudent && (
                    <div className="fixed bottom-8 right-8 z-50">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        title="Create your own pin for the Wall of Fame"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                    <div className="text-6xl mb-4">📌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Pins Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      The Wall of Fame is waiting for amazing content!
                      {isAdmin || forceShowAdminControls ? (
                        <span>
                          Create the first pin to get started, or review pending
                          submissions.
                        </span>
                      ) : isCoach ? (
                        <span>
                          Suggest student work to be featured on the Wall of
                          Fame.
                        </span>
                      ) : (
                        <span>
                          Submit your work to be featured on the Wall of Fame.
                        </span>
                      )}
                    </p>
                    {(isAdmin || forceShowAdminControls) && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Create First Pin
                      </button>
                    )}
                    {isCoach && (
                      <>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-3"
                        >
                          <Plus className="w-5 h-5 inline mr-2" />
                          Suggest Pin
                        </button>
                        <div className="text-sm text-gray-500">
                          💡 Tip: Review student work and suggest exceptional
                          pieces for the Wall of Fame
                        </div>
                      </>
                    )}
                    {isStudent && (
                      <>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-3"
                        >
                          <Plus className="w-5 h-5 inline mr-2" />
                          Create Pin
                        </button>
                        <div className="text-sm text-gray-500">
                          💡 Share your amazing work, voice notes, or articles!
                        </div>
                      </>
                    )}
                    {!isAdmin && !isCoach && !isStudent && (
                      <div className="text-sm text-gray-500">
                        💡 Tip: Submit your voice notes or articles to be
                        featured here
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sophisticated Modals */}
      {selectedContent && modalType === "photo" && (
        <ImageViewer
          isOpen={true}
          onClose={closeModal}
          imageSrc={selectedContent.mediaUrl || selectedContent.content}
          title={selectedContent.title}
          author={selectedContent.author}
          likes={selectedContent.engagementMetrics?.likes || 0}
          hearts={selectedContent.engagementMetrics?.shares || 0}
          views={selectedContent.engagementMetrics?.seen || 0}
        />
      )}

      {selectedContent && modalType === "video" && (
        <VideoPlayer
          isOpen={true}
          onClose={closeModal}
          videoSrc={selectedContent.mediaUrl || selectedContent.content}
          title={selectedContent.title}
          author={selectedContent.author}
          likes={selectedContent.engagementMetrics?.likes || 0}
          hearts={selectedContent.engagementMetrics?.shares || 0}
          views={selectedContent.engagementMetrics?.seen || 0}
        />
      )}

      {selectedContent && modalType === "audio" && (
        <AudioPlayer
          isOpen={true}
          onClose={closeModal}
          audioSrc={selectedContent.mediaUrl || selectedContent.content}
          title={selectedContent.title}
          author={selectedContent.author}
          likes={selectedContent.engagementMetrics?.likes || 0}
          hearts={selectedContent.engagementMetrics?.shares || 0}
          views={selectedContent.engagementMetrics?.seen || 0}
        />
      )}

      {selectedContent && modalType === "text" && (
        <TextReader
          isOpen={true}
          onClose={closeModal}
          title={selectedContent.title}
          content={selectedContent.content}
          author={selectedContent.author}
          likes={selectedContent.engagementMetrics?.likes || 0}
          hearts={selectedContent.engagementMetrics?.shares || 0}
          views={selectedContent.engagementMetrics?.seen || 0}
        />
      )}

      {/* Create New Pin Modal */}
      <CreateNewPinModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePin={handleCreatePin}
        isCoachMode={isCoach}
        isStudentMode={isStudent}
        userRole={isAdmin ? "admin" : isCoach ? "coach" : "student"}
      />
    </div>
  );
};

// Wrapper component with background provider
const WallOfFame = (props) => {
  return (
    <WtfBackgroundProvider>
      <WallOfFameContent {...props} />
    </WtfBackgroundProvider>
  );
};

export default WallOfFame;
