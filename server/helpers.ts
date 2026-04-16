import { getCookie } from "hono/cookie";

export async function getAuthUser(c: any) {
    const token = getCookie(c, "spotify_token");
    if (!token) return null;
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { "Authorization": `Bearer ${token}` },
    });
    return await res.json();
}