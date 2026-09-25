const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const donations = [];
const ngoRequirements = [];
const needyRequests = [];
const deliveries = [];

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Surplus2Shelter backend is running"
  });
});

app.get("/api/donations", (req, res) => {
  res.json(donations);
});

app.post("/api/donations", (req, res) => {
  const donation = {
    id: Date.now().toString(),
    ...req.body,
    status: "PENDING_SAFETY",
    createdAt: new Date().toISOString()
  };

  donations.push(donation);

  res.status(201).json({
    success: true,
    donation
  });
});

app.get("/api/ngos", (req, res) => {
  res.json(ngoRequirements);
});

app.post("/api/ngos", (req, res) => {
  const ngo = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };

  ngoRequirements.push(ngo);

  res.status(201).json({
    success: true,
    ngo
  });
});

app.get("/api/need-food", (req, res) => {
  res.json(needyRequests);
});

app.post("/api/need-food", (req, res) => {
  const request = {
    id: Date.now().toString(),
    ...req.body,
    status: "PENDING_MATCH",
    createdAt: new Date().toISOString()
  };

  needyRequests.push(request);

  res.status(201).json({
    success: true,
    request
  });
});

app.get("/api/deliveries", (req, res) => {
  res.json(deliveries);
});
// ================= FOOD SAFETY VERIFICATION =================

app.post("/api/food-safety/verify", (req, res) => {
  const {
    fssaiVerified,
    preparationTime,
    expiryTime,
    temperature,
    packagingIntact,
    hygienePassed,
    contaminationFree
  } = req.body;

  const now = new Date();
  const prepared = new Date(preparationTime);
  const expiry = new Date(expiryTime);

  const checks = {
    fssaiVerified: fssaiVerified === true,

    shelfLifeValid:
      !isNaN(prepared.getTime()) &&
      !isNaN(expiry.getTime()) &&
      prepared <= now &&
      expiry > now,

    temperatureSafe:
      Number(temperature) >= 60 ||
      Number(temperature) < 5,

    packagingIntact:
      packagingIntact === true,

    hygienePassed:
      hygienePassed === true,

    contaminationFree:
      contaminationFree === true
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  const safe = failedChecks.length === 0;

  res.json({
    success: true,
    safe,
    checks,
    passedChecks: Object.keys(checks).length - failedChecks.length,
    totalChecks: Object.keys(checks).length,
    failedChecks,
    status: safe
      ? "SAFE_TO_DONATE"
      : "DONATION_BLOCKED"
  });
});
// ================= SMART NEED PRIORITY =================

app.post("/api/matching/priority", (req, res) => {
  const {
    ngoName,
    requiredMeals,
    availableMeals,
    urgency = "MEDIUM",
    distanceKm = 0,
    verified = true
  } = req.body;

  const required = Number(requiredMeals) || 0;
  const available = Number(availableMeals) || 0;

  const deficit = Math.max(required - available, 0);

  const urgencyScore = {
    LOW: 20,
    MEDIUM: 50,
    HIGH: 80,
    CRITICAL: 100
  }[String(urgency).toUpperCase()] || 50;

  const needScore = Math.min((deficit / Math.max(required, 1)) * 100, 100);

  const distanceScore =
    Math.max(0, 100 - Number(distanceKm) * 10);

  const verificationScore = verified ? 100 : 0;

  const priorityScore = Math.round(
    needScore * 0.50 +
    urgencyScore * 0.25 +
    distanceScore * 0.15 +
    verificationScore * 0.10
  );

  let priority = "NORMAL";

  if (priorityScore >= 75) {
    priority = "CRITICAL";
  } else if (priorityScore >= 55) {
    priority = "HIGH";
  } else if (priorityScore >= 35) {
    priority = "MEDIUM";
  }

  res.json({
    success: true,
    ngoName,
    requiredMeals: required,
    availableMeals: available,
    unmetDemand: deficit,
    priorityScore,
    priority
  });
});


// ================= INDIVIDUAL FOOD REQUEST =================

app.post("/api/need-food/request", (req, res) => {
  const {
    name,
    peopleCount,
    mealsRequired,
    location,
    urgency = "HIGH",
    contact
  } = req.body;

  const request = {
    id: Date.now().toString(),
    name,
    peopleCount: Number(peopleCount) || 1,
    mealsRequired: Number(mealsRequired) || 1,
    location,
    urgency,
    contact,
    status: "PENDING_MATCH",
    createdAt: new Date().toISOString()
  };

  needyRequests.push(request);

  res.status(201).json({
    success: true,
    message: "Food request registered",
    request
  });
});


// ================= DONATION SAFETY STATUS =================

app.post("/api/donations/:id/approve", (req, res) => {
  const donation = donations.find(
    item => item.id === req.params.id
  );

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: "Donation not found"
    });
  }

  donation.status = "SAFETY_APPROVED";

  res.json({
    success: true,
    message: "Donation passed safety gate",
    donation
  });
});


// ================= DELIVERY CREATION =================

app.post("/api/deliveries", (req, res) => {
  const {
    donationId,
    recipientType,
    recipientName,
    pickupLocation,
    dropLocation,
    meals
  } = req.body;

  const delivery = {
    id: Date.now().toString(),
    donationId,
    recipientType,
    recipientName,
    pickupLocation,
    dropLocation,
    meals,
    status: "AVAILABLE",
    otp: "7249",
    createdAt: new Date().toISOString()
  };

  deliveries.push(delivery);

  res.status(201).json({
    success: true,
    delivery
  });
});


// ================= DRIVER ACCEPT =================

app.post("/api/deliveries/:id/accept", (req, res) => {
  const delivery = deliveries.find(
    item => item.id === req.params.id
  );

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: "Delivery not found"
    });
  }

  delivery.status = "DRIVER_ACCEPTED";

  res.json({
    success: true,
    message: "Delivery accepted by driver",
    delivery
  });
});


// ================= DELIVERY OTP =================

app.post("/api/deliveries/:id/verify-otp", (req, res) => {
  const delivery = deliveries.find(
    item => item.id === req.params.id
  );

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: "Delivery not found"
    });
  }

  const { otp } = req.body;

  if (String(otp) !== String(delivery.otp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid delivery OTP"
    });
  }

  delivery.status = "DELIVERED";
  delivery.completedAt = new Date().toISOString();

  res.json({
    success: true,
    message: "Delivery verified successfully",
    delivery
  });
});

app.listen(5000, () => {
  console.log("🚀 Surplus2Shelter backend running on http://localhost:5000");
});
