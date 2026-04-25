import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FriendsList() {
    const [open, setOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/friends", {credentials: "include" })
            .then(res => res.json())
            .then(data => setFriends(data.friends || []));
    }, []);

    return (
        <div className="relative">
            <button className="db-icon-btn" onClick={() => setOpen(!open)} title="Friends">
                👥 {friends.length > 0 && <span className="badge">{friends.length}</span>}
            </button>
            {open && (
                <div className="dropdown">
                    <h3>Friends</h3>
                    {friends.length === 0 && <p className="db-empty">No friends yet</p>}
                    {friends.map((friend) => (
                        <div key={friend.spotifyId} className="request-item">
                            <span>{friend.displayName}</span>
                            <button
                                className="accept-btn"
                                onClick={() => {
                                    setOpen(false);
                                    navigate(`/compare/${friend.spotifyId}`);
                                }}
                            >
                                Compare
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}