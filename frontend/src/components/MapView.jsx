import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ThumbsUp, Calendar, ArrowRight, Compass, ShieldAlert, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

// Fix for default Leaflet icon paths in Vite assets bundler
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center the map on new coordinates
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, map]);
  return null;
}

// Custom user GPS marker icon (blue dot with pulsing radar effect)
const userIcon = L.divIcon({
  className: "user-gps-marker",
  html: `
    <div class="relative flex items-center justify-center w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg">
      <span class="absolute -inset-2 rounded-full bg-blue-500 animate-ping opacity-60 pointer-events-none"></span>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export default function MapView({ issues, isHeatmap, onSelectIssue }) {
  const { upvoteIssue } = useApp();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore center default
  const [userLocation, setUserLocation] = useState(null);
  const [hasGpsLocation, setHasGpsLocation] = useState(false);

  // Request user GPS location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setHasGpsLocation(true);
        },
        (error) => {
          console.warn("GPS access denied or unavailable. Falling back to issue/default center.");
        }
      );
    }
  }, []);

  // Automatically update map center to recent issue coordinates only if GPS is not active
  useEffect(() => {
    if (!hasGpsLocation && issues.length > 0) {
      const firstIssue = issues[0];
      setMapCenter([firstIssue.location.lat, firstIssue.location.lng]);
    }
  }, [issues, hasGpsLocation]);

  const getPinColorClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-500 ring-rose-500/30";
      case "high":
        return "bg-amber-500 ring-amber-500/30";
      case "medium":
        return "bg-sky-500 ring-sky-500/30";
      default:
        return "bg-slate-500 ring-slate-500/30";
    }
  };

  // Custom standard marker icon with Leaflet L.divIcon to match existing CSS designs
  const createStandardIcon = (issue) => {
    const isSelected = selectedIssue?.id === issue.id;
    const colorClass = getPinColorClass(issue.severity);
    const isCritical = issue.severity?.toLowerCase() === "critical";

    return L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="relative flex items-center justify-center p-2 rounded-full text-white ring-4 shadow-xl transition-all duration-300 ${colorClass} ${
        isSelected ? "scale-125 -translate-y-1" : ""
      }">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin shrink-0"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          ${
            isCritical
              ? '<span class="absolute -inset-1 rounded-full border border-rose-500 animate-ping opacity-75 pointer-events-none"></span>'
              : ""
          }
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -32],
    });
  };

  // Custom heatmap icon
  const createHeatmapIcon = (severity) => {
    let sizeClass = "w-10 h-10 bg-sky-500/40 filter blur-md";
    if (severity?.toLowerCase() === "critical") {
      sizeClass = "w-28 h-28 bg-rose-500/45 filter blur-xl";
    } else if (severity?.toLowerCase() === "high") {
      sizeClass = "w-20 h-20 bg-orange-500/45 filter blur-lg";
    } else if (severity?.toLowerCase() === "medium") {
      sizeClass = "w-14 h-14 bg-yellow-500/45 filter blur-md";
    }

    return L.divIcon({
      className: "custom-heatmap-icon",
      html: `
        <div class="rounded-full animate-pulse-slow mix-blend-screen ${sizeClass} transform -translate-x-1/2 -translate-y-1/2"></div>
      `,
      iconSize: [1, 1],
      iconAnchor: [0, 0],
    });
  };

  const handlePinClick = (issue) => {
    setSelectedIssue(issue);
    if (onSelectIssue) {
      onSelectIssue(issue);
    }
  };

  return (
    <div className="relative w-full h-[550px] md:h-[620px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden transition-colors duration-300">
      
      {/* Leaflet Map Integration */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // dark-mode styled OSM tiles
        />

        <MapRecenter center={mapCenter} />

        {/* You Are Here User GPS Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="p-1 text-center text-slate-800 dark:text-slate-200">
                <p className="text-xs font-bold">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.location.lat, issue.location.lng]}
            icon={isHeatmap ? createHeatmapIcon(issue.severity) : createStandardIcon(issue)}
            eventHandlers={{
              click: () => handlePinClick(issue),
            }}
          >
            {!isHeatmap && (
              <Popup className="custom-leaflet-popup">
                <div className="p-2.5 space-y-2 min-w-[160px] text-slate-900 dark:text-white">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="text-[9px] font-black uppercase text-sky-500">
                      {issue.category}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold uppercase">
                      {issue.status}
                    </span>
                  </div>
                  <h5 className="font-extrabold text-xs leading-snug line-clamp-2">{issue.title}</h5>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1">
                    <span>{issue.upvotes} Supports</span>
                    <button
                      onClick={() => handlePinClick(issue)}
                      className="text-sky-500 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      Inspect Details
                    </button>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* Map Compass Widget */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-lg pointer-events-none">
        <Compass className="h-4 w-4 text-sky-500 animate-spin-slow" />
        <span>MERN Live Spatial Grid</span>
      </div>

      {/* Detail Drawer Popup */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 z-30 w-full sm:w-80 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  {selectedIssue.category}
                </span>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Cover Image */}
              <div className="h-36 rounded-xl overflow-hidden border border-slate-800">
                <img
                  src={selectedIssue.imageUrl}
                  alt={selectedIssue.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Priority */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-extrabold text-white leading-snug">
                  {selectedIssue.title}
                </h4>
                
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedIssue.severity?.toLowerCase() === "critical"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : selectedIssue.severity?.toLowerCase() === "high"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  }`}>
                    {selectedIssue.severity}
                  </span>
                  
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedIssue.status?.toLowerCase() === "resolved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>

              {/* Summary Description */}
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                {selectedIssue.description}
              </p>

              {/* Address / Location Details */}
              <div className="pt-2 space-y-1 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{selectedIssue.location.address}</span>
                </div>
                <div className="flex items-center gap-1.5 pl-5 text-[10px] text-slate-500">
                  <span>Lat: {selectedIssue.location.lat.toFixed(4)}, Lng: {selectedIssue.location.lng.toFixed(4)}</span>
                </div>
              </div>

              {/* AI Details Card inside Drawer */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none">Priority Score</p>
                    <span className="text-xs font-bold text-white leading-none">{selectedIssue.priorityScore}/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none">Estimated</p>
                  <span className="text-xs font-bold text-slate-300 leading-none">{selectedIssue.estimatedResolution}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => upvoteIssue(selectedIssue.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{selectedIssue.upvotes} Upvotes</span>
              </button>

              <button
                onClick={() => {
                  setSelectedIssue(null);
                  window.location.href = `#/issue/${selectedIssue.id}`;
                }}
                className="flex items-center justify-center p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-md shadow-sky-500/10 animate-pulse"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
