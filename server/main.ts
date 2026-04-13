import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie, getCookie } from "hono/cookie";
import { load } from "load";

const env = await load({ envPath: "./server/.env" });

const app = new Hono();

// Middleware
app.use("*", cors({
  origin: "http://localhost:5173", // Vite's default port
  credentials: true,
}));

// Routes
app.get("/api/health", (c) => c.json({ status: "ok", message: "Server is running!" }));

// Spotify login -- redirects user to Spotify
app.get("/api/login", (c) => {
    const scopes = [
        "user-top-read",
        "user-follow-read",
        "playlist-modify-public",
        "playlist-modify-private",
    ].join(" ");

    const params = new URLSearchParams({
        client_id: env["SPOTIFY_CLIENT_ID"]!,
        response_type: "code",
        redirect_uri: env["SPOTIFY_REDIRECT_URI"]!,
        scope: scopes,
    });

    return c.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get("/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) {
        return c.json({ error: "Authorization code not found" }, 400);
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(`${env["SPOTIFY_CLIENT_ID"]}:${env["SPOTIFY_CLIENT_SECRET"]}`),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: env["SPOTIFY_REDIRECT_URI"],
        }),
    });

    const data = await response.json();

    if (data.error) {
        return c.json({ error: data.error }, 400);
    }

    const accessToken = data.access_token;

    const profileRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    const profile = await profileRes.json();

    const topArtistsRes = await fetch("https://api.spotify.com/v1/me/top/artists?limit=20", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    const topArtists = await topArtistsRes.json();

    const topTracksRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=20", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    const topTracks = await topTracksRes.json();

    setCookie(c, "spotify_token", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600, // 1 hour
        path: "/",
    });

    // TODO: Save to MongoDB
    console.log("Us logged in:", profile.display_name);
    console.log("Top Artists:", topArtists.items.map((a: any) => a.name));
    return c.redirect(`${env["FRONTEND_URL"]}/dashboard`);
});

/*
app.get("/api/me", async (c) => {
    const token = getCookie(c, "spotify_token");
    if (!token) {
        return c.json({ error: "Not authenticated" }, 401);
    }

    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    const profile = await res.json();
    return c.json(profile);
});
*/

// new endpoint, old one commented out
app.get("/api/me", async (c) => {
  const token = getCookie(c, "spotify_token");
  if (!token) return c.json({ error: "Not authenticated" }, 401);

  const [profileRes, artistsRes, tracksRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me", {
      headers: { "Authorization": `Bearer ${token}` },
    }),
    fetch("https://api.spotify.com/v1/me/top/artists?limit=20", {
      headers: { "Authorization": `Bearer ${token}` },
    }),
    fetch("https://api.spotify.com/v1/me/top/tracks?limit=20", {
      headers: { "Authorization": `Bearer ${token}` },
    }),
  ]);

  const [profile, artists, tracks] = await Promise.all([
    profileRes.json(), artistsRes.json(), tracksRes.json()
  ]);

  // TODO: swap this out for MongoDB reads/writes later
  return c.json({
    profile,
    topArtists: artists.items,
    topTracks: tracks.items,
  });
});

// Start server
Deno.serve({ port: Number(env["PORT"]) || 5000 }, app.fetch);
console.log(`Server running on port ${env["PORT"] || 5000}`);