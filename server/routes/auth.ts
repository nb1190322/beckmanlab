import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import User from "../models/User.ts";

export const authRoutes = (env: Record<string, string>) => {
    const app = new Hono();

    app.get("/api/login", (c) => {
        const scopes = [
            "user-top-read",
            "user-follow-read",
            "playlist-modify-public",
            "playlist-modify-private",
        ].join(" ");

        const params = new URLSearchParams({
            client_id: env["SPOTIFY_CLIENT_ID"],
            response_type: "code",
            redirect_uri: env["SPOTIFY_REDIRECT_URI"],
            scope: scopes,
            show_dialog: "true",
        });

        return c.redirect(`https://accounts.spotify.com/authorize?${params}`);
    });

    app.get("/callback", async (c) => {
        const code = c.req.query("code");
        if (!code) return c.json({ error: "No code provided" }, 400);

        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
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

        const tokenData = await tokenRes.json();
        if (tokenData.error) return c.json({ error: tokenData.error }, 400);

        const accessToken = tokenData.access_token;

        const [profileRes, topArtistsRes, topTracksRes] = await Promise.all([
            fetch("https://api.spotify.com/v1/me", {
                headers: { "Authorization": `Bearer ${accessToken}` },
            }),
            fetch("https://api.spotify.com/v1/me/top/artists?limit=20", {
                headers: { "Authorization": `Bearer ${accessToken}` },
            }),
            fetch("https://api.spotify.com/v1/me/top/tracks?limit=20", {
                headers: { "Authorization": `Bearer ${accessToken}` },
            }),
        ]);

        const [profile, topArtists, topTracks] = await Promise.all([
            profileRes.json(),
            topArtistsRes.json(),
            topTracksRes.json(),
        ]);

        setCookie(c, "spotify_token", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3600,
            path: "/",
        });

        await User.findOneAndUpdate(
            { spotifyId: profile.id },
            {
                spotifyId: profile.id,
                displayName: profile.display_name,
                email: profile.email,
                profileImage: profile.images?.[0]?.url || "",
                topArtists: topArtists.items.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    imageUrl: a.images?.[0]?.url || "",
                    popularity: a.popularity,
                })),
                topTracks: topTracks.items.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    artists: t.artists.map((a: any) => a.name),
                    albumName: t.album.name,
                    albumImage: t.album.images?.[0]?.url || "",
                    popularity: t.popularity,
                })),
                lastUpdated: new Date(),
            },
            { upsert: true, new: true }
        );

        console.log("Saved user to MongoDB:", profile.display_name);
        return c.redirect(`${env["FRONTEND_URL"]}/dashboard`);
    });

    app.post("/api/logout", (c) => {
        setCookie(c, "spotify_token", "", {
            httpOnly: true,
            secure: true,
            maxAge: 0,
            path: "/",
        });
        return c.json({ message: "Logged out" });
    });

    return app;
};