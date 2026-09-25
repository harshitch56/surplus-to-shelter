import { memo, useEffect, useRef, useState } from "react";

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/*
  SURPLUS2SHELTER — AMIHACKS 1.0
  Completely redesigned single-file React interface.
  Map intentionally exists ONLY inside the Delivery Tracking section.
*/

const donorPoint = [26.8894, 75.7928];
const shelterPoint = [26.8547, 75.806];
const driverRoute = [
  [26.8894, 75.7928],
  [26.8836, 75.794],
  [26.8773, 75.7964],
  [26.871, 75.7991],
  [26.8647, 75.802],
  [26.8594, 75.804],
  [26.8547, 75.806],
];

const shelters = [
  { name: "Hope Shelter", location: "Malviya Nagar", distance: "2.4 km", needs: 30, match: 94, type: "Community shelter", demand: "High" },
  { name: "Umeed Foundation", location: "Mansarovar", distance: "4.1 km", needs: 50, match: 89, type: "NGO kitchen", demand: "Medium" },
  { name: "Care & Share NGO", location: "Vaishali Nagar", distance: "6.8 km", needs: 80, match: 82, type: "Relief centre", demand: "High" },
];

const drivers = [
  { name: "Ravi Sharma", phone: "+91 98765 42110", vehicle: "RJ 14 AB 2148", rating: "4.9/5", zone: "Malviya Nagar" },
  { name: "Aman Verma", phone: "+91 98102 66341", vehicle: "RJ 14 CD 7812", rating: "4.8/5", zone: "Mansarovar" },
  { name: "Mohit Singh", phone: "+91 99281 54026", vehicle: "RJ 14 EF 4930", rating: "4.9/5", zone: "Vaishali Nagar" },
  { name: "Karan Meena", phone: "+91 97821 31564", vehicle: "RJ 14 GH 6284", rating: "4.7/5", zone: "Jagatpura" },
  { name: "Arjun Yadav", phone: "+91 99504 77218", vehicle: "RJ 14 JK 9051", rating: "4.8/5", zone: "C-Scheme" },
  { name: "Dev Sharma", phone: "+91 98290 44873", vehicle: "RJ 14 LM 3567", rating: "4.9/5", zone: "Pratap Nagar" },
];

const shelterMapPoints = [
  { ...shelters[0], point: [26.8547, 75.806] },
  { ...shelters[1], point: [26.8628, 75.7648] },
  { ...shelters[2], point: [26.9172, 75.7447] },
];

const Icon = memo(function Icon({ name, size = 18 }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const d = {
    heart: <><path fill="currentColor" stroke="none" d="M20.8 8.8c0 5.5-8.8 10-8.8 10S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    close: <><path d="m6 6 12 12"/><path d="M18 6 6 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    user: <><circle cx="12" cy="8" r="3.2"/><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    truck: <><path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    route: <><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h5a3 3 0 0 1 3 3v5a3 3 0 0 0 3 3"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    leaf: <><path d="M20 4C11 4 5 8 5 14c0 3.3 2.7 6 6 6 6 0 9-6 9-16Z"/><path d="M4 20c3-4 6.5-6.5 11-8"/></>,
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z"/><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/></>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    shield: <path d="M12 3 19 6v5c0 5-3 8.2-7 10-4-1.8-7-5-7-10V6l7-3Z"/>,
  };
  return <svg {...p}>{d[name] || d.spark}</svg>;
});

function MapFollower({ position }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.stop();
    map.panTo(position, { animate: true, duration: 0.30, easeLinearity: 0.25 });
  }, [map, position]);
  return null;
}

const roleAccounts = {
  Admin: { email: "admin@surplus2shelter.demo", password: "Admin@123", label: "Network Admin" },
  Donor: { email: "donor@surplus2shelter.demo", password: "Donor@123", label: "Food Donor" },
  Receiver: { email: "receiver@surplus2shelter.demo", password: "Receiver@123", label: "Shelter Receiver" },
  Driver: { email: "driver@surplus2shelter.demo", password: "Driver@123", label: "Delivery Driver" },
};

const TRACKING_DURATION_MS = 5000;

const DEMO_DONATION_QUEUE = [
  {
    id: 2048,
    foodName: "Fresh rice & dal",
    category: "Cooked meals",
    meals: "45",
    foodType: "Rice & dal",
    address: "Demo Restaurant · Malviya Nagar",
    bestBeforeTime: "16:30",
    contact: "+91 98765 40001",
    createdAt: "03:18 AM",
    selectedShelterName: "Hope Shelter",
    driverIndex: 2,
    delivered: false,
    deliveryStarted: true,
    pickupAssigned: true,
    handoffVerified: false,
    trackingStartAt: null,
    driverRotation: 0,
    driverName: "Ravi Sharma",
    routeOptimized: true,
    driverAccepted: true,
    driverDeclined: false,
    isDemo: true,
  },
  {
    id: 2049,
    foodName: "Bakery surplus",
    category: "Bakery",
    meals: "28",
    foodType: "Bread & snacks",
    address: "Demo Cafe · C-Scheme",
    bestBeforeTime: "17:00",
    contact: "+91 98765 40002",
    createdAt: "03:20 AM",
    selectedShelterName: "Umeed Foundation",
    driverIndex: driverRoute.length - 1,
    delivered: true,
    deliveryStarted: true,
    pickupAssigned: true,
    handoffVerified: false,
    trackingStartAt: null,
    driverRotation: 1,
    driverName: "Aman Verma",
    routeOptimized: true,
    driverAccepted: true,
    driverDeclined: false,
    isDemo: true,
  },
];

const DEMO_SHELTER_REQUESTS = [
  {
    id: "REQ-DEMO-301",
    shelterName: "Hope Shelter",
    location: "Malviya Nagar",
    meals: 30,
    foodType: "Rice & dal",
    neededBy: "16:30",
    urgency: "Urgent",
    notes: "Fresh cooked meals preferred.",
    status: "open",
    createdAt: "03:12 AM",
    donorName: null,
    donationId: null,
    isDemo: true,
  },
  {
    id: "REQ-DEMO-302",
    shelterName: "Umeed Foundation",
    location: "Mansarovar",
    meals: 20,
    foodType: "Bakery / breakfast",
    neededBy: "17:00",
    urgency: "Normal",
    notes: "Any sealed surplus is welcome.",
    status: "accepted",
    createdAt: "03:08 AM",
    donorName: "Demo Restaurant",
    donationId: 2049,
    isDemo: true,
  },
];

const DEMO_NOTIFICATIONS = [
  { id: "MSG-DEMO-1", message: "Hope Shelter requested 30 meals. A restaurant can accept the requirement.", target: "Donor", time: "03:12 AM", read: false, isDemo: true },
  { id: "MSG-DEMO-2", message: "Demo Restaurant accepted Umeed Foundation's 20-meal request.", target: "Receiver", time: "03:20 AM", read: false, isDemo: true },
  { id: "MSG-DEMO-3", message: "A delivery request is waiting for driver acceptance.", target: "Driver", time: "03:21 AM", read: false, isDemo: true },
  { id: "MSG-DEMO-4", message: "Bakery surplus has reached Umeed Foundation. Receiver OTP is ready.", target: "Admin", time: "03:22 AM", read: false, isDemo: true },
];

function expiryInfo(time) {
  if (!time) return { label: "No expiry set", tone: "safe", minutes: 999 };
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const expiry = new Date(now);
  expiry.setHours(h || 0, m || 0, 0, 0);
  if (expiry.getTime() <= now.getTime()) expiry.setDate(expiry.getDate() + 1);
  const minutes = Math.max(0, Math.round((expiry.getTime() - now.getTime()) / 60000));
  const tone = minutes <= 45 ? "critical" : minutes <= 120 ? "urgent" : "safe";
  return { minutes, tone, label: minutes < 60 ? `${minutes} min remaining` : `${Math.floor(minutes / 60)}h ${minutes % 60}m remaining` };
}
function matchScoreFor(shelter, donation) {
  if (!shelter) return 0;
  const meals = Number(donation?.meals || 30);
  const quantityFit = Math.min(100, Math.round((shelter.needs / Math.max(meals, 1)) * 72));
  const score = Math.round((shelter.match * 0.45) + (Math.min(quantityFit, 100) * 0.25) + (shelter.demand === "High" ? 20 : 12) + (shelter.distance === "2.4 km" ? 8 : shelter.distance === "4.1 km" ? 6 : 4));
  return Math.min(99, Math.max(74, score));
}

