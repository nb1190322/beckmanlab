import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getAuthUser } from "../helpers.ts";
import User from "../models/User.ts";

export const userRoutes = () => {
    const app = new Hono();

    app.get("/api/health", (c) => c.json({ status: "ok", message: "Server is running!" }));

    app.get("/api/me", async (c) => {
        const token = getCookie(c, "spotify_token");
        if (!token) return c.json({ error: "Not authenticated" }, 401);

        const res = await fetch("https://api.spotify.com/v1/me", {
            headers: { "Authorization": `Bearer ${token}` },
        });
        return c.json(await res.json());
    });

    app.get("/api/users/search", async (c) => {
        const token = getCookie(c, "spotify_token");
        if (!token) return c.json({ error: "Not authenticated" }, 401);

        const query = c.req.query("q");
        if (!query) return c.json({ error: "No search query" }, 400);

        const users = await User.find({
            $or: [
                { displayName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ]
        }).select("spotifyId displayName profileImage");

        return c.json(users);
    });

    app.get("/api/me/top", async (c) => {
        const token = getCookie(c, "spotify_token");
        if (!token) return c.json({ error: "Not authenticated" }, 401);

        const res = await fetch("https://api.spotify.com/v1/me", {
            headers: { "Authorization": `Bearer ${token}` },
        });
        const profile = await res.json();

        const user = await User.findOne({ spotifyId: profile.id })
            .select("topArtists topTracks");

        if (!user) return c.json({ error: "User not found" }, 404);

        return c.json({
            topArtists: user.topArtists.map((a: any) => ({
                id: a.id,
                name: a.name,
                imageUrl: a.imageUrl,
                popularity: a.popularity,
            })),
            topTracks: user.topTracks.map((t: any) => ({
                id: t.id,
                name: t.name,
                artists: t.artists.map((name: string) => ({ name })),
                album: { name: t.albumName },
                albumImage: t.albumImage,
                popularity: t.popularity,
            })),
        });
    });

    return app;
};