import { useState, useEffect } from "react";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await fetch("/api/follow/requests", { credentials: "include" });
    const data = await res.json();
    setRequests(data.requests || []);
  };

  useEffect(() => {
    fetchRequests();
    // Poll every 30 seconds for new requests
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const respond = async (spotifyId, action) => {
    await fetch(`/api/follow/${action}/${spotifyId}`, {
      method: "POST",
      credentials: "include",
    });
    fetchRequests();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button className="db-icon-btn" onClick={() => setOpen(!open)} title="Notifications">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        Notifications
        {requests.length > 0 && <span className="badge">{requests.length}</span>}
      </button>
      {open && (
        <div className="db-dropdown">
          <h3>Friend Requests</h3>
          {requests.length === 0 && <p className="db-dropdown-msg">No pending requests</p>}
          {requests.map((req) => (
            <div key={req.spotifyId} className="db-request-item">
              <span>{req.displayName}</span>
              <div>
                <button className="db-accept-btn" onClick={() => respond(req.spotifyId, "accept")}>Accept</button>
                <button className="db-decline-btn" onClick={() => respond(req.spotifyId, "decline")}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}