function App() {
  const [active, setActive] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState(0);
  const [showDonate, setShowDonate] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeRole, setActiveRole] = useState("");
  const [roleDashboardOpen, setRoleDashboardOpen] = useState(false);
  const [loginRole, setLoginRole] = useState("Admin");
  const [loginEmail, setLoginEmail] = useState(roleAccounts.Admin.email);
  const [loginPassword, setLoginPassword] = useState(roleAccounts.Admin.password);
  const [toast, setToast] = useState("");

  const [donation, setDonation] = useState({
    foodName: "", category: "", meals: "", foodType: "", address: "", bestBeforeTime: "", contact: ""
  });
  const [createdDonation, setCreatedDonation] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [pickupAssigned, setPickupAssigned] = useState(false);
  const [deliveryStarted, setDeliveryStarted] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackingStartAt, setTrackingStartAt] = useState(null);
  const [driverIndex, setDriverIndex] = useState(0);
  const [driverRotation, setDriverRotation] = useState(0);
  const [showSheltersOnMap, setShowSheltersOnMap] = useState(false);
  const [roadTracking, setRoadTracking] = useState(true);
  const [donationQueue, setDonationQueue] = useState(DEMO_DONATION_QUEUE);
  const [routeOptimized, setRouteOptimized] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyDispatched, setEmergencyDispatched] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffOtp, setHandoffOtp] = useState("");
  const [handoffVerified, setHandoffVerified] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [shelterRequests, setShelterRequests] = useState(DEMO_SHELTER_REQUESTS);
  const [networkNotifications, setNetworkNotifications] = useState(DEMO_NOTIFICATIONS);
  const [driverAccepted, setDriverAccepted] = useState(false);
  const [driverDeclined, setDriverDeclined] = useState(false);
  const [portalTab, setPortalTab] = useState("home");
  const toastTimerRef = useRef(null);

  const driver = drivers[driverRotation % drivers.length];
  const now = Date.now();
  const trackingElapsed = trackingStartAt ? Math.max(0, now - trackingStartAt) : 0;
  const progress = delivered ? 100 : trackingStartAt ? Math.min(99, Math.max(0, Math.floor((trackingElapsed / TRACKING_DURATION_MS) * 100))) : Math.round((driverIndex / (driverRoute.length - 1)) * 100);
  const routePositionIndex = Math.min(driverRoute.length - 1, Math.floor((progress / 100) * (driverRoute.length - 1)));
  const driverPosition = driverRoute[routePositionIndex];
  const etaMinutes = delivered ? 0 : trackingStartAt ? Math.max(1, Math.ceil((TRACKING_DURATION_MS - trackingElapsed) / 60000)) : 0;
  const eta = delivered ? "Delivered" : trackingStartAt ? `${etaMinutes} min` : selectedShelter ? "~2 min" : "—";
  const status = delivered ? "Delivered" : selectedShelter ? "Matched" : createdDonation ? "Available" : "Waiting";
  const completedDonations = donationQueue.filter((item) => item.handoffVerified);
  const activeDonations = donationQueue.filter((item) => !item.handoffVerified);
  const mealsRescued = completedDonations.reduce((sum, item) => sum + Number(item.meals || 0), 0);
  const mealsInNetwork = donationQueue.reduce((sum, item) => sum + Number(item.meals || 0), 0);
  const activeMeals = activeDonations.reduce((sum, item) => sum + Number(item.meals || 0), 0);
  const completedHandoffs = completedDonations.length;
  const sheltersReached = new Set(completedDonations.map((item) => item.selectedShelterName).filter(Boolean)).size;
  const activeShelters = new Set(activeDonations.map((item) => item.selectedShelterName).filter(Boolean)).size;
  const networkCompletion = donationQueue.length ? Math.round((completedHandoffs / donationQueue.length) * 100) : 0;
  const urgentDonations = donationQueue.filter((item) => !item.handoffVerified && ["urgent", "critical"].includes(expiryInfo(item.bestBeforeTime).tone));
  const pendingRequests = shelterRequests.filter((r) => r.status === "open");
  const acceptedRequests = shelterRequests.filter((r) => r.status === "accepted");
  const realDonationQueue = donationQueue.filter((item) => !item.isDemo);
  const realShelterRequests = shelterRequests.filter((item) => !item.isDemo);
  const demoActiveMission = donationQueue.find((item) => item.isDemo && !item.handoffVerified) || donationQueue.find((item) => item.isDemo);
  const demoHandoffMission = donationQueue.find((item) => item.isDemo && item.delivered && !item.handoffVerified);
  const portalMission = createdDonation || demoActiveMission;

  const notifyNetwork = (message, target = "Network") => {
    setNetworkNotifications((items) => [{ id: Date.now() + Math.random(), message, target, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), read: false }, ...items].slice(0, 20));
  };

  const createShelterRequest = (payload) => {
    const request = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      shelterName: payload.shelterName || "Hope Shelter",
      location: payload.location || "Malviya Nagar",
      meals: Number(payload.meals || 0),
      foodType: payload.foodType || "Any suitable food",
      neededBy: payload.neededBy || "As soon as possible",
      urgency: payload.urgency || "Normal",
      notes: payload.notes || "",
      status: "open",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      donorName: null,
      donationId: null,
    };
    if (!request.meals) { flash("Enter the number of meals required."); return; }
    setShelterRequests((items) => [request, ...items]);
    notifyNetwork(`${request.shelterName} requested ${request.meals} meals.`, "Donors");
    flash(`Request ${request.id} is live for restaurants.`);
  };

  const acceptShelterRequest = (request) => {
    const shelter = shelters.find((item) => item.name === request.shelterName) || shelters[0];
    const newDonation = {
      id: Date.now(), foodName: request.foodType || "Prepared surplus food", category: "Requested meal", meals: String(request.meals), foodType: request.foodType || "Any suitable food", address: "Restaurant pickup point", bestBeforeTime: request.neededBy, contact: "Restaurant contact",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), selectedShelterName: shelter.name, driverIndex: 0, delivered: false, deliveryStarted: false, pickupAssigned: false, handoffVerified: false, trackingStartAt: null, driverRotation, driverName: driver.name, routeOptimized: false, requestId: request.id, donorName: "Demo Restaurant"
    };
    setShelterRequests((items) => items.map((item) => item.id === request.id ? { ...item, status: "accepted", donorName: "Demo Restaurant", donationId: newDonation.id } : item));
    setDonationQueue((items) => [...items, newDonation]);
    setCreatedDonation(newDonation);
    setSelectedShelter(shelter);
    setPickupAssigned(false); setDeliveryStarted(false); setDelivered(false); setTracking(false); setTrackingStartAt(null); setDriverIndex(0); setDriverAccepted(false); setDriverDeclined(false); setHandoffVerified(false); setRouteOptimized(false);
    notifyNetwork(`Your request for ${request.meals} meals was accepted by Demo Restaurant.`, request.shelterName);
    notifyNetwork(`New delivery request: ${request.meals} meals → ${request.shelterName}.`, "Driver");
    flash(`${request.shelterName} request accepted. Driver assignment is now open.`);
  };

  const activateMission = (mission) => {
    if (!mission) return null;
    setCreatedDonation(mission);
    setSelectedShelter(shelters.find((s) => s.name === mission.selectedShelterName) || null);
    setDriverIndex(Math.min(mission.driverIndex || 0, driverRoute.length - 1));
    setDriverRotation(typeof mission.driverRotation === "number" ? mission.driverRotation % drivers.length : 0);
    setDelivered(Boolean(mission.delivered));
    setDeliveryStarted(Boolean(mission.deliveryStarted));
    setPickupAssigned(Boolean(mission.pickupAssigned));
    setHandoffVerified(Boolean(mission.handoffVerified));
    setDriverAccepted(Boolean(mission.driverAccepted || mission.pickupAssigned));
    setDriverDeclined(Boolean(mission.driverDeclined));
    setRouteOptimized(Boolean(mission.routeOptimized));
    setTracking(false);
    setTrackingStartAt(null);
    return mission;
  };

  const acceptDelivery = (missionOverride) => {
    const mission = missionOverride || createdDonation || demoActiveMission;
    if (!mission || !mission.selectedShelterName) { flash("No delivery request is available yet."); return; }
    activateMission(mission);
    setDriverAccepted(true); setDriverDeclined(false); setPickupAssigned(true);
    setDonationQueue((items) => items.map((item) => item.id === mission.id ? { ...item, pickupAssigned: true, driverAccepted: true, driverDeclined: false } : item));
    notifyNetwork(`${driver.name} accepted the delivery to ${mission.selectedShelterName}.`, "Network");
    flash("Delivery accepted. Start the route when you are ready.");
  };

  const declineDelivery = (missionOverride) => {
    const mission = missionOverride || createdDonation || demoActiveMission;
    if (!mission) return;
    activateMission(mission);
    setDriverDeclined(true); setDriverAccepted(false); setPickupAssigned(false);
    setDonationQueue((items) => items.map((item) => item.id === mission.id ? { ...item, pickupAssigned: false, driverAccepted: false, driverDeclined: true } : item));
    notifyNetwork(`${driver.name} declined the current delivery. A new driver is needed.`, "Admin");
    flash("Delivery declined. The rescue remains open for reassignment.");
  };

  const demoArrive = () => {
    const mission = createdDonation || demoActiveMission;
    if (!mission) { flash("No demo delivery is available."); return; }
    activateMission(mission);
    setDriverAccepted(true);
    setPickupAssigned(true);
    setDeliveryStarted(true);
    setDriverIndex(driverRoute.length - 1);
    setTracking(false);
    setTrackingStartAt(null);
    setDelivered(true);
    setHandoffVerified(false);
    setDonationQueue((items) => items.map((item) => item.id === mission.id ? { ...item, pickupAssigned: true, driverAccepted: true, deliveryStarted: true, driverIndex: driverRoute.length - 1, delivered: true, handoffVerified: false } : item));
    notifyNetwork(`Driver arrived at ${mission.selectedShelterName}. Receiver OTP is ready.`, "Driver");
    flash("Demo driver has arrived. Open OTP handoff to verify the receiver.");
  };

  const flash = (msg) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 3000);
  };

  const go = (id, label) => {
    setActive(label);
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rotateDriver = () => setDriverRotation((current) => (current + 1) % drivers.length);


  const resetFlow = () => {
    setSelectedShelter(null);
    setPickupAssigned(false);
    setDeliveryStarted(false);
    setDelivered(false);
    setTracking(false);
    setTrackingStartAt(null);
    setDriverIndex(0);
    setShowSheltersOnMap(false);
    setRoadTracking(true);
    rotateDriver();
  };

  const createDonation = (e) => {
    e.preventDefault();
    if (!donation.foodName.trim() || !donation.category || !donation.meals || !donation.address.trim() || !donation.bestBeforeTime) {
      flash("Complete the required donation fields first.");
      return;
    }
    const newDonation = { ...donation, id: Date.now(), createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setCreatedDonation(newDonation);
    setDonationQueue((queue) => [...queue, newDonation]);
    setHandoffVerified(false);
    setProofFile(null);
    setRouteOptimized(false);
    setDriverAccepted(false);
    setDriverDeclined(false);
    resetFlow();
    setShowDonate(false);
    setDonation({ foodName: "", category: "", meals: "", foodType: "", address: "", bestBeforeTime: "", contact: "" });
    flash("Donation added to the rescue queue.");
    setTimeout(() => go("rescue-board", "Donations"), 100);
  };

  const chooseShelter = (shelter) => {
    if (!createdDonation) {
      flash("Publish a donation before matching a shelter.");
      setShowMatch(false);
      setShowDonate(true);
      return;
    }
    setSelectedShelter(shelter);
    setPickupAssigned(false);
    setDeliveryStarted(false);
    setDelivered(false);
    setTracking(false);
    setDriverIndex(0);
    setHandoffVerified(false);
    setProofFile(null);
    setRouteOptimized(false);
    setDriverAccepted(false);
    setDriverDeclined(false);
    setShowMatch(false);
    flash(`${shelter.name} is now matched.`);
  };

  const startTracking = () => {
    if (!createdDonation) return setShowDonate(true);
    if (!selectedShelter) {
      setShowMatch(true);
      flash("Select a shelter before starting delivery.");
      return;
    }
    setPickupAssigned(true);
    setDeliveryStarted(true);
    setDelivered(false);
    setTracking(true);
    setTrackingStartAt((current) => current || Date.now());
    flash("Live delivery tracking started. Demo route completes in 5 seconds.");
  };

  const startDriverRoute = () => {
    if (!driverAccepted) { flash("Accept the delivery request before starting the route."); return; }
    startTracking();
  };

  const simulateDelivery = () => {
    if (!createdDonation) return setShowDonate(true);
    if (!selectedShelter) return setShowMatch(true);
    setPickupAssigned(true);
    setDeliveryStarted(true);
    setTracking(false);
    setDriverIndex(driverRoute.length - 1);
    setDelivered(true);
    setHandoffVerified(false);
    flash("Driver arrived. Verify the shelter handoff to complete the rescue.");
  };

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (!tracking || delivered || !trackingStartAt) return;
    const tick = () => {
      const elapsed = Date.now() - trackingStartAt;
      const nextProgress = Math.min(100, Math.floor((elapsed / TRACKING_DURATION_MS) * 100));
      const nextIndex = Math.min(driverRoute.length - 1, Math.floor((nextProgress / 100) * (driverRoute.length - 1)));
      setDriverIndex(nextIndex);
      if (nextProgress >= 100) {
        setTracking(false);
        setTrackingStartAt(null);
        setDelivered(true);
        setHandoffVerified(false);
        flash("Driver reached the shelter. Verify the handoff with OTP.");
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [tracking, delivered, trackingStartAt]);

  useEffect(() => {
    if (driverIndex > 0) setPickupAssigned(true);
    if (driverIndex > 1) setDeliveryStarted(true);
  }, [driverIndex]);

  const optimizeRoute = () => {
    if (!selectedShelter) { flash("Choose a shelter before optimizing the route."); return; }
    setRouteOptimized(true);
    flash("Route optimized · 11 minutes saved.");
  };
  const verifyHandoff = () => {
    if (handoffOtp.trim() !== "7249") { flash("Demo OTP is 7249."); return; }
    const mission = createdDonation || demoHandoffMission || demoActiveMission;
    if (!mission) { flash("No delivery is waiting for verification."); return; }
    activateMission(mission);
    setDelivered(true);
    setHandoffVerified(true);
    setShowHandoff(false);
    setDonationQueue((items) => items.map((item) => item.id === mission.id ? { ...item, handoffVerified: true, delivered: true, deliveryStarted: true, pickupAssigned: true, driverAccepted: true, driverIndex: driverRoute.length - 1 } : item));
    notifyNetwork(`${mission.meals} meals were delivered to ${mission.selectedShelterName || "the shelter"}.`, "Network");
    flash("Handoff verified · rescue receipt generated.");
  };
  const selectDonationFromQueue = (item) => {
    setCreatedDonation(item);
    const assignedDriverIndex = typeof item.driverRotation === "number" ? item.driverRotation : drivers.findIndex((d) => d.name === item.driverName);
    if (assignedDriverIndex >= 0) setDriverRotation(assignedDriverIndex % drivers.length);
    setSelectedShelter(shelters.find((s) => s.name === item.selectedShelterName) || null);
    setDriverIndex(Math.min(item.driverIndex || 0, driverRoute.length - 1));
    setDelivered(Boolean(item.delivered));
    setDeliveryStarted(Boolean(item.deliveryStarted));
    setPickupAssigned(Boolean(item.pickupAssigned));
    setHandoffVerified(Boolean(item.handoffVerified));
    setTracking(Boolean(item.trackingStartAt && !item.delivered));
    setTrackingStartAt(item.trackingStartAt || null);
    setRouteOptimized(Boolean(item.routeOptimized));
    setDriverAccepted(Boolean(item.driverAccepted || item.pickupAssigned));
    setDriverDeclined(Boolean(item.driverDeclined));
    setShowHandoff(false);
    flash(`${item.foodName} is now the active rescue.`);
  };
  useEffect(() => {
    if (!createdDonation?.id) return;
    setDonationQueue((queue) => queue.map((item) => item.id === createdDonation.id ? {
      ...item,
      selectedShelterName: selectedShelter?.name || null,
      driverIndex,
      delivered,
      deliveryStarted,
      pickupAssigned,
      handoffVerified,
      trackingStartAt,
      driverRotation,
      driverName: driver.name,
      routeOptimized,
      driverAccepted,
      driverDeclined,
    } : item));
  }, [createdDonation?.id, selectedShelter?.name, driverIndex, delivered, deliveryStarted, pickupAssigned, handoffVerified, trackingStartAt, driverRotation, driver.name, routeOptimized, driverAccepted, driverDeclined]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBackgroundTheme((current) => (current + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncFocusMode = () => setFocusMode(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFocusMode);
    syncFocusMode();
    return () => document.removeEventListener("fullscreenchange", syncFocusMode);
  }, []);

  const toggleFocusMode = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        setFocusMode(false);
        return;
      }
      setFocusMode(true);
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      setFocusMode(false);
    }
  };

  return (
    <div className={focusMode ? "app focus-mode" : "app"}>
    
      <style>{styles}</style>
      <div className="ambient-stage" aria-hidden="true">
        <span className={`ambient-layer ambient-theme-1 ${backgroundTheme === 0 ? "active" : ""}`} />
        <span className={`ambient-layer ambient-theme-2 ${backgroundTheme === 1 ? "active" : ""}`} />
        <span className={`ambient-layer ambient-theme-3 ${backgroundTheme === 2 ? "active" : ""}`} />
      </div>

      <header className="nav">
        <div className="nav-inner">
          <button className="logo" onClick={() => go("home", "Overview")}>
            <span className="logo-box"><Icon name="heart" size={16} /></span>
            <span>Surplus<span>2</span>Shelter</span>
          </button>

          <nav className={mobileNav ? "nav-links open" : "nav-links"}>
            {["Overview"].map((item) => <button key={item} className="nav-item active" onClick={() => go("home", "Overview")}>{item}</button>)}
          </nav>

          <div className="nav-right">
            <button className="nav-icon" onClick={() => setShowNotifications((v) => !v)} aria-label="Notifications">
              <Icon name="bell" size={17} /><i />
            </button>
            <button className="account" onClick={() => loggedIn ? setRoleDashboardOpen(true) : setShowLogin(true)}>
              <span>{loggedIn ? activeRole.charAt(0) : <Icon name="user" size={15} />}</span>
              <b>{loggedIn ? activeRole : "Sign in"}</b>
            </button>
            <button
              className="fullscreen-btn"
              onClick={toggleFocusMode}
              aria-label="Toggle fullscreen"
              title="Toggle fullscreen"
            >
              <span className="fullscreen-icon">⛶</span>
              <span className="fullscreen-label">Focus</span>
            </button>
            <button className="hamburger" onClick={() => setMobileNav((v) => !v)}><Icon name="menu" size={20} /></button>
          </div>
        </div>
      </header>

      {roleDashboardOpen ? <RoleDashboard role={activeRole} onClose={() => setRoleDashboardOpen(false)} onLogout={() => { setLoggedIn(false); setActiveRole(""); setRoleDashboardOpen(false); setPortalTab("home"); }} driver={driver} progress={createdDonation ? progress : (portalMission?.delivered ? 100 : portalMission?.deliveryStarted ? 46 : 25)} eta={createdDonation ? eta : (portalMission?.delivered ? "Arrived" : "9 min")} createdDonation={portalMission} selectedShelter={selectedShelter || shelters.find((s) => s.name === portalMission?.selectedShelterName) || null} delivered={createdDonation ? delivered : Boolean(portalMission?.delivered)} donationQueue={donationQueue} handoffVerified={createdDonation ? handoffVerified : Boolean(portalMission?.handoffVerified)} routeOptimized={routeOptimized} onGoTracking={() => { if (!createdDonation && portalMission) activateMission(portalMission); setRoleDashboardOpen(false); go("tracking", "Tracking"); }} shelterRequests={shelterRequests} onCreateRequest={createShelterRequest} onAcceptRequest={acceptShelterRequest} onAcceptDelivery={acceptDelivery} onDeclineDelivery={declineDelivery} onDemoArrive={demoArrive} driverAccepted={createdDonation ? driverAccepted : Boolean(portalMission?.driverAccepted)} driverDeclined={createdDonation ? driverDeclined : Boolean(portalMission?.driverDeclined)} handoffOtp={handoffOtp} setHandoffOtp={setHandoffOtp} onVerifyHandoff={verifyHandoff} notifications={networkNotifications} portalTab={portalTab} setPortalTab={setPortalTab} /> : <main>
        <section id="home" className="hero section">
          <div className="hero-left">
            <div className="eyebrow"><span /> COMMUNITY FOOD RESCUE · JAIPUR</div>
            <div className="hero-kicker"><Icon name="spark" size={13} /> BUILT FOR FAST, LOCAL ACTION</div>
            <h1>Food should move.<br /><em>Not go to waste.</em></h1>
            <p>Surplus2Shelter turns extra food into a coordinated rescue mission — publish once, find the right shelter, assign a pickup and verify the final handoff.</p>
            <div className="hero-buttons">
              <button className="primary" onClick={() => setShowDonate(true)}><Icon name="plus" size={16} /> Start a rescue</button>
              <button className="secondary" onClick={() => go("rescue-board", "Donations")}>Open rescue board <Icon name="arrow" size={15} /></button>
            </div>
            <div className="hero-proof">
              <span><Icon name="shield" size={14} /> Verified workflow</span>
              <span><Icon name="route" size={14} /> Live delivery status</span>
              <span><Icon name="leaf" size={14} /> Measurable impact</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="command-card">
              <div className="command-head">
                <div><small>RESCUE COMMAND</small><h2>What needs attention?</h2></div>
                <span className="online"><i /> ONLINE</span>
              </div>
              <div className="priority-card">
                <div className="priority-icon"><Icon name="heart" size={18} /></div>
                <div className="priority-copy"><span>PRIORITY QUEUE</span><strong>{createdDonation ? createdDonation.foodName : "No active donation"}</strong><p>{createdDonation ? `${createdDonation.meals} meals · ${status}` : "Publish surplus food to create a rescue job."}</p></div>
                <button onClick={createdDonation ? () => setShowMatch(true) : () => setShowDonate(true)}>{createdDonation ? "Match" : "Create"}<Icon name="arrow" size={13} /></button>
              </div>
              <div className="command-grid">
                <MiniCommand icon="truck" value={pickupAssigned ? "1" : "0"} label="Pickups active" />
                <MiniCommand icon="home" value={shelters.length} label="Shelters available" />
                <MiniCommand icon="check" value={`${networkCompletion}%`} label="Handoff completion" />
                <MiniCommand icon="clock" value={eta === "Delivered" ? "Done" : eta} label="Current ETA" />
              </div>
              <div className="command-footer"><span><i className="green-dot" /> Network operational</span><button onClick={() => go("impact", "Impact")}>View impact <Icon name="arrow" size={12} /></button></div>
            </div>
          </div>
        </section>

        <section className="ticker section">
          <div><b>{mealsRescued}</b><span>meals rescued</span></div>
          <div><b>{mealsInNetwork}</b><span>meals in network</span></div>
          <div><b>{completedHandoffs}</b><span>handoffs completed</span></div>
          <div><b>{sheltersReached}</b><span>shelters reached</span></div>
          <div className="ticker-note"><Icon name="spark" size={15} /> Live data from your rescue workflow</div>
        </section>

        <section id="rescue-board" className="section content">
          <SectionTitle number="01" title="The rescue board" text="One place to see what is available, what needs matching, and what is already moving." action={<button className="primary small" onClick={() => setShowDonate(true)}><Icon name="plus" size={14} /> New donation</button>} />
          <div className="board-grid">
            <div className="board-main">
              <div className="board-label"><span>ACTIVE QUEUE</span><b>{donationQueue.length || (createdDonation ? 1 : 0)} RESCUES</b></div>
              {createdDonation ? (
                <div className="rescue-job">
                  <div className="job-top"><div className="job-type"><span className="food-dot">🍲</span><div><small>FOOD DONATION</small><h3>{createdDonation.foodName}</h3></div></div><span className="job-status">{delivered ? "DELIVERED" : selectedShelter ? "MATCHED" : "AVAILABLE"}</span></div>
                  <div className="job-facts"><Fact label="Meals" value={createdDonation.meals} /><Fact label="Category" value={createdDonation.category} /><Fact label="Pickup" value={createdDonation.address} /><Fact label="Best before" value={createdDonation.bestBeforeTime} /></div>
                  <div className="job-bottom"><div className="mini-progress"><span style={{ width: `${delivered ? 100 : selectedShelter ? 35 : 8}%` }} /></div><span>{delivered ? "Rescue complete" : selectedShelter ? "Ready for pickup" : "Awaiting match"}</span><button onClick={() => selectedShelter ? go("tracking", "Tracking") : setShowMatch(true)}>{selectedShelter ? "Open tracking" : "Find shelter"}<Icon name="arrow" size={13} /></button></div>
                </div>
              ) : (
                <div className="empty-board"><div className="empty-ring"><Icon name="plus" size={22} /></div><h3>No rescue jobs yet</h3><p>Have surplus food? Add the first rescue job and let the network take it from there.</p><button className="secondary" onClick={() => setShowDonate(true)}>Publish surplus food <Icon name="arrow" size={14} /></button></div>
              )}
            </div>
<div className="queue-stack">
               <div className="queue-stack-head"><span>RESCUE MISSIONS</span><b>{donationQueue.length} total</b></div>
               {donationQueue.length === 0 ? <div className="queue-empty">Create multiple donations here. Each rescue gets its own mission card and can be reopened independently.</div> : donationQueue.map((item, index) => { const itemShelter = shelters.find((s) => s.name === item.selectedShelterName); const itemProgress = item.handoffVerified || item.delivered ? 100 : item.trackingStartAt ? Math.min(99, Math.floor(((Date.now() - item.trackingStartAt) / TRACKING_DURATION_MS) * 100)) : item.selectedShelterName ? 25 : 0; return <button className={createdDonation?.id === item.id ? "queue-item active" : "queue-item"} key={item.id} onClick={() => selectDonationFromQueue(item)}><span className="queue-number">0{index + 1}</span><span><b>{item.foodName}</b><small>{item.meals} meals · {item.category}</small></span><span className="queue-meta"><strong>{itemProgress}%</strong><small>{itemShelter?.name || "Awaiting match"}</small></span></button>; })}
             </div>
            <div className="workflow">
              <div className="workflow-head"><span>WORKFLOW</span><b>4 STAGES</b></div>
              <WorkflowStep n="01" title="Publish" text="Food and pickup details" done={!!createdDonation} />
              <WorkflowStep n="02" title="Match" text={selectedShelter ? selectedShelter.name : "Distance + need + fit"} done={!!selectedShelter} />
              <WorkflowStep n="03" title="Move" text={deliveryStarted ? "Driver on route" : "Pickup assignment"} done={deliveryStarted} />
              <WorkflowStep n="04" title="Verify" text={delivered ? "Handoff recorded" : "Shelter confirms arrival"} done={delivered} />
            </div>
          </div>
        </section>

        <section id="shelters" className="section content">
          <SectionTitle number="02" title="Shelter network" text="Choose where the food matters most. Matching is transparent so the donor can see why a shelter fits." />
          <div className="shelter-layout">
            <div className="shelter-list">
              {shelters.map((shelter, i) => (
                <div className={selectedShelter?.name === shelter.name ? "shelter-row selected" : "shelter-row"} key={shelter.name}>
                  <span className="shelter-index">0{i + 1}</span>
                  <span className="shelter-symbol"><Icon name="home" size={18} /></span>
                  <span className="shelter-info"><strong>{shelter.name}</strong><small>{shelter.type} · {shelter.location}</small><em><i /> {shelter.demand} demand</em></span>
                  <span className="need"><small>NEED</small><b>{shelter.needs}</b></span>
                  <span className="match"><small>MATCH</small><b>{shelter.match}%</b></span>
                  <span className="capacity-chip"><small>CAPACITY</small><b>{shelter.name === "Hope Shelter" ? "72%" : shelter.name === "Umeed Foundation" ? "58%" : "81%"}</b><i><em style={{width:shelter.name === "Hope Shelter" ? "72%" : shelter.name === "Umeed Foundation" ? "58%" : "81%"}} /></i></span>
                  <button className="accept-btn" onClick={() => chooseShelter(shelter)}>{selectedShelter?.name === shelter.name ? "Accepted" : "Accept shelter"}<Icon name="check" size={14} /></button>
                </div>
              ))}
            </div>
            <div className="match-explainer">
              <div className="explainer-top"><span className="match-ring">94%</span><div><small>TOP MATCH</small><h3>{selectedShelter?.name || "Hope Shelter"}</h3></div></div>
              <p>Matches consider distance, current meal requirement, capacity and compatibility with the available food.</p><div className="smart-match-score"><span>AI RESCUE MATCH</span><strong>{matchScoreFor(selectedShelter || shelters[0], createdDonation)}%</strong></div><div className="match-factors"><span>Distance <b>92%</b></span><span>Current need <b>100%</b></span><span>Food fit <b>96%</b></span><span>Capacity <b>90%</b></span></div><div className="criteria"><Criterion label="Distance" value={selectedShelter?.distance || "2.4 km"} /><Criterion label="Current need" value={`${selectedShelter?.needs || 30} meals`} /><Criterion label="Food fit" value="High" /></div><p className="match-reason">Why this match? {selectedShelter?.name || "Hope Shelter"} combines high demand, available capacity and a short pickup distance.</p><button className="primary full" onClick={() => createdDonation ? setShowMatch(true) : setShowDonate(true)}>{createdDonation ? "Review shelter match" : "Create donation first"} <Icon name="arrow" size={14} /></button>
            </div>
          </div>
        </section>

        <section id="tracking" className="section content tracking-section">
          <SectionTitle number="03" title="Delivery control" text="Once a match is confirmed, the delivery becomes a clear, trackable sequence. The map lives here — and nowhere on the landing page." />
          <div className="tracking-shell">
            <div className="tracking-side">
              <div className="tracking-status"><span className={delivered ? "status-dot done" : tracking ? "status-dot live" : "status-dot"} /><div><small>DELIVERY STATUS</small><strong>{delivered && !handoffVerified ? "Arrived · verify handoff" : delivered ? "Handoff verified" : tracking ? "Driver moving" : selectedShelter ? "Ready for pickup" : "Waiting for match"}</strong></div></div>
              <div className="route-summary"><div><small>FROM</small><strong>{createdDonation?.address || "Donor pickup point"}</strong></div><Icon name="arrow" size={15} /><div><small>TO</small><strong>{selectedShelter?.name || "Matched shelter"}</strong></div></div>
              <div className="eta-panel"><div><small>ETA</small><b>{selectedShelter ? eta : "—"}</b></div><div><small>PROGRESS</small><b>{deliveryStarted ? `${progress}%` : "—"}</b></div><div><small>VEHICLE</small><b>{selectedShelter ? driver.vehicle.replace("RJ 14 ","") : "—"}</b></div></div>
              <div className="driver-detail-strip"><span><b>Zone</b>{driver.zone}</span><span><b>Vehicle</b>{driver.vehicle}</span><span><b>Contact</b>{driver.phone}</span></div>
              <div className="delivery-tools"><button onClick={() => flash(selectedShelter ? "Shelter contact notified." : "Choose a shelter first.")}><Icon name="bell" size={14} /> Notify shelter</button><button onClick={() => flash(selectedShelter ? `${driver.name} · ${driver.phone}` : "Assign a driver first.")}><Icon name="user" size={14} /> Driver details</button><button onClick={() => flash(delivered ? "Handoff proof is available in the demo." : "Proof unlocks after delivery.")}><Icon name="shield" size={14} /> Handoff proof</button></div>
              <div className="delivery-steps">
                <DeliveryStep n="01" title="Donation ready" done={!!createdDonation} text={createdDonation ? `${createdDonation.meals} meals listed` : "Waiting for food"} />
                <DeliveryStep n="02" title="Shelter matched" done={!!selectedShelter} text={selectedShelter?.name || "Choose a shelter"} />
                <DeliveryStep n="03" title="Pickup assigned" done={pickupAssigned} text={pickupAssigned ? "Driver assigned" : "Not assigned"} />
                <DeliveryStep n="04" title="Out for delivery" done={deliveryStarted} text={deliveryStarted ? "Route active" : "Not started"} />
                <DeliveryStep n="05" title="Handoff verified" done={handoffVerified} text={handoffVerified ? "OTP + proof recorded" : delivered ? "Verify receiver handoff" : "Awaiting arrival"} />
              </div>
              <div className="progress-card"><div className="progress-head"><b>DELIVERY PROGRESS</b><strong>{progress}%</strong></div><div className="big-progress"><span style={{ width: `${progress}%` }} /></div><div className="progress-caption"><span>Pickup</span><span>On road</span><span>Shelter</span></div></div>
              <div className="tracking-actions"><button className="primary" onClick={startTracking}><Icon name="route" size={15} /> {tracking ? "Tracking live" : "Start tracking"}</button><button className="secondary" onClick={() => { setRoadTracking(true); flash("Road tracking view enabled."); }}><Icon name="route" size={15} /> Road tracking</button><button className="secondary" onClick={() => { const next = !showSheltersOnMap; setShowSheltersOnMap(next); flash(next ? "All shelter positions shown on map." : "Shelter positions hidden."); }}><Icon name="home" size={15} /> {showSheltersOnMap ? "Hide shelters" : "Show shelters"}</button><button className="secondary" onClick={optimizeRoute}><Icon name="spark" size={15} /> {routeOptimized ? "Route optimized" : "Optimize route"}</button><button className="secondary" onClick={simulateDelivery}><Icon name="check" size={15} /> Demo arrival</button>{delivered && <button className="secondary" onClick={() => setShowHandoff(true)}><Icon name="shield" size={15} /> Verify handoff</button>}{handoffVerified && <button className="secondary" onClick={() => setShowReceipt(true)}><Icon name="check" size={15} /> Rescue receipt</button>}<button className="reset" onClick={() => { resetFlow(); flash("Delivery flow reset."); }}>Reset</button></div>
            </div>
            <div className="map-zone">
              <div className="map-zone-head"><div><small>LIVE ROUTE</small><strong>Jaipur delivery corridor</strong><small className="map-subline">{roadTracking ? "Road tracking active" : "Road tracking paused"} · {showSheltersOnMap ? "Shelter positions visible" : "Shelter positions hidden"}</small></div><span><i /> {tracking ? "MOVING" : delivered ? "ARRIVED" : "STANDBY"}</span></div>
              <div className="map-wrap">
                <MapContainer center={driverPosition} zoom={13} scrollWheelZoom className="delivery-map">
                  <MapFollower position={driverPosition} />
                  <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {roadTracking && <Polyline positions={routeOptimized ? [...driverRoute].reverse() : driverRoute} pathOptions={{ color: routeOptimized ? "#315d78" : "#527a5b", weight: 5, opacity: .9, dashArray: tracking ? undefined : "10 8" }} />}
                  {showHeatmap && shelterMapPoints.map((item) => <CircleMarker key={`heat-${item.name}`} center={item.point} radius={Math.max(14, item.needs / 2.5)} pathOptions={{ color: "#d17a45", weight: 1, fillColor: "#d17a45", fillOpacity: .12 }} />)}
                  {showSheltersOnMap && shelterMapPoints.map((item) => (
                    <CircleMarker key={item.name} center={item.point} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#8c6a4b", fillOpacity: 1 }}>
                      <Popup><b>{item.name}</b><br />{item.location} · {item.distance}<br />Needs {item.needs} meals · Match {item.match}%</Popup>
                    </CircleMarker>
                  ))}
                  <CircleMarker center={donorPoint} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#ff8a4c", fillOpacity: 1 }}><Popup><b>Pickup</b><br />Donor location</Popup></CircleMarker>
                  <CircleMarker center={shelterPoint} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#527a5b", fillOpacity: 1 }}><Popup><b>Shelter</b><br />{selectedShelter?.name || "Matched shelter"}</Popup></CircleMarker>
                  <CircleMarker center={driverPosition} radius={10} pathOptions={{ color: "#fff", weight: 3, fillColor: "#d17a45", fillOpacity: 1 }}><Popup><b>Delivery partner</b><br />Vehicle {driver.vehicle}<br />Live route position</Popup></CircleMarker>
                </MapContainer>
                <div className="map-overlay"><Icon name="truck" size={15} /><div><b>{delivered ? "Handoff complete" : tracking ? "Driver is moving" : "Route ready"}</b><small>{delivered ? "Impact recorded" : `${Math.max(0, 100 - progress)}% remaining`}</small></div></div>
              </div>
              <div className="map-legend"><span><i className="pickup" /> Pickup</span><span><i className="driver" /> Driver</span><span><i className="shelter" /> Shelter</span><span><i className="line" /> Route</span><button className="map-toggle" onClick={() => setShowHeatmap((v) => !v)}>{showHeatmap ? "Hide demand" : "Demand heatmap"}</button></div>
            </div>
          </div>
        </section>

        <section id="smart-ops" className="section content smart-ops-section">
  <SectionTitle number="04" title="Smart rescue operations." text="Turn the rescue workflow into an intelligent operations layer — urgency, routing, verification, demand and impact all work together." action={<button className="primary small" onClick={() => setEmergencyMode(true)}><Icon name="spark" size={14} /> Emergency mode</button>} />
  <div className="ops-grid">
    <div className="ops-card"><div className="ops-card-head"><span>EXPIRY RISK ENGINE</span><b className={`risk-pill ${expiryInfo(createdDonation?.bestBeforeTime).tone}`}>{expiryInfo(createdDonation?.bestBeforeTime).tone.toUpperCase()}</b></div><strong>{createdDonation ? expiryInfo(createdDonation.bestBeforeTime).label : "Add a donation to start the countdown"}</strong><p>Food is prioritized automatically as its best-before window approaches.</p><div className="risk-meter"><span style={{width:`${createdDonation ? Math.max(8, Math.min(100, 100 - expiryInfo(createdDonation.bestBeforeTime).minutes / 7)) : 0}%`}}/></div></div>
    <div className="ops-card"><div className="ops-card-head"><span>ROUTE OPTIMIZER</span><Icon name="route" size={17}/></div><strong>{routeOptimized ? "5.9 km optimized" : "7.4 km current route"}</strong><p>{routeOptimized ? "11 minutes saved · lower travel overhead" : "Find a shorter road path before dispatch."}</p><button className="ops-action" onClick={optimizeRoute}>{routeOptimized ? "Optimized ✓" : "Optimize now"}</button></div>
    <div className="ops-card"><div className="ops-card-head"><span>LIVE DEMAND</span><Icon name="home" size={17}/></div><strong>{activeShelters} active shelters</strong><p>{shelters.length} shelters are available for matching. Active count comes from your current rescue queue.</p><button className="ops-action" onClick={() => { setShowHeatmap(true); go("tracking", "Tracking"); }}>Open demand map</button></div>
    <div className="ops-card"><div className="ops-card-head"><span>HANDOFF SECURITY</span><Icon name="shield" size={17}/></div><strong>{handoffVerified ? `Verified · ${createdDonation?.id || "Rescue"}` : delivered ? "OTP verification ready" : "Awaiting arrival"}</strong><p>Receiver verification turns a route completion into a trusted handoff.</p><button className="ops-action" onClick={() => delivered ? setShowHandoff(true) : flash("Complete the delivery first.")}>{handoffVerified ? "View receipt" : "Verify handoff"}</button></div>
    <div className="ops-card impact-live-card"><div className="ops-card-head"><span>LIVE IMPACT</span><Icon name="leaf" size={17}/></div><div className="impact-live-grid"><div><strong>{mealsRescued}</strong><small>meals rescued</small></div><div><strong>{activeMeals}</strong><small>meals in active rescue</small></div><div><strong>{completedHandoffs}</strong><small>verified handoffs</small></div><div><strong>{sheltersReached}</strong><small>shelters reached</small></div><div><strong>0 kg</strong><small>food weight tracked</small></div></div></div>
    <div className="ops-card"><div className="ops-card-head"><span>EMERGENCY RESCUE</span><b>{emergencyDispatched ? "DISPATCHED" : urgentDonations.length ? `${urgentDonations.length} URGENT` : "CLEAR"}</b></div><strong>{emergencyDispatched ? "Nearest driver dispatched" : urgentDonations.length ? `${urgentDonations.length} rescue${urgentDonations.length === 1 ? "" : "s"} need attention` : "No urgent rescue right now"}</strong><p>Urgency is calculated from the best-before time you entered for each active donation.</p><button className="ops-action danger" onClick={() => setEmergencyMode(true)}>{emergencyDispatched ? "View dispatch" : "Open emergency mode"}</button></div>
  </div>
  <div className="admin-operations-card"><div className="admin-ops-head"><div><span>LIVE OPERATIONS CENTER</span><h3>Rescue queue · Jaipur</h3></div><b><i/> {donationQueue.length ? "LIVE · CONNECTED" : "WAITING FOR DONATION"}</b></div><div className="ops-table">{donationQueue.length ? donationQueue.map((item) => { const itemProgress = item.handoffVerified || item.delivered ? 100 : item.trackingStartAt ? Math.min(99, Math.floor(((Date.now() - item.trackingStartAt) / TRACKING_DURATION_MS) * 100)) : item.selectedShelterName ? 25 : 0; const itemEta = item.handoffVerified ? "Delivered" : item.trackingStartAt ? `${Math.max(1, Math.ceil((TRACKING_DURATION_MS - Math.max(0, Date.now() - item.trackingStartAt)) / 60000))} min` : "Not started"; return <div className="ops-row" key={item.id}><span><b>S2S-{item.id}</b><small>{item.foodName} · {item.meals} meals</small></span><span><b>{item.selectedShelterName || "Awaiting match"}</b><small>{item.driverName || "No driver yet"}</small></span><span><b>{itemProgress}%</b><small>{itemEta}</small></span><span className="risk-text safe">{item.handoffVerified ? "COMPLETED" : item.deliveryStarted ? "ACTIVE" : item.selectedShelterName ? "MATCHED" : "NEW"}</span></div>; }) : <div className="queue-empty">No rescue jobs yet. Create a donation and this operations center will populate with the same live data used by every role dashboard.</div>}</div></div>
</section>

<section id="impact" className="section content impact-section">
          <SectionTitle number="05" title="Impact, not just activity." text="A rescue platform should prove what happened after the button was pressed. These are the outcomes the workflow can measure." />
          <div className="impact-grid">
            {[
              { value: mealsRescued, label: "Meals rescued", change: `${completedHandoffs} verified handoff${completedHandoffs === 1 ? "" : "s"}`, icon: "heart" },
              { value: mealsInNetwork, label: "Meals in network", change: `${donationQueue.length} donation${donationQueue.length === 1 ? "" : "s"}`, icon: "leaf" },
              { value: completedHandoffs, label: "Completed handoffs", change: delivered ? "Latest delivery arrived" : "Waiting for delivery", icon: "check" },
              { value: sheltersReached, label: "Shelters reached", change: `${activeShelters} active match${activeShelters === 1 ? "" : "es"}`, icon: "home" },
            ].map((item) => <div className="impact-tile" key={item.label}><span className="impact-icon"><Icon name={item.icon} size={17} /></span><strong>{item.value}</strong><p>{item.label}</p><small>{item.change}</small></div>)}
          </div>
          <div className="impact-bottom"><div><small>NETWORK COMPLETION</small><strong>{networkCompletion}%</strong><p>{donationQueue.length ? `${completedHandoffs} of ${donationQueue.length} rescue${donationQueue.length === 1 ? "" : "s"} completed.` : "No rescue has been completed yet."}</p></div><div className="big-meter"><span style={{ width: `${networkCompletion}%` }} /></div><button className="secondary" onClick={() => flash("Analytics are based only on your live rescue data.")}>Open analytics <Icon name="arrow" size={14} /></button></div>
        </section>

        <section className="final-cta section"><div><span>THE NEXT MEAL CAN STILL BE SAVED</span><h2>Give surplus food a destination.</h2></div><button className="primary" onClick={() => setShowDonate(true)}>Start a rescue <Icon name="arrow" size={15} /></button></section>

        <section className="team-section section" aria-label="Surplus2Shelter team">
          <div className="team-card">
            <div className="team-heading">
              <span>THE TEAM BEHIND THE RESCUE</span>
              <h2>Built with purpose. <em>Delivered together.</em></h2>
              <p>Surplus2Shelter · AMIHACKS 1.0</p>
            </div>
            <div className="team-members">
              <div className="team-member team-leader"><span className="team-avatar"><Icon name="heart" size={17} /></span><div><strong>Harshit (Team Leader)</strong></div></div>
              <div className="team-member"><span className="team-avatar"><Icon name="user" size={16} /></span><div><strong>Ayush Choudhary</strong></div></div>
              <div className="team-member"><span className="team-avatar"><Icon name="user" size={16} /></span><div><strong>Kushal Sharma</strong></div></div>
              <div className="team-member"><span className="team-avatar"><Icon name="user" size={16} /></span><div><strong>Siddharth Yadav</strong></div></div>
            </div>
          </div>
        </section>
      </main>}

      <footer><div className="footer-inner"><div className="logo"><span className="logo-box"><Icon name="heart" size={14} /></span><span>Surplus<span>2</span>Shelter</span></div><p>Food rescue infrastructure for local communities.</p><span>AMIHACKS 1.0 · Jaipur</span></div></footer>

      {emergencyMode && <div className="feature-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEmergencyMode(false)}><div className="feature-modal"><button className="feature-close" onClick={() => setEmergencyMode(false)}><Icon name="close" size={18}/></button><span className="feature-kicker">EMERGENCY RESCUE MODE</span><h2>Dispatch food before the clock runs out.</h2><p>{urgentDonations.length ? "These active donations are nearing their best-before time based on the details entered in the form." : "No active donation is currently in an urgent or critical expiry window."}</p><div className="emergency-list">{urgentDonations.length ? urgentDonations.map((item,i) => { const info = expiryInfo(item.bestBeforeTime); return <div key={item.id}><span className="emergency-index">0{i+1}</span><div><b>{item.foodName}</b><small>{item.selectedShelterName || "Awaiting match"} · {item.driverName || "No driver assigned"}</small></div><strong>{info.label}</strong></div>; }) : <div><span className="emergency-index">—</span><div><b>No urgent donations</b><small>Create a donation with a near-term best-before time to activate this system.</small></div><strong>Clear</strong></div>}</div>{urgentDonations.length > 0 && <button className="primary full" onClick={() => { setEmergencyDispatched(true); setEmergencyMode(false); flash("Nearest available driver dispatched to the urgent rescue."); }}>Dispatch nearest available driver <Icon name="arrow" size={14}/></button>}</div></div>}
{showHandoff && <div className="feature-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowHandoff(false)}><div className="feature-modal"><button className="feature-close" onClick={() => setShowHandoff(false)}><Icon name="close" size={18}/></button><span className="feature-kicker">HANDOFF VERIFICATION</span><h2>Confirm the shelter received the food.</h2><p>Use the demo receiver OTP <b>7249</b>, then optionally attach proof of delivery.</p><label className="otp-label">4-DIGIT RECEIVER OTP<input value={handoffOtp} onChange={(e) => setHandoffOtp(e.target.value.replace(/\D/g, "").slice(0,4))} inputMode="numeric" placeholder="7249" /></label><label className="proof-upload"><span>PROOF OF DELIVERY</span><input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />{proofFile ? <b>✓ {proofFile.name}</b> : <small>Optional · upload a handoff photo</small>}</label><button className="primary full" onClick={verifyHandoff}>Verify handoff <Icon name="check" size={14}/></button></div></div>}
{showReceipt && <div className="feature-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowReceipt(false)}><div className="feature-modal"><button className="feature-close" onClick={() => setShowReceipt(false)}><Icon name="close" size={18}/></button><span className="feature-kicker">DIGITAL RESCUE RECEIPT</span><h2>Rescue successfully completed.</h2><div className="receipt-grid"><div><small>RESCUE ID</small><b>S2S-{createdDonation?.id ? String(createdDonation.id).slice(-4) : "—"}</b></div><div><small>MEALS</small><b>{createdDonation?.meals || "—"}</b></div><div><small>RECEIVER</small><b>{selectedShelter?.name || "—"}</b></div><div><small>DRIVER</small><b>{driver.name}</b></div><div><small>ROUTE</small><b>{routeOptimized ? "Optimized route" : "Standard route"}</b></div><div><small>STATUS</small><b className="verified-text">✓ VERIFIED</b></div></div><div className="receipt-proof">{proofFile ? `Proof attached · ${proofFile.name}` : "OTP verified · digital handoff recorded"}</div></div></div>}

{toast && <div className="toast"><span><Icon name="check" size={14} /></span>{toast}</div>}

      {showNotifications && <button className="notification" onClick={() => setShowNotifications(false)}><span><Icon name="bell" size={15} /></span><div><b>Rescue intelligence</b><small>{emergencyDispatched ? "Urgent driver dispatched." : createdDonation && !selectedShelter ? "Donation waiting for an AI shelter match." : delivered && !handoffVerified ? "Handoff ready for OTP verification." : "Network operational · no critical alerts."}</small></div><Icon name="close" size={14} /></button>}

      {showDonate && <Modal onClose={() => setShowDonate(false)} title="Publish surplus food" kicker="NEW RESCUE JOB" text="Add the minimum information needed to move food into the rescue network."><form className="modal-form" onSubmit={createDonation}><label>Food name *<input name="foodName" value={donation.foodName} onChange={(e) => setDonation({ ...donation, foodName: e.target.value })} placeholder="e.g. Rice & dal" /></label><div className="two"><label>Category *<select name="category" value={donation.category} onChange={(e) => setDonation({ ...donation, category: e.target.value })}><option value="">Select</option><option>Cooked Food</option><option>Bakery</option><option>Fruits & Vegetables</option><option>Packaged Food</option></select></label><label>Meals *<input type="number" min="1" name="meals" value={donation.meals} onChange={(e) => setDonation({ ...donation, meals: e.target.value })} placeholder="50" /></label></div><div className="two"><label>Food type<input name="foodType" value={donation.foodType} onChange={(e) => setDonation({ ...donation, foodType: e.target.value })} placeholder="Vegetarian / mixed" /></label><label>Best before time *<input type="time" name="bestBeforeTime" value={donation.bestBeforeTime} onChange={(e) => setDonation({ ...donation, bestBeforeTime: e.target.value })} /></label></div><label>Pickup address *<input name="address" value={donation.address} onChange={(e) => setDonation({ ...donation, address: e.target.value })} placeholder="Area, landmark, Jaipur" /></label><label>Contact number<input name="contact" value={donation.contact} onChange={(e) => setDonation({ ...donation, contact: e.target.value })} placeholder="Optional" /></label><div className="form-bottom"><span><Icon name="shield" size={14} /> Details stay within the rescue workflow.</span><button className="primary" type="submit">Publish donation <Icon name="arrow" size={14} /></button></div></form></Modal>}

      {showMatch && <Modal onClose={() => setShowMatch(false)} title="Choose a shelter" kicker="SMART MATCH" text="Select the destination that best fits the available food and current need."><div className="modal-matches">{shelters.map((s) => <button key={s.name} className="modal-match" onClick={() => chooseShelter(s)}><span className="shelter-symbol"><Icon name="home" size={16} /></span><div><b>{s.name}</b><small>{s.location} · {s.distance} · needs {s.needs}</small></div><strong>{s.match}%</strong><Icon name="arrow" size={14} /></button>)}</div></Modal>}

      {showLogin && <RoleLoginModal role={loginRole} setRole={(role) => { setLoginRole(role); setLoginEmail(roleAccounts[role].email); setLoginPassword(roleAccounts[role].password); }} email={loginEmail} password={loginPassword} setEmail={setLoginEmail} setPassword={setLoginPassword} onClose={() => setShowLogin(false)} onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); setActiveRole(loginRole); setShowLogin(false); setRoleDashboardOpen(true); flash(`${roleAccounts[loginRole].label} dashboard opened.`); }} />}
    </div>
  );
}

