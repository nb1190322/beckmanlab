import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopTracks from "./TopTracks";
import SharedArtists from "./SharedArtists";
import SharedTracks from "./SharedTracks";
import UniqueArtists from "./UniqueArtists";

function nameToColor(name = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#1DB954","#E91E8C","#F59B00","#2D9CDB","#9B51E0","#EB5757","#27AE60","#F2994A"];
    return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, name }) {
    if (src) return <img src={src} alt={name} className="db-avatar" />;
    const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div className="db-avatar-fallback" style={{ "--avatar-bg": nameToColor(name) }}>
            {initials}
        </div>
    );
}

function scoreColor(score) {
    if (score >= 70) return "#1DB954";
    if (score >= 40) return "#F59B00";
    return "#e74c3c";
}

function scoreLabel(score) {
    if (score >= 80) return "Musical soulmates 🎵";
    if (score >= 60) return "Strong vibes match ✨";
    if (score >= 40) return "Some common ground 🎶";
    if (score >= 20) return "Different tastes 🎲";
    return "Musical opposites 🌍";
}

export default function Compare() {
    const { spotifyId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [myProfile, setMyProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch(`/api/compare/${spotifyId}`, { credentials: "include" }),
            fetch("/api/me", { credentials: "include" }),
        ])
            .then(([cmpRes, meRes]) => {
                if (!cmpRes.ok) throw new Error("Failed to load comparison");
                return Promise.all([cmpRes.json(), meRes.json()]);
            })
            .then(([cmpData, meData]) => {
                setData(cmpData);
                setMyProfile(meData);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [spotifyId]);

    if (loading) return <div className="db-state"><p>Loading comparison...</p></div>;
    if (error)   return <div className="db-state"><p>{error}</p></div>;

    const color = scoreColor(data.compatibilityScore);

    return (
        <div className="db-root">
            <nav className="db-navbar">
                <span className="db-nav-title">
                    Friend Wrapped
                    <span className="db-nav-dot" />
                </span>
                <button className="db-icon-btn" onClick={() => navigate("/dashboard")}>← Back</button>
            </nav>

            <div className="db-body">

                {/* VS Header */}
                <div className="cmp-vs-header">
                    <div className="cmp-vs-user">
                        <Avatar src={myProfile?.images?.[0]?.url} name={myProfile?.display_name || "You"} />
                        <span className="cmp-vs-name">{myProfile?.display_name || "You"}</span>
                    </div>

                    <div className="cmp-vs-badge" style={{ "--score-color": color }}>
                        <span className="cmp-vs-score">{data.compatibilityScore}%</span>
                        <span className="cmp-vs-label">{scoreLabel(data.compatibilityScore)}</span>
                    </div>

                    <div className="cmp-vs-user">
                        <Avatar src={data.friend.profileImage} name={data.friend.displayName} />
                        <span className="cmp-vs-name">{data.friend.displayName}</span>
                    </div>
                </div>

                {/* Top Tracks */}
                <span className="db-section-label">✦ Top Tracks</span>
                <div className="db-grid">
                    <TopTracks
                        title="Your top tracks"
                        tracks={data.yourTopTracks.slice(0, 20)}
                    />
                    <TopTracks
                        title={`${data.friend.displayName}'s top tracks`}
                        tracks={data.friendTopTracks.slice(0, 20)}
                    />
                </div>

                {/* In Common */}
                <span className="db-section-label">✦ In Common</span>
                <div className="db-grid">
                    <SharedArtists artists={data.sharedArtists} />
                    <SharedTracks tracks={data.sharedTracks} />
                </div>

                {/* Unique to Each */}
                <span className="db-section-label">✦ Unique to Each</span>
                <UniqueArtists
                    yourName={myProfile?.display_name || "You"}
                    yourArtists={data.yourUniqueArtists.slice(0, 20)}
                    friendName={data.friend.displayName}
                    friendArtists={data.friendUniqueArtists.slice(0, 20)}
                />
            </div>
        </div>
    );
}