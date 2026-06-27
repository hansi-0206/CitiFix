export const mockIssues = [
  {
    id: "issue-1",
    title: "Severe Road Damage & Pothole Cluster",
    category: "Road Damage",
    description: "Multiple deep potholes have opened up near the main bus stop, forcing vehicles to swerve into oncoming traffic. It is causing massive traffic bottlenecks and poses a high safety hazard for motorbikes.",
    aiSummary: "Multiple deep potholes near the bus stop posing a safety risk. Swerving vehicles causing traffic congestion; immediate resurfacing required.",
    severity: "High",
    priorityScore: 91,
    aiConfidence: 94,
    status: "In Progress",
    upvotes: 48,
    date: "2026-06-20T10:30:00Z",
    reportedBy: "Aarav Sharma",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    location: {
      address: "Central Bus Stand Entrance, Main Arterial Rd",
      lat: 12.9716,
      lng: 77.5946,
      distance: "150m away"
    },
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    recommendedAction: "Immediate Asphalt Repair & Overlay",
    estimatedResolution: "3 days",
    timeline: [
      { status: "Reported", date: "2026-06-20T10:30:00Z", note: "Issue logged via CitiFix Mobile and auto-categorized by AI engine." },
      { status: "Verified", date: "2026-06-20T11:15:00Z", note: "Verified by AI Cross-reference & community votes." },
      { status: "Assigned", date: "2026-06-21T09:00:00Z", note: "Dispatched to Municipal Public Works Division (Team B)." },
      { status: "In Progress", date: "2026-06-22T08:30:00Z", note: "Crews are currently on-site patching the asphalt." }
    ]
  },
  {
    id: "issue-2",
    title: "Overflowing Garbage Dumpster & Industrial Waste",
    category: "Waste Management",
    description: "The neighborhood garbage bin has not been cleared for 4 days. Stray animals are spreading the trash everywhere, creating extremely unhygienic conditions and foul smell in the residential block.",
    aiSummary: "Accumulated unmanaged waste blockading pedestrian paths, attracting pests. Sanitation dispatch requested for comprehensive cleanup.",
    severity: "Medium",
    priorityScore: 72,
    aiConfidence: 89,
    status: "Reported",
    upvotes: 32,
    date: "2026-06-22T14:15:00Z",
    reportedBy: "Priya Patel",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    location: {
      address: "Crossroad 4, Sector 7, Green Glen Layout",
      lat: 12.9785,
      lng: 77.5912,
      distance: "500m away"
    },
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
    recommendedAction: "Standard Sanitation Dispatch & Waste Clearance",
    estimatedResolution: "5 days",
    timeline: [
      { status: "Reported", date: "2026-06-22T14:15:00Z", note: "Issue reported. Photo analysis confirmed trash accumulation." }
    ]
  },
  {
    id: "issue-3",
    title: "Broken Streetlight Array (Entire Lane in Dark)",
    category: "Streetlight Failures",
    description: "Three consecutive streetlights are broken, leaving the entire stretch near the local park completely dark after dusk. This is a safety hazard for night walkers and increases the risk of local crime.",
    aiSummary: "Multiple broken lighting fixtures causing dark zones in a high-pedestrian lane. Electrical grid team needs to replace bulbs and inspect wiring.",
    severity: "High",
    priorityScore: 84,
    aiConfidence: 96,
    status: "Reported",
    upvotes: 56,
    date: "2026-06-21T19:45:00Z",
    reportedBy: "Vikram Malhotra",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    location: {
      address: "Parkside Walkway, Block C, Silver Springs",
      lat: 12.9692,
      lng: 77.6015,
      distance: "700m away"
    },
    imageUrl: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=800&q=80",
    recommendedAction: "Utility Dispatch (Electrical Maintenance)",
    estimatedResolution: "3 days",
    timeline: [
      { status: "Reported", date: "2026-06-21T19:45:00Z", note: "Reported. AI verification confirmed dark zone cluster." },
      { status: "Verified", date: "2026-06-22T06:00:00Z", note: "Verified through light sensor API anomaly and community validations." }
    ]
  },
  {
    id: "issue-4",
    title: "Major Mainline Water Leakage",
    category: "Water Supply",
    description: "A fresh water pipe has burst underground. Water is gushing onto the road, flooding the sidewalk and wasting thousands of gallons of clean drinking water. The pressure in nearby houses has dropped.",
    aiSummary: "Subsurface utility pipeline rupture leading to street flooding and water wastage. Immediate mechanical isolation and repair advised.",
    severity: "Critical",
    priorityScore: 98,
    aiConfidence: 97,
    status: "In Progress",
    upvotes: 89,
    date: "2026-06-23T06:00:00Z",
    reportedBy: "Ananya Iyer",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    location: {
      address: "Opposite HDFC Bank, Outer Ring Road",
      lat: 12.9754,
      lng: 77.6052,
      distance: "1.2km away"
    },
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
    recommendedAction: "Emergency Plumbing & Infrastructure Dispatch",
    estimatedResolution: "1 day",
    timeline: [
      { status: "Reported", date: "2026-06-23T06:00:00Z", note: "Reported via mobile. System flagged as critical water loss." },
      { status: "Verified", date: "2026-06-23T06:15:00Z", note: "Verified by water department flow meters." },
      { status: "Assigned", date: "2026-06-23T07:00:00Z", note: "Emergency squad sent to isolate the main valve." },
      { status: "In Progress", date: "2026-06-23T08:00:00Z", note: "Welding crews on-site replacing the cracked conduit pipe." }
    ]
  },
  {
    id: "issue-5",
    title: "Collapsed Public Footbridge Railing",
    category: "Public Facilities",
    description: "The metal safety railing on the pedestrian footbridge over the canal has broken off. It is extremely dangerous for kids and elderly citizens using the bridge daily to cross over.",
    aiSummary: "Structural failure on bridge railing creating a falling hazard. Structural repair division notified for metal welding work.",
    severity: "Critical",
    priorityScore: 94,
    aiConfidence: 91,
    status: "Resolved",
    upvotes: 64,
    date: "2026-06-15T08:00:00Z",
    reportedBy: "Rohan Deshmukh",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    location: {
      address: "Canal Walkway Bridge, Sector 3",
      lat: 12.9654,
      lng: 77.5872,
      distance: "2.1km away"
    },
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    recommendedAction: "Emergency Structural Repair & Welding",
    estimatedResolution: "1 day",
    timeline: [
      { status: "Reported", date: "2026-06-15T08:00:00Z", note: "Reported by citizen." },
      { status: "Verified", date: "2026-06-15T09:12:00Z", note: "Verified by municipal engineers." },
      { status: "Assigned", date: "2026-06-15T11:00:00Z", note: "Assigned to Metal Work Maintenance Division." },
      { status: "In Progress", date: "2026-06-15T13:30:00Z", note: "Welding and structural reinforce work started." },
      { status: "Resolved", date: "2026-06-16T17:00:00Z", note: "Railing replaced and verified by inspection supervisor. Case closed." }
    ]
  },
  {
    id: "issue-6",
    title: "Dangling High Voltage Wire",
    category: "Utility Failures",
    description: "An overhead power cable has snapped and is hanging very low, just 6 feet above the pavement. It sparked briefly earlier. Extremely hazardous, especially in the rainy season.",
    aiSummary: "Snapped electrical utility cable hanging dangerously low. Shock and electrocution risk; urgent power cut and line repair required.",
    severity: "Critical",
    priorityScore: 99,
    aiConfidence: 98,
    status: "In Progress",
    upvotes: 110,
    date: "2026-06-23T09:12:00Z",
    reportedBy: "Kiran Rao",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    location: {
      address: "Opposite Metro Station Pillar 12, MG Road",
      lat: 12.9732,
      lng: 77.5982,
      distance: "300m away"
    },
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    recommendedAction: "Immediate Electrical Grid Shutdown & Rewiring",
    estimatedResolution: "1 day",
    timeline: [
      { status: "Reported", date: "2026-06-23T09:12:00Z", note: "Reported with photos. Auto-flagged by system due to high-voltage keyword matching." },
      { status: "Verified", date: "2026-06-23T09:20:00Z", note: "Verified through grid sensor diagnostics. Power shut off on grid line 4." },
      { status: "Assigned", date: "2026-06-23T09:30:00Z", note: "Emergency grid response squad dispatched." },
      { status: "In Progress", date: "2026-06-23T10:15:00Z", note: "Crews on-site replacing snapped isolator and securing overhead cabling." }
    ]
  }
];

export const mockNearbyWidgets = [
  { id: "w-1", title: "Road Damage", distance: "150m away", severity: "High", lat: 12.9716, lng: 77.5946 },
  { id: "w-2", title: "Garbage Dump", distance: "500m away", severity: "Medium", lat: 12.9785, lng: 77.5912 },
  { id: "w-3", title: "Streetlight Failure", distance: "700m away", severity: "High", lat: 12.9692, lng: 77.6015 },
  { id: "w-4", title: "Water Leakage", distance: "1.2km away", severity: "Critical", lat: 12.9754, lng: 77.6052 }
];

export const mockStats = {
  activeReports: 145,
  resolvedIssues: 320,
  communityMembers: 1840,
  participationScore: 84
};
