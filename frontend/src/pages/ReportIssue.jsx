import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Upload, MapPin, Sparkles, Check, AlertTriangle, ShieldAlert, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIAnalysisCard from "../components/AIAnalysisCard";

export default function ReportIssue() {
  const { reportIssue, checkForDuplicate, upvoteIssue, analyzeIssue } = useApp();
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Road Damage");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedSpot, setSelectedSpot] = useState("spot-new");
  const [customAddress, setCustomAddress] = useState("45, High Street, Residency Road");
  const [customLat, setCustomLat] = useState("12.9820");
  const [customLng, setCustomLng] = useState("77.6150");

  // AI & Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({
    category: "",
    severity: "",
    priorityScore: 0,
    confidence: 0,
    action: "",
    summary: "",
    error: false
  });

  // Duplicate Check State
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Predefined locations for testing duplicate detection
  const locationSpots = {
    "spot-bus": {
      name: "Central Bus Stand (Pothole area)",
      address: "Central Bus Stand Entrance, Main Arterial Rd",
      lat: "12.9718",
      lng: "77.5948"
    },
    "spot-sector7": {
      name: "Sector 7 Crossroad (Garbage area)",
      address: "Crossroad 4, Sector 7, Green Glen Layout",
      lat: "12.9786",
      lng: "77.5914"
    },
    "spot-springs": {
      name: "Silver Springs Lane (Streetlight area)",
      address: "Parkside Walkway, Block C, Silver Springs",
      lat: "12.9691",
      lng: "77.6014"
    },
    "spot-mgroad": {
      name: "MG Road Metro (High Voltage Wire area)",
      address: "Opposite Metro Station Pillar 12, MG Road",
      lat: "12.9733",
      lng: "77.5983"
    },
    "spot-new": {
      name: "New Unreported Location",
      address: "45, High Street, Residency Road",
      lat: "12.9820",
      lng: "77.6150"
    }
  };

  // Image Upload handler (Calls real Gemini AI API)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        triggerAIScan(file, description);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Gemini AI analysis via Express backend
  const triggerAIScan = async (currentImage = image, currentDescription = description) => {
    if (!currentImage) return;

    setIsScanning(true);
    setAiAnalysis((prev) => ({ ...prev, error: false }));

    try {
      const scanData = new FormData();
      scanData.append("image", currentImage);
      if (currentDescription) {
        scanData.append("description", currentDescription);
      }

      const response = await analyzeIssue(scanData);

      setAiAnalysis({
        category: response.category || "",
        severity: response.severity || "",
        priorityScore: response.priorityScore || 0,
        confidence: response.confidence || 0,
        action: response.recommendedAction || "",
        summary: response.summary || "",
        error: false
      });

      // Update dropdown selection dynamically with Gemini's category recommendation
      if (response.category) {
        setCategory(response.category);
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis({
        category: "",
        severity: "",
        priorityScore: 0,
        confidence: 0,
        action: "",
        summary: "",
        error: error.message || "AI analysis unavailable. Please try again."
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Check for duplicates whenever location or category changes
  useEffect(() => {
    const check = async () => {
      const activeSpot = locationSpots[selectedSpot];
      const lat = selectedSpot === "spot-new" ? customLat : activeSpot.lat;
      const lng = selectedSpot === "spot-new" ? customLng : activeSpot.lng;

      const dup = await checkForDuplicate(lat, lng, category);
      setDuplicateWarning(dup);
    };
    check();
  }, [selectedSpot, customLat, customLng, category]);

  // Detect user's current GPS location and geocode
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCustomLat(latitude.toString());
        setCustomLng(longitude.toString());
        setSelectedSpot("spot-new");

        // Set address field to loading state while geocoding
        setCustomAddress("Determining current address...");

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setCustomAddress(data.display_name);
            } else {
              setCustomAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
          } else {
            setCustomAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setCustomAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      },
      (error) => {
        console.error("Geolocation capture error:", error);
        showToast(`Failed to retrieve current location: ${error.message}`);
      }
    );
  };

  // Handle location spot selection
  const handleSpotChange = (e) => {
    const val = e.target.value;
    setSelectedSpot(val);
    if (val !== "spot-new") {
      const spot = locationSpots[val];
      setCustomAddress(spot.address);
      setCustomLat(spot.lat);
      setCustomLng(spot.lng);
    }
  };

  // Trigger AI Scan when description changes (debounce to prevent spamming)
  useEffect(() => {
    if (image && description.length > 5) {
      const timer = setTimeout(() => {
        triggerAIScan(image, description);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [description]);

  // Handle support upvoting for duplicates
  const handleSupportDuplicate = () => {
    if (duplicateWarning) {
      upvoteIssue(duplicateWarning.id);
      navigate(`/issue/${duplicateWarning.id}`);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      showToast("Please enter a description.");
      return;
    }
    if (!image) {
      showToast("Please select and upload an issue photo snapshot.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", title || `${category} Anomaly`);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("latitude", customLat);
      formData.append("longitude", customLng);
      formData.append("address", customAddress);
      formData.append("image", image);
      if (duplicateWarning) {
        formData.append("bypassDuplicateCheck", "true");
      }

      // If AI scan succeeded, supply pre-analyzed values to skip re-classification on backend
      if (!aiAnalysis.error && aiAnalysis.category) {
        formData.append("aiCategory", aiAnalysis.category);
        formData.append("aiSeverity", aiAnalysis.severity);
        formData.append("aiPriorityScore", aiAnalysis.priorityScore);
        formData.append("aiConfidence", aiAnalysis.confidence);
        formData.append("aiRecommendedAction", aiAnalysis.action);
        formData.append("aiSummary", aiAnalysis.summary);
      }

      await reportIssue(formData);
      setIsSubmitting(false);
      navigate("/feed");
    } catch (error) {
      setIsSubmitting(false);
      let friendlyMessage = error.message || "Failed to submit report. Please check backend log.";
      if (error.message?.includes("500") || error.message?.includes("Internal Server Error")) {
        friendlyMessage = "Something went wrong while submitting your report. Please try again.";
      } else if (error.message?.includes("api_key") || error.message?.includes("Cloudinary")) {
        friendlyMessage = "Image upload service is temporarily unavailable. Please try again in a few moments.";
      } else if (error.message?.includes("Network Error") || error.message?.includes("Network")) {
        friendlyMessage = "Unable to connect to the server. Check your internet connection.";
      } else if (error.message?.includes("Duplicate") || error.status === 409) {
        friendlyMessage = "Duplicate issue already exists nearby.";
      }
      showToast(friendlyMessage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Title block */}
      <div className="space-y-1 text-center md:text-left">
        <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Report an Issue</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Provide description and photos. Our AI models will categorize, calculate priority, and cross-reference nearby tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Form (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Duplicate warning bar */}
          <AnimatePresence>
            {duplicateWarning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex gap-2.5 items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Similar issue already reported 150m away!
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg">
                        We detected another unresolved <span className="font-bold text-sky-500">"{duplicateWarning.category}"</span> issue nearby reported by {duplicateWarning.reportedBy}.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSupportDuplicate}
                    className="w-full md:w-auto shrink-0 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm shadow-amber-500/15"
                  >
                    Support existing report
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Area */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Issue Snapshot</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Drag drop slot */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-colors relative min-h-[180px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isScanning || isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Upload className="h-8 w-8 text-slate-400 mb-3" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Drag &amp; drop an image here</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
              </div>

              {/* Image Preview slot */}
              <div className="border border-slate-100 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl flex items-center justify-center overflow-hidden min-h-[180px] max-h-[180px] relative">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={isScanning || isSubmitting}
                      onClick={() => { setImage(null); setImagePreview(""); }}
                      className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-white rounded-lg p-1.5 text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    No image uploaded yet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</label>
                <select
                  value={category}
                  disabled={isScanning || isSubmitting}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-4 py-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Road Damage">Road Damage (Potholes, cracks)</option>
                  <option value="Waste Management">Waste Management (Trash, dumping)</option>
                  <option value="Streetlight Failures">Streetlight Failures (Dark lanes)</option>
                  <option value="Water Supply">Water Supply (Leaks, bursts)</option>
                  <option value="Public Facilities">Public Facilities (Broken parks, fences)</option>
                  <option value="Utility Failures">Utility Failures (Wires down, transformers)</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Short Title</label>
                <input
                  type="text"
                  value={title}
                  disabled={isScanning || isSubmitting}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole near crossroads"
                  className="block w-full px-4 py-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                disabled={isScanning || isSubmitting}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Describe the issue in detail, including potential hazards, landmarks, and approximate duration..."
                className="block w-full px-4 py-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Coordinates & Location selection simulator */}
            <div className="p-5 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/25 dark:border-slate-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sky-500" />
                  Incident Location
                </span>
                <button
                  type="button"
                  disabled={isScanning || isSubmitting}
                  onClick={handleUseCurrentLocation}
                  className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📍 Use My Current Location
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Location Spot</label>
                  <select
                    value={selectedSpot}
                    disabled={isScanning || isSubmitting}
                    onChange={handleSpotChange}
                    className="block w-full h-14 px-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-base font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Object.entries(locationSpots).map(([key, value]) => (
                      <option 
                        key={key} 
                        value={key}
                        className="py-3 px-4 text-slate-900 dark:bg-slate-900 dark:text-slate-200 font-medium"
                      >
                        {value.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coordinates</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={selectedSpot !== "spot-new" || isScanning || isSubmitting}
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="Lat"
                      className="block w-1/2 px-3 py-2 bg-slate-200/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none disabled:opacity-75"
                    />
                    <input
                      type="text"
                      disabled={selectedSpot !== "spot-new" || isScanning || isSubmitting}
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      placeholder="Lng"
                      className="block w-1/2 px-3 py-2 bg-slate-200/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none disabled:opacity-75"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Details</label>
                <input
                  type="text"
                  disabled={selectedSpot !== "spot-new" || isScanning || isSubmitting}
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Street Address..."
                  className="block w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none disabled:bg-slate-200/40 dark:disabled:bg-slate-800/40"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {duplicateWarning ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSupportDuplicate}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-sm text-center cursor-pointer"
                  >
                    Support Existing Report
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-sm text-center cursor-pointer"
                  >
                    Report Anyway
                  </button>
                </div>
                
                <button
                  type="button"
                  disabled
                  className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold rounded-xl text-sm cursor-not-allowed border border-slate-350 dark:border-slate-750"
                >
                  Duplicate Found
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isScanning || isSubmitting}
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning || isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-md transition-all pt-3 pb-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? "Submitting civic report..." : isScanning ? "AI is inspecting your report..." : "Submit Civic Ticket"}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* AI Inference Sidebar (1 col) */}
        <div className="space-y-4">
          <AIAnalysisCard analysis={aiAnalysis} isScanning={isScanning} />
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
            <Sparkles className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Suggestion Helper</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                The priority score is calculated dynamically based on keyword severity, historical reports in this neighborhood, and local pedestrian densities.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 px-4.5 py-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-955 rounded-2xl shadow-2xl border border-slate-805 dark:border-slate-200"
          >
            <span className="text-xs font-black tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
