import { useState, useEffect } from "react";

const TWO_WHEELER_COUNT = 200;
const FOUR_WHEELER_COUNT = 100;

// Helper to generate parking spots
const generateSpots = (count, type) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    parked: false,
  }));

export default function Dashboard() {
  const [twoWheelerSpots, setTwoWheelerSpots] = useState(generateSpots(TWO_WHEELER_COUNT, "2W"));
  const [fourWheelerSpots, setFourWheelerSpots] = useState(generateSpots(FOUR_WHEELER_COUNT, "4W"));
  const [loginUser, setLoginUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [form, setForm] = useState({ name: "", vehicle: "", type: "2W" });
  const [formError, setFormError] = useState("");

  // Toggle parking status
  const toggleSpot = (type, idx) => {
    if (type === "2W") {
      setTwoWheelerSpots(spots =>
        spots.map((spot, i) =>
          i === idx ? { ...spot, parked: !spot.parked } : spot
        )
      );
    } else {
      setFourWheelerSpots(spots =>
        spots.map((spot, i) =>
          i === idx ? { ...spot, parked: !spot.parked } : spot
        )
      );
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.vehicle.trim()) {
      setFormError("Name and Vehicle Number are required.");
      setTimeout(() => setFormError(""), 2000);
      return;
    }
    // Find next available spot
    let spotIdx, spotId;
    if (form.type === "2W") {
      spotIdx = twoWheelerSpots.findIndex((s) => !s.parked);
      if (spotIdx === -1) {
        setFormError("No Two Wheeler spots available!");
        setTimeout(() => setFormError(""), 2000);
        return;
      }
      spotId = twoWheelerSpots[spotIdx].id;
      setTwoWheelerSpots((spots) =>
        spots.map((s, i) =>
          i === spotIdx ? { ...s, parked: true, name: form.name, vehicle: form.vehicle } : s
        )
      );
    } else {
      spotIdx = fourWheelerSpots.findIndex((s) => !s.parked);
      if (spotIdx === -1) {
        setFormError("No Four Wheeler spots available!");
        setTimeout(() => setFormError(""), 2000);
        return;
      }
      spotId = fourWheelerSpots[spotIdx].id;
      setFourWheelerSpots((spots) =>
        spots.map((s, i) =>
          i === spotIdx ? { ...s, parked: true, name: form.name, vehicle: form.vehicle } : s
        )
      );
    }
    // Generate ticket
    setTicket({
      ticketNo: Date.now(),
      spotId,
      vehicle: form.vehicle,
      name: form.name,
      type: form.type,
    });
    setForm({ name: "", vehicle: "", type: form.type });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("parking_user");
      if (user) {
        setLoginUser(JSON.parse(user));
        // Hide green bar after 3 seconds
        const timer = setTimeout(() => setLoginUser(null), 3000);
        return () => clearTimeout(timer);
      } else {
        setLoginError("User name and password is wrong");
        setTimeout(() => setLoginError(""), 3000);
      }
    }
  }, []);

  return (
    <div className="dashboard-bg">
      {/* Login status bar */}
      {loginUser ? (
        <div className="login-bar success">
          Logged in as: <b>{loginUser.username}</b>
        </div>
      ) : loginError ? (
        <div className="login-bar error">{loginError}</div>
      ) : null}

      <div className="parking-form-bg">
        <form className="parking-form" onSubmit={handleAllocate}>
          <h3>Allocate Parking</h3>
          <div>
            <label>Name<span style={{color:"red"}}>*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label>Vehicle Number<span style={{color:"red"}}>*</span></label>
            <input
              name="vehicle"
              value={form.vehicle}
              onChange={handleFormChange}
              required
              placeholder="Enter vehicle number"
            />
          </div>
          <div>
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleFormChange}>
              <option value="2W">Two Wheeler</option>
              <option value="4W">Four Wheeler</option>
            </select>
          </div>
          {formError && <div className="form-error">{formError}</div>}
          <button type="submit">Allocate</button>
        </form>
        {ticket && (
          <div className="ticket">
            <h4>Parking Ticket</h4>
            <div><b>Ticket No:</b> {ticket.ticketNo}</div>
            <div><b>Name:</b> {ticket.name}</div>
            <div><b>Vehicle No:</b> {ticket.vehicle}</div>
            <div><b>Parking Place:</b> {ticket.spotId}</div>
            <div><b>Type:</b> {ticket.type === "2W" ? "Two Wheeler" : "Four Wheeler"}</div>
          </div>
        )}
      </div>

      <div className="dashboard-container">
        <h1>Parking Dashboard</h1>
        <div className="section">
          <h2>Two Wheeler Parking ({twoWheelerSpots.filter(s => s.parked).length}/{TWO_WHEELER_COUNT} Parked)</h2>
          <div className="spots-grid">
            {twoWheelerSpots.map((spot, idx) => (
              <div
                key={spot.id}
                className={`spot ${spot.parked ? "parked" : ""}`}
                title={spot.id}
                onClick={() => toggleSpot("2W", idx)}
              >
                {spot.id}
              </div>
            ))}
          </div>
        </div>
        <div className="section">
          <h2>Four Wheeler Parking ({fourWheelerSpots.filter(s => s.parked).length}/{FOUR_WHEELER_COUNT} Parked)</h2>
          <div className="spots-grid">
            {fourWheelerSpots.map((spot, idx) => (
              <div
                key={spot.id}
                className={`spot fourwheeler ${spot.parked ? "parked" : ""}`}
                title={spot.id}
                onClick={() => toggleSpot("4W", idx)}
              >
                {spot.id}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- ONLY ONE STYLE BLOCK HERE ---- */}
      <style jsx>{`
        .dashboard-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #6dd5fa 0%, #2980b9 100%);
          padding: 2rem 0;
        }
        .dashboard-container {
          background: #fff;
          margin: 0 auto;
          max-width: 1200px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44, 62, 80, 0.15);
          padding: 2rem;
        }
        h1 {
          text-align: center;
          color: #2980b9;
          margin-bottom: 2rem;
        }
        .section {
          margin-bottom: 2.5rem;
        }
        h2 {
          color: #34495e;
          margin-bottom: 1rem;
        }
        .spots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 8px;
          max-height: 320px;
          overflow-y: auto;
          background: #f4f8fb;
          padding: 10px;
          border-radius: 8px;
        }
        .spot {
          background: #e0eafc;
          border: 2px solid #b2bec3;
          border-radius: 8px;
          padding: 8px 0;
          text-align: center;
          font-size: 0.95rem;
          color: #34495e;
          cursor: pointer;
          transition: background 0.2s, border 0.2s, color 0.2s;
          user-select: none;
        }
        .spot.parked {
          background: #27ae60;
          color: #fff;
          border-color: #219150;
        }
        .spot.fourwheeler {
          font-weight: bold;
        }
        .spot:hover {
          border-color: #2980b9;
        }
        .login-bar {
          width: 100%;
          text-align: center;
          padding: 0.7rem 0;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 1px;
        }
        .login-bar.success {
          background: #27ae60;
          color: #fff;
        }
        .login-bar.error {
          background: #e74c3c;
          color: #fff;
        }
        .parking-form-bg {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .parking-form {
          background: #fff;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(44,62,80,0.08);
          min-width: 300px;
        }
        .parking-form h3 {
          margin-bottom: 1rem;
          color: #2980b9;
        }
        .parking-form div {
          margin-bottom: 1rem;
        }
        .parking-form label {
          display: block;
          margin-bottom: 0.3rem;
          color: #34495e;
          font-weight: 500;
        }
        .parking-form input, .parking-form select {
          width: 100%;
          padding: 0.6rem;
          border: 1px solid #b2bec3;
          border-radius: 6px;
          font-size: 1rem;
          outline: none;
          margin-bottom: 0.2rem;
        }
        .parking-form button {
          width: 100%;
          padding: 0.7rem;
          background: linear-gradient(90deg, #2980b9 0%, #6dd5fa 100%);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.05rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .parking-form button:hover {
          background: linear-gradient(90deg, #2574a9 0%, #48c6ef 100%);
        }
        .form-error {
          color: #e74c3c;
          margin-bottom: 0.5rem;
          font-size: 0.98rem;
        }
        .ticket {
          background: #e0f7fa;
          border: 2px solid #2980b9;
          border-radius: 12px;
          padding: 1.2rem 2rem;
          min-width: 250px;
          color: #2980b9;
          font-size: 1.05rem;
          box-shadow: 0 4px 16px rgba(44,62,80,0.08);
        }
        .ticket h4 {
          margin-top: 0;
          margin-bottom: 0.7rem;
          color: #2196f3;
        }
      `}</style>
    </div>
  );
}