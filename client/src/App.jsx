import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
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

function Landing() {
  return (
    <div>
      <nav className="navbar">
        <span className="nav-title">Friend Wrapped</span>
        <div className="nav-actions">
          <AddFriend />
          <Notifications />
        </div>
      </nav>
        <div className="container">
          <h1>Friend Wrapped</h1>
          <p>Compare your music taste with your friends and discover new music together!</p>
          <button className="spotify-btn" onClick={() => window.location.href = '/api/login'}>
            Login with Spotify
          </button>
        </div>
    </div>
  );
}

function Dashboard() {
  const { user, topData, loading, error } = useSpotifyData();
  const navigate = useNavigate();

  const logout = async () => {
      await fetch("/api/logout", {
          method: "POST",
          credentials: "include"
      })
      navigate("/")
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>Not logged in. <a href="/api/login">Login here</a></p></div>;

    return (
        <div className="dashboard">
            <nav className="navbar">
                <span className="nav-title">🎵 Friend Wrapped</span>
                <div className="nav-actions">
                    <AddFriend />
                    <Notifications />
                    <button className="icon-btn" onClick={logout}>Sign Out</button>
                </div>
            </nav>
            <div className="profile-header">
                <img src={user?.images?.[0]?.url} alt="profile" className="avatar" />
                <div>
                    <h1>{user?.display_name}</h1>
                    <p>{user?.followers?.total} followers</p>
                </div>
            </div>

            <CompatibilityScore score={null} />

            <div className="tables-grid">
                <TopTracks title="Your top tracks" tracks={topData?.topTracks || []} />
                <TopTracks title="Friend's top tracks" tracks={[]} />
            </div>

            <div className="tables-grid">
                <SharedArtists artists={null} />
                <SharedGenres genres={null} />
            </div>

            <div className="tables-grid">
                <SharedTracks tracks={null} />
                <UniqueArtists
                    yourName={user?.display_name}
                    yourArtists={topData?.topArtists || []}
                    friendName="Friend"
                    friendArtists={null}
                />
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