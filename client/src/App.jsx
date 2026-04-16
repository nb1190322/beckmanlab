import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopTracks from './components/TopTracks';
import "./App.css";

import SharedArtists from './components/SharedArtists';
import SharedGenres from './components/SharedGenres';
import CompatibilityScore from './components/CompatibilityScore';
import UniqueArtists from './components/UniqueArtists';
import SharedTracks from './components/SharedTracks';
import AddFriend from './components/AddFriend';
import Notifications from './components/Notifications';

function useSpotifyData() {
  const [data, setData] = useState(null);


function Landing() {
  return (
    <div className="container">
      <h1> Friend Wrapped </h1>
      <p> Compare your music taste with your friends and discover new music together! </p>
      <a href="/api/login">
        <button className="spotify-btn">Login with Spotify</button>
      </a>
    </div>
  )
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>Not logged in. <a href="/api/login">Login here</a></p></div>;
}


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
  );
}

function Dashboard() {
  const { data, loading, error } = useSpotifyData();

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>Not logged in. <a href="/api/login">Login here</a></p></div>;

  return (
    <div className="dashboard">
      <div className="profile-header">
        <img src={data.profile.images[0]?.url} alt="profile" className="avatar" />
        <div>
          <h1>{data.profile.display_name}</h1>
          <p>{data.profile.followers?.total} followers</p>
        </div>
      </div>

      <CompatibilityScore score={null} />

      <div className="tables-grid">
        <TopTracks title="Your top tracks" tracks={data.topTracks} />
        <TopTracks title="Friend's top tracks" tracks={[]} />
      </div>

      <div className="tables-grid">
        <SharedArtists artists={null} />
        <SharedGenres genres={null} />
      </div>

      <div className="tables-grid">
        <SharedTracks tracks={null} />
        <UniqueArtists
          yourName={data.profile.display_name}
          yourArtists={data.topArtists}
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