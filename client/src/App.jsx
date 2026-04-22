import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import TopTracks from './components/TopTracks';
import "./App.css";
import { useSpotifyData } from "./hooks/useSpotifyData.js";

import SharedArtists from './components/SharedArtists';
import SharedGenres from './components/SharedGenres';
import CompatibilityScore from './components/CompatibilityScore';
import UniqueArtists from './components/UniqueArtists';
import SharedTracks from './components/SharedTracks';
import AddFriend from './components/AddFriend';
import Notifications from './components/Notifications';
import Landing from './components/Landing';
import "./css/Dashboard.css";

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

                {/* Compatibility */}
                <CompatibilityScore score={null} />

                {/* Top Tracks */}
                <span className="db-section-label">✦ Top Tracks</span>
                <div className="db-grid">
                    <TopTracks title="Your top tracks" tracks={topData?.topTracks || []} />
                    <TopTracks title="Friend's top tracks" tracks={[]} />
                </div>

                {/* Shared */}
                <span className="db-section-label">✦ In Common</span>
                <div className="db-grid">
                    <SharedArtists artists={null} />
                    <SharedGenres genres={null} />
                </div>

                <div className="db-grid">
                    <SharedTracks tracks={null} />
                    <UniqueArtists
                        yourName={user?.display_name}
                        yourArtists={topData?.topArtists || []}
                        friendName="Friend"
                        friendArtists={null}
                    />
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
            </Routes>
        </BrowserRouter>
    );
}
