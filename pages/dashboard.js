import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";

// Top-level button style for profile actions
const profileBtnStyle = {
  width: '100%',
  padding: 7,
  background: '#2980b9',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 'bold',
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: 0,
  marginBottom: 0,
  transition: 'background 0.2s',
};
// ProfileCorner and profileBtnStyle are now at the top level, above Dashboard

function ProfileCorner({ authUser, setAuthUser }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'email' | 'password'
  const [email, setEmail] = useState(authUser.email || '');
  const [emailMsg, setEmailMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Close dropdown on outside click
  const ref = useRef();
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="profile-corner" ref={ref}>
      <div className="profile-avatar" style={{cursor:'pointer'}} onClick={() => setOpen(o => !o)}>
        <img src="/user-avatar.png" alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2980b9', boxShadow: open ? '0 0 0 4px #6dd5fa' : undefined }} />
      </div>
      {open && (
        <div className="profile-card" style={{marginTop:8}}>
          {mode === 'view' && (
            <>
              <div className="profile-info">
                <div style={{ fontWeight: 600, color: '#2980b9', fontSize: '1.1rem' }}>{authUser.username}</div>
                <div style={{ color: '#636e72', fontSize: '0.95rem', marginBottom: 8 }}>{authUser.email || 'No email set'}</div>
                <div style={{ color: '#636e72', fontSize: '0.95rem', marginBottom: 8 }}>Password: {'*****'}</div>
              </div>
              <button style={profileBtnStyle} onClick={() => setMode('email')}>Change Email</button>
              <button style={{...profileBtnStyle, background:'#27ae60',marginTop:8}} onClick={() => setMode('password')}>Change Password</button>
            </>
          )}
          {mode === 'email' && (
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!email.trim()) return;
                setEmailMsg('');
                const res = await fetch('/api/profile', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: authUser.username, email: email.trim() })
                });
                if (res.ok) {
                  setAuthUser(prev => ({ ...prev, email: email.trim() }));
                  setEmailMsg('Email updated!');
                  setTimeout(() => { setMode('view'); setEmailMsg(''); }, 1200);
                } else {
                  setEmailMsg('Failed to update email.');
                }
              }}
              style={{ width: '100%' }}
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="New email"
                style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #b2bec3', marginBottom: 6, fontSize: '0.95rem' }}
                required
              />
              <button type="submit" style={{ ...profileBtnStyle, width: '100%' }}>Update Email</button>
              <button type="button" style={{ ...profileBtnStyle, background:'#e74c3c', width: '100%', marginTop: 6 }} onClick={() => { setMode('view'); setEmailMsg(''); }}>Cancel</button>
              {emailMsg && <div style={{ color: '#27ae60', marginTop: 6 }}>{emailMsg}</div>}
            </form>
          )}
          {mode === 'password' && (
            <form
              onSubmit={async e => {
                e.preventDefault();
                setPwMsg('');
                setPwLoading(true);
                const oldPassword = e.target.oldPassword.value;
                const newPassword = e.target.newPassword.value;
                if (!oldPassword || !newPassword) { setPwLoading(false); return; }
                const res = await fetch('/api/profile', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: authUser.username, oldPassword, newPassword })
                });
                setPwLoading(false);
                if (res.ok) {
                  setPwMsg('Password changed!');
                  setTimeout(() => { setMode('view'); setPwMsg(''); }, 1200);
                } else {
                  setPwMsg('Password change failed.');
                }
              }}
              style={{ width: '100%' }}
            >
              <input
                type="password"
                name="oldPassword"
                placeholder="Current password"
                style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #b2bec3', marginBottom: 6, fontSize: '0.95rem' }}
                required
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #b2bec3', marginBottom: 8, fontSize: '0.95rem' }}
                required
              />
              <button type="submit" style={{ ...profileBtnStyle, width: '100%' }} disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
              <button type="button" style={{ ...profileBtnStyle, background:'#e74c3c', width: '100%', marginTop: 6 }} onClick={() => { setMode('view'); setPwMsg(''); }}>Cancel</button>
              {pwMsg && <div style={{ color: pwMsg.includes('failed') ? '#e74c3c' : '#27ae60', marginTop: 6 }}>{pwMsg}</div>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const TWO_WHEELER_COUNT = 324;
const FOUR_WHEELER_COUNT = 236;

// Helper to generate parking spots
const generateSpots = (count, type) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    parked: false,
    active: true,
  }));

