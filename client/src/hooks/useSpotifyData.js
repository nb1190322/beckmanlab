// hooks/useSpotifyData.js
import { useState, useEffect } from 'react';

export function useSpotifyData() {
    const [user, setUser] = useState(null);
    const [topData, setTopData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/me', { credentials: 'include' }),
            fetch('/api/me/top', { credentials: 'include' }),
        ])
            .then(([meRes, topRes]) => {
                if (!meRes.ok) throw new Error('Not authenticated');
                return Promise.all([meRes.json(), topRes.json()]);
            })
            .then(([userData, topData]) => {
                setUser(userData);
                setTopData(topData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { user, topData, loading, error };
}