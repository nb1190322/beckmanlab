import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import TopTracks from './components/TopTracks';
import "./App.css";
import { useSpotifyData } from "./hooks/useSpotifyData.js";

import AddFriend from './components/AddFriend';
import Notifications from './components/Notifications';
import Landing from './components/Landing';
import "./css/Dashboard.css";
import FriendsList from "./components/FriendsList.jsx";
import Compare from "./components/Compare.jsx";

function nameToColor(name = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#1DB954","#E91E8C","#F59B00","#2D9CDB","#9B51E0","#EB5757","#27AE60","#F2994A"];
    return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, name }) {
    if (src)
        return <img src={src} alt="profile" className="db-avatar" />;
    const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div className="db-avatar-fallback" style={{ "--avatar-bg": nameToColor(name) }}>
            {initials}
        </div>
    );
}
function Dashboard() {
    const { user, topData, loading, error } = useSpotifyData();
    const navigate = useNavigate();

    const logout = async () => {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
        navigate("/");
    };

    if (loading) return <div className="db-state"><p>Loading your music data...</p></div>;
    if (error)   return <div className="db-state"><p>Not logged in.<a href="/api/login">Login here</a></p></div>;

    return (
        <div className="db-root">
            <nav className="db-navbar">
                <span className="db-nav-title">
                    Friend Wrapped
                    <span className="db-nav-dot" />
                </span>
                <div className="db-nav-actions">
                    <AddFriend />
                    <FriendsList />
                    <Notifications />
                    <button className="db-icon-btn" onClick={logout}>Sign Out</button>
                </div>
            </nav>

            <div className="db-body">
                {/* Profile */}
                <div className="db-profile">
                    <Avatar src={user?.images?.[0]?.url} name={user?.display_name} />
                    <div>
                        <h1 className="db-profile-name">{user?.display_name}</h1>
                        <p className="db-profile-meta">{user?.followers?.total} followers</p>
                    </div>
                </div>

                {/* Top Tracks & Artists side by side */}
                <span className="db-section-label">✦ Your Top Tracks</span>
                <TopTracks
                    title="Your top tracks"
                    tracks={topData?.topTracks?.medium || []}
                />

                <span className="db-section-label">✦ Your Top Artists</span>
                <div className="db-card">
                    <p className="db-card-title">Top Artists</p>
                    <table className="db-table">
                        <colgroup>
                            <col style={{ width: "36px" }} />
                            <col />
                        </colgroup>
                        <thead><tr><th>#</th><th>Artist</th></tr></thead>
                        <tbody>
                        {(topData?.topArtists?.medium || []).slice(0, 20).map((a, i) => (
                            <tr key={a.id}>
                                <td className="db-row-num">{i + 1}</td>
                                <td className="db-track-name">{a.name}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* CTA to compare with a friend */}
                <div className="db-card" style={{ textAlign: "center", padding: "32px" }}>
                    <p className="db-card-title">Compare with a friend</p>
                    <p className="db-empty" style={{ marginBottom: "16px" }}>
                        Select a friend from the friends list to see your compatibility score and shared music taste!
                    </p>
                    <FriendsList inline />
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/compare/:spotifyId" element={<Compare />} />
            </Routes>
        </BrowserRouter>
    );
}