function SectionTitle({ number, title, text, action }) {
  return <div className="section-title"><div><span>{number} /</span><h2>{title}</h2><p>{text}</p></div>{action}</div>;
}
function MiniCommand({ icon, value, label }) { return <div className="mini-command"><span><Icon name={icon} size={14} /></span><div><b>{value}</b><small>{label}</small></div></div>; }
function Fact({ label, value }) { return <div><small>{label}</small><b>{value}</b></div>; }
function WorkflowStep({ n, title, text, done }) { return <div className={done ? "workflow-step done" : "workflow-step"}><span>{n}</span><div><b>{title}</b><small>{text}</small></div><i><Icon name="check" size={12} /></i></div>; }
function Criterion({ label, value }) { return <div><span>{label}</span><b>{value}</b></div>; }
function DeliveryStep({ n, title, text, done }) { return <div className={done ? "delivery-step done" : "delivery-step"}><span>{n}</span><div><b>{title}</b><small>{text}</small></div><i><Icon name="check" size={11} /></i></div>; }
function Modal({ onClose, title, kicker, text, children }) { return <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal"><div className="modal-head"><div><span>{kicker}</span><h2>{title}</h2><p>{text}</p></div><button className="close" onClick={onClose}><Icon name="close" size={18} /></button></div>{children}</div></div>; }

function RoleLoginModal({ role, setRole, email, password, setEmail, setPassword, onClose, onSubmit }) {
  const roles = [["Admin","shield","Network overview"],["Donor","heart","Food contributions"],["Receiver","home","Shelter operations"],["Driver","truck","Delivery & route"]];
  return <div className="role-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="role-login-shell" onMouseDown={(e) => e.stopPropagation()}><div className="role-login-brand"><div className="role-brand-mark"><Icon name="heart" size={22}/></div><span className="role-login-kicker">SURPLUS2SHELTER · DEMO ACCESS</span><h2>Good food.<br/><em>A better destination.</em></h2><p>Choose a workspace to see the information that matters to that part of the rescue network.</p><div className="role-feature"><b>01</b><span>Role-specific workspace</span></div><div className="role-feature"><b>02</b><span>Connected rescue data</span></div><div className="role-feature"><b>03</b><span>Live demo workflow</span></div></div><div className="role-login-panel"><button className="role-close" type="button" onClick={onClose}><Icon name="close" size={17}/></button><span className="role-panel-kicker">SIGN IN</span><h3>Choose your workspace</h3><p className="role-panel-sub">Select a role and its demo credentials will fill automatically.</p><div className="role-picker-grid">{roles.map(([key,icon,sub]) => <button key={key} type="button" className={role===key?"role-choice active":"role-choice"} onClick={()=>setRole(key)}><span><Icon name={icon} size={14}/></span><b>{key}</b><small>{sub}</small><i>→</i></button>)}</div><form className="role-login-form" onSubmit={onSubmit}><label>Email / ID<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="text" value={password} onChange={e=>setPassword(e.target.value)}/></label><div className="demo-credentials"><span>DEMO</span><b>{email}</b><b>{password}</b></div><button className="role-login-submit" type="submit">Enter {role} Dashboard <Icon name="arrow" size={14}/></button></form></div></div></div>;
}

function RoleDashboard({ role, onClose, onLogout, driver, progress, eta, createdDonation, selectedShelter, delivered, donationQueue = [], handoffVerified, routeOptimized, onGoTracking, shelterRequests = [], onCreateRequest, onAcceptRequest, onAcceptDelivery, onDeclineDelivery, onDemoArrive, driverAccepted, driverDeclined, handoffOtp, setHandoffOtp, onVerifyHandoff, notifications = [], portalTab, setPortalTab }) {
  const [leaving, setLeaving] = useState(false);
  const exitDashboard = (action) => { if (leaving) return; setLeaving(true); window.setTimeout(action, 360); };
  const [requestForm, setRequestForm] = useState({ shelterName: "Hope Shelter", location: "Malviya Nagar", meals: "", foodType: "Rice & dal", neededBy: "", urgency: "Normal", notes: "" });
  const [requestOpen, setRequestOpen] = useState(false);
  const completed = donationQueue.filter((item) => item.handoffVerified);
  const active = donationQueue.filter((item) => !item.handoffVerified);
  const rescuedMeals = completed.reduce((sum, item) => sum + Number(item.meals || 0), 0);
  const activeMeals = active.reduce((sum, item) => sum + Number(item.meals || 0), 0);
  const currentMission = createdDonation;
  const driverJobs = donationQueue.filter((item) => item.selectedShelterName && !item.handoffVerified);
  const roleMeta = {
    Admin: ["Network command", "Control requests, donations, drivers and verified rescues."],
    Donor: ["Restaurant workspace", "Publish surplus and respond to live shelter requirements."],
    Receiver: ["Shelter workspace", "Create meal requirements and follow accepted deliveries."],
    Driver: ["Delivery workspace", "Accept a delivery, move the route and verify the handoff."],
  }[role];

  const submitRequest = (e) => { e.preventDefault(); onCreateRequest(requestForm); setRequestOpen(false); setRequestForm({ shelterName: "Hope Shelter", location: "Malviya Nagar", meals: "", foodType: "Rice & dal", neededBy: "", urgency: "Normal", notes: "" }); };
  const visibleNotifications = notifications.filter((n) => n.target === role || n.target === "Network" || n.target === "All");
  const goTab = (tab) => setPortalTab(tab);

  const renderHome = () => <>
    <div className="portal-hero-card"><div><span className="portal-kicker">{role.toUpperCase()} · LIVE WORKSPACE</span><h1>{roleMeta[0]}</h1><p>{roleMeta[1]}</p></div><div className="portal-live"><i /> NETWORK LIVE</div></div><div className="demo-banner"><b>DEMO NETWORK READY</b><span>Preloaded sample requests, delivery jobs and messages are shown until you create your own rescue. Your new form submissions are added to the same live workflow.</span></div>
    <div className="portal-action-grid">
      {role === "Admin" && <><PortalTile icon="shield" title="Live network" text="See every open request and active rescue." onClick={() => goTab("network")} /><PortalTile icon="bell" title="Messages" text={`${notifications.length} network updates`} onClick={() => goTab("messages")} /><PortalTile icon="truck" title="Deliveries" text={`${active.length} active rescue${active.length === 1 ? "" : "s"}`} onClick={() => goTab("deliveries")} /></>}
      {role === "Donor" && <><PortalTile icon="heart" title="Shelter requests" text={`${shelterRequests.filter((r) => r.status === "open").length} live request${shelterRequests.filter((r) => r.status === "open").length === 1 ? "" : "s"}`} onClick={() => goTab("requests")} /><PortalTile icon="plus" title="Publish surplus" text="Create a food donation for the network." onClick={() => goTab("donate")} /><PortalTile icon="route" title="My deliveries" text="Follow accepted food through handoff." onClick={() => goTab("deliveries")} /></>}
      {role === "Receiver" && <><PortalTile icon="plus" title="Create requirement" text="Tell nearby restaurants what your shelter needs." onClick={() => setRequestOpen(true)} /><PortalTile icon="home" title="My requests" text={`${shelterRequests.filter((r) => r.shelterName === "Hope Shelter").length} request${shelterRequests.filter((r) => r.shelterName === "Hope Shelter").length === 1 ? "" : "s"}`} onClick={() => goTab("requests")} /><PortalTile icon="truck" title="Incoming delivery" text={currentMission ? `${currentMission.meals} meals · ${eta}` : "No delivery assigned"} onClick={() => goTab("delivery")} /></>}
      {role === "Driver" && <><PortalTile icon="truck" title="Delivery requests" text={`${driverJobs.length} available rescue${driverJobs.length === 1 ? "" : "s"}`} onClick={() => goTab("requests")} /><PortalTile icon="route" title="Active route" text={currentMission ? `${progress}% complete` : "No active route"} onClick={() => goTab("delivery")} /><PortalTile icon="shield" title="OTP handoff" text={delivered ? "Receiver verification ready" : "Available after arrival"} onClick={() => goTab("handoff")} /></>}
    </div>
    <div className="portal-summary-grid"><PortalStat value={rescuedMeals} label="Meals rescued" /><PortalStat value={activeMeals} label="Meals in active rescue" /><PortalStat value={completed.length} label="Verified handoffs" /><PortalStat value={shelterRequests.filter((r) => r.status === "open").length} label="Open shelter requests" /></div>
    <div className="portal-recent"><div className="portal-section-head"><span>LIVE ACTIVITY</span><b>{visibleNotifications.length} updates · demo ready</b></div>{visibleNotifications.length ? visibleNotifications.slice(0,4).map((n) => <div className="portal-notice" key={n.id}><span><Icon name="bell" size={14}/></span><div><b>{n.message}</b><small>{n.target} · {n.time}</small></div></div>) : <div className="portal-empty">No activity yet. Create a requirement or donation to start the network.</div>}</div>
    {requestOpen && <div className="portal-inline-modal"><form onSubmit={submitRequest}><div className="portal-form-head"><div><span>NEW SHELTER REQUIREMENT</span><h2>What does the shelter need?</h2></div><button type="button" onClick={() => setRequestOpen(false)}>×</button></div><div className="portal-form-grid"><label>Shelter<select value={requestForm.shelterName} onChange={e => setRequestForm({...requestForm,shelterName:e.target.value})}>{shelters.map(s => <option key={s.name}>{s.name}</option>)}</select></label><label>Meals needed<input type="number" min="1" value={requestForm.meals} onChange={e => setRequestForm({...requestForm,meals:e.target.value})} placeholder="30" required /></label><label>Food type<input value={requestForm.foodType} onChange={e => setRequestForm({...requestForm,foodType:e.target.value})} /></label><label>Needed by<input type="time" value={requestForm.neededBy} onChange={e => setRequestForm({...requestForm,neededBy:e.target.value})} required /></label><label>Urgency<select value={requestForm.urgency} onChange={e => setRequestForm({...requestForm,urgency:e.target.value})}><option>Normal</option><option>Urgent</option><option>Critical</option></select></label><label>Notes<input value={requestForm.notes} onChange={e => setRequestForm({...requestForm,notes:e.target.value})} placeholder="Dietary or pickup notes" /></label></div><button className="portal-primary" type="submit">Publish live requirement <Icon name="arrow" size={14}/></button></form></div>}
  </>;

  const renderRequests = () => {
    if (role === "Receiver") return <PortalList title="My shelter requests" subtitle="Requests created by the shelter appear here with their live status." items={shelterRequests.filter(r => r.shelterName === "Hope Shelter")} render={(r) => <PortalRow key={r.id} icon="home" title={`${r.meals} meals · ${r.foodType}`} meta={`${r.shelterName} · needed by ${r.neededBy || "ASAP"}`} status={r.status === "accepted" ? `Accepted by ${r.donorName}` : "Waiting for donor"} />} />;
    if (role === "Donor") return <PortalList title="Live shelter requests" subtitle="Accept a requirement and it becomes a connected rescue mission." items={shelterRequests.filter(r => r.status === "open")} render={(r) => <PortalRow key={r.id} icon="home" title={`${r.shelterName} · ${r.meals} meals`} meta={`${r.foodType} · ${r.urgency} · ${r.location}${r.isDemo ? " · DEMO" : ""}`} status={<button className="portal-small-btn" onClick={() => onAcceptRequest(r)}>Accept & fulfil</button>} />} />;
    if (role === "Driver") return <PortalList title="Delivery requests" subtitle="Accept or decline before the route can start." items={driverJobs} render={(r) => <PortalRow key={r.id} icon="truck" title={`${r.meals} meals → ${r.selectedShelterName}`} meta={`${r.foodName} · pickup at ${r.address}${r.isDemo ? " · DEMO" : ""}`} status={r.id === currentMission?.id && driverAccepted ? "Accepted" : r.id === currentMission?.id && driverDeclined ? <button className="portal-small-btn" onClick={() => onAcceptDelivery(r)}>Reassign to me</button> : <div className="portal-dual"><button className="portal-small-btn" onClick={() => onAcceptDelivery(r)}>Accept</button><button className="portal-decline" onClick={() => onDeclineDelivery(r)}>Decline</button></div>} />} />;
    return <PortalList title="Network requests" subtitle="All current requirements and rescue jobs." items={shelterRequests} render={(r) => <PortalRow key={r.id} icon="home" title={`${r.shelterName} · ${r.meals} meals`} meta={`${r.foodType} · ${r.urgency}`} status={r.status} />} />;
  };

  const renderDelivery = () => <div className="portal-detail-grid"><div className="portal-detail-card"><span>ACTIVE RESCUE {currentMission?.isDemo ? "· DEMO" : ""}</span><h2>{currentMission ? `${currentMission.foodName} · ${currentMission.meals} meals` : "No active rescue"}</h2><p>{currentMission ? `${currentMission.address} → ${selectedShelter?.name || currentMission.selectedShelterName}` : "An accepted request will appear here."}</p><div className="portal-progress"><i style={{width:`${progress}%`}} /></div><strong>{progress}%</strong></div><div className="portal-detail-card"><span>STATUS</span><h2>{handoffVerified ? "Delivered & verified" : delivered ? "Arrived · OTP required" : driverAccepted ? "Driver accepted · ready to move" : selectedShelter ? "Waiting for driver" : "Waiting for match"}</h2><p>{eta === "—" ? "No ETA yet" : `ETA ${eta}`}</p>{role === "Driver" && currentMission && !delivered && <><button className="portal-primary" onClick={() => exitDashboard(onGoTracking)}>Open route</button><button className="portal-secondary-action" onClick={onDemoArrive}>Demo: mark arrived</button></>}{role === "Driver" && currentMission && delivered && <button className="portal-primary" onClick={() => goTab("handoff")}>Verify receiver OTP</button>}</div></div>;

  const handoffMission = currentMission?.delivered ? currentMission : (createdDonation ? currentMission : demoHandoffMission);
  const renderHandoff = () => <div className="portal-detail-card portal-handoff"><span>SECURE HANDOFF {handoffMission?.isDemo ? "· DEMO" : ""}</span><h2>{(createdDonation ? delivered : Boolean(handoffMission?.delivered)) ? "Receiver verification" : "OTP unlocks after arrival"}</h2><p>{(createdDonation ? delivered : Boolean(handoffMission?.delivered)) ? `Ask ${selectedShelter?.name || handoffMission?.selectedShelterName || "the receiver"} for the 4-digit OTP. Demo OTP: <b>7249</b>.` : "Complete the route first. The OTP step appears only after the driver arrives."}</p>{(createdDonation ? delivered : Boolean(handoffMission?.delivered)) && !handoffVerified && <div className="otp-row"><input inputMode="numeric" maxLength="4" value={handoffOtp} onChange={e => setHandoffOtp(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="7249"/><button className="portal-primary" onClick={onVerifyHandoff}>Verify OTP</button></div>}{handoffVerified && <div className="verified-box">✓ Handoff verified · {currentMission?.meals || handoffMission?.meals || 0} meals received</div>}</div>;

  return <main className={leaving ? "role-dashboard-page portal-page-leaving" : "role-dashboard-page"}><section className="section role-dashboard"><div className="role-dashboard-top"><div><span className="role-dashboard-kicker">SURPLUS2SHELTER · {role.toUpperCase()} PORTAL</span><h1>{roleMeta[0]}</h1><p>{roleMeta[1]}</p></div><div className="role-dashboard-actions"><button className="secondary" onClick={() => exitDashboard(onClose)}>Public overview</button><button className="reset" onClick={() => exitDashboard(onLogout)}>Sign out</button></div></div><div className="portal-nav">{["home",...(role === "Donor"?["requests","donate"]:role === "Receiver"?["requests"]:role === "Driver"?["requests","delivery","handoff"]:["network","deliveries"]),"messages"].map(tab => <button key={tab} className={portalTab===tab?"active":""} onClick={()=>goTab(tab)}>{tab === "home" ? "Overview" : tab === "requests" ? "Requests" : tab === "donate" ? "Publish surplus" : tab === "delivery" || tab === "deliveries" ? "Deliveries" : tab === "handoff" ? "OTP handoff" : tab === "network" ? "Live network" : "Messages"}</button>)}</div><div key={portalTab} className="portal-view-transition">{portalTab === "home" && renderHome()}{portalTab === "requests" && renderRequests()}{portalTab === "delivery" && renderDelivery()}{portalTab === "deliveries" && <PortalList title="Active deliveries" subtitle="One shared rescue state across donor, shelter, driver and admin." items={active} render={(r)=><PortalRow key={r.id} icon="truck" title={`${r.meals} meals · ${r.foodName}`} meta={`${r.selectedShelterName || "Awaiting match"} · ${r.driverName || "No driver"}`} status={r.handoffVerified ? "Verified" : r.deliveryStarted ? "Moving" : r.pickupAssigned ? "Driver accepted" : "Awaiting driver"} />} />}{portalTab === "network" && <PortalList title="Live network" subtitle="Requirements, accepted rescues and deliveries in one operational view." items={shelterRequests} render={(r)=><PortalRow key={r.id} icon="home" title={`${r.shelterName} · ${r.meals} meals`} meta={`${r.status} · ${r.donorName || "No donor yet"}${r.isDemo ? " · DEMO" : ""}`} status={r.donationId ? "Connected" : "Open"} />} />}{portalTab === "messages" && <PortalList title="Network messages" subtitle="Events generated by real actions in this session." items={visibleNotifications} render={(n)=><PortalRow key={n.id} icon="bell" title={n.message} meta={`${n.target} · ${n.time}${n.isDemo ? " · DEMO" : ""}`} status="Live" />} />}{portalTab === "handoff" && renderHandoff()}{portalTab === "donate" && <div className="portal-detail-card"><span>PUBLISH SURPLUS</span><h2>Create a donation from the public overview</h2><p>Use the main website donation form, then return here to follow the connected rescue.</p><button className="portal-primary" onClick={() => exitDashboard(onClose)}>Open public overview</button></div>}</div></section></main>;
}

function PortalTile({ icon, title, text, onClick }) { return <button className="portal-tile" onClick={onClick}><span><Icon name={icon} size={18}/></span><div><b>{title}</b><small>{text}</small></div><i>→</i></button>; }
function PortalStat({ value, label }) { return <div className="portal-stat"><strong>{value}</strong><span>{label}</span></div>; }
function PortalList({ title, subtitle, items, render }) { return <div className="portal-list"><div className="portal-section-head"><div><span>LIVE WORKSPACE</span><h2>{title}</h2><p>{subtitle}</p></div><b>{items.length}</b></div>{items.length ? items.map(render) : <div className="portal-empty">Nothing here yet. The list will update when another role creates a real request or rescue.</div>}</div>; }
function PortalRow({ icon, title, meta, status }) { return <div className="portal-row"><span className="portal-row-icon"><Icon name={icon} size={16}/></span><div><b>{title}</b><small>{meta}</small></div><strong>{status}</strong></div>; }

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#eef5ff;background:#060a12;font-synthesis:none;text-rendering:optimizeLegibility;--bg:#060a12;--surface:#0d1420;--surface2:#111a29;--line:rgba(255,255,255,.075);--text:#eef5ff;--muted:#8190a5;--dim:#56657a;--cyan:#00dfc0;--purple:#7869ff;--orange:#ff8a4c;--green:#36d49b}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-width:320px;background:var(--bg);color:var(--text)}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid rgba(0,223,192,.5);outline-offset:2px}
.app{min-height:100vh;overflow:hidden;background:radial-gradient(circle at 10% 8%,rgba(0,223,192,.055),transparent 25%),radial-gradient(circle at 90% 20%,rgba(120,105,255,.07),transparent 27%),linear-gradient(180deg,#060a12,#070c15 55%,#060a12)}
.section{width:min(1180px,calc(100% - 40px));margin:auto;position:relative;z-index:2}.nav{height:72px;position:sticky;top:0;z-index:100;background:rgba(6,10,18,.82);backdrop-filter:blur(20px);border-bottom:1px solid var(--line)}.nav-inner{height:100%;width:min(1180px,calc(100% - 40px));margin:auto;display:flex;align-items:center;gap:28px}.logo{border:0;background:none;color:#f3f7ff;display:flex;align-items:center;gap:10px;font-size:15px;font-weight:850;letter-spacing:-.03em;padding:0}.logo>span:last-child>span{color:var(--cyan)}.logo-box{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;color:#03100d;background:var(--cyan);box-shadow:0 0 25px rgba(0,223,192,.16)}.nav-links{display:flex;align-items:center;gap:2px;flex:1;margin-left:20px}.nav-item{border:0;background:none;color:#75849a;font-size:11px;font-weight:750;padding:10px 13px;border-radius:8px;position:relative}.nav-item:hover{color:#fff;background:rgba(255,255,255,.035)}.nav-item.active{color:#fff}.nav-item.active:after{content:"";position:absolute;left:13px;right:13px;bottom:2px;height:2px;background:var(--cyan);border-radius:4px}.nav-right{display:flex;align-items:center;gap:8px}.nav-icon,.hamburger{width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:9px;color:#8290a4;position:relative}.nav-icon i{position:absolute;right:8px;top:8px;width:4px;height:4px;border-radius:50%;background:var(--orange)}.account{height:39px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:#b4c0d0;border-radius:10px;padding:0 10px 0 6px;display:flex;align-items:center;gap:8px;font-size:10px}.account span{width:27px;height:27px;display:grid;place-items:center;border-radius:7px;background:rgba(0,223,192,.09);color:var(--cyan)}.account b{font-weight:750}.hamburger{display:none}
.hero{min-height:690px;padding-top:88px;padding-bottom:80px;display:grid;grid-template-columns:1.03fr .97fr;gap:65px;align-items:center}.eyebrow{display:flex;align-items:center;gap:8px;color:var(--cyan);font-size:8px;font-weight:900;letter-spacing:.17em}.eyebrow>span{width:7px;height:7px;border-radius:50%;background:var(--cyan);box-shadow:0 0 12px rgba(0,223,192,.8)}.hero-kicker{width:max-content;display:flex;align-items:center;gap:7px;margin-top:22px;padding:7px 9px;border:1px solid rgba(120,105,255,.16);border-radius:999px;color:#aaa3ff;background:rgba(120,105,255,.055);font-size:8px;font-weight:800}.hero h1{margin:18px 0 20px;font-size:clamp(48px,6vw,78px);line-height:.94;letter-spacing:-.065em;color:#f1f7ff}.hero h1 em{display:block;color:var(--cyan);font-style:normal}.hero-left>p{max-width:590px;margin:0;color:#8190a5;font-size:15px;line-height:1.78}.hero-buttons{display:flex;gap:9px;margin-top:29px;flex-wrap:wrap}.primary,.secondary,.reset{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 15px;border-radius:9px;font-size:10px;font-weight:850;transition:.18s ease}.primary{border:1px solid var(--cyan);background:var(--cyan);color:#02100d;box-shadow:0 12px 30px rgba(0,223,192,.12)}.primary:hover{transform:translateY(-1px);background:#2be9cf}.secondary{border:1px solid var(--line);background:rgba(255,255,255,.03);color:#d4deec}.secondary:hover{border-color:rgba(0,223,192,.25);background:rgba(0,223,192,.045)}.reset{border:0;background:none;color:#68778d}.primary.small{min-height:38px}.primary.full{width:100%}.hero-proof{display:flex;gap:18px;flex-wrap:wrap;margin-top:26px}.hero-proof span{display:flex;align-items:center;gap:6px;color:#65748a;font-size:9px;font-weight:700}.hero-proof svg{color:#8392a7}
.command-card{padding:17px;border:1px solid var(--line);border-radius:19px;background:linear-gradient(145deg,rgba(17,27,42,.92),rgba(9,15,25,.94));box-shadow:0 28px 75px rgba(0,0,0,.28)}.command-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:4px 4px 15px}.command-head small,.board-label span,.workflow-head span,.tracking-status small,.map-zone-head small,.impact-tile small,.final-cta>div>span{color:#5e6d83;font-size:7px;font-weight:900;letter-spacing:.15em}.command-head h2{margin:5px 0 0;font-size:17px;letter-spacing:-.03em}.online{display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid rgba(0,223,192,.14);border-radius:999px;color:var(--cyan);font-size:7px;font-weight:900}.online i,.green-dot{width:5px;height:5px;border-radius:50%;background:var(--cyan);box-shadow:0 0 9px rgba(0,223,192,.6)}.priority-card{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:11px;padding:14px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:rgba(255,255,255,.025)}.priority-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;color:var(--cyan);background:rgba(0,223,192,.07)}.priority-copy span{color:#5f6e84;font-size:7px;font-weight:900;letter-spacing:.13em}.priority-copy strong{display:block;margin-top:3px;color:#eaf2ff;font-size:12px}.priority-copy p{margin:3px 0 0;color:#6e7c90;font-size:8px}.priority-card button{border:0;background:none;color:var(--cyan);font-size:8px;font-weight:850;display:flex;align-items:center;gap:5px}.command-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}.mini-command{display:flex;align-items:center;gap:9px;padding:12px;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(255,255,255,.018)}.mini-command>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;color:#a69fff;background:rgba(120,105,255,.08)}.mini-command b,.mini-command small{display:block}.mini-command b{font-size:13px}.mini-command small{margin-top:2px;color:#65748a;font-size:7px}.command-footer{display:flex;justify-content:space-between;align-items:center;margin-top:11px;padding:0 3px}.command-footer span{display:flex;align-items:center;gap:6px;color:#637188;font-size:8px}.command-footer button{border:0;background:none;color:#7e8b9e;font-size:8px;display:flex;align-items:center;gap:5px}
.ticker{display:grid;grid-template-columns:repeat(4,1fr) 1.4fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:21px 0}.ticker>div{padding:0 22px;border-right:1px solid var(--line)}.ticker>div:first-child{padding-left:0}.ticker>div:nth-child(4){border-right:1px solid var(--line)}.ticker b,.ticker span{display:block}.ticker b{font-size:21px;letter-spacing:-.03em}.ticker span{margin-top:3px;color:#66758a;font-size:8px;font-weight:700}.ticker-note{display:flex;align-items:center;justify-content:center;gap:7px;color:var(--cyan);font-size:8px;font-weight:800}.content{padding-top:115px;scroll-margin-top:85px}.section-title{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:31px}.section-title>div>span{color:var(--cyan);font-size:8px;font-weight:900;letter-spacing:.15em}.section-title h2{margin:8px 0 10px;font-size:38px;line-height:1.04;letter-spacing:-.05em}.section-title p{max-width:690px;margin:0;color:#78879c;font-size:12px;line-height:1.75}
.board-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:14px}.board-main,.workflow,.shelter-list,.match-explainer,.tracking-shell,.impact-bottom{border:1px solid var(--line);border-radius:16px;background:rgba(13,20,32,.78);box-shadow:0 18px 50px rgba(0,0,0,.12)}.board-main{padding:22px}.board-label,.workflow-head{display:flex;justify-content:space-between;align-items:center}.board-label b,.workflow-head b{color:#67768b;font-size:7px;letter-spacing:.1em}.rescue-job{margin-top:17px;padding:18px;border:1px solid rgba(0,223,192,.12);border-radius:13px;background:linear-gradient(135deg,rgba(0,223,192,.035),rgba(120,105,255,.025))}.job-top{display:flex;align-items:center;justify-content:space-between;gap:15px}.job-type{display:flex;align-items:center;gap:11px}.food-dot{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:rgba(255,138,76,.08);font-size:20px}.job-type small{color:#607086;font-size:7px;font-weight:900;letter-spacing:.13em}.job-type h3{margin:4px 0 0;font-size:16px}.job-status{padding:6px 8px;border:1px solid rgba(0,223,192,.15);border-radius:999px;color:var(--cyan);background:rgba(0,223,192,.05);font-size:7px;font-weight:900}.job-facts{display:grid;grid-template-columns:repeat(4,1fr);margin-top:20px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.job-facts>div{padding:13px 10px;border-right:1px solid var(--line)}.job-facts>div:first-child{padding-left:0}.job-facts>div:last-child{border-right:0}.job-facts small,.job-facts b{display:block}.job-facts small{color:#5e6d82;font-size:7px}.job-facts b{margin-top:4px;color:#bcc9d9;font-size:9px;overflow-wrap:anywhere}.job-bottom{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;margin-top:17px}.mini-progress{height:4px;border-radius:8px;background:rgba(255,255,255,.07);overflow:hidden}.mini-progress span{display:block;height:100%;border-radius:8px;background:var(--cyan)}.job-bottom>span{color:#65748a;font-size:7px}.job-bottom button{border:0;background:none;color:var(--cyan);font-size:8px;font-weight:850;display:flex;align-items:center;gap:5px}.empty-board{text-align:center;padding:65px 20px 45px}.empty-ring{width:48px;height:48px;margin:auto;display:grid;place-items:center;border:1px solid rgba(0,223,192,.14);border-radius:50%;color:var(--cyan);background:rgba(0,223,192,.05)}.empty-board h3{margin:13px 0 7px;font-size:14px}.empty-board p{max-width:350px;margin:0 auto 18px;color:#68778d;font-size:9px;line-height:1.7}.workflow{padding:22px}.workflow-step{display:grid;grid-template-columns:30px 1fr 20px;align-items:center;gap:9px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.05)}.workflow-step:last-child{border-bottom:0}.workflow-step>span{color:#435166;font-size:9px;font-weight:900}.workflow-step b,.workflow-step small{display:block}.workflow-step b{font-size:10px;color:#b7c4d5}.workflow-step small{margin-top:3px;color:#65748a;font-size:8px}.workflow-step i{width:20px;height:20px;display:grid;place-items:center;border-radius:6px;color:#47556a;background:rgba(255,255,255,.035);font-style:normal}.workflow-step.done>span,.workflow-step.done i{color:var(--cyan)}.workflow-step.done i{background:rgba(0,223,192,.07)}
.shelter-layout{display:grid;grid-template-columns:1.35fr .65fr;gap:14px}.shelter-list{padding:7px}.shelter-row{width:100%;display:grid;grid-template-columns:28px 40px 1fr 60px 60px 18px;align-items:center;gap:11px;padding:13px 10px;border:1px solid transparent;border-radius:11px;background:transparent;color:#eaf2ff;text-align:left}.shelter-row:hover{background:rgba(255,255,255,.025);border-color:var(--line)}.shelter-row.selected{background:rgba(0,223,192,.045);border-color:rgba(0,223,192,.18)}.shelter-index{color:#465469;font-size:8px;font-weight:900}.shelter-symbol{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;color:var(--cyan);background:rgba(0,223,192,.06)}.shelter-info strong,.shelter-info small,.need small,.need b,.match small,.match b{display:block}.shelter-info strong{font-size:10px}.shelter-info small{margin-top:3px;color:#68778d;font-size:8px}.need small,.match small{color:#4f5e73;font-size:6px;font-weight:900;letter-spacing:.1em}.need b,.match b{margin-top:3px;font-size:9px}.match b{color:var(--cyan)}.row-arrow{color:#506077}.match-explainer{padding:23px}.explainer-top{display:flex;align-items:center;gap:12px}.match-ring{width:55px;height:55px;display:grid;place-items:center;border:1px solid rgba(0,223,192,.2);border-radius:50%;color:var(--cyan);background:rgba(0,223,192,.05);font-size:13px;font-weight:900}.explainer-top small{color:#5f6e84;font-size:7px;font-weight:900;letter-spacing:.12em}.explainer-top h3{margin:5px 0 0;font-size:15px}.match-explainer>p{margin:18px 0;color:#728197;font-size:9px;line-height:1.7}.criteria{border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:17px}.criteria>div{display:flex;justify-content:space-between;padding:11px 0}.criteria>div+div{border-top:1px solid rgba(255,255,255,.045)}.criteria span{color:#5e6d82;font-size:8px}.criteria b{color:#bdc9d8;font-size:8px}
.tracking-section{padding-top:120px}.tracking-shell{display:grid;grid-template-columns:.78fr 1.22fr;overflow:hidden}.tracking-side{padding:24px;border-right:1px solid var(--line)}.tracking-status{display:flex;align-items:center;gap:9px}.status-dot{width:8px;height:8px;border-radius:50%;background:#48566a}.status-dot.live{background:var(--cyan);box-shadow:0 0 13px rgba(0,223,192,.7)}.status-dot.done{background:var(--green)}.tracking-status strong,.tracking-status small{display:block}.tracking-status strong{margin-top:4px;font-size:13px}.route-summary{display:grid;grid-template-columns:1fr 18px 1fr;align-items:center;gap:8px;margin:20px 0;padding:14px;border:1px solid var(--line);border-radius:11px;background:rgba(255,255,255,.02)}.route-summary small{display:block;color:#59687d;font-size:6px;font-weight:900;letter-spacing:.1em}.route-summary strong{display:block;margin-top:4px;color:#aebccd;font-size:8px;overflow-wrap:anywhere}.route-summary>svg{color:#65748a}.eta-panel{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:8px}.eta-panel>div{padding:13px 8px;border-right:1px solid var(--line)}.eta-panel>div:last-child{border-right:0}.eta-panel small,.eta-panel b{display:block}.eta-panel small{color:#59687d;font-size:6px;font-weight:900;letter-spacing:.1em}.eta-panel b{margin-top:4px;font-size:13px}.delivery-steps{margin-top:5px}.delivery-step{display:grid;grid-template-columns:25px 1fr 18px;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.045)}.delivery-step>span{color:#445267;font-size:7px;font-weight:900}.delivery-step b,.delivery-step small{display:block}.delivery-step b{font-size:9px;color:#9eacbe}.delivery-step small{margin-top:2px;color:#5e6d82;font-size:7px}.delivery-step i{width:18px;height:18px;display:grid;place-items:center;border-radius:6px;color:#455369;background:rgba(255,255,255,.03);font-style:normal}.delivery-step.done>span,.delivery-step.done i{color:var(--cyan)}.tracking-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px}.map-zone{padding:14px}.map-zone-head{display:flex;justify-content:space-between;align-items:center;padding:3px 4px 11px}.map-zone-head strong{display:block;margin-top:4px;font-size:14px}.map-zone-head>span{display:flex;align-items:center;gap:6px;color:#68778d;font-size:7px;font-weight:900}.map-zone-head>span i{width:5px;height:5px;border-radius:50%;background:var(--cyan)}.map-wrap{height:535px;position:relative;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#dfe7e9}.delivery-map{height:100%;width:100%}.map-overlay{position:absolute;z-index:500;left:13px;bottom:13px;display:flex;align-items:center;gap:8px;padding:9px 11px;border:1px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(6,11,19,.92);box-shadow:0 15px 35px rgba(0,0,0,.25);backdrop-filter:blur(10px);color:var(--cyan)}.map-overlay>div b,.map-overlay>div small{display:block}.map-overlay>div b{color:#eaf3ff;font-size:9px}.map-overlay>div small{margin-top:2px;color:#68778d;font-size:7px}.map-legend{display:flex;gap:16px;padding:10px 3px 0}.map-legend span{display:flex;align-items:center;gap:5px;color:#617087;font-size:7px}.map-legend i{display:inline-block;width:6px;height:6px;border-radius:50%}.map-legend .pickup{background:var(--orange)}.map-legend .driver{background:var(--purple)}.map-legend .shelter{background:var(--cyan)}.map-legend .line{width:15px;height:3px;border-radius:4px;background:var(--cyan)}
.impact-section{padding-top:120px}.impact-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.impact-tile{padding:20px;border:1px solid var(--line);border-radius:14px;background:rgba(13,20,32,.78)}.impact-icon{width:33px;height:33px;display:grid;place-items:center;border-radius:9px;color:var(--cyan);background:rgba(0,223,192,.06)}.impact-tile strong{display:block;margin-top:21px;font-size:25px;letter-spacing:-.04em}.impact-tile p{margin:4px 0 0;color:#728197;font-size:9px}.impact-tile small{display:block;margin-top:14px;color:var(--cyan);font-size:7px;letter-spacing:0}.impact-bottom{display:grid;grid-template-columns:180px 1fr auto;align-items:center;gap:30px;margin-top:13px;padding:22px}.impact-bottom small{color:#5e6d82;font-size:7px;font-weight:900;letter-spacing:.13em}.impact-bottom strong{display:block;margin-top:5px;font-size:27px}.impact-bottom p{margin:4px 0 0;color:#65748a;font-size:8px}.big-meter{height:6px;border-radius:8px;background:rgba(255,255,255,.06);overflow:hidden}.big-meter span{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,var(--cyan),var(--purple))}.final-cta{margin-top:110px;margin-bottom:75px;padding:32px 36px;border:1px solid var(--line);border-radius:17px;display:flex;align-items:center;justify-content:space-between;gap:25px;background:linear-gradient(110deg,rgba(0,223,192,.045),rgba(120,105,255,.045))}.final-cta h2{margin:8px 0 0;font-size:28px;letter-spacing:-.04em}.final-cta>div>span{color:var(--cyan)}footer{border-top:1px solid var(--line)}.footer-inner{width:min(1180px,calc(100% - 40px));min-height:82px;margin:auto;display:flex;align-items:center;gap:20px;color:#55647a;font-size:8px}.footer-inner .logo{font-size:11px}.footer-inner .logo-box{width:28px;height:28px;border-radius:8px}.footer-inner p{flex:1}
.backdrop{position:fixed;inset:0;z-index:900;display:grid;place-items:center;padding:20px;background:rgba(2,5,10,.75);backdrop-filter:blur(13px)}.modal{width:min(610px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:24px;border:1px solid rgba(255,255,255,.11);border-radius:17px;background:linear-gradient(145deg,#111a29,#09101b);box-shadow:0 40px 100px rgba(0,0,0,.55)}.modal-head{display:flex;justify-content:space-between;gap:20px;margin-bottom:22px}.modal-head>div>span{color:var(--cyan);font-size:7px;font-weight:900;letter-spacing:.15em}.modal-head h2{margin:6px 0;font-size:24px;letter-spacing:-.04em}.modal-head p{margin:0;color:#718096;font-size:9px}.close{width:35px;height:35px;display:grid;place-items:center;border:1px solid var(--line);border-radius:9px;color:#7f8da1;background:rgba(255,255,255,.025)}.modal-form{display:flex;flex-direction:column;gap:12px}.modal-form label{display:flex;flex-direction:column;gap:6px;color:#7e8da2;font-size:8px;font-weight:800}.modal-form input,.modal-form select{height:42px;padding:0 11px;border:1px solid var(--line);border-radius:8px;background:#080f19;color:#eaf2ff;font-size:10px}.modal-form input::placeholder{color:#4f5e73}.two{display:grid;grid-template-columns:1fr 1fr;gap:11px}.form-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:14px;margin-top:4px;border-top:1px solid var(--line)}.form-bottom span{display:flex;align-items:center;gap:6px;color:#5e6d82;font-size:7px}.modal-matches{display:flex;flex-direction:column;gap:7px}.modal-match{width:100%;display:grid;grid-template-columns:38px 1fr auto 15px;align-items:center;gap:10px;padding:11px;border:1px solid var(--line);border-radius:10px;text-align:left;color:#eaf2ff;background:rgba(255,255,255,.025)}.modal-match:hover{border-color:rgba(0,223,192,.25);background:rgba(0,223,192,.035)}.modal-match b,.modal-match small{display:block}.modal-match b{font-size:10px}.modal-match small{margin-top:3px;color:#66758a;font-size:7px}.modal-match>strong{color:var(--cyan);font-size:9px}.toast{position:fixed;right:20px;bottom:20px;z-index:1000;max-width:370px;display:flex;align-items:center;gap:8px;padding:11px 13px;border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#eef5ff;background:#111b2a;box-shadow:0 20px 50px rgba(0,0,0,.45);font-size:9px}.toast>span{width:22px;height:22px;display:grid;place-items:center;border-radius:6px;color:#02100d;background:var(--cyan)}.notification{position:fixed;right:20px;top:82px;z-index:800;width:min(310px,calc(100% - 40px));display:grid;grid-template-columns:30px 1fr 14px;align-items:start;gap:8px;padding:11px;border:1px solid var(--line);border-radius:11px;background:#101927;color:#eaf2ff;box-shadow:0 20px 60px rgba(0,0,0,.4);text-align:left}.notification>span{width:29px;height:29px;display:grid;place-items:center;border-radius:7px;color:var(--cyan);background:rgba(0,223,192,.06)}.notification b,.notification small{display:block}.notification b{font-size:9px}.notification small{margin-top:3px;color:#6b7a90;font-size:7px}.leaflet-control-attribution{font-size:7px!important}.leaflet-control-zoom a{background:#101827!important;color:#e7eff9!important;border-color:rgba(255,255,255,.1)!important}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#101827;color:#eef5ff}.leaflet-popup-content{font-size:10px}
@media(max-width:1050px){.hero{grid-template-columns:1fr;gap:40px;padding-top:65px}.hero-right{max-width:760px}.board-grid,.shelter-layout,.tracking-shell{grid-template-columns:1fr}.tracking-side{border-right:0;border-bottom:1px solid var(--line)}.map-wrap{height:470px}.impact-grid{grid-template-columns:1fr 1fr}.impact-bottom{grid-template-columns:1fr}.nav-links{margin-left:5px}}
@media(max-width:720px){.section,.nav-inner,.footer-inner{width:calc(100% - 24px)}.nav{height:64px}.nav-inner{gap:10px}.nav-links{position:absolute;display:none;left:12px;right:12px;top:64px;flex-direction:column;margin:0;padding:8px;border:1px solid var(--line);border-radius:12px;background:rgba(7,12,20,.98);box-shadow:0 25px 70px rgba(0,0,0,.45)}.nav-links.open{display:flex}.nav-item{width:100%;text-align:left}.nav-item.active:after{display:none}.account b{display:none}.hamburger{display:grid}.hero{padding-top:52px;padding-bottom:55px}.hero h1{font-size:48px}.hero-left>p{font-size:13px}.hero-buttons{flex-direction:column}.hero-buttons button{width:100%}.hero-proof{gap:10px 14px}.ticker{grid-template-columns:1fr 1fr;gap:0}.ticker>div{padding:14px 10px;border-bottom:1px solid var(--line)}.ticker>div:first-child{padding-left:0}.ticker>div:nth-child(2){border-right:0}.ticker>div:nth-child(3){padding-left:0}.ticker>div:nth-child(4){border-right:0}.ticker-note{grid-column:1/-1;padding-top:15px}.content{padding-top:80px}.section-title{align-items:flex-start;flex-direction:column}.section-title h2{font-size:30px}.job-facts{grid-template-columns:1fr 1fr}.job-facts>div:nth-child(2){border-right:0}.job-facts>div:nth-child(3),.job-facts>div:nth-child(4){border-top:1px solid var(--line)}.job-bottom{grid-template-columns:1fr}.job-bottom button{justify-self:start}.shelter-row{grid-template-columns:24px 36px 1fr 50px 18px}.need{display:none}.shelter-symbol{width:34px;height:34px}.match-explainer{padding:18px}.map-wrap{height:390px}.map-legend{flex-wrap:wrap;gap:10px}.tracking-actions{flex-direction:column}.tracking-actions .primary,.tracking-actions .secondary,.tracking-actions .reset{width:100%}.impact-grid{grid-template-columns:1fr 1fr}.impact-bottom{gap:18px}.final-cta{margin-top:80px;padding:25px;align-items:flex-start;flex-direction:column}.final-cta .primary{width:100%}.footer-inner{padding:20px 0;flex-wrap:wrap}.footer-inner p{order:3;flex-basis:100%}.two{grid-template-columns:1fr}.form-bottom{flex-direction:column;align-items:stretch}.form-bottom .primary{width:100%}}
@media(max-width:420px){.hero h1{font-size:42px}.command-grid{grid-template-columns:1fr}.impact-grid{grid-template-columns:1fr}.ticker{grid-template-columns:1fr}.ticker>div{border-right:0!important;padding-left:0!important}.ticker-note{grid-column:auto}.hero-kicker{font-size:7px}.map-overlay{left:8px;bottom:8px}}
/* ===== POLISHED HUMAN / GLOSSY THEME ===== */
:root{--bg:#f4f0e7;--surface:#fffdf8;--surface2:#f8f4ec;--line:rgba(44,58,47,.13);--text:#203026;--muted:#69756c;--dim:#899189;--cyan:#527a5b;--purple:#9a6a45;--orange:#d17a45;--green:#527a5b}
body{background:#f4f0e7;color:var(--text)}
.app{background:radial-gradient(circle at 8% 0%,rgba(82,122,91,.13),transparent 24%),radial-gradient(circle at 94% 10%,rgba(209,122,69,.10),transparent 22%),linear-gradient(180deg,#f8f5ed 0%,#f1ede3 48%,#f7f3eb 100%);position:relative}
.app:before{content:"";position:fixed;inset:-20%;pointer-events:none;z-index:0;background:radial-gradient(circle at 25% 20%,rgba(255,255,255,.7),transparent 18%),radial-gradient(circle at 78% 64%,rgba(255,255,255,.55),transparent 20%);filter:blur(24px)}
.nav{background:rgba(248,245,237,.78);border-bottom:1px solid rgba(44,58,47,.10);box-shadow:0 8px 35px rgba(54,61,48,.06)}
.logo{color:#243429}.logo-box{background:#527a5b;color:#fff;box-shadow:0 8px 20px rgba(82,122,91,.22)}.logo>span:last-child>span{color:#a35f37}
.nav-item{color:#778177}.nav-item:hover{color:#243429;background:rgba(82,122,91,.07)}.nav-item.active{color:#243429}.nav-item.active:after{background:#527a5b}.nav-icon,.hamburger,.account{border-color:rgba(44,58,47,.12);background:rgba(255,255,255,.56);color:#68736a;box-shadow:0 4px 15px rgba(44,58,47,.04)}.account{color:#526056}.account span{background:#e7efe7;color:#527a5b}.nav-icon i{background:#d17a45}
.hero{min-height:720px}.eyebrow{color:#527a5b}.eyebrow>span{background:#527a5b;box-shadow:0 0 12px rgba(82,122,91,.5)}.hero-kicker{border-color:rgba(82,122,91,.16);color:#527a5b;background:rgba(82,122,91,.08)}.hero h1{color:#223228}.hero h1 em{color:#527a5b}.hero-left>p{color:#6b756d}.hero-proof span{color:#758078}.hero-proof svg{color:#527a5b}
.primary{border-color:#527a5b;background:#527a5b;color:#fff;box-shadow:0 12px 26px rgba(82,122,91,.17)}.primary:hover{background:#638b6b}.secondary{border-color:rgba(44,58,47,.13);background:rgba(255,255,255,.55);color:#314137;box-shadow:0 6px 20px rgba(44,58,47,.04)}.secondary:hover{border-color:rgba(82,122,91,.28);background:#fff}.reset{color:#778177}
.command-card,.rescue-job,.workflow,.shelter-list,.match-explainer,.tracking-shell,.impact-tile,.impact-bottom,.final-cta{background:rgba(255,253,248,.72);border-color:rgba(44,58,47,.12);box-shadow:0 18px 55px rgba(56,63,50,.08),inset 0 1px 0 rgba(255,255,255,.95);backdrop-filter:blur(18px)}
.command-card{border-radius:24px}.command-head h2,.priority-copy strong,.section-title h2,.final-cta h2{color:#26372c}.command-head small,.board-label span,.workflow-head span,.tracking-status small,.map-zone-head small,.impact-tile small,.final-cta>div>span{color:#7c877e}.online{border-color:rgba(82,122,91,.18);color:#527a5b}.online i,.green-dot{background:#527a5b;box-shadow:0 0 9px rgba(82,122,91,.45)}.priority-card,.mini-command{border-color:rgba(44,58,47,.09);background:rgba(255,255,255,.58)}.priority-icon{color:#527a5b;background:#edf3ed}.priority-copy span,.mini-command small,.command-footer span{color:#7a857d}.mini-command>span{color:#9a6a45;background:#f5ebe3}.command-footer button{color:#657168}
.ticker{border-color:rgba(44,58,47,.11)}.ticker>div{border-color:rgba(44,58,47,.10)}.ticker b{color:#26372c}.ticker span{color:#7b857d}.ticker-note{color:#527a5b}
.content{scroll-margin-top:90px}.section-title>div>span{color:#527a5b}.section-title p{color:#707a72}.board-label b,.workflow-head b{color:#527a5b}.empty-board{background:rgba(255,255,255,.45);border:1px dashed rgba(44,58,47,.16)}
.rescue-job{border-radius:20px}.job-type h3,.job-facts b,.workflow-step b,.shelter-info strong,.match-explainer h3,.tracking-status strong,.route-summary strong,.delivery-step b,.map-zone-head strong,.impact-tile strong,.impact-bottom strong{color:#26372c}.job-status{background:#edf3ed;color:#527a5b;border-color:rgba(82,122,91,.14)}.job-facts>div{border-color:rgba(44,58,47,.08)}.job-facts small,.job-bottom>span,.workflow-step small,.shelter-info small,.need small,.match small,.criteria span,.tracking-status small,.route-summary small,.eta-panel small,.delivery-step small,.impact-tile p,.impact-bottom p{color:#7d877f}.mini-progress,.big-meter{background:rgba(44,58,47,.08)}.mini-progress span,.big-meter span{background:linear-gradient(90deg,#527a5b,#8da46f)}
.workflow-step{border-color:rgba(44,58,47,.08)}.workflow-step>span{color:#8c958e}.workflow-step i{background:#f0f3ef;color:#8b958d}.workflow-step.done>span,.workflow-step.done i{color:#527a5b}
.shelter-list{padding:9px;border-radius:22px}.shelter-row{background:rgba(255,255,255,.54);border:1px solid transparent;border-radius:17px;transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s,border-color .28s,background .28s}.shelter-row:hover{transform:translateX(5px);background:#fffdf9;border-color:rgba(82,122,91,.16);box-shadow:0 12px 30px rgba(57,68,56,.08)}.shelter-row.selected{background:#eef4ee;border-color:rgba(82,122,91,.22);box-shadow:0 14px 34px rgba(82,122,91,.10)}.shelter-symbol{color:#527a5b;background:#edf3ed}.shelter-index{color:#9aa29b}.shelter-info em{display:flex;align-items:center;gap:5px;margin-top:5px;color:#8b7465;font-size:8px;font-style:normal}.shelter-info em i{width:5px;height:5px;border-radius:50%;background:#d17a45}.need,.match{border-color:rgba(44,58,47,.08)}.need b,.match b{color:#527a5b}.row-arrow{color:#849087}.accept-btn{min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:1px solid rgba(82,122,91,.18);border-radius:10px;background:#f4f7f2;color:#527a5b;font-size:8px;font-weight:900;transition:.25s}.accept-btn:hover{background:#527a5b;color:#fff;transform:translateY(-2px);box-shadow:0 8px 18px rgba(82,122,91,.16)}.shelter-row.selected .accept-btn{background:#527a5b;color:#fff}
.match-explainer{border-radius:22px}.match-ring{border-color:rgba(82,122,91,.18);color:#527a5b;background:#eef4ee}.match-explainer p{color:#707a72}.criteria{border-color:rgba(44,58,47,.09)}.criteria div{border-color:rgba(44,58,47,.08)}.criteria b{color:#34453a}
.tracking-shell{border-radius:24px}.tracking-side{border-color:rgba(44,58,47,.09)}.status-dot{background:#c2c9c2}.status-dot.live{background:#d17a45;box-shadow:0 0 0 5px rgba(209,122,69,.12)}.status-dot.done{background:#527a5b;box-shadow:0 0 0 5px rgba(82,122,91,.11)}.route-summary{background:rgba(255,255,255,.52);border-color:rgba(44,58,47,.08)}.route-summary>svg{color:#527a5b}.eta-panel{border-color:rgba(44,58,47,.08)}.eta-panel div{border-color:rgba(44,58,47,.08)}.eta-panel b{color:#527a5b}.delivery-step{border-color:rgba(44,58,47,.08)}.delivery-step>span{color:#a0a7a1}.delivery-step i{color:#9aa29b;background:#f0f2ef}.delivery-step.done>span,.delivery-step.done i{color:#527a5b}.tracking-actions{margin-top:14px}
.driver-card{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;padding:11px;border:1px solid rgba(44,58,47,.09);border-radius:14px;background:rgba(255,255,255,.56);margin-top:11px}.driver-avatar{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:#e8efe8;color:#527a5b;font-weight:900}.driver-card strong,.driver-card small{display:block}.driver-card strong{font-size:10px;color:#304136}.driver-card small{margin-top:3px;color:#7d877f;font-size:7px}.driver-live{display:flex;align-items:center;gap:5px;color:#527a5b;font-size:7px;font-weight:900}.driver-live i{width:5px;height:5px;border-radius:50%;background:#527a5b}.driver-live.idle{color:#9a6a45}.driver-live.idle i{background:#d17a45}.delivery-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}.delivery-tools button{min-height:34px;border:1px solid rgba(44,58,47,.09);border-radius:10px;background:rgba(255,255,255,.5);color:#68736b;font-size:7px;font-weight:850;display:flex;align-items:center;justify-content:center;gap:5px;transition:.22s}.delivery-tools button:hover{background:#fff;color:#527a5b;border-color:rgba(82,122,91,.2);transform:translateY(-2px)}
.map-zone{background:transparent}.map-wrap{border-color:rgba(44,58,47,.12);border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 12px 30px rgba(50,58,50,.08)}.map-overlay{background:rgba(34,48,39,.93);color:#dbe9dc}.map-overlay>div b{color:#fff}.map-overlay>div small{color:#b5c0b7}.map-legend span{color:#7a857c}.map-legend .pickup{background:#d17a45}.map-legend .driver{background:#9a6a45}.map-legend .shelter,.map-legend .line{background:#527a5b}
.impact-section{padding-top:120px}.impact-tile{border-radius:20px}.impact-icon{color:#527a5b;background:#edf3ed}.impact-tile small{color:#527a5b}.impact-bottom{border-radius:20px}.final-cta{border-radius:24px;background:linear-gradient(115deg,rgba(82,122,91,.08),rgba(209,122,69,.06));margin-bottom:85px}.final-cta>div>span{color:#527a5b}
footer{border-color:rgba(44,58,47,.10)}.footer-inner{color:#7b857d}.footer-inner .logo{color:#314137}
.backdrop{background:rgba(30,39,32,.36);backdrop-filter:blur(18px);animation:backdropIn .28s ease-out}.modal{width:min(760px,100%);padding:32px;border:1px solid rgba(255,255,255,.72);border-radius:26px;background:linear-gradient(145deg,rgba(255,254,250,.96),rgba(246,242,233,.96));box-shadow:0 40px 100px rgba(49,57,48,.24),inset 0 1px 0 rgba(255,255,255,.98);animation:modalIn .42s cubic-bezier(.16,1,.3,1)}.modal-head h2{color:#243429;font-size:30px}.modal-head p{color:#737e76;font-size:11px;line-height:1.55}.modal-head>div>span{color:#527a5b;font-size:8px}.close{border-color:rgba(44,58,47,.11);background:rgba(255,255,255,.6);color:#657168;border-radius:11px;transition:.2s}.close:hover{transform:rotate(90deg);background:#fff}.modal-form{gap:15px}.modal-form label{color:#536057;font-size:10px;gap:7px}.modal-form input,.modal-form select{height:52px;padding:0 15px;border:1px solid rgba(44,58,47,.13);border-radius:13px;background:rgba(255,255,255,.76);color:#26372c;font-size:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 5px 15px rgba(44,58,47,.03);transition:.22s}.modal-form input:focus,.modal-form select:focus{border-color:rgba(82,122,91,.5);box-shadow:0 0 0 4px rgba(82,122,91,.08),inset 0 1px 0 #fff}.modal-form input::placeholder{color:#a0a8a2}.form-bottom{border-color:rgba(44,58,47,.10);padding-top:18px}.form-bottom span{color:#7b857d;font-size:8px}.modal-match{padding:15px;border-color:rgba(44,58,47,.10);border-radius:15px;background:rgba(255,255,255,.65);transition:.25s}.modal-match:hover{border-color:rgba(82,122,91,.22);background:#fff;transform:translateX(4px);box-shadow:0 10px 25px rgba(44,58,47,.06)}.modal-match b{font-size:11px;color:#2d3d32}.modal-match small{color:#7c877f;font-size:8px}.modal-match>strong{color:#527a5b;font-size:10px}.toast{border-color:rgba(255,255,255,.7);border-radius:14px;color:#eef5ee;background:#304238;box-shadow:0 20px 50px rgba(44,58,47,.22);font-size:10px;animation:toastIn .35s cubic-bezier(.16,1,.3,1)}.toast>span{background:#dfeadf;color:#304238}.notification{border-color:rgba(255,255,255,.8);background:rgba(255,253,248,.96);color:#314137;box-shadow:0 20px 60px rgba(44,58,47,.18);border-radius:15px}.notification>span{color:#527a5b;background:#edf3ed}.notification small{color:#7b857d}
@keyframes modalIn{from{opacity:0;transform:translateY(26px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes backdropIn{from{opacity:0}to{opacity:1}}@keyframes toastIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.primary,.secondary,.accept-btn,.nav-icon,.account,.shelter-row,.mini-command,.impact-tile,.command-card{transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s,border-color .28s,background .28s}.primary:hover{transform:translateY(-3px)}.command-card:hover{transform:translateY(-4px);box-shadow:0 25px 70px rgba(56,63,50,.12),inset 0 1px 0 #fff}.impact-tile:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(56,63,50,.11)}
@media(max-width:720px){.modal{padding:24px;border-radius:22px}.modal-head h2{font-size:25px}.delivery-tools{grid-template-columns:1fr}.driver-card{grid-template-columns:38px 1fr}.driver-live{grid-column:2}.shelter-row{grid-template-columns:24px 36px 1fr auto}.need,.match{display:none}.accept-btn{grid-column:4;grid-row:1/3}.shelter-info em{font-size:7px}}


/* ===== FINAL POLISH: LARGE TYPE + GLASS TILES + ALIGNED SHELTER ACTIONS ===== */
html{scroll-behavior:smooth}
body,.app{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
body{font-size:16px}
.section{scroll-margin-top:96px}
.nav-item{font-size:13px;font-weight:760;padding:11px 14px}
.logo{font-size:17px}.account{font-size:12px}.hero-kicker{font-size:10px}.eyebrow{font-size:10px}
.hero-left>p{font-size:17px;line-height:1.72}.hero-proof span{font-size:11px}.primary,.secondary,.reset{font-size:12px;min-height:48px;padding:0 18px;border-radius:13px}
.command-card,.board-main,.workflow,.shelter-list,.match-explainer,.tracking-shell,.impact-tile,.impact-bottom,.final-cta,.rescue-job{border:1px solid rgba(255,255,255,.72);background:linear-gradient(145deg,rgba(255,255,255,.74),rgba(248,246,239,.57));box-shadow:0 22px 60px rgba(49,61,51,.10),inset 0 1px 0 rgba(255,255,255,.96),inset 0 -1px 0 rgba(82,122,91,.035);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.command-card,.board-main,.workflow,.shelter-list,.match-explainer,.tracking-shell,.impact-tile,.impact-bottom,.final-cta{position:relative;overflow:hidden}
.command-card:before,.board-main:before,.workflow:before,.shelter-list:before,.match-explainer:before,.tracking-shell:before,.impact-tile:before,.impact-bottom:before,.final-cta:before,.rescue-job:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.42),transparent 30%,transparent 70%,rgba(255,255,255,.16));opacity:.72}
.section-title h2{font-size:39px;line-height:1.05}.section-title p{font-size:14px;line-height:1.65}.board-label b,.workflow-head b{font-size:10px}.board-label span,.workflow-head span{font-size:9px}
.priority-copy span,.command-head small,.online,.mini-command small,.command-footer span{font-size:9px}.priority-copy strong{font-size:14px}.priority-copy p{font-size:10px}.mini-command b{font-size:15px}.command-footer button{font-size:10px}
.ticker b{font-size:22px}.ticker span{font-size:10px}.ticker-note{font-size:11px}
.job-type small{font-size:9px}.job-type h3{font-size:19px}.job-status{font-size:10px;padding:8px 11px}.job-facts small{font-size:9px}.job-facts b{font-size:12px}.job-bottom>span,.job-bottom button{font-size:10px}.empty-board h3{font-size:17px}.empty-board p{font-size:11px}.workflow-step>span{font-size:10px}.workflow-step b{font-size:13px}.workflow-step small{font-size:10px}
/* Shelter rows are intentionally structured as a real tile: the action gets its own full-width column. */
.shelter-list{padding:12px;display:flex;flex-direction:column;gap:8px}
.shelter-row{grid-template-columns:32px 46px minmax(180px,1fr) 72px 72px 116px 126px;gap:13px;min-height:78px;padding:12px 14px;border:1px solid rgba(255,255,255,.66);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.64),rgba(247,246,239,.46));box-shadow:0 10px 25px rgba(50,61,52,.06),inset 0 1px 0 rgba(255,255,255,.9);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px)}
.shelter-row:hover{transform:translateY(-3px) translateX(0);background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(247,246,239,.63));border-color:rgba(82,122,91,.20);box-shadow:0 18px 38px rgba(50,61,52,.10),inset 0 1px 0 #fff}
.shelter-row.selected{background:linear-gradient(145deg,rgba(235,244,236,.92),rgba(248,249,242,.67));border-color:rgba(82,122,91,.28);box-shadow:0 18px 42px rgba(82,122,91,.13),inset 0 1px 0 #fff}
.shelter-index{font-size:11px}.shelter-symbol{width:42px;height:42px;border-radius:13px}.shelter-info strong{font-size:15px;line-height:1.2}.shelter-info small{font-size:10px;line-height:1.4}.shelter-info em{font-size:9px}.need small,.match small{font-size:8px}.need b,.match b{font-size:12px}
.accept-btn{width:100%;min-height:42px;padding:0 13px;border:1px solid rgba(82,122,91,.22);border-radius:13px;background:rgba(255,255,255,.74);color:#527a5b;font-size:11px;font-weight:900;letter-spacing:-.01em;box-shadow:0 7px 18px rgba(55,69,57,.07),inset 0 1px 0 #fff;white-space:nowrap}
.accept-btn:hover{background:#527a5b;color:#fff;transform:translateY(-2px) scale(1.015);box-shadow:0 12px 25px rgba(82,122,91,.19)}
.shelter-row.selected .accept-btn{background:#527a5b;color:#fff;border-color:#527a5b;box-shadow:0 10px 24px rgba(82,122,91,.20)}
.explainer-top small{font-size:9px}.explainer-top h3{font-size:19px}.match-explainer>p{font-size:11px;line-height:1.75}.criteria span,.criteria b{font-size:10px}
.tracking-status strong{font-size:16px}.tracking-status small{font-size:9px}.route-summary small,.eta-panel small{font-size:8px}.route-summary strong{font-size:10px}.eta-panel b{font-size:16px}.delivery-step>span{font-size:9px}.delivery-step b{font-size:11px}.delivery-step small{font-size:9px}.map-zone-head strong{font-size:16px}.map-zone-head small{font-size:9px}.map-zone-head>span{font-size:9px}.map-legend span{font-size:9px}
.driver-card strong{font-size:12px}.driver-card small{font-size:9px}.driver-live{font-size:9px}.delivery-tools button{font-size:9px;min-height:38px}
.impact-tile strong{font-size:30px}.impact-tile p{font-size:11px}.impact-tile small{font-size:9px}.impact-bottom small{font-size:9px}.impact-bottom strong{font-size:31px}.impact-bottom p{font-size:10px}.final-cta h2{font-size:31px}
.footer-inner{font-size:10px}
/* Larger, more legible modal while keeping the glass-on-surface feel. */
.modal{width:min(800px,100%);padding:34px;max-height:calc(100vh - 34px);border:1px solid rgba(255,255,255,.84);border-radius:30px;background:linear-gradient(145deg,rgba(255,255,252,.94),rgba(243,240,232,.88));box-shadow:0 45px 120px rgba(49,57,48,.25),inset 0 1px 0 #fff;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.modal-head{margin-bottom:25px}.modal-head>div>span{font-size:9px}.modal-head h2{font-size:32px}.modal-head p{font-size:13px;line-height:1.6}.close{width:42px;height:42px;border-radius:13px}
.modal-form{gap:17px}.modal-form label{font-size:12px;gap:8px}.modal-form input,.modal-form select{height:56px;padding:0 16px;border-radius:15px;font-size:14px;background:rgba(255,255,255,.82);box-shadow:inset 0 1px 0 #fff,0 7px 20px rgba(44,58,47,.045)}.modal-form input:focus,.modal-form select:focus{transform:translateY(-1px)}.form-bottom{padding-top:20px}.form-bottom span{font-size:10px}.modal-match b{font-size:13px}.modal-match small{font-size:10px}.modal-match>strong{font-size:12px}
.toast{font-size:12px;padding:13px 15px;border-radius:16px}.notification b{font-size:11px}.notification small{font-size:9px}
@media(max-width:1050px){.shelter-row{grid-template-columns:30px 44px minmax(150px,1fr) 68px 68px 108px 116px}}
@media(max-width:720px){
  .section-title h2{font-size:32px}.section-title p{font-size:13px}.hero-left>p{font-size:15px}.hero h1{font-size:48px}
  .shelter-row{grid-template-columns:28px 42px 1fr 100px;min-height:72px;gap:10px;padding:11px 10px}.need,.match{display:none}.accept-btn{grid-column:auto;grid-row:auto;min-height:40px;font-size:10px;padding:0 8px}.shelter-info strong{font-size:14px}.shelter-info small{font-size:9px}.shelter-info em{font-size:8px}
  .modal{padding:25px;border-radius:24px}.modal-head h2{font-size:27px}.modal-head p{font-size:12px}.modal-form label{font-size:11px}.modal-form input,.modal-form select{height:54px;font-size:13px}.form-bottom .primary{font-size:12px}
}
@media(max-width:420px){.hero h1{font-size:42px}.shelter-row{grid-template-columns:26px 38px minmax(0,1fr);position:relative;padding-right:12px}.shelter-info{padding-right:82px}.accept-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:74px;min-height:36px;font-size:9px}.accept-btn:hover{transform:translateY(-52%) scale(1.02)}.shelter-symbol{width:36px;height:36px}.shelter-info strong{font-size:13px}}


/* ===== LIQUID GLASS / LARGE TYPE / MAP CONTROL UPGRADE ===== */
body{font-size:18px;letter-spacing:-.01em}body,.app,.nav-item,.primary,.secondary,.reset,.accept-btn,.account,.delivery-tools button,.tracking-actions button{font-family:"Avenir Next","Trebuchet MS","Segoe UI",system-ui,sans-serif}.nav-item{font-size:15px;font-weight:800}.logo{font-size:20px}.account{font-size:14px}.eyebrow,.hero-kicker{font-size:12px;letter-spacing:.16em}.hero-left>p{font-size:20px;line-height:1.75;max-width:760px}.hero h1{font-size:76px;letter-spacing:-.055em}.hero-proof span{font-size:13px}.primary,.secondary,.reset{font-size:14px;min-height:54px}.section-title h2{font-size:48px}.section-title p{font-size:16px}.board-label b,.workflow-head b{font-size:12px}.board-label span,.workflow-head span{font-size:11px}.command-head h2{font-size:22px}.command-head small,.priority-copy span,.online{font-size:10px}.priority-copy strong{font-size:17px}.priority-copy p{font-size:12px}.mini-command b{font-size:18px}.mini-command small{font-size:10px}.command-footer span,.command-footer button{font-size:11px}.ticker b{font-size:27px}.ticker span,.ticker-note{font-size:12px}.job-type small{font-size:11px}.job-type h3{font-size:23px}.job-status{font-size:12px}.job-facts small{font-size:11px}.job-facts b{font-size:15px}.job-bottom>span,.job-bottom button{font-size:12px}.workflow-step>span{font-size:12px}.workflow-step b{font-size:16px}.workflow-step small{font-size:12px}.shelter-info strong{font-size:18px}.shelter-info small{font-size:12px}.shelter-info em{font-size:11px}.need small,.match small{font-size:10px}.need b,.match b{font-size:14px}.accept-btn{font-size:13px;min-height:48px}.tracking-status strong{font-size:20px}.tracking-status small{font-size:11px}.route-summary small,.eta-panel small{font-size:10px}.route-summary strong{font-size:13px}.eta-panel b{font-size:19px}.delivery-step>span{font-size:11px}.delivery-step b{font-size:14px}.delivery-step small{font-size:11px}.map-zone-head strong{font-size:21px}.map-zone-head small{font-size:11px}.map-zone-head>span{font-size:11px}.map-legend span{font-size:11px}.driver-card{padding:15px;border-radius:18px;grid-template-columns:48px 1fr auto}.driver-avatar{width:44px;height:44px;font-size:17px}.driver-card strong{font-size:15px}.driver-card small{font-size:11px;line-height:1.45}.driver-live{font-size:11px}.driver-detail-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.driver-detail-strip span{padding:10px 11px;border:1px solid rgba(255,255,255,.72);border-radius:13px;background:rgba(255,255,255,.45);color:#68756b;font-size:10px}.driver-detail-strip b{display:block;color:#304136;font-size:9px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}.delivery-tools{gap:8px}.delivery-tools button{min-height:44px;font-size:11px}.progress-card{margin-top:12px;padding:15px;border:1px solid rgba(255,255,255,.75);border-radius:17px;background:linear-gradient(145deg,rgba(255,255,255,.57),rgba(246,244,237,.42));box-shadow:inset 0 1px 0 #fff,0 10px 30px rgba(50,60,51,.06);backdrop-filter:blur(14px)}.progress-head{display:flex;justify-content:space-between;align-items:center}.progress-head b{font-size:10px;letter-spacing:.12em;color:#748077}.progress-head strong{font-size:18px;color:#527a5b}.big-progress{height:11px;margin-top:10px;border-radius:999px;background:rgba(44,58,47,.09);overflow:hidden;box-shadow:inset 0 1px 3px rgba(44,58,47,.08)}.big-progress span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#527a5b,#a1b77f);transition:width .6s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 14px rgba(82,122,91,.22)}.progress-caption{display:flex;justify-content:space-between;margin-top:7px;color:#879188;font-size:10px}.map-subline{display:block!important;margin-top:4px;color:#89938b!important;font-size:10px!important;font-weight:600!important;letter-spacing:0!important}.map-zone-head>div{min-width:0}.command-card,.board-main,.workflow,.shelter-list,.match-explainer,.tracking-shell,.impact-tile,.impact-bottom,.final-cta,.rescue-job,.shelter-row,.progress-card{background:linear-gradient(135deg,rgba(255,255,255,.70),rgba(246,244,237,.42) 55%,rgba(255,255,255,.58));border-color:rgba(255,255,255,.84);box-shadow:0 25px 70px rgba(49,61,51,.10),inset 0 1px 0 rgba(255,255,255,.98),inset 0 -1px 0 rgba(82,122,91,.04);backdrop-filter:blur(14px) saturate(115%);-webkit-backdrop-filter:blur(14px) saturate(115%)}.command-card:after,.board-main:after,.workflow:after,.shelter-list:after,.match-explainer:after,.tracking-shell:after,.impact-tile:after,.impact-bottom:after,.final-cta:after,.rescue-job:after,.shelter-row:after{content:"";position:absolute;left:8%;right:8%;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);pointer-events:none}.shelter-row{position:relative}.map-wrap{height:570px;border-radius:22px;background:rgba(223,231,233,.68);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 18px 45px rgba(50,58,50,.09)}
@media(max-width:1050px){.hero h1{font-size:64px}.section-title h2{font-size:42px}.driver-detail-strip{grid-template-columns:1fr 1fr}.map-wrap{height:500px}}@media(max-width:720px){body{font-size:16px}.nav-item{font-size:14px}.logo{font-size:18px}.hero h1{font-size:52px}.hero-left>p{font-size:17px}.section-title h2{font-size:36px}.section-title p{font-size:14px}.shelter-row{grid-template-columns:28px 42px 1fr 92px;min-height:80px}.accept-btn{min-height:44px;font-size:11px}.driver-detail-strip{grid-template-columns:1fr}.map-wrap{height:430px}}@media(max-width:420px){.hero h1{font-size:45px}.shelter-row{grid-template-columns:26px 38px minmax(0,1fr);padding-right:92px}.accept-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:76px}.accept-btn:hover{transform:translateY(-52%) scale(1.02)}}


/* ===== FULLSCREEN FOCUS — DOES NOT CHANGE PAGE WIDTH ===== */
.fullscreen-btn{
  height:42px;
  min-width:78px;
  padding:0 12px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  flex:0 0 auto;
  border:1px solid rgba(255,255,255,.72);
  border-radius:13px;
  background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(246,244,237,.42));
  color:#304136;
  font-family:"Avenir Next","Trebuchet MS","Segoe UI",system-ui,sans-serif;
  font-size:11px;
  font-weight:900;
  box-shadow:inset 0 1px 0 #fff,0 8px 22px rgba(49,61,51,.08);
  backdrop-filter:blur(18px) saturate(125%);
  -webkit-backdrop-filter:blur(18px) saturate(125%);
  transition:transform .25s ease,box-shadow .25s ease,background .25s ease;
}
.fullscreen-btn:hover{
  transform:translateY(-2px);
  background:linear-gradient(145deg,rgba(255,255,255,.9),rgba(238,244,238,.68));
  box-shadow:inset 0 1px 0 #fff,0 13px 30px rgba(49,61,51,.13);
}
.fullscreen-btn:active{transform:scale(.96)}
.fullscreen-icon{font-size:18px;line-height:1}
.fullscreen-label{font-size:11px}

/* True browser fullscreen: the site keeps its natural responsive layout. */
html:fullscreen,
body:fullscreen,
#root:fullscreen,
.app:fullscreen{
  width:100%;
  min-width:100%;
  min-height:100vh;
  margin:0;
}

@media(max-width:720px){
  .fullscreen-btn{
    min-width:42px;
    width:42px;
    padding:0;
  }
  .fullscreen-label{display:none}
}


/* ===== CLEAN 16:9 LAPTOP / FULLSCREEN LAYOUT ===== */
body,.app{font-family:"Avenir Next","Trebuchet MS","Segoe UI",system-ui,sans-serif}

/* Readable supporting typography. */
.small,.command-head small,.priority-copy span,.online,.board-label span,.workflow-head span,
.job-type small,.job-facts small,.progress-head b,.delivery-step>span,.map-zone-head small,
.map-zone-head>span,.map-legend span,.driver-card small,.driver-live,.impact-tile small,
.impact-bottom small,.footer-inner,.form-bottom span,.modal-match small{
  font-family:"Avenir Next","Trebuchet MS","Segoe UI",system-ui,sans-serif;
  font-size:clamp(11px,.72vw,14px);
  line-height:1.45;
  letter-spacing:.015em;
}
.section-title p,.hero-proof span,.ticker span,.ticker-note,.priority-copy p,
.job-bottom>span,.job-bottom button,.workflow-step small,.route-summary small,.eta-panel small,
.delivery-step small,.map-subline,.criteria span,.criteria b{
  font-family:"Avenir Next","Trebuchet MS","Segoe UI",system-ui,sans-serif;
  font-size:clamp(12px,.78vw,15px);
  line-height:1.55;
}

.progress-card{margin-top:14px;padding:18px;border-radius:19px}
.progress-head b{font-size:11px;letter-spacing:.1em}
.progress-head strong{font-size:20px}
.big-progress{height:12px;margin-top:11px}
.progress-caption{font-size:12px;line-height:1.4;margin-top:8px}

/*
  IMPORTANT: the laptop viewport itself is the 16:9 canvas.
  We do NOT create another 16:9 wrapper inside it.
  Also do not use 100vw here: on browsers with a vertical scrollbar,
  100vw can be wider than the usable layout viewport and causes the exact
  clipped/right-shifted alignment visible in the screenshot.
*/
html:fullscreen{
  width:100%;
  max-width:100%;
  min-width:0;
  overflow-x:hidden;
  overflow-y:auto;
}
html:fullscreen body{
  width:100%;
  max-width:100%;
  min-width:0;
  margin:0;
  overflow-x:hidden;
}

:fullscreen .app,
:fullscreen main,
:fullscreen .nav,
:fullscreen footer{
  width:100%;
  max-width:100%;
  min-width:0;
  margin:0;
}

/* Same horizontal rails everywhere. */
:fullscreen .section,
:fullscreen .nav-inner,
:fullscreen .footer-inner{
  width:100%;
  max-width:none;
  min-width:0;
  margin-left:0;
  margin-right:0;
  padding-left:clamp(44px,4.25vw,82px);
  padding-right:clamp(44px,4.25vw,82px);
}

/* Header stays completely inside the usable viewport. */
:fullscreen .nav-inner{
  box-sizing:border-box;
  gap:clamp(12px,1.4vw,26px);
}
:fullscreen .nav-links{
  min-width:0;
  flex:1 1 auto;
  margin-left:clamp(4px,1vw,18px);
  overflow:hidden;
}
:fullscreen .nav-right{
  flex:0 0 auto;
  min-width:max-content;
}
:fullscreen .logo{flex:0 0 auto}
:fullscreen .nav-item{white-space:nowrap}

/* Perfectly balanced 50/50 hero for 1366x768 and 1920x1080 laptops. */
:fullscreen .hero{
  box-sizing:border-box;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:clamp(28px,3vw,56px);
  min-height:calc(100vh - 72px);
  padding-top:clamp(54px,6vh,88px);
  padding-bottom:clamp(48px,6vh,82px);
}
:fullscreen .hero-left,
:fullscreen .hero-right{
  min-width:0;
  width:100%;
}
:fullscreen .hero-right{max-width:none}
:fullscreen .command-card{width:100%;max-width:none}
:fullscreen .hero h1{
  font-size:clamp(52px,4.5vw,76px);
  max-width:100%;
}
:fullscreen .hero-left>p{max-width:720px}
:fullscreen .ticker{box-sizing:border-box;width:100%}

@media(max-width:1200px){
  :fullscreen .section,
  :fullscreen .nav-inner,
  :fullscreen .footer-inner{
    padding-left:38px;
    padding-right:38px;
  }
  :fullscreen .hero{gap:28px}
  :fullscreen .hero h1{font-size:clamp(48px,4.8vw,64px)}
}
@media(max-width:900px){
  :fullscreen .hero{grid-template-columns:1fr;min-height:auto}
  :fullscreen .hero-right{max-width:none}
}
@media(max-width:720px){
  :fullscreen .section,
  :fullscreen .nav-inner,
  :fullscreen .footer-inner{
    padding-left:18px;
    padding-right:18px;
  }
}


/* ===== FOCUS MODE: EXPLICIT FULL-WIDTH LAYOUT =====
   This class is applied immediately when Focus is pressed. It also keeps the
   layout correct if the browser's fullscreen transition takes a moment. */
.app.focus-mode{
  width:100%;
  max-width:none;
  min-width:0;
  margin:0;
  overflow-x:hidden;
}

.app.focus-mode .nav,
.app.focus-mode main,
.app.focus-mode footer{
  width:100%;
  max-width:none;
  min-width:0;
  margin:0;
}

.app.focus-mode .section,
.app.focus-mode .nav-inner,
.app.focus-mode .footer-inner{
  width:100%;
  max-width:none;
  min-width:0;
  margin-left:0;
  margin-right:0;
  padding-left:clamp(44px,5vw,96px);
  padding-right:clamp(44px,5vw,96px);
  box-sizing:border-box;
}

.app.focus-mode .nav-inner{
  gap:clamp(12px,1.5vw,28px);
}

.app.focus-mode .nav-links{
  min-width:0;
  flex:1 1 auto;
  margin-left:clamp(4px,1vw,18px);
}

.app.focus-mode .nav-right{
  flex:0 0 auto;
  min-width:max-content;
}

.app.focus-mode .hero{
  box-sizing:border-box;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:clamp(32px,4vw,72px);
  min-height:calc(100vh - 72px);
  padding-top:clamp(54px,6vh,88px);
  padding-bottom:clamp(48px,6vh,82px);
}

.app.focus-mode .hero-left,
.app.focus-mode .hero-right{
  width:100%;
  min-width:0;
}

.app.focus-mode .hero-right{max-width:none}
.app.focus-mode .command-card{width:100%;max-width:none}
.app.focus-mode .hero h1{font-size:clamp(52px,4.4vw,76px)}
.app.focus-mode .hero-left>p{max-width:760px}
.app.focus-mode .ticker{box-sizing:border-box;width:100%}

@media(max-width:1200px){
  .app.focus-mode .section,
  .app.focus-mode .nav-inner,
  .app.focus-mode .footer-inner{
    padding-left:36px;
    padding-right:36px;
  }
  .app.focus-mode .hero{gap:28px}
  .app.focus-mode .hero h1{font-size:clamp(48px,4.8vw,64px)}
}

@media(max-width:900px){
  .app.focus-mode .hero{
    grid-template-columns:1fr;
    min-height:auto;
  }
  .app.focus-mode .hero-right{max-width:none}
}

@media(max-width:720px){
  .app.focus-mode .section,
  .app.focus-mode .nav-inner,
  .app.focus-mode .footer-inner{
    padding-left:18px;
    padding-right:18px;
  }
}


/* ===== FINAL 16:9 FOCUS FRAME — LAST LAYOUT FIX ===== */
html,body,#root{
  width:100%;
  max-width:none;
  min-width:0;
  margin:0;
  padding:0;
  box-sizing:border-box;
}

html{
  overflow-x:hidden;
}

body{
  overflow-x:hidden;
}

#root{
  min-height:100vh;
}

/* Focus mode is the ONLY place where we create a 16:9 canvas.
   The canvas uses the full available height, so a 16:9 laptop gets
   essentially zero dead side space. */
.app.focus-mode{
  width:min(100%, calc(100vh * 1.7777777778));
  max-width:none;
  min-width:0;
  margin:0 auto;
  min-height:100vh;
  box-sizing:border-box;
  overflow-x:hidden;
}

.app.focus-mode .nav,
.app.focus-mode main,
.app.focus-mode footer{
  width:100%;
  max-width:none;
  min-width:0;
  margin:0;
  box-sizing:border-box;
}

.app.focus-mode .section,
.app.focus-mode .nav-inner,
.app.focus-mode .footer-inner{
  width:100%;
  max-width:none;
  min-width:0;
  margin-left:0;
  margin-right:0;
  box-sizing:border-box;
}

/* Keep one consistent 16:9 content rail. */
.app.focus-mode .section{
  padding-left:clamp(34px,3.2vw,58px);
  padding-right:clamp(34px,3.2vw,58px);
}

.app.focus-mode .nav-inner{
  padding-left:clamp(34px,3.2vw,58px);
  padding-right:clamp(34px,3.2vw,58px);
  gap:clamp(10px,1.2vw,22px);
}

.app.focus-mode .footer-inner{
  padding-left:clamp(34px,3.2vw,58px);
  padding-right:clamp(34px,3.2vw,58px);
}

.app.focus-mode .hero{
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:clamp(28px,3.2vw,52px);
  min-height:calc(100vh - 72px);
  box-sizing:border-box;
}

.app.focus-mode .hero-left,
.app.focus-mode .hero-right{
  min-width:0;
  width:100%;
}

.app.focus-mode .hero-right,
.app.focus-mode .command-card{
  max-width:none;
}

.app.focus-mode .command-card{width:100%;box-sizing:border-box}

.app.focus-mode .hero h1{
  font-size:clamp(48px,4.3vw,76px);
}

@media(max-aspect-ratio:16/9){
  /* Taller-than-16:9 screens: use full width rather than creating
     unnecessary horizontal margins. */
  .app.focus-mode{width:100%;}
}

@media(max-width:900px){
  .app.focus-mode{width:100%;}
  .app.focus-mode .hero{grid-template-columns:1fr;min-height:auto;}
}

@media(max-width:720px){
  .app.focus-mode .section,
  .app.focus-mode .nav-inner,
  .app.focus-mode .footer-inner{
    padding-left:18px;
    padding-right:18px;
  }
}


/* ===== TRACKING PANEL REFINEMENT — MAP FILLS THE RIGHT COLUMN ===== */
.tracking-shell{align-items:stretch}
.tracking-side{min-width:0}
.map-zone{display:flex;flex-direction:column;min-width:0;min-height:100%}
.map-wrap{flex:1 1 auto;min-height:620px;height:auto!important}
.delivery-map{width:100%;height:100%!important;min-height:620px}
.map-legend{flex:0 0 auto}
.driver-detail-strip{margin-top:12px}
@media(max-width:1050px){.map-wrap,.delivery-map{min-height:520px}}
@media(max-width:720px){.map-wrap,.delivery-map{min-height:430px}}

/* ROLE LOGIN / DASHBOARD — isolated; existing alignment rules untouched */
/* ===== ROLE UI TYPOGRAPHY + CONTRAST POLISH ===== */
.role-login-shell,
.role-login-shell button,
.role-login-shell input,
.role-dashboard-page,
.role-dashboard-page button{
  font-family:"Avenir Next","Segoe UI",Inter,system-ui,sans-serif;
}
.role-login-brand h2{
  font-size:clamp(44px,4.4vw,64px)!important;
  line-height:.98!important;
  letter-spacing:-.055em!important;
  font-weight:800!important;
}
.role-login-brand>p{font-size:16px!important;line-height:1.65!important}
.role-login-kicker,.role-panel-kicker,.role-dashboard-kicker{
  font-size:11px!important;
  letter-spacing:.18em!important;
}
.role-feature{font-size:13px!important;line-height:1.4}
.role-feature b{font-size:10px!important}
.role-login-panel{color:#2e5874!important}
.role-login-panel h3{
  color:#294f68!important;
  font-size:36px!important;
  font-weight:800!important;
  line-height:1.08!important;
}
.role-panel-sub{font-size:15px!important;line-height:1.55!important;color:#617486!important}
.role-choice{color:#294b61!important;min-height:82px!important;padding:14px 34px 14px 52px!important}
.role-choice b{font-size:14px!important;color:#294b61!important}
.role-choice small{font-size:10px!important;color:#718394!important}
.role-choice i{font-size:17px!important;color:#4b6d83!important}
.role-choice>span{color:#47708a!important;background:#e8f0f4!important}
.role-login-form label{font-size:12px!important;color:#466175!important}
.role-login-form input{
  height:50px!important;
  font-size:15px!important;
  color:#25475d!important;
  font-family:"Avenir Next","Segoe UI",Inter,system-ui,sans-serif!important;
}
.role-login-form input::placeholder{color:#91a0aa}
.demo-credentials{font-size:10px!important;color:#416b83!important}
.demo-credentials b{font-size:11px!important;color:#31566d!important}
.role-login-submit{font-size:14px!important;letter-spacing:.01em}
.role-close{font-size:18px!important;color:#46677a!important}

/* Dashboard text that inherited white hero/card styling is forced to a readable blue. */
.role-dashboard-page h1,
.role-dashboard-page h2,
.role-dashboard-page h3,
.role-dashboard-page strong,
.role-dashboard-page b{
  color:#315d78!important;
}
.role-dashboard-top h1{
  font-size:clamp(42px,4.6vw,68px)!important;
  font-weight:800!important;
  color:#315d78!important;
}
.role-dashboard-top p{font-size:15px!important;color:#607687!important}
.role-dashboard-kicker{color:#4f7891!important}
.role-dashboard-actions button{font-size:14px!important}
.role-stat strong{font-size:27px!important;color:#315d78!important}
.role-stat small{font-size:11px!important;color:#6f808d!important}
.role-info-card h3{font-size:21px!important;color:#315d78!important}
.role-info-card p{font-size:13px!important;color:#687b87!important}
.role-info-card>span,.role-live-card>div>span{font-size:10px!important;color:#4f7891!important}
.role-live-card h2{font-size:25px!important;color:#315d78!important}
.role-live-card p{font-size:13px!important;color:#687b87!important}
.role-progress>div{font-size:11px!important;color:#70808b!important}
.role-progress strong{font-size:28px!important;color:#4f7891!important}
.role-progress small{font-size:10px!important;color:#71818b!important}
.role-dashboard-page .role-stat>span{color:#4f7891!important;background:#e8f0f4!important}

.role-backdrop{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:24px;background:rgba(24,31,27,.52);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.role-login-shell{width:min(1040px,94vw);display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border:1px solid rgba(255,255,255,.65);border-radius:26px;background:#f5f2ea;box-shadow:0 35px 100px rgba(35,45,38,.25)}.role-login-brand{padding:48px;background:linear-gradient(145deg,#31573e,#527a5b);color:#f8fbf5}.role-brand-mark{width:50px;height:50px;display:grid;place-items:center;border-radius:15px;background:rgba(255,255,255,.16)}.role-login-kicker,.role-panel-kicker,.role-dashboard-kicker{display:block;margin-top:30px;font-size:9px;font-weight:900;letter-spacing:.16em;color:#e7f0e6}.role-login-brand h2{margin:16px 0;font-size:clamp(38px,4vw,56px);line-height:.95;letter-spacing:-.05em}.role-login-brand h2 em{font-style:normal;color:#dfeeda}.role-login-brand>p{max-width:400px;color:rgba(255,255,255,.72);font-size:13px;line-height:1.7}.role-feature{display:flex;gap:14px;margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,.16);font-size:11px}.role-feature b{font-size:9px;color:#dcebd9}.role-login-panel{position:relative;padding:44px;color:#304137}.role-close{position:absolute;right:20px;top:20px;width:36px;height:36px;border:1px solid rgba(44,63,53,.12);border-radius:10px;background:#fff;color:#607066;display:grid;place-items:center}.role-panel-kicker{margin:0;color:#527a5b}.role-login-panel h3{margin:10px 0 6px;font-size:30px;letter-spacing:-.04em}.role-panel-sub{margin:0 0 20px;color:#718077;font-size:12px}.role-picker-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.role-choice{position:relative;text-align:left;min-height:72px;padding:10px 30px 10px 45px;border:1px solid rgba(55,75,64,.12);border-radius:13px;background:rgba(255,255,255,.65);color:#304139}.role-choice>span{position:absolute;left:11px;top:12px;width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:#e7eee7;color:#527a5b}.role-choice b{display:block;font-size:11px}.role-choice small{display:block;margin-top:3px;color:#7b887f;font-size:8px}.role-choice i{position:absolute;right:11px;top:27px;font-style:normal;color:#6b7b71}.role-choice.active{border-color:#527a5b;background:#e7efe7}.role-login-form{margin-top:16px;display:grid;gap:9px}.role-login-form label{display:grid;gap:5px;font-size:9px;font-weight:850;color:#52625a}.role-login-form input{height:42px;border:1px solid rgba(55,75,64,.14);border-radius:10px;background:#fff;padding:0 11px;color:#26382f;font-size:11px}.demo-credentials{display:grid;grid-template-columns:auto 1fr 1fr;gap:8px;padding:9px;border:1px dashed rgba(82,122,91,.3);border-radius:10px;background:#edf3ed;color:#527a5b;font-size:8px}.demo-credentials b{color:#35483d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.role-login-submit{height:45px;border:0;border-radius:10px;background:#304a3a;color:#fff;font-weight:850;font-size:11px;display:flex;align-items:center;justify-content:center;gap:7px}.role-dashboard-page{min-height:calc(100vh - 72px);background:#f4f0e7;color:#24342d}.role-dashboard{padding-top:70px;padding-bottom:90px}.role-dashboard-top{display:flex;justify-content:space-between;gap:30px;align-items:flex-end}.role-dashboard-kicker{margin:0;color:#527a5b}.role-dashboard-top h1{margin:10px 0;font-size:clamp(38px,4.5vw,62px);line-height:.95;letter-spacing:-.05em}.role-dashboard-top p{max-width:650px;margin:0;color:#69756c;font-size:14px;line-height:1.65}.role-dashboard-actions{display:flex;gap:8px}.role-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:42px}.role-stat{padding:20px;border:1px solid rgba(44,58,47,.12);border-radius:17px;background:rgba(255,255,255,.58);box-shadow:0 12px 35px rgba(44,58,47,.06)}.role-stat>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#e7efe7;color:#527a5b}.role-stat strong{display:block;margin-top:16px;font-size:23px}.role-stat small{display:block;margin-top:5px;color:#778177;font-size:10px}.role-dashboard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.role-info-card{padding:23px;border:1px solid rgba(44,58,47,.12);border-radius:17px;background:rgba(255,255,255,.5);min-height:175px}.role-info-card>span,.role-live-card>div>span{font-size:8px;font-weight:900;letter-spacing:.14em;color:#527a5b}.role-info-card h3{margin:10px 0 7px;font-size:18px}.role-info-card p{margin:0;color:#6f7b73;font-size:11px;line-height:1.65}.role-live-card{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:14px;padding:25px;border:1px solid rgba(44,58,47,.12);border-radius:19px;background:rgba(255,255,255,.6)}.role-live-card h2{margin:9px 0 6px;font-size:22px}.role-live-card p{margin:0;color:#6f7b73;font-size:11px}.role-progress{align-self:center}.role-progress>div{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#78847c}.role-progress strong{font-size:24px;color:#527a5b}.role-progress>span{display:block;height:9px;margin-top:10px;border-radius:99px;background:#dfe7df;overflow:hidden}.role-progress>span i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#527a5b,#9fb97e);transition:width .5s ease}.role-progress small{display:block;margin-top:8px;color:#7a857d;font-size:8px}@media(max-width:850px){.role-login-shell{grid-template-columns:1fr}.role-login-brand{display:none}.role-stat-grid{grid-template-columns:1fr 1fr}.role-dashboard-grid{grid-template-columns:1fr}.role-live-card{grid-template-columns:1fr}.role-dashboard-top{align-items:flex-start;flex-direction:column}}@media(max-width:520px){.role-picker-grid{grid-template-columns:1fr}.role-stat-grid{grid-template-columns:1fr 1fr}.role-login-panel{padding:32px 22px}.demo-credentials{grid-template-columns:1fr}.role-dashboard{padding-top:40px}}


/* ===== FINAL TYPOGRAPHY PASS — MINIMAL / REFINED =====
/* Alignment/layout is intentionally untouched. Only typography is adjusted. */
body,.app,
.nav-item,.primary,.secondary,.reset,.accept-btn,.account,
.delivery-tools button,.tracking-actions button,
.role-login-shell,.role-login-shell button,.role-login-shell input,
.role-dashboard-page,.role-dashboard-page button{
  font-family:"Inter","Avenir Next","Segoe UI",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}

/* Small global readability lift across the main website. */
.command-head small,.priority-copy span,.online,.board-label span,.workflow-head span,
.job-type small,.job-facts small,.progress-head b,.map-zone-head small,
.map-zone-head>span,.map-legend span,.impact-tile small,.impact-bottom small,
.footer-inner,.form-bottom span,.modal-match small{
  font-size:clamp(12px,.76vw,15px);
  line-height:1.5;
}

.section-title p,.hero-proof span,.ticker span,.ticker-note,
.priority-copy p,.job-bottom>span,.job-bottom button,
.workflow-step small,.criteria span,.criteria b{
  font-size:clamp(13px,.82vw,16px);
  line-height:1.6;
}

.nav-item{font-size:16px}
.account{font-size:15px}
.primary,.secondary,.reset{font-size:15px}
.command-head h2{font-size:24px}
.priority-copy strong{font-size:18px}
.priority-copy p{font-size:13px}
.section-title h2{font-size:50px}
.section-title p{font-size:17px}
.job-type h3{font-size:24px}
.job-facts b{font-size:16px}
.workflow-step b{font-size:17px}
.shelter-info strong{font-size:19px}
.shelter-info small{font-size:13px}
.accept-btn{font-size:14px}

/* Tracking: deliberately larger than the rest, especially the left panel. */
.tracking-side{
  font-family:"Inter","Avenir Next","Segoe UI",system-ui,sans-serif;
}
.tracking-status strong{font-size:21px;line-height:1.25}
.tracking-status small{font-size:12px;line-height:1.45}
.route-summary small,.eta-panel small{
  font-size:11px;
  letter-spacing:.11em;
  line-height:1.3;
}
.route-summary strong{
  font-size:15px;
  line-height:1.4;
  color:#315d78;
}
.eta-panel b{
  font-size:21px;
  line-height:1.25;
}
.delivery-step{
  padding:12px 0;
}
.delivery-step>span{
  font-size:12px;
}
.delivery-step b{
  font-size:16px;
  line-height:1.35;
  color:#315d78;
}
.delivery-step small{
  font-size:13px;
  line-height:1.45;
  color:#687b87;
}
.driver-card strong{font-size:16px}
.driver-card small{font-size:12px;line-height:1.5}
.driver-live{font-size:12px}
.driver-detail-strip span{font-size:12px;line-height:1.45}
.driver-detail-strip b{font-size:10px}
.delivery-tools button{font-size:12px}
.tracking-actions button{font-size:13px}
.map-zone-head strong{font-size:22px}
.map-zone-head small,.map-zone-head>span{font-size:12px}
.map-legend span{font-size:12px}
.map-overlay>div b{font-size:11px}
.map-overlay>div small{font-size:9px}

/* Login information — slightly larger, cleaner, less condensed. */
.role-login-brand h2{font-size:clamp(46px,4.6vw,68px)!important;line-height:.98!important}
.role-login-brand>p{font-size:15px!important;line-height:1.7!important}
.role-feature{font-size:13px!important;line-height:1.5!important}
.role-feature b{font-size:11px!important}
.role-login-panel h3{font-size:38px!important}
.role-panel-sub{font-size:16px!important;line-height:1.6!important}
.role-choice{min-height:78px}
.role-choice b{font-size:15px!important}
.role-choice small{font-size:11px!important;line-height:1.4}
.role-choice i{font-size:18px!important}
.role-login-form label{font-size:13px!important}
.role-login-form input{font-size:16px!important;height:46px!important}
.demo-credentials{font-size:11px!important;line-height:1.45}
.demo-credentials b{font-size:12px!important}
.role-login-submit{font-size:15px!important;height:48px!important}

/* Role dashboards — same refined typography, without touching their geometry. */
.role-dashboard-top h1{font-size:clamp(44px,4.7vw,70px)!important}
.role-dashboard-top p{font-size:16px!important;line-height:1.7!important}
.role-dashboard-actions button{font-size:15px!important}
.role-stat strong{font-size:29px!important}
.role-stat small{font-size:12px!important}
.role-info-card h3{font-size:22px!important}
.role-info-card p{font-size:14px!important;line-height:1.7!important}
.role-info-card>span,.role-live-card>div>span{font-size:11px!important}
.role-live-card h2{font-size:26px!important}
.role-live-card p{font-size:14px!important;line-height:1.7!important}
.role-progress>div{font-size:12px!important}
.role-progress strong{font-size:29px!important}
.role-progress small{font-size:11px!important}


/* ===== SMART RESCUE FEATURE LAYER ===== */
.queue-stack{margin-top:14px;padding:16px;border:1px solid rgba(255,255,255,.78);border-radius:20px;background:rgba(255,255,255,.42);box-shadow:inset 0 1px 0 #fff,0 12px 30px rgba(49,61,51,.06)}
.queue-stack-head,.admin-ops-head,.role-panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.queue-stack-head span,.admin-ops-head>div>span,.role-panel-head span{font-size:11px;letter-spacing:.14em;font-weight:900;color:#527a5b}.queue-stack-head b,.admin-ops-head>b,.role-panel-head>b{font-size:11px;color:#60736a}.queue-item{width:100%;display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:12px;margin-top:9px;padding:12px;border:1px solid rgba(82,122,91,.12);border-radius:14px;background:rgba(255,255,255,.66);text-align:left;color:#304136;transition:.2s ease}.queue-item:hover,.queue-item.active{transform:translateY(-1px);border-color:rgba(82,122,91,.3);background:rgba(237,244,238,.82)}.queue-number{font-size:11px;font-weight:900;color:#527a5b}.queue-item b{display:block;font-size:14px}.queue-item small{display:block;margin-top:3px;color:#78877f;font-size:11px}.queue-meta{text-align:right}.queue-meta strong{display:block;color:#315d78;font-size:16px}.queue-empty{padding:14px 4px;color:#77847d;font-size:12px;line-height:1.5}
.smart-match-score{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;padding:14px;border-radius:15px;background:linear-gradient(135deg,#edf4ef,#f8f7f1);border:1px solid rgba(82,122,91,.16)}.smart-match-score span{font-size:10px;font-weight:900;letter-spacing:.13em;color:#527a5b}.smart-match-score strong{font-size:28px;color:#315d78}.match-factors{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px}.match-factors span{display:flex;justify-content:space-between;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.55);font-size:11px;color:#6c7b73}.match-factors b{color:#315d78}.match-reason{font-size:12px!important;line-height:1.55!important;color:#5f7280!important}.map-toggle{margin-left:auto;border:1px solid rgba(82,122,91,.2);border-radius:10px;background:rgba(255,255,255,.7);color:#527a5b;padding:7px 10px;font-size:11px;font-weight:800}
.smart-ops-section{padding-top:25px}.ops-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ops-card{position:relative;padding:20px;border:1px solid rgba(255,255,255,.82);border-radius:19px;background:linear-gradient(135deg,rgba(255,255,255,.72),rgba(246,244,237,.5));box-shadow:0 18px 50px rgba(49,61,51,.08),inset 0 1px 0 #fff;backdrop-filter:blur(18px)}.ops-card-head{display:flex;justify-content:space-between;align-items:center;color:#527a5b}.ops-card-head span{font-size:10px;font-weight:900;letter-spacing:.14em}.ops-card-head svg{color:#315d78}.ops-card>strong{display:block;margin:14px 0 6px;font-size:21px;color:#315d78}.ops-card p{margin:0;color:#6c7b73;font-size:12px;line-height:1.55}.ops-action{margin-top:14px;border:1px solid rgba(82,122,91,.2);border-radius:10px;background:rgba(255,255,255,.72);color:#315d78;padding:9px 12px;font-size:11px;font-weight:900}.ops-action.danger{color:#a65c39;border-color:rgba(209,122,69,.22)}.risk-pill{padding:5px 8px;border-radius:99px;font-size:9px!important;letter-spacing:.08em}.risk-pill.safe{background:#e6f1e7;color:#527a5b}.risk-pill.urgent{background:#fff0d9;color:#a66b30}.risk-pill.critical{background:#fde4dc;color:#a94c36}.risk-meter{height:8px;margin-top:14px;border-radius:99px;background:#e5eae5;overflow:hidden}.risk-meter span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#527a5b,#d17a45)}.impact-live-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.impact-live-grid strong{display:block;font-size:22px;color:#315d78}.impact-live-grid small{color:#78857e;font-size:10px}.admin-operations-card{margin-top:14px;padding:20px;border:1px solid rgba(255,255,255,.82);border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.72),rgba(246,244,237,.5));box-shadow:0 18px 50px rgba(49,61,51,.08),inset 0 1px 0 #fff}.admin-ops-head h3{margin:6px 0 0;font-size:22px;color:#315d78}.admin-ops-head>b{display:flex;align-items:center;gap:6px}.admin-ops-head>b i{width:7px;height:7px;border-radius:50%;background:#527a5b}.ops-table{margin-top:15px}.ops-row{display:grid;grid-template-columns:1.1fr 1.1fr .55fr .4fr;gap:12px;padding:12px 0;border-top:1px solid rgba(44,58,47,.08);align-items:center}.ops-row span b,.ops-row span small{display:block}.ops-row b{font-size:12px;color:#315d78}.ops-row small{margin-top:3px;color:#78857e;font-size:10px}.risk-text{font-size:10px;font-weight:900;text-transform:uppercase;text-align:right}.risk-text.urgent{color:#a66b30}.risk-text.safe{color:#527a5b}
.feature-backdrop{position:fixed;inset:0;z-index:1600;display:grid;place-items:center;padding:24px;background:rgba(24,31,27,.5);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.feature-modal{position:relative;width:min(650px,94vw);max-height:90vh;overflow:auto;padding:32px;border-radius:25px;border:1px solid rgba(255,255,255,.82);background:linear-gradient(145deg,rgba(255,255,252,.96),rgba(243,240,232,.93));box-shadow:0 40px 100px rgba(35,45,38,.28),inset 0 1px 0 #fff;color:#304136}.feature-modal h2{margin:10px 0;font-size:31px;color:#315d78;letter-spacing:-.04em}.feature-modal>p{color:#697b84;font-size:13px;line-height:1.65}.feature-kicker{font-size:10px;font-weight:900;letter-spacing:.15em;color:#527a5b}.feature-close{position:absolute;right:18px;top:18px;width:38px;height:38px;border:1px solid rgba(44,63,53,.12);border-radius:11px;background:#fff;color:#607066}.emergency-list{display:grid;gap:9px;margin:20px 0}.emergency-list>div{display:grid;grid-template-columns:34px 1fr auto;gap:12px;align-items:center;padding:12px;border-radius:14px;background:#fff;border:1px solid rgba(82,122,91,.12)}.emergency-index{color:#527a5b;font-weight:900}.emergency-list b,.emergency-list small{display:block}.emergency-list b{font-size:13px;color:#315d78}.emergency-list small{margin-top:3px;color:#77857d;font-size:10px}.emergency-list strong{color:#a94c36;font-size:15px}.otp-label,.proof-upload{display:grid;gap:7px;margin:16px 0;font-size:10px;font-weight:900;letter-spacing:.1em;color:#527a5b}.otp-label input{height:54px;border:1px solid rgba(55,75,64,.14);border-radius:13px;background:#fff;padding:0 15px;font-size:22px;letter-spacing:.3em;color:#315d78}.proof-upload{padding:14px;border:1px dashed rgba(82,122,91,.3);border-radius:14px}.proof-upload input{margin-top:4px}.proof-upload small,.proof-upload b{font-size:11px;letter-spacing:0;color:#6e7d76}.receipt-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}.receipt-grid>div{padding:14px;border-radius:13px;background:rgba(255,255,255,.7);border:1px solid rgba(82,122,91,.1)}.receipt-grid small,.receipt-grid b{display:block}.receipt-grid small{font-size:9px;color:#718079;letter-spacing:.12em}.receipt-grid b{margin-top:5px;font-size:13px;color:#315d78}.verified-text{color:#527a5b!important}.receipt-proof{margin-top:12px;padding:12px;border-radius:12px;background:#e8f1e9;color:#527a5b;font-size:11px;font-weight:800}
.role-stat-grid-expanded{grid-template-columns:repeat(6,1fr)}.role-inline-action{margin-top:12px;border:0;background:none;color:#315d78;font-weight:900;font-size:12px;padding:0}.role-timeline{display:flex;gap:7px;flex-wrap:wrap;margin-top:18px}.role-timeline span{padding:7px 9px;border-radius:99px;background:#eef1ed;color:#87928b;font-size:10px}.role-timeline span.done{background:#e5f0e7;color:#527a5b}.role-ops-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;margin-top:14px}.role-ops-panel{padding:20px;border:1px solid rgba(44,58,47,.12);border-radius:18px;background:rgba(255,255,255,.58)}.role-job-row{display:grid;grid-template-columns:1.3fr 1fr auto;gap:12px;align-items:center;padding:11px 0;border-top:1px solid rgba(44,58,47,.08)}.role-job-row b,.role-job-row small{display:block}.role-job-row b{font-size:12px;color:#315d78}.role-job-row small{margin-top:3px;color:#78857e;font-size:10px}.role-job-row>strong{font-size:17px;color:#527a5b}.smart-chip-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.smart-chip-grid span{padding:9px;border-radius:10px;background:#edf2ee;color:#527a5b;font-size:10px;font-weight:800}.role-streak{margin-top:14px;padding:12px;border-radius:12px;background:#f0eee6;color:#315d78;font-size:11px;font-weight:800}
@media(max-width:1050px){.ops-grid{grid-template-columns:1fr 1fr}.role-stat-grid-expanded{grid-template-columns:repeat(3,1fr)}.role-ops-grid{grid-template-columns:1fr}.ops-row{grid-template-columns:1fr 1fr .5fr .4fr}}@media(max-width:720px){.ops-grid{grid-template-columns:1fr}.ops-row{grid-template-columns:1fr 1fr}.ops-row .risk-text{text-align:left}.receipt-grid{grid-template-columns:1fr}.role-stat-grid-expanded{grid-template-columns:1fr 1fr}.smart-chip-grid{grid-template-columns:1fr}.queue-item{grid-template-columns:30px 1fr auto}}

.capacity-chip{display:flex;flex-direction:column;gap:3px;min-width:78px}.capacity-chip small{font-size:8px;color:#7b887f;letter-spacing:.1em}.capacity-chip b{font-size:12px;color:#315d78}.capacity-chip i{display:block;height:5px;border-radius:99px;background:#e4eae5;overflow:hidden}.capacity-chip i em{display:block;height:100%;border-radius:inherit;background:#8ba97e}
@media(max-width:1050px){.capacity-chip{display:none}}
/* ===== FINAL READABILITY + SHELTER ACTION ALIGNMENT PASS ===== */
.shelter-row{
  grid-template-columns:32px 46px minmax(180px,1fr) 72px 72px 116px 126px;
}
.shelter-row .accept-btn{
  width:100%;
  min-width:0;
  min-height:46px;
  padding:0 12px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  white-space:nowrap;
  overflow:hidden;
  font-family:"Inter","Avenir Next","Segoe UI",system-ui,sans-serif;
  font-size:14px;
  line-height:1;
  letter-spacing:-.01em;
}
.shelter-row .accept-btn svg{flex:0 0 auto}
.shelter-info strong{font-family:"Inter","Avenir Next","Segoe UI",system-ui,sans-serif}
.shelter-info small{font-size:13px!important;line-height:1.45!important}
.shelter-info em{font-size:12px!important;line-height:1.35!important}
.need small,.match small,.capacity-chip small{font-size:10px!important;line-height:1.3!important}
.need b,.match b,.capacity-chip b{font-size:14px!important}
.capacity-chip{min-width:0}
.capacity-chip i{height:6px}

/* Smart operations / live operations center */
.smart-ops-section .section-title p{font-size:16px!important;line-height:1.65!important}
.ops-card-head span{font-size:12px!important}
.ops-card>strong{font-size:23px!important;line-height:1.25!important}
.ops-card p{font-size:14px!important;line-height:1.65!important}
.ops-action{font-size:13px!important;line-height:1.3!important}
.risk-pill{font-size:11px!important}
.impact-live-grid small{font-size:12px!important}
.admin-ops-head>div>span{font-size:12px!important}
.admin-ops-head>b{font-size:12px!important}
.admin-ops-head h3{font-size:24px!important}
.ops-row b{font-size:14px!important}
.ops-row small{font-size:12px!important;line-height:1.45!important}
.risk-text{font-size:12px!important}
.queue-stack-head span{font-size:12px!important}
.queue-stack-head b{font-size:12px!important}
.queue-item b{font-size:15px!important}
.queue-item small{font-size:12px!important;line-height:1.4!important}
.queue-meta strong{font-size:18px!important}
.queue-meta small{font-size:12px!important}

/* Match panel / shelter explainer */
.explainer-top small{font-size:11px!important}
.explainer-top h3{font-size:21px!important}
.match-explainer>p{font-size:13px!important;line-height:1.65!important}
.smart-match-score span{font-size:12px!important}
.match-factors span{font-size:13px!important}
.match-reason{font-size:13px!important;line-height:1.65!important}
.criteria span,.criteria b{font-size:12px!important}

/* Delivery status and tracking labels */
.tracking-status small{font-size:12px!important}
.route-summary small,.eta-panel small{font-size:12px!important}
.delivery-step>span{font-size:12px!important}
.delivery-step b{font-size:16px!important}
.delivery-step small{font-size:13px!important}
.map-legend span{font-size:12px!important}
.delivery-tools button{font-size:13px!important}

/* Role dashboards: make supporting information comfortably readable */
.role-dashboard-page{
  font-family:"Inter","Avenir Next","Segoe UI",system-ui,sans-serif;
}
.role-dashboard-kicker{font-size:12px!important}
.role-stat small{font-size:13px!important;line-height:1.45!important}
.role-info-card>span,.role-live-card>div>span{font-size:12px!important}
.role-info-card p{font-size:15px!important;line-height:1.7!important}
.role-live-card p{font-size:15px!important;line-height:1.7!important}
.role-progress>div{font-size:13px!important}
.role-progress small{font-size:12px!important;line-height:1.45!important}
.role-panel-kicker{font-size:11px!important}
.role-panel-sub{font-size:15px!important}
.role-choice small{font-size:12px!important}
.demo-credentials{font-size:12px!important}
.role-job-row b{font-size:14px!important}
.role-job-row small{font-size:12px!important;line-height:1.45!important}
.role-timeline span{font-size:11px!important}
.smart-chip-grid span{font-size:12px!important}
.role-streak{font-size:13px!important}

/* Automatic delivery status */
.progress-head b{font-size:14px!important}
.progress-head span{font-size:13px!important}
.delivery-status-text{font-size:15px!important}

@media(max-width:1050px){
  .shelter-row{grid-template-columns:30px 44px minmax(150px,1fr) 68px 68px 108px 116px}
}
@media(max-width:720px){
  .shelter-row{grid-template-columns:28px 42px 1fr 92px;min-height:80px}
  .shelter-row .accept-btn{min-height:44px;font-size:13px;padding:0 9px}
  .shelter-info small{font-size:12px!important}
  .shelter-info em{font-size:11px!important}
}
@media(max-width:420px){
  .shelter-row{grid-template-columns:26px 38px minmax(0,1fr);padding-right:92px;position:relative}
  .shelter-row .accept-btn{
    position:absolute;
    right:10px;
    top:50%;
    transform:translateY(-50%);
    width:76px;
    min-height:38px;
    font-size:11px;
  }
}

/* ===== ROLE PORTALS ===== */
.portal-nav{display:flex;gap:7px;flex-wrap:wrap;padding:10px;border:1px solid var(--line);background:rgba(255,255,255,.035);border-radius:16px;margin:22px 0}.portal-nav button{border:0;background:transparent;color:var(--muted);padding:10px 14px;border-radius:10px;font-size:12px;font-weight:800}.portal-nav button.active{background:#fff;color:#183246;box-shadow:0 5px 18px rgba(0,0,0,.08)}.portal-hero-card{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:30px;border:1px solid var(--line);border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.86),rgba(241,247,243,.75));color:#20372c}.portal-kicker,.portal-section-head>span,.portal-section-head>div>span{font-size:10px;letter-spacing:.15em;font-weight:900;color:#5a8064}.portal-hero-card h1{font-size:clamp(32px,4vw,54px);margin:8px 0 8px;letter-spacing:-.04em}.portal-hero-card p{margin:0;color:#6d7b74;max-width:650px;font-size:15px}.portal-live{display:flex;align-items:center;gap:7px;padding:9px 12px;border-radius:999px;background:#eaf3ec;color:#4f7659;font-size:10px;font-weight:900;white-space:nowrap}.portal-live i{width:7px;height:7px;border-radius:50%;background:#5b8a66}.portal-action-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0}.demo-banner{display:flex;align-items:center;gap:12px;margin:12px 0;padding:12px 15px;border:1px solid rgba(154,106,69,.16);border-radius:14px;background:#fbf5ec;color:#725b48}.demo-banner b{font-size:10px;letter-spacing:.1em;color:#9a6a45;white-space:nowrap}.demo-banner span{font-size:11px;line-height:1.5;color:#7d7166}.portal-tile{display:flex;align-items:center;gap:14px;text-align:left;border:1px solid var(--line);border-radius:18px;padding:18px;background:rgba(255,255,255,.72);color:#20372c;box-shadow:0 10px 30px rgba(33,51,43,.04)}.portal-tile:hover{transform:translateY(-2px);box-shadow:0 16px 35px rgba(33,51,43,.08)}.portal-tile>span{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#edf5ef;color:#5b8063}.portal-tile div{flex:1}.portal-tile b,.portal-tile small{display:block}.portal-tile b{font-size:14px}.portal-tile small{font-size:11px;color:#7a8780;margin-top:4px;line-height:1.4}.portal-tile i{font-style:normal;font-size:18px;color:#64816b}.portal-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0 18px}.portal-stat{padding:18px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.7)}.portal-stat strong{display:block;font-size:27px;color:#315f79}.portal-stat span{font-size:10px;color:#77847d;margin-top:4px;display:block}.portal-recent,.portal-list{border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,.72);padding:20px}.portal-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:4px}.portal-section-head h2{margin:5px 0 3px;color:#284f67;font-size:24px}.portal-section-head p{margin:0;color:#7a8780;font-size:12px}.portal-section-head>b{font-size:13px;color:#315f79}.portal-notice{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}.portal-notice:last-child{border-bottom:0}.portal-notice>span{width:32px;height:32px;border-radius:10px;background:#edf5ef;display:grid;place-items:center;color:#5b8063}.portal-notice b,.portal-notice small{display:block}.portal-notice b{font-size:12px;color:#30483c}.portal-notice small{font-size:10px;color:#88928d;margin-top:3px}.portal-empty{padding:28px 10px;text-align:center;color:#8a958f;font-size:12px}.portal-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:12px;align-items:center;padding:15px 4px;border-bottom:1px solid var(--line)}.portal-row:last-child{border-bottom:0}.portal-row-icon{width:36px;height:36px;border-radius:11px;background:#edf5ef;color:#5b8063;display:grid;place-items:center}.portal-row b,.portal-row small{display:block}.portal-row b{font-size:13px;color:#2d4d60}.portal-row small{font-size:10px;color:#7e8984;margin-top:4px}.portal-row>strong{font-size:11px;color:#567c60;text-align:right}.portal-small-btn,.portal-decline{border:0;border-radius:9px;padding:8px 11px;font-size:10px;font-weight:900}.portal-small-btn{background:#527a5b;color:#fff}.portal-decline{background:#f8ece5;color:#a05b35}.portal-dual{display:flex;gap:6px}.portal-detail-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.portal-detail-card{border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,.75);padding:24px}.portal-detail-card>span{font-size:10px;letter-spacing:.14em;font-weight:900;color:#5a8064}.portal-detail-card h2{font-size:25px;color:#2e5870;margin:8px 0}.portal-detail-card p{color:#7c8882;font-size:12px;line-height:1.6}.portal-progress{height:10px;border-radius:999px;background:#e5ebe6;overflow:hidden;margin:22px 0 8px}.portal-progress i{display:block;height:100%;background:linear-gradient(90deg,#527a5b,#9ab37f);border-radius:inherit}.portal-detail-card>strong{font-size:24px;color:#315f79}.portal-primary{border:0;border-radius:11px;background:#527a5b;color:white;padding:11px 15px;font-size:11px;font-weight:900;display:inline-flex;align-items:center;gap:7px}.portal-secondary-action{margin:10px 0 0 8px;border:1px solid #dce4de;border-radius:11px;background:#f5f8f5;color:#527a5b;padding:10px 13px;font-size:11px;font-weight:900}.demo-badge{display:inline-flex;padding:4px 7px;border-radius:99px;background:#f3eee6;color:#9a6a45;font-size:9px;font-weight:900;letter-spacing:.06em}.portal-row small{line-height:1.45}.portal-handoff{max-width:760px}.otp-row{display:flex;gap:10px;margin-top:18px}.otp-row input{width:150px;border:1px solid #dce4de;border-radius:10px;padding:12px;font-size:20px;letter-spacing:.25em;text-align:center}.verified-box{margin-top:18px;padding:14px;border-radius:12px;background:#eaf4ed;color:#4e7659;font-weight:800}.portal-inline-modal{margin-top:16px;border:1px solid #dce5df;border-radius:20px;background:#fff;padding:24px;box-shadow:0 20px 50px rgba(31,50,40,.12)}.portal-form-head{display:flex;justify-content:space-between;align-items:flex-start}.portal-form-head span{font-size:10px;letter-spacing:.14em;font-weight:900;color:#5a8064}.portal-form-head h2{margin:5px 0 18px;color:#2d5267}.portal-form-head button{border:0;background:#edf2ee;border-radius:9px;width:34px;height:34px;font-size:20px}.portal-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.portal-form-grid label{font-size:11px;font-weight:800;color:#5d6d65}.portal-form-grid input,.portal-form-grid select{display:block;width:100%;margin-top:6px;border:1px solid #dce4de;border-radius:10px;padding:11px;background:#fff;color:#30473d}.portal-inline-modal .portal-primary{margin-top:15px}.role-dashboard-page{background:rgba(246,244,237,.46);min-height:calc(100vh - 72px);color:#25392f}.role-dashboard-page .role-dashboard{padding-top:34px;padding-bottom:70px}.role-dashboard-actions{display:flex;gap:8px}.role-dashboard-actions .secondary,.role-dashboard-actions .reset{border-radius:10px;padding:10px 13px}.role-dashboard-actions .reset{border:1px solid #e1cfc5;background:#fff;color:#9b5e3c}.role-dashboard-actions .secondary{border:1px solid #dce4de;background:#fff;color:#4f6e59}@media(max-width:800px){.demo-banner{align-items:flex-start;flex-direction:column;gap:5px}.portal-action-grid,.portal-summary-grid,.portal-detail-grid{grid-template-columns:1fr 1fr}.portal-hero-card{flex-direction:column}.portal-form-grid{grid-template-columns:1fr}}@media(max-width:560px){.portal-action-grid,.portal-summary-grid,.portal-detail-grid{grid-template-columns:1fr}.portal-row{grid-template-columns:36px minmax(0,1fr)}.portal-row>strong{grid-column:2;text-align:left}.otp-row{flex-direction:column}.otp-row input{width:100%}}

/* ===== FINAL PERFORMANCE + LIQUID GLASS PASS =====
   One motion system. No bounce keyframes, no continuous breathing, no JS pointer loop.
   Heavy blur is limited to the surfaces that actually need the glass look. */

/* Remove legacy animation loops / layer hints from earlier passes. */
.app .command-card,
.app .board-main,
.app .workflow,
.app .shelter-list,
.app .match-explainer,
.app .tracking-shell,
.app .impact-tile,
.app .impact-bottom,
.app .final-cta,
.app .rescue-job,
.app .shelter-row,
.app .ops-card,
.app .queue-item,
.app .progress-card,
.app .priority-card,
.app .mini-command,
.app .role-stat,
.app .role-info-card,
.app .role-live-card,
.app .portal-detail-card,
.app .portal-recent,
.app .portal-list,
.app .portal-hero-card,
.app .portal-inline-modal,
.app .portal-tile,
.app .portal-row,
.app .portal-nav button,
.app button,
.role-login-shell button{
  animation:none!important;
  will-change:auto;
}

/* Main glass surfaces: enough blur for depth without forcing a huge backdrop-filter area. */
.app .command-card,
.app .board-main,
.app .workflow,
.app .shelter-list,
.app .match-explainer,
.app .tracking-shell,
.app .impact-tile,
.app .impact-bottom,
.app .final-cta,
.app .rescue-job,
.app .shelter-row,
.app .ops-card,
.app .queue-item,
.app .progress-card,
.app .portal-detail-card,
.app .portal-recent,
.app .portal-list,
.app .portal-hero-card,
.app .portal-inline-modal{
  position:relative;
  overflow:hidden;
  transform:translate3d(0,0,0);
  backface-visibility:hidden;
  -webkit-backface-visibility:hidden;
  transition:
    transform 480ms cubic-bezier(.22,.8,.2,1),
    box-shadow 480ms cubic-bezier(.22,.8,.2,1),
    border-color 360ms ease,
    background-color 360ms ease;
}

/* Keep the liquid look, but reduce expensive backdrop blur from the old 18–24px stack. */
.app .command-card,
.app .board-main,
.app .workflow,
.app .shelter-list,
.app .match-explainer,
.app .tracking-shell,
.app .impact-tile,
.app .impact-bottom,
.app .final-cta,
.app .rescue-job,
.app .shelter-row,
.app .ops-card,
.app .queue-item,
.app .progress-card{
  backdrop-filter:blur(12px) saturate(118%);
  -webkit-backdrop-filter:blur(12px) saturate(118%);
}

/* Static glass highlight. No continuous shimmer. */
.app .command-card::before,
.app .board-main::before,
.app .workflow::before,
.app .shelter-list::before,
.app .match-explainer::before,
.app .tracking-shell::before,
.app .impact-tile::before,
.app .impact-bottom::before,
.app .final-cta::before,
.app .rescue-job::before,
.app .shelter-row::before,
.app .ops-card::before,
.app .queue-item::before,
.app .progress-card::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:2;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(135deg,rgba(255,255,255,.16),transparent 26%,transparent 72%,rgba(255,255,255,.08));
  opacity:.7;
}

/* One restrained glossy sweep on hover. transform + opacity are composited cheaply. */
.app .command-card::after,
.app .board-main::after,
.app .workflow::after,
.app .shelter-list::after,
.app .match-explainer::after,
.app .tracking-shell::after,
.app .impact-tile::after,
.app .impact-bottom::after,
.app .final-cta::after,
.app .rescue-job::after,
.app .shelter-row::after,
.app .ops-card::after,
.app .queue-item::after,
.app .progress-card::after{
  content:"";
  position:absolute;
  inset:-25% -35%;
  z-index:3;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(110deg,transparent 40%,rgba(255,255,255,.40) 49%,rgba(255,255,255,.08) 54%,transparent 64%);
  transform:translate3d(-58%,0,0) rotate(0.001deg);
  opacity:0;
  transition:transform 900ms cubic-bezier(.22,.8,.2,1),opacity 360ms ease;
}

@media (hover:hover) and (pointer:fine){
  .app .command-card:hover,
  .app .board-main:hover,
  .app .workflow:hover,
  .app .shelter-list:hover,
  .app .match-explainer:hover,
  .app .tracking-shell:hover,
  .app .impact-tile:hover,
  .app .impact-bottom:hover,
  .app .final-cta:hover,
  .app .rescue-job:hover,
  .app .shelter-row:hover,
  .app .ops-card:hover,
  .app .queue-item:hover,
  .app .progress-card:hover,
  .app .priority-card:hover,
  .app .mini-command:hover,
  .app .portal-detail-card:hover,
  .app .portal-recent:hover,
  .app .portal-list:hover,
  .app .portal-hero-card:hover,
  .app .portal-inline-modal:hover,
  .app .portal-tile:hover,
  .app .portal-row:hover,
  .app .role-stat:hover,
  .app .role-info-card:hover,
  .app .role-live-card:hover{
    transform:translate3d(0,-6px,0) scale(1.006);
    border-color:rgba(92,132,101,.24)!important;
    box-shadow:0 20px 46px rgba(49,61,51,.11),inset 0 1px 0 rgba(255,255,255,.98);
  }

  .app .command-card:hover::after,
  .app .board-main:hover::after,
  .app .workflow:hover::after,
  .app .shelter-list:hover::after,
  .app .match-explainer:hover::after,
  .app .tracking-shell:hover::after,
  .app .impact-tile:hover::after,
  .app .impact-bottom:hover::after,
  .app .final-cta:hover::after,
  .app .rescue-job:hover::after,
  .app .shelter-row:hover::after,
  .app .ops-card:hover::after,
  .app .queue-item:hover::after,
  .app .progress-card:hover::after{
    transform:translate3d(58%,0,0) rotate(0.001deg);
    opacity:1;
  }
}

/* Small glass icons: lower blur, subtle depth, same calm motion language. */
.app .priority-icon,
.app .mini-command>span,
.app .shelter-symbol,
.app .workflow-step i,
.app .driver-avatar,
.app .empty-ring,
.app .nav-icon,
.app .account span,
.app .role-brand-mark,
.app .role-choice>span,
.app .role-stat>span,
.app .impact-icon,
.app .food-dot,
.app .logo-box,
.app .portal-row-icon,
.app .portal-tile>span,
.app .feature-close,
.app .role-close{
  position:relative;
  overflow:hidden;
  background:linear-gradient(145deg,rgba(255,255,255,.52),rgba(255,255,255,.14))!important;
  border:1px solid rgba(255,255,255,.72)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.96),inset 0 -5px 12px rgba(82,122,91,.05),0 7px 18px rgba(46,70,53,.07);
  backdrop-filter:blur(5px) saturate(115%);
  -webkit-backdrop-filter:blur(5px) saturate(115%);
  transition:transform 430ms cubic-bezier(.22,.8,.2,1),box-shadow 430ms cubic-bezier(.22,.8,.2,1),background-color 340ms ease,border-color 340ms ease;
}

.app .priority-icon::after,
.app .mini-command>span::after,
.app .shelter-symbol::after,
.app .workflow-step i::after,
.app .driver-avatar::after,
.app .empty-ring::after,
.app .nav-icon::after,
.app .account span::after,
.app .role-brand-mark::after,
.app .role-choice>span::after,
.app .role-stat>span::after,
.app .impact-icon::after,
.app .food-dot::after,
.app .logo-box::after,
.app .portal-row-icon::after,
.app .portal-tile>span::after,
.app .feature-close::after,
.app .role-close::after{
  content:"";
  position:absolute;
  left:10%;
  top:7%;
  width:70%;
  height:30%;
  border-radius:999px;
  background:rgba(255,255,255,.64);
  opacity:.7;
  filter:blur(3px);
  transform:rotate(-12deg);
  pointer-events:none;
}

@media (hover:hover) and (pointer:fine){
  .app .priority-icon:hover,
  .app .mini-command:hover>span,
  .app .shelter-row:hover .shelter-symbol,
  .app .workflow-step:hover i,
  .app .driver-card:hover .driver-avatar,
  .app .empty-board:hover .empty-ring,
  .app .nav-icon:hover,
  .app .account:hover span,
  .app .impact-icon:hover,
  .app .food-dot:hover,
  .app .logo-box:hover,
  .app .role-choice:hover>span,
  .app .role-stat:hover>span,
  .app .portal-row:hover .portal-row-icon,
  .app .portal-tile:hover>span{
    transform:translate3d(0,-3px,0) scale(1.04);
    box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 12px 24px rgba(82,122,91,.13);
  }
}

/* Monotonic hover lift. Never use bounce/rebound keyframes on controls. */
.app .nav-item,
.app .nav-icon,
.app .account,
.app .fullscreen-btn,
.app .hamburger,
.app .logo,
.app .primary,
.app .secondary,
.app .reset,
.app .hero-proof span,
.app .command-card button,
.app .priority-card button,
.app .section-title button,
.app .accept-btn,
.app .queue-item,
.app .workflow-step,
.app .delivery-tools button,
.app .tracking-actions button,
.app .driver-card,
.app .final-cta button,
.app .rescue-job button,
.app .role-login-submit,
.app .role-choice,
.app .portal-nav button,
.app .portal-tile,
.app .portal-primary,
.app .portal-secondary-action,
.app .portal-small-btn,
.app .portal-decline,
.app .portal-row,
.app .portal-stat,
.app .portal-form-head button,
.app .portal-dashboard-actions button,
.app .modal .primary,
.app .modal .secondary,
.app .modal button[type="submit"]{
  transform:translate3d(0,0,0);
  transition:transform 430ms cubic-bezier(.22,.8,.2,1),box-shadow 430ms cubic-bezier(.22,.8,.2,1),border-color 340ms ease,background-color 340ms ease,color 340ms ease;
}

@media (hover:hover) and (pointer:fine){
  .app .nav-item:hover,
  .app .nav-icon:hover,
  .app .account:hover,
  .app .fullscreen-btn:hover,
  .app .hamburger:hover,
  .app .logo:hover,
  .app .primary:hover,
  .app .secondary:hover,
  .app .reset:hover,
  .app .hero-proof span:hover,
  .app .command-card button:hover,
  .app .priority-card button:hover,
  .app .section-title button:hover,
  .app .accept-btn:hover,
  .app .queue-item:hover,
  .app .workflow-step:hover,
  .app .delivery-tools button:hover,
  .app .tracking-actions button:hover,
  .app .driver-card:hover,
  .app .final-cta button:hover,
  .app .rescue-job button:hover,
  .app .role-login-submit:hover,
  .app .role-choice:hover,
  .app .portal-nav button:hover,
  .app .portal-tile:hover,
  .app .portal-primary:hover,
  .app .portal-secondary-action:hover,
  .app .portal-small-btn:hover,
  .app .portal-decline:hover,
  .app .portal-row:hover,
  .app .portal-stat:hover,
  .app .portal-form-head button:hover,
  .app .portal-dashboard-actions button:hover,
  .app .modal .primary:hover,
  .app .modal .secondary:hover,
  .app .modal button[type="submit"]:hover{
    transform:translate3d(0,-4px,0) scale(1.006);
  }
}

.app .primary:active,.app .secondary:active,.app .reset:active,
.app .nav-icon:active,.app .account:active,.app .fullscreen-btn:active,
.app .portal-tile:active,.app .portal-primary:active,.app .portal-secondary-action:active,
.app .portal-small-btn:active,.app .portal-decline:active,.app .role-login-submit:active,
.app .accept-btn:active,.app .tracking-actions button:active{
  transform:translate3d(0,1px,0) scale(.985)!important;
  transition-duration:100ms!important;
}

/* Form controls: small, slow lift. */
.modal-form input,.modal-form select,
.portal-form-grid input,.portal-form-grid select,
.role-login-form input,.otp-row input{
  transition:transform 360ms cubic-bezier(.22,.8,.2,1),box-shadow 360ms cubic-bezier(.22,.8,.2,1),border-color 320ms ease,background-color 320ms ease!important;
}

@media (hover:hover) and (pointer:fine){
  .modal-form input:hover,.modal-form select:hover,
  .portal-form-grid input:hover,.portal-form-grid select:hover,
  .role-login-form input:hover,.otp-row input:hover{
    transform:translate3d(0,-2px,0) scale(1.003);
    box-shadow:0 9px 20px rgba(49,61,51,.08),inset 0 1px 0 rgba(255,255,255,.98);
  }
}

.modal-form input:focus,.modal-form select:focus,
.portal-form-grid input:focus,.portal-form-grid select:focus,
.role-login-form input:focus,.otp-row input:focus{
  transform:translate3d(0,-2px,0) scale(1.003);
  border-color:rgba(82,122,91,.34)!important;
  box-shadow:0 9px 20px rgba(49,61,51,.08),inset 0 1px 0 rgba(255,255,255,.98);
}

/* Modal / login / portal transitions: opacity + transform only (no animated blur). */
.backdrop{
  background:rgba(28,38,30,.27)!important;
  backdrop-filter:blur(14px) saturate(112%)!important;
  -webkit-backdrop-filter:blur(14px) saturate(112%)!important;
  animation:s2sBackdropIn 420ms cubic-bezier(.22,.75,.18,1) both!important;
}
.modal{
  position:relative;
  transform-origin:50% 72%;
  animation:s2sModalIn 520ms cubic-bezier(.16,1,.3,1) both!important;
}
.role-login-shell{animation:s2sLoginIn 520ms cubic-bezier(.16,1,.3,1) both!important}
.role-login-panel{animation:s2sLoginPanelIn 560ms cubic-bezier(.16,1,.3,1) 40ms both!important}
.role-dashboard-page{animation:s2sPortalIn 560ms cubic-bezier(.16,1,.3,1) both}
.portal-view-transition{animation:s2sViewIn 360ms cubic-bezier(.16,1,.3,1) both}
.portal-page-leaving{animation:s2sPortalOut 300ms cubic-bezier(.65,0,.84,.2) both!important;pointer-events:none}

/* Role picker keeps its icon above the text with clean spacing. */
.role-picker-grid{gap:10px}
.role-choice{
  min-height:96px!important;
  padding:14px 34px 12px 14px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:flex-start!important;
  justify-content:center!important;
  gap:4px!important;
}
.role-choice>span{
  position:relative!important;
  left:auto!important;
  top:auto!important;
  width:34px!important;
  height:34px!important;
  margin-bottom:2px;
  border-radius:11px!important;
}
.role-choice b{font-size:12px!important;line-height:1.1}
.role-choice small{font-size:8px!important;margin-top:1px!important}
.role-choice i{right:12px!important;top:14px!important;transition:transform 360ms cubic-bezier(.22,.8,.2,1)!important}
@media (hover:hover) and (pointer:fine){
  .role-choice:hover{transform:translate3d(0,-4px,0) scale(1.006)!important;box-shadow:0 16px 32px rgba(49,61,51,.10),inset 0 1px 0 #fff!important}
  .role-choice:hover i{transform:translate3d(3px,0,0)}
}
.role-choice.active{box-shadow:0 10px 26px rgba(82,122,91,.12),inset 0 1px 0 rgba(255,255,255,.9)!important}
.role-login-submit{transition:transform 380ms cubic-bezier(.16,1,.3,1),box-shadow 380ms cubic-bezier(.16,1,.3,1)!important}
@media (hover:hover) and (pointer:fine){.role-login-submit:hover{transform:translate3d(0,-4px,0) scale(1.006)!important}}

/* Portal tabs/pages keep transitions deliberate and short. */
.portal-nav button{transition:transform 320ms cubic-bezier(.22,.8,.2,1),background-color 320ms ease,color 320ms ease,border-color 320ms ease,box-shadow 320ms ease!important}
.portal-tile,.role-stat,.role-info-card,.role-live-card,.portal-detail-card,.portal-section-card,.portal-notice,.portal-row{
  transition:transform 380ms cubic-bezier(.16,1,.3,1),box-shadow 380ms cubic-bezier(.16,1,.3,1),border-color 320ms ease,background-color 320ms ease!important;
}
@media (hover:hover) and (pointer:fine){
  .portal-tile:hover,.role-stat:hover,.role-info-card:hover,.role-live-card:hover,.portal-detail-card:hover{transform:translate3d(0,-4px,0) scale(1.004)}
}

/* One-shot page/modal keyframes. */
@keyframes s2sBackdropIn{from{opacity:0}to{opacity:1}}
@keyframes s2sModalIn{from{opacity:0;transform:translate3d(0,20px,0) scale(.97)}to{opacity:1;transform:none}}
@keyframes s2sLoginIn{from{opacity:0;transform:translate3d(0,18px,0) scale(.97)}to{opacity:1;transform:none}}
@keyframes s2sLoginPanelIn{from{opacity:0;transform:translate3d(18px,0,0)}to{opacity:1;transform:none}}
@keyframes s2sPortalIn{from{opacity:0;transform:translate3d(0,18px,0) scale(.99)}to{opacity:1;transform:none}}
@keyframes s2sViewIn{from{opacity:0;transform:translate3d(0,9px,0)}to{opacity:1;transform:none}}
@keyframes s2sPortalOut{from{opacity:1;transform:none}to{opacity:0;transform:translate3d(0,12px,0) scale(.99)}}

/* Touch devices don't need hover transforms; prevents sticky-hover feel and saves work. */
@media (hover:none){
  .app .command-card:hover,.app .board-main:hover,.app .workflow:hover,.app .shelter-list:hover,
  .app .match-explainer:hover,.app .tracking-shell:hover,.app .impact-tile:hover,.app .impact-bottom:hover,
  .app .final-cta:hover,.app .rescue-job:hover,.app .shelter-row:hover,.app .ops-card:hover,
  .app .queue-item:hover,.app .progress-card:hover,.app .portal-detail-card:hover,.app .portal-recent:hover,
  .app .portal-list:hover,.app .portal-hero-card:hover,.app .portal-inline-modal:hover,.app .portal-tile:hover,
  .app .portal-row:hover,.app .role-stat:hover,.app .role-info-card:hover,.app .role-live-card:hover{
    transform:translate3d(0,0,0)!important;
  }
}



/* Background ambient glow is intentionally static: blur is kept, the expensive
   18s perpetual transform animation is removed. */
.app:before{animation:none!important;filter:blur(24px)}

/* Only overlay surfaces use heavier glass blur, and only while they are open. */
.nav{backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.map-overlay{backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
.feature-backdrop{backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}

/* ===== FINAL COLOR-WASH / SOFT-LIQUID BACKDROP — 3 DISTINCT THEMES =====
   The background is intentionally richer than the white UI surfaces: broad, warm/cool
   color pools sit underneath the glass cards and cross-fade as a single composited layer. */
.app{background:transparent!important;position:relative;isolation:isolate}
.app:before{display:none!important}
body{background:#dfe7df!important}
.ambient-stage{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:
  radial-gradient(58vw 48vw at 0% 0%,rgba(78,170,127,.22),transparent 70%),
  radial-gradient(54vw 46vw at 100% 0%,rgba(104,145,216,.18),transparent 72%),
  radial-gradient(56vw 48vw at 100% 100%,rgba(231,128,101,.18),transparent 72%),
  linear-gradient(180deg,#e8eee8 0%,#e5ebe5 52%,#ebe9e2 100%)}
.ambient-layer{position:absolute;inset:-4%;opacity:0;transition:opacity 1.2s cubic-bezier(.22,.61,.36,1);overflow:hidden}
.ambient-layer.active{opacity:1;will-change:opacity;overflow:hidden;animation:ambientDrift 10.5s ease-in-out infinite alternate}
.ambient-layer::before,.ambient-layer::after{content:"";position:absolute;border-radius:50%;pointer-events:none}
@keyframes ambientDrift{
  0%{transform:translate3d(-1.2%, -0.8%, 0) scale(1.01)}
  50%{transform:translate3d(1.4%, 1%, 0) scale(1.035)}
  100%{transform:translate3d(-.6%, 1.5%, 0) scale(1.02)}
}

.ambient-theme-1{background:
  radial-gradient(46vw 38vw at -4% 2%,rgba(51,170,125,.24),transparent 72%),
  radial-gradient(44vw 34vw at 25% 76%,rgba(99,183,143,.16),transparent 72%),
  radial-gradient(42vw 34vw at 103% 9%,rgba(92,147,224,.21),transparent 71%),
  radial-gradient(40vw 34vw at 84% 83%,rgba(235,128,94,.21),transparent 72%),
  radial-gradient(36vw 32vw at 54% 44%,rgba(175,138,219,.09),transparent 73%),
  linear-gradient(180deg,#e3ece3 0%,#e5ebe5 50%,#ece6dd 100%)}
.ambient-theme-1::before{width:52vw;height:52vw;left:-12vw;top:8vh;background:radial-gradient(circle at 60% 48%,rgba(40,163,117,.24),rgba(40,163,117,0) 68%);filter:blur(48px)}
.ambient-theme-1::after{width:50vw;height:50vw;right:-13vw;bottom:-7vh;background:radial-gradient(circle at 44% 46%,rgba(240,123,93,.22),rgba(240,123,93,0) 69%);filter:blur(52px)}
.ambient-theme-2{background:
  radial-gradient(48vw 39vw at 10% -2%,rgba(65,171,187,.22),transparent 72%),
  radial-gradient(43vw 35vw at 98% 24%,rgba(133,112,214,.22),transparent 72%),
  radial-gradient(46vw 36vw at 72% 103%,rgba(97,168,132,.18),transparent 72%),
  radial-gradient(36vw 31vw at 35% 84%,rgba(245,194,91,.15),transparent 72%),
  radial-gradient(35vw 30vw at 51% 44%,rgba(239,139,156,.08),transparent 73%),
  linear-gradient(180deg,#e1ebec 0%,#e0e5ef 52%,#e8ede3 100%)}
.ambient-theme-2::before{width:54vw;height:54vw;left:-10vw;top:-12vh;background:radial-gradient(circle at 56% 58%,rgba(52,167,188,.23),rgba(52,167,188,0) 68%);filter:blur(50px)}
.ambient-theme-2::after{width:53vw;height:53vw;right:-13vw;bottom:-11vh;background:radial-gradient(circle at 38% 40%,rgba(134,104,216,.22),rgba(134,104,216,0) 70%);filter:blur(54px)}
.ambient-theme-3{background:
  radial-gradient(49vw 40vw at -4% 86%,rgba(225,118,81,.23),transparent 72%),
  radial-gradient(46vw 37vw at 101% 5%,rgba(99,163,96,.21),transparent 72%),
  radial-gradient(47vw 38vw at 58% 48%,rgba(126,141,210,.16),transparent 73%),
  radial-gradient(38vw 33vw at 78% 98%,rgba(240,190,80,.15),transparent 72%),
  radial-gradient(34vw 29vw at 18% 20%,rgba(83,177,160,.09),transparent 73%),
  linear-gradient(180deg,#ece3dd 0%,#e4e9df 52%,#ece6df 100%)}
.ambient-theme-3::before{width:56vw;height:56vw;left:-14vw;bottom:-15vh;background:radial-gradient(circle at 60% 40%,rgba(224,108,77,.23),rgba(224,108,77,0) 68%);filter:blur(52px)}
.ambient-theme-3::after{width:54vw;height:54vw;right:-15vw;top:-13vh;background:radial-gradient(circle at 42% 54%,rgba(92,158,92,.21),rgba(92,158,92,0) 70%);filter:blur(56px)}
.app>header,.app>main,.app>footer{position:relative;z-index:1}
/* Make the brand mark read clearly over all three color washes. */
.app .logo-box{background:linear-gradient(135deg,#3f8c67 0%,#5da07b 52%,#e38a62 100%)!important;color:#fff!important;border-color:rgba(255,255,255,.9)!important;box-shadow:0 9px 25px rgba(71,123,88,.24),inset 0 1px 0 rgba(255,255,255,.92)!important}
.app .logo-box svg{filter:drop-shadow(0 1px 1px rgba(30,62,40,.16))}
@media (max-width:720px){
  .ambient-theme-1::before,.ambient-theme-2::before,.ambient-theme-3::before{width:78vw;height:78vw}
  .ambient-theme-1::after,.ambient-theme-2::after,.ambient-theme-3::after{width:72vw;height:72vw}
}
@media (prefers-reduced-motion:reduce){.ambient-layer{transition:none!important}}

/* A few controls not covered by the main button groups get the same calm lift. */
.ops-action,.map-toggle,.feature-close,.role-close,.close{
  transition:transform 360ms cubic-bezier(.22,.8,.2,1),box-shadow 360ms cubic-bezier(.22,.8,.2,1),background-color 320ms ease,border-color 320ms ease,color 320ms ease;
}
@media (hover:hover) and (pointer:fine){
  .ops-action:hover,.map-toggle:hover,.feature-close:hover,.role-close:hover,.close:hover{
    transform:translate3d(0,-3px,0) scale(1.004);
  }
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    scroll-behavior:auto!important;
    transition-duration:.01ms!important;
  }
}

/* ===== FINAL TEAM SIGNATURE + SHARED PORTAL COLOR WASH ===== */
.team-section{padding-top:12px;padding-bottom:86px}
.team-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.72);border-radius:30px;padding:34px 36px;background:linear-gradient(135deg,rgba(255,255,255,.64),rgba(255,255,255,.32));box-shadow:0 24px 70px rgba(43,70,56,.10),inset 0 1px 0 rgba(255,255,255,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.team-card:before{content:"";position:absolute;width:240px;height:240px;left:-100px;top:-120px;border-radius:50%;background:rgba(63,160,119,.18);filter:blur(38px);pointer-events:none}
.team-card:after{content:"";position:absolute;width:260px;height:260px;right:-100px;bottom:-150px;border-radius:50%;background:rgba(226,126,91,.17);filter:blur(42px);pointer-events:none}
.team-heading,.team-members{position:relative;z-index:1}
.team-heading>span{font-size:10px;letter-spacing:.16em;font-weight:900;color:#527b65}
.team-heading h2{margin:7px 0 4px;font-size:clamp(28px,3.2vw,42px);letter-spacing:-.045em;color:#294d5f}
.team-heading h2 em{font-style:normal;background:linear-gradient(90deg,#3f8766,#527ca4,#c9785e);-webkit-background-clip:text;background-clip:text;color:transparent}
.team-heading p{margin:0;color:#708078;font-size:12px}
.team-members{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px}
.team-member{display:flex;align-items:center;gap:11px;padding:14px;border:1px solid rgba(255,255,255,.72);border-radius:17px;background:rgba(255,255,255,.48);box-shadow:0 10px 28px rgba(39,61,49,.06);transition:transform 360ms cubic-bezier(.16,1,.3,1),box-shadow 360ms ease,border-color 320ms ease}
.team-avatar{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:12px;color:#fff;background:linear-gradient(135deg,#3f8d68,#5b9c78 55%,#df8964);box-shadow:0 7px 18px rgba(66,125,91,.18);border:1px solid rgba(255,255,255,.8)}
.team-member strong,.team-member small{display:block}.team-member strong{font-size:17px;color:#294b5c}.team-member small{font-size:11px;color:#718078;margin-top:3px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}
.team-leader{background:linear-gradient(135deg,rgba(255,255,255,.7),rgba(237,247,239,.58));border-color:rgba(82,139,101,.28)}
@media (hover:hover) and (pointer:fine){.team-member:hover{transform:translate3d(0,-4px,0);box-shadow:0 18px 35px rgba(39,61,49,.10);border-color:rgba(82,139,101,.25)}}
.role-dashboard-page{background:rgba(246,244,237,.40)!important}
.role-dashboard-page .section{position:relative}
@media(max-width:800px){.team-members{grid-template-columns:1fr 1fr}.team-card{padding:28px 24px}}
@media(max-width:520px){.team-members{grid-template-columns:1fr}.team-card{padding:24px 18px}.team-section{padding-bottom:60px}}


/* ===== FINAL PERFORMANCE SAFE PASS ===== */
.section,.section-shell{content-visibility:auto;contain-intrinsic-size:720px;}
@media (prefers-reduced-motion:reduce){.ambient-layer.active{animation:none!important}.ambient-layer{transition:none!important}}

`;

export default App;