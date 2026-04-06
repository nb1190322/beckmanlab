import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "./App.css";

function Landing() {
  return (
    <div className="container">
      <h1> Friend Wrapped </h1>
      <p> Compare your music taste with your friends and discover new music together! </p>
      <a href="https://beckmanlab.dev/api/login">
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
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>Not logged in. <a href="https://beckmanlab.dev/api/login">Login here</a></p></div>;

  return (
    <div className="container">
      <h1>Welcome, {user.display_name}!</h1>
      <img src={user.images[0]?.url} alt="profile" className="avatar" />
      <p>{user.followers?.total} followers on Spotify</p>
      <p>Country: {user.country} </p>
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