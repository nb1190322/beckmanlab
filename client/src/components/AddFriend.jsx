import { useState } from "react";

export default function AddFriend() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState("");

    const search = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length < 2) return setResults([]);
        const res = await fetch(`/api/users/search?q=${val}`, { credentials: "include" });
        const data = await res.json();
        setResults(data);
    };

    const sendRequest = async (spotifyId) => {
        const res = await fetch(`/api/follow/request/${spotifyId}`, {
            method: "POST",
            credentials: "include"
        });
        const data = await res.json();
        setMessage(data.message || data.error);
        setResults([]);
        setQuery("");
    };

    return (
    <div className="relative">
      <button className="icon-btn" onClick={() => setOpen(!open)} title="Add Friend">
        👤+
      </button>
      {open && (
        <div className="dropdown">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={search}
            className="search-input"
            autoFocus
          />
          {message && <p className="dropdown-msg">{message}</p>}
          {results.map((user) => (
            <div key={user.spotifyId} className="search-result">
              <span>{user.displayName}</span>
              <button onClick={() => sendRequest(user.spotifyId)}>Send Request</button>
            </div>
          ))}
          {query.length >= 2 && results.length === 0 && (
            <p className="dropdown-msg">No users found</p>
          )}
        </div>
      )}
    </div>
  );
}