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
        <div style={{ position: "relative" }}>
            <button className="db-icon-btn" onClick={() => setOpen(!open)} title="Add Friend">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Add Friend
            </button>
            {open && (
                <div className="db-dropdown">
                    <h3>Find Friends</h3>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={search}
                        className="db-search-input"
                        autoFocus
                    />
                    {message && <p className="db-dropdown-msg">{message}</p>}
                    {results.map((user) => (
                        <div key={user.spotifyId} className="db-search-result">
                            <span>{user.displayName}</span>
                            <button className="db-send-btn" onClick={() => sendRequest(user.spotifyId)}>Send Request</button>
                        </div>
                    ))}
                    {query.length >= 2 && results.length === 0 && (
                        <p className="db-dropdown-msg">No users found</p>
                    )}
                </div>
            )}
        </div>
    );
}