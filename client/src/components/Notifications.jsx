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
    <div className="relative">
      <button className="icon-btn" onClick={() => setOpen(!open)} title="Notifications">
        🔔 {requests.length > 0 && <span className="badge">{requests.length}</span>}
      </button>
      {open && (
        <div className="dropdown">
          <h3>Friend Requests</h3>
          {requests.length === 0 && <p className="dropdown-msg">No pending requests</p>}
          {requests.map((req) => (
            <div key={req.spotifyId} className="request-item">
              <span>{req.displayName}</span>
              <div>
                <button className="accept-btn" onClick={() => respond(req.spotifyId, "accept")}>✓</button>
                <button className="decline-btn" onClick={() => respond(req.spotifyId, "decline")}>✗</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}