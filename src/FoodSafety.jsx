import { useState } from "react";

export default function FoodSafety() {
  const [form, setForm] = useState({
    fssaiVerified: false,
    preparationTime: "",
    expiryTime: "",
    temperature: "",
    packagingIntact: false,
    hygienePassed: false,
    contaminationFree: false,
  });

  const [result, setResult] = useState(null);

  const update = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const verifyFood = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/food-safety/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            temperature: Number(form.temperature),
          }),
        }
      );

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        safe: false,
        status: "ERROR",
        message: "Backend connection failed",
      });
    }
  };

  return (
    <div style={{
      maxWidth: 700,
      margin: "30px auto",
      padding: 28,
      borderRadius: 24,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "white",
    }}>
      <h2>🛡️ Food Safety Verification</h2>

      <p>
        Every food donation must pass all safety gates before matching.
      </p>

      <label>
        <input
          type="checkbox"
          checked={form.fssaiVerified}
          onChange={(e) =>
            update("fssaiVerified", e.target.checked)
          }
        />
        {" "}FSSAI / Restaurant Verified
      </label>

      <br /><br />

      <label>Preparation Time</label>
      <input
        type="datetime-local"
        value={form.preparationTime}
        onChange={(e) =>
          update("preparationTime", e.target.value)
        }
        style={inputStyle}
      />

      <label>Last Safe Consumption Time</label>
      <input
        type="datetime-local"
        value={form.expiryTime}
        onChange={(e) =>
          update("expiryTime", e.target.value)
        }
        style={inputStyle}
      />

      <label>Food Temperature (°C)</label>
      <input
        type="number"
        value={form.temperature}
        placeholder="Example: 72"
        onChange={(e) =>
          update("temperature", e.target.value)
        }
        style={inputStyle}
      />

      <br />

      <label>
        <input
          type="checkbox"
          checked={form.packagingIntact}
          onChange={(e) =>
            update("packagingIntact", e.target.checked)
          }
        />
        {" "}Packaging intact
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={form.hygienePassed}
          onChange={(e) =>
            update("hygienePassed", e.target.checked)
          }
        />
        {" "}Hygiene checklist passed
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={form.contaminationFree}
          onChange={(e) =>
            update("contaminationFree", e.target.checked)
          }
        />
        {" "}No visible contamination
      </label>

      <br /><br />

      <button onClick={verifyFood} style={buttonStyle}>
        🔍 Verify Food Safety
      </button>

      {result && (
        <div style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 16,
          background: result.safe
            ? "rgba(34,197,94,.18)"
            : "rgba(239,68,68,.18)",
        }}>
          <h3>
            {result.safe
              ? "🟢 SAFE TO DONATE"
              : "🔴 DONATION BLOCKED"}
          </h3>

          {result.checks &&
            Object.entries(result.checks).map(([name, passed]) => (
              <div key={name}>
                {passed ? "✅" : "❌"} {name}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  margin: "8px 0 16px",
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.2)",
  background: "rgba(255,255,255,.08)",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  border: 0,
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
};