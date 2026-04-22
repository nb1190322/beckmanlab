import Notifications from "./Notifications.jsx";
import AddFriend from "./AddFriend.jsx";
import "../css/Landing.css";

function Visualizer() {
    const bars = Array.from({ length: 80 }, (_, i) => ({
        height: 40 + Math.random() * 60,
        dur: (0.8 + Math.random() * 1.6).toFixed(2),
        delay: (Math.random() * 1.5).toFixed(2),
    }));

    return (
        <div className="visualizer-bg">
            {bars.map((b, i) => (
                <div
                    key={i}
                    className="viz-bar"
                    style={{
                        height: `${b.height}vh`,
                        "--dur": `${b.dur}s`,
                        "--delay": `${b.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function Landing() {
    return (
        <div className="fw-root">
            <style>{Landing.css}</style>
            <Visualizer />
            <div className="noise" />
            <div className="glow-orb" />

            {/* Corner decoration */}
            <div className="corner-art">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {[0,1,2,3,4,5].map(i => (
                        <circle key={i} cx="100" cy="100" r={20 + i * 28}
                            stroke="white" strokeWidth="1" strokeDasharray="4 8" />
                    ))}
                </svg>
            </div>

            <nav className="navbar">
                <span className="nav-title">
                    Friend Wrapped
                    <span className="nav-dot" />
                </span>
                <div className="nav-actions">
                    <AddFriend />
                    <Notifications />
                </div>
            </nav>

            <div className="hero">
                <p className="hero-eyebrow">✦ Music Comparison</p>

                <h1 className="hero-title">
                    Friend<br />
                    <span className="accent">Wrapped</span>
                </h1>

                <p className="hero-sub">
                    Compare your music taste with your friends and discover new music together.
                </p>

                <div className="badge-row">
                    <span className="badge">Top Artists</span>
                    <span className="badge">Top Tracks</span>
                    <span className="badge">Compatibility Score</span>
                    <span className="badge">Generate Playlists</span>
                </div>

                <div className="hero-actions">
                    <button
                        className="spotify-btn"
                        onClick={() => window.location.href = '/api/login'}
                    >
                        <img
                            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png"
                            alt="Spotify"
                            style={{ height: '20px', width: 'auto' }}
                        />
                        Continue with Spotify
                    </button>
                    <span className="hero-hint">Free to use &nbsp;·&nbsp; No credit card</span>
                </div>
            </div>
        </div>
    );
}