export default function Dashboard() {
  const [twoWheelerSpots, setTwoWheelerSpots] = useState(generateSpots(TWO_WHEELER_COUNT, "2W"));
  const [fourWheelerSpots, setFourWheelerSpots] = useState(generateSpots(FOUR_WHEELER_COUNT, "4W"));
  const [selectedSpot, setSelectedSpot] = useState(null);  // user-selected spot
  const [authUser, setAuthUser] = useState(null);  // persistent logged-in user
  const [loginUser, setLoginUser] = useState(null); // for showing login notification bar
  const [loginError, setLoginError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [parkingRecords, setParkingRecords] = useState([]);
  const [form, setForm] = useState({ name: "", vehicle: "", type: "2W" });
  const [formError, setFormError] = useState("");
  const [issuedTickets, setIssuedTickets] = useState([]);
  const [claimTicketNo, setClaimTicketNo] = useState("");
  const [claimedTicket, setClaimedTicket] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [pendingTicket, setPendingTicket] = useState(null);
  const upiInputRef = useRef();

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

  // Handle user selecting a spot
  const handleSpotSelect = (spot) => {
    if (spot.parked) return; // ignore occupied
    setSelectedSpot(spot.id);
    // ensure form type matches spot type
    setForm(prev => ({ ...prev, type: spot.id.startsWith('2W') ? '2W' : '4W' }));
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    // Auto-select first free spot if none selected
    let spotId, spotIdx;
    if (!selectedSpot) {
      const spots = form.type === '2W' ? twoWheelerSpots : fourWheelerSpots;
      const freeIdx = spots.findIndex(s => !s.parked);
      if (freeIdx === -1) {
        setFormError('No free spots available.');
        setTimeout(() => setFormError(''), 2000);
        return;
      }
      spotIdx = freeIdx;
      spotId = spots[freeIdx].id;
    } else {
      spotId = selectedSpot;
      const [, idxStr] = selectedSpot.split('-');
      spotIdx = parseInt(idxStr, 10) - 1;
    }
    // Generate ticket data
    const price = form.type === '2W' ? 250 : 350; // updated pricing
    const ticketNo = Date.now();
    const createdAt = new Date().toISOString();
    const pending = {
      ticketNo,
      spotId,
      spotIdx,
      name: form.name,
      vehicle: form.vehicle,
      type: form.type,
      price,
      createdAt
    };
    // Admin/worker allocate directly without payment
    if (authUser?.role === 'admin' || authUser?.role === 'worker') {
      // Persist parking record
      await fetch('/api/parking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pending, paid: true, active: true })
      });
      // Update UI
      if (pending.type === '2W') {
        setTwoWheelerSpots(arr => arr.map((s,i)=> i===pending.spotIdx? { ...s, parked: true }: s));
      } else {
        setFourWheelerSpots(arr => arr.map((s,i)=> i===pending.spotIdx? { ...s, parked: true }: s));
      }
      setIssuedTickets(prev => [...prev, { ...pending, paid: true }]);
      // Show ticket for admin/worker with download option
      setTicket({ ...pending, paid: true });
      // Reset selection and form
      setSelectedSpot(null);
      setForm({ name: '', vehicle: '', type: pending.type });
      return;
    }
    // User flow: show payment modal
    setPendingTicket(pending);
    setPaymentAmount(price);
    setShowPaymentModal(true);
  };
  
  const handlePaymentProceed = async () => {
    if (!upiId.trim() || !paymentAmount) {
      setFormError('Please enter UPI ID and amount.');
      setTimeout(() => setFormError(''), 2000);
      return;
    }
    // Simulate payment success
    const paid = true;
    const transactionId = 'UPI_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    // Create payment intent record
    await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketNo: pendingTicket.ticketNo, name: pendingTicket.name })
    });
    // Update payment status in DB
    await fetch('/api/payment', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketNo: pendingTicket.ticketNo, transactionId, paid })
    });

    // 4. Generate PDF as base64
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 80, 180);
    doc.text("ANIBank Parking", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Parking Ticket", 105, 35, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Ticket No: ${pendingTicket.ticketNo}`, 20, 55);
    doc.text(`Name: ${pendingTicket.name}`, 20, 65);
    doc.text(`Vehicle No: ${pendingTicket.vehicle}`, 20, 75);
    doc.text(`Parking Place: ${pendingTicket.spotId}`, 20, 85);
    doc.text(`Type: ${pendingTicket.type === "2W" ? "Two Wheeler" : "Four Wheeler"}`, 20, 95);
    // Additional fields
    doc.text(`Price: ₹${pendingTicket.price}`, 20, 105);
    doc.text(`Created At: ${new Date(pendingTicket.createdAt).toLocaleString()}`, 20, 115);
    doc.text(`Transaction ID: ${transactionId}`, 20, 125);
    doc.text(`Paid: ${paid ? 'Yes' : 'No'}`, 20, 135);
    // Get PDF as base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // 5. Upload parking record with PDF to DB
    await fetch('/api/parking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNo: pendingTicket.ticketNo,
        spotId: pendingTicket.spotId,
        name: pendingTicket.name,
        vehicle: pendingTicket.vehicle,
        type: pendingTicket.type,
        price: pendingTicket.price,
        createdAt: pendingTicket.createdAt,
        paid: true,
        active: true,
        transactionId,
        ticketPdf: pdfBase64
      })
    });

    // 6. Only generate ticket if payment is successful
    if (pendingTicket.type === '2W') {
      setTwoWheelerSpots(arr =>
        arr.map((s, i) =>
          i === pendingTicket.spotIdx ? { ...s, parked: true, active: true } : s
        )
      );
    } else {
      setFourWheelerSpots(arr =>
        arr.map((s, i) =>
          i === pendingTicket.spotIdx ? { ...s, parked: true, active: true } : s
        )
      );
    }
    const newTicket = {
      ...pendingTicket,
      paid: true,
      transactionId,
      ticketPdf: pdfBase64
    };
    setTicket(newTicket);
    setIssuedTickets(prev => [...prev, newTicket]);
    setForm({ name: "", vehicle: "", type: pendingTicket.type });
    setSelectedSpot(null);
    setShowPaymentModal(false);
    setUpiId("");
    setPendingTicket(null);
  };

  const handleDownloadTicket = () => {
    if (!ticket) return;
    const doc = new jsPDF();

    // Company Name
    doc.setFontSize(18);
    doc.setTextColor(40, 80, 180);
    doc.text("ANIBank Parking", 105, 20, { align: "center" });

    // Ticket Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Parking Ticket", 105, 35, { align: "center" });

    // Ticket Details
    doc.setFontSize(12);
    doc.text(`Ticket No: ${ticket.ticketNo}`, 20, 55);
    doc.text(`Name: ${ticket.name}`, 20, 65);
    doc.text(`Vehicle No: ${ticket.vehicle}`, 20, 75);
    doc.text(`Parking Place: ${ticket.spotId}`, 20, 85);
    doc.text(`Type: ${ticket.type === "2W" ? "Two Wheeler" : "Four Wheeler"}`, 20, 95);
    // Additional fields
    doc.text(`Price: ₹${ticket.price}`, 20, 105);
    doc.text(`Created At: ${new Date(ticket.createdAt).toLocaleString()}`, 20, 115);
    if(ticket.transactionId) doc.text(`Transaction ID: ${ticket.transactionId}`, 20, 125);
    doc.text(`Paid: ${ticket.paid ? 'Yes' : 'No'}`, 20, 135);

    // Footer - Developer Name
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Developed by Er.XYZ", 105, 280, { align: "center" });

    doc.save(`ParkingTicket_${ticket.ticketNo}.pdf`);

    // Clear the ticket block after download
    setTicket(null);
  };

  const handlePayment = async () => {
    if (!ticket) return;
    try {
      const res = await fetch('/api/parking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNo: ticket.ticketNo }),
      });
      if (res.ok) {
        // Update local paid status
        setTicket(prev => ({ ...prev, paid: true }));
        setParkingRecords(prev => prev.map(r => r.ticketNo === ticket.ticketNo ? { ...r, paid: true } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("parking_user");
      if (stored) {
        const usr = JSON.parse(stored);
        setAuthUser(usr);
        setLoginUser(usr);
        // Hide notification after 3 seconds
        const timer = setTimeout(() => setLoginUser(null), 3000);
        return () => clearTimeout(timer);
      } else {
        setLoginError("User name and password is wrong");
        setTimeout(() => setLoginError(""), 3000);
      }
    }
  }, []);
  // Poll parking records every 5 seconds for real-time updates
  useEffect(() => {
    const fetchRecords = () => {
      fetch('/api/parking')
        .then(res => res.json())
        .then(data => setParkingRecords(data))
        .catch(err => console.error(err));
    };
    fetchRecords();
    const interval = setInterval(fetchRecords, 5000);
    return () => clearInterval(interval);
  }, []);
  // Mark spots as parked based on records
  useEffect(() => {
    if (parkingRecords.length) {
      setTwoWheelerSpots(spots =>
        spots.map(s => ({
          ...s,
          parked: parkingRecords.some(r => r.spotId === s.id),
        }))
      );
      setFourWheelerSpots(spots =>
        spots.map(s => ({
          ...s,
          parked: parkingRecords.some(r => r.spotId === s.id),
        }))
      );
    }
  }, [parkingRecords]);
  // Auto-expire tickets older than 24h and checkout
  useEffect(() => {
    const expireOldTickets = async () => {
      const now = Date.now();
      const threshold = 24 * 60 * 60 * 1000;
      const expired = parkingRecords.filter(r => r.active && now - new Date(r.createdAt).getTime() > threshold);
      if (expired.length) {
        // Checkout expired tickets via API
        for (const r of expired) {
          try {
            await fetch('/api/parking', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ticketNo: r.ticketNo, checkout: true }),
            });
          } catch (err) { console.error(err); }
        }
        // Update local state: remove expired records and free spots
        setParkingRecords(prev => prev.filter(r => !expired.some(e => e.ticketNo === r.ticketNo)));
        setTwoWheelerSpots(spots => spots.map(s => expired.some(e => e.spotId === s.id) ? { ...s, parked: false } : s));
        setFourWheelerSpots(spots => spots.map(s => expired.some(e => e.spotId === s.id) ? { ...s, parked: false } : s));
        setIssuedTickets(prev => prev.filter(t => now - new Date(t.createdAt).getTime() <= threshold));
        setTicket(prev => (prev && now - new Date(prev.createdAt).getTime() > threshold ? null : prev));
      }
    };
    // run every minute
    const iv = setInterval(expireOldTickets, 60 * 1000);
    // also run once on mount
    expireOldTickets();
    return () => clearInterval(iv);
  }, [parkingRecords]);

  return (
    <div className="dashboard-bg">
      {/* User Profile Section (only for user role, top-right corner) */}
      {authUser?.role === 'user' && (
        <ProfileCorner authUser={authUser} setAuthUser={setAuthUser} />
      )}

      {/* Login status bar for all roles */}
      {loginUser ? (
        <div className="login-bar success">
          Logged in as: <b>{loginUser.username}</b>
        </div>
      ) : loginError ? (
        <div className="login-bar error">{loginError}</div>
      ) : null}

      {/* Allocate Parking always visible */}
      <div className="parking-form-bg">
        <form className="parking-form" onSubmit={handleAllocate}>
          <h3>Allocate Parking</h3>
          <div className="input-group">
            <label>Name<span style={{ color: "red" }}>*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="input-group">
            <label>Vehicle Number<span style={{ color: "red" }}>*</span></label>
            <input
              name="vehicle"
              value={form.vehicle}
              onChange={handleFormChange}
              required
              placeholder="Enter vehicle number"
            />
          </div>
          <div className="input-group">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleFormChange}>
              <option value="2W">Two Wheeler</option>
              <option value="4W">Four Wheeler</option>
            </select>
          </div>
          {formError && <div className="form-error">{formError}</div>}
          {/* Allocate button text changes based on role */}
          <button type="submit">
            {authUser?.role === 'admin' || authUser?.role === 'worker' ? 'Allocate Only' : 'Allocate'}
          </button>
        </form>
        {ticket && (
          <div className="ticket">
            <h4>Parking Ticket</h4>
            <div><b>Ticket No:</b> {ticket.ticketNo}</div>
            <div><b>Name:</b> {ticket.name}</div>
            <div><b>Vehicle No:</b> {ticket.vehicle}</div>
            <div><b>Parking Place:</b> {ticket.spotId}</div>
            <div><b>Type:</b> {ticket.type === "2W" ? "Two Wheeler" : "Four Wheeler"}</div>
            <div><b>Price:</b> ₹{ticket.price}</div>
            {/* Show payment info if available */}
            {ticket.transactionId && (
              <div><b>Transaction ID:</b> {ticket.transactionId}</div>
            )}
            <div><b>Payment Status:</b> {ticket.paid ? <span style={{color:'#27ae60'}}>Paid</span> : <span style={{color:'#e74c3c'}}>Pending</span>}</div>
            <button onClick={handleDownloadTicket} style={{marginTop: "1rem"}}>Download Ticket</button>
            {(authUser?.role === 'admin' || authUser?.role === 'worker') && (
              <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: ticket.paid ? "#27ae60" : "#e74c3c" }}>
                {ticket.paid ? "Payment Successful" : "Payment Pending"}
              </div>
            )}
            {(authUser?.role === 'admin' || authUser?.role === 'worker') && !ticket.paid && (
              <button
                onClick={handlePayment}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { e.target.style.background = "#219150"; }}
                onMouseLeave={e => { e.target.style.background = "#27ae60"; }}
              >
                Pay Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Claim Your Ticket block only for admin/worker */}
      {(authUser?.role === 'admin' || authUser?.role === 'worker') && (
        <div className="claim-ticket-block">
          <h3>Claim Your Ticket</h3>
          <form
            onSubmit={e => {
              e.preventDefault();
              // Search in database records for ticket
              const found = parkingRecords.find(r => String(r.ticketNo) === claimTicketNo.trim());
              if (found) {
                setClaimedTicket(found);
                setClaimError("");
              } else {
                setClaimedTicket(null);
                setClaimError("Ticket not found!");
                setTimeout(() => setClaimError(""), 2000);
              }
            }}
            style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          >
            <input
              type="text"
              placeholder="Enter Ticket No"
              value={claimTicketNo}
              onChange={e => setClaimTicketNo(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #b2bec3" }}
            />
            <button type="submit" style={{ padding: "0.5rem 1rem" }}>Claim</button>
          </form>
          {claimError && <div style={{ color: "#e74c3c", marginTop: 8 }}>{claimError}</div>}
          {claimedTicket && (
            <div className="ticket" style={{ marginTop: 16 }}>
              <h4>Parking Ticket</h4>
              <div><b>Ticket No:</b> {claimedTicket.ticketNo}</div>
              <div><b>Name:</b> {claimedTicket.name}</div>
              <div><b>Vehicle No:</b> {claimedTicket.vehicle}</div>
              <div><b>Parking Place:</b> {claimedTicket.spotId}</div>
              <div><b>Type:</b> {claimedTicket.type === "2W" ? "Two Wheeler" : "Four Wheeler"}</div>
              <button
                onClick={() => {
                  // Download PDF for claimed ticket
                  const doc = new jsPDF();
                  doc.setFontSize(18);
                  doc.setTextColor(40, 80, 180);
                  doc.text("ANIBank Parking", 105, 20, { align: "center" });
                  doc.setFontSize(14);
                  doc.setTextColor(0, 0, 0);
                  doc.text("Parking Ticket", 105, 35, { align: "center" });
                  doc.setFontSize(12);
                  doc.text(`Ticket No: ${claimedTicket.ticketNo}`, 20, 55);
                  doc.text(`Name: ${claimedTicket.name}`, 20, 65);
                  doc.text(`Vehicle No: ${claimedTicket.vehicle}`, 20, 75);
                  doc.text(`Parking Place: ${claimedTicket.spotId}`, 20, 85);
                  doc.text(`Type: ${claimedTicket.type === "2W" ? "Two Wheeler" : "Four Wheeler"}`, 20, 95);
                  doc.setFontSize(10);
                  doc.setTextColor(100, 100, 100);
                  doc.text("Developed by Er.XYZ", 105, 280, { align: "center" });
                  doc.save(`ParkingTicket_${claimedTicket.ticketNo}.pdf`);
                }}
                style={{ marginTop: "1rem", marginRight: "1rem" }}
              >
                Download Ticket
              </button>
              <button
                onClick={async () => {
                  // Call API to remove record (checkout)
                  try {
                    const res = await fetch('/api/parking', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ticketNo: claimedTicket.ticketNo, checkout: true }),
                    });
                    if (!res.ok) console.error('Checkout failed');
                  } catch (err) {
                    console.error(err);
                  }
                  // Remove ticket from issuedTickets
                  setIssuedTickets(prev => prev.filter(t => t.ticketNo !== claimedTicket.ticketNo));
                  // Free the parking spot
                  if (claimedTicket.type === '2W') {
                    setTwoWheelerSpots(spots =>
                      spots.map(s =>
                        s.id === claimedTicket.spotId ? { ...s, parked: false, name: undefined, vehicle: undefined } : s
                      )
                    );
                  } else {
                    setFourWheelerSpots(spots =>
                      spots.map(s =>
                        s.id === claimedTicket.spotId ? { ...s, parked: false, name: undefined, vehicle: undefined } : s
                      )
                    );
                  }
                  // Update local parkingRecords and hide claimed ticket block
                  setParkingRecords(prev => prev.filter(r => r.ticketNo !== claimedTicket.ticketNo));
                  setClaimedTicket(null);
                  setClaimTicketNo('');
                }}
                style={{ marginTop: '1rem', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Checkout & Free Spot
              </button>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-container">
        <h1>Parking Dashboard</h1>
        <div className="section">
         <p style={{ fontSize: '0.9rem', color: '#2980b9' }}>{selectedSpot ? `Selected Spot: ${selectedSpot}` : 'Click on a spot to select specific location.'}</p>
          <h2>Two Wheeler Parking ({twoWheelerSpots.filter(s => s.parked).length}/{TWO_WHEELER_COUNT} Parked)</h2>
          <div className="spots-grid">
            {twoWheelerSpots.map((spot) => {
              return (
                <div
                  key={spot.id}
                  className={`spot ${spot.parked ? "parked" : ""} ${spot.active ? "active" : ""} ${selectedSpot===spot.id? 'selected': ''}`}
                  title={spot.id}
                  onClick={() => handleSpotSelect(spot)}
                >
                  <div>{spot.id}</div>
                  {/* Disable button removed for all roles */}
                </div>
              );
            })}
          </div>
        </div>
        <div className="section">
          <h2>Four Wheeler Parking ({fourWheelerSpots.filter(s => s.parked).length}/{FOUR_WHEELER_COUNT} Parked)</h2>
          <div className="spots-grid">
            {fourWheelerSpots.map((spot) => {
              return (
                <div
                  key={spot.id}
                  className={`spot fourwheeler ${spot.parked ? "parked" : ""} ${spot.active ? "active" : ""}`}
                  title={spot.id}
                  onClick={() => handleSpotSelect(spot)}
                >
                  <div>{spot.id}</div>
                  {/* Disable button removed for all roles */}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment modal only for users */}
      {showPaymentModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,boxShadow:'0 4px 24px #0002'}}>
            <h3>UPI Payment</h3>
            <div style={{marginBottom:12}}>
              <label>UPI ID:</label>
              <input ref={upiInputRef} value={upiId} onChange={e=>setUpiId(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #b2bec3'}} placeholder="Enter your UPI ID" />
            </div>
            <div style={{marginBottom:12}}>
              <label>Amount:</label>
              <input value={paymentAmount} readOnly style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #b2bec3',background:'#f4f8fb'}} />
            </div>
            <button style={{width:'100%',padding:10,background:'#27ae60',color:'#fff',border:'none',borderRadius:6,fontWeight:'bold',fontSize:'1rem'}} onClick={handlePaymentProceed}>Proceed</button>
            <button style={{width:'100%',padding:10,marginTop:8,background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,fontWeight:'bold',fontSize:'1rem'}} onClick={()=>{setShowPaymentModal(false);setUpiId("");setPendingTicket(null);}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ---- ONLY ONE STYLE BLOCK HERE ---- */}
      <style jsx>{`
        .profile-corner {
          position: fixed;
          top: 18px;
          right: 24px;
          z-index: 2000;
        }
        .profile-card {
          background: #f4f8fb;
          border-radius: 14px;
          box-shadow: 0 2px 12px #0001;
          padding: 18px 18px 12px 18px;
          min-width: 240px;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .profile-avatar {
          margin-bottom: 8px;
        }
        .profile-info {
          text-align: center;
          margin-bottom: 8px;
        }
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
        .spot.active {
          box-shadow: 0 0 0 3px #2980b9;
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
        .claim-ticket-block {
          background: #fff;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(44,62,80,0.08);
          min-width: 300px;
          margin: 2rem auto;
          max-width: 400px;
        }
        .claim-ticket-block h3 {
          margin-bottom: 1rem;
          color: #2980b9;
        }
        .spot-desc {
          font-size: 0.8rem;
          color: #34495e;
          margin-top: 4px;
        }

      `}</style>
    </div>
  );
}
