import { useState } from "react";

export default function NeedPriority() {
  const [ngo, setNgo] = useState({
    ngoName: "",
    requiredMeals: "",
    availableMeals: "",
    urgency: "HIGH",
    distanceKm: "",
    verified: true,
  });

  const [priority, setPriority] = useState(null);

  const [person, setPerson] = useState({
    name: "",
    peopleCount: 1,
    mealsRequired: 1,
    location: "",
    urgency: "HIGH",
    contact: "",
  });

  const [personResult, setPersonResult] = useState(null);

  const calculatePriority = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/matching/priority",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...ngo,
            requiredMeals: Number(ngo.requiredMeals),
            availableMeals: Number(ngo.availableMeals),
            distanceKm: Number(ngo.distanceKm),
          }),
        }
      );

      const data = await response.json();
      setPriority(data);
    } catch {
      setPriority({
        error: "Backend connection failed",
      });
    }
  };

  const registerPerson = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/need-food/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...person,
            peopleCount: Number(person.peopleCount),
            mealsRequired: Number(person.mealsRequired),
          }),
        }
      );

      const data = await response.json();
      setPersonResult(data);
    } catch {
      setPersonResult({
        success: false,
        message: "Backend connection failed",
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "30px auto",
        padding: 28,
        borderRadius: 24,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "white",
      }}
    >
      <h2>🎯 Smart Food Allocation</h2>

      <p style={{ opacity: 0.75 }}>
        Food is prioritized using actual unmet demand, urgency,
        distance and verification instead of organization size alone.
      </p>

      <hr style={{ opacity: 0.15 }} />

      <h3>🏠 NGO Need Priority</h3>

      <input
        placeholder="NGO Name"
        value={ngo.ngoName}
        onChange={(e) =>
          setNgo({ ...ngo, ngoName: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Total meals required"
        value={ngo.requiredMeals}
        onChange={(e) =>
          setNgo({ ...ngo, requiredMeals: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Meals currently available"
        value={ngo.availableMeals}
        onChange={(e) =>
          setNgo({ ...ngo, availableMeals: e.target.value })
        }
        style={inputStyle}
      />

      <select
        value={ngo.urgency}
        onChange={(e) =>
          setNgo({ ...ngo, urgency: e.target.value })
        }
        style={inputStyle}
      >
        <option value="LOW">Low urgency</option>
        <option value="MEDIUM">Medium urgency</option>
        <option value="HIGH">High urgency</option>
        <option value="CRITICAL">Critical</option>
      </select>

      <input
        type="number"
        placeholder="Distance from donor (km)"
        value={ngo.distanceKm}
        onChange={(e) =>
          setNgo({ ...ngo, distanceKm: e.target.value })
        }
        style={inputStyle}
      />

      <label>
        <input
          type="checkbox"
          checked={ngo.verified}
          onChange={(e) =>
            setNgo({ ...ngo, verified: e.target.checked })
          }
        />
        {" "}Verified NGO
      </label>

      <br /><br />

      <button onClick={calculatePriority} style={buttonStyle}>
        Calculate Need Priority
      </button>

      {priority && !priority.error && (
        <div style={resultStyle}>
          <h3>
            {priority.priority === "CRITICAL"
              ? "🔴 CRITICAL NEED"
              : priority.priority === "HIGH"
              ? "🟠 HIGH NEED"
              : "🟢 NORMAL NEED"}
          </h3>

          <p>
            <b>{priority.ngoName}</b>
          </p>

          <p>
            Actual unmet demand:{" "}
            <b>{priority.unmetDemand} meals</b>
          </p>

          <p>
            Priority score:{" "}
            <b>{priority.priorityScore}/100</b>
          </p>
        </div>
      )}

      <hr style={{ opacity: 0.15, margin: "30px 0" }} />

      <h3>🧑‍🤝‍🧑 Need Food — Individual</h3>

      <p style={{ opacity: 0.75 }}>
        People who are not connected to an NGO can also request
        available food.
      </p>

      <input
        placeholder="Name"
        value={person.name}
        onChange={(e) =>
          setPerson({ ...person, name: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="number"
        min="1"
        placeholder="Number of people"
        value={person.peopleCount}
        onChange={(e) =>
          setPerson({ ...person, peopleCount: e.target.value })
        }
        style={inputStyle}
      />

      <input
        type="number"
        min="1"
        placeholder="Meals required"
        value={person.mealsRequired}
        onChange={(e) =>
          setPerson({ ...person, mealsRequired: e.target.value })
        }
        style={inputStyle}
      />

      <input
        placeholder="Location"
        value={person.location}
        onChange={(e) =>
          setPerson({ ...person, location: e.target.value })
        }
        style={inputStyle}
      />

      <input
        placeholder="Contact"
        value={person.contact}
        onChange={(e) =>
          setPerson({ ...person, contact: e.target.value })
        }
        style={inputStyle}
      />

      <button onClick={registerPerson} style={buttonStyle}>
        🍱 Request Food
      </button>

      {personResult && (
        <div style={resultStyle}>
          {personResult.success ? (
            <>
              <h3>✅ Food Request Registered</h3>
              <p>
                Request ID: <b>{personResult.request.id}</b>
              </p>
              <p>Status: <b>PENDING MATCH</b></p>
            </>
          ) : (
            <p>❌ {personResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  margin: "9px 0",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,.18)",
  background: "rgba(255,255,255,.08)",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  border: 0,
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 700,
};

const resultStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "16px",
  background: "rgba(255,255,255,.08)",
};