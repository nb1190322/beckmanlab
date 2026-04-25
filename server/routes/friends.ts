import { Hono } from "hono";
import { getAuthUser } from "../helpers.ts";
import User from "../models/User.ts";

export const friendRoutes = () => {
    const app = new Hono();

    app.post("/api/follow/request/:spotifyId", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const targetId = c.req.param("spotifyId");
        if (targetId === profile.id) return c.json({ error: "Cannot follow yourself" }, 400);

        const [sender, target] = await Promise.all([
            User.findOne({ spotifyId: profile.id }),
            User.findOne({ spotifyId: targetId }),
        ]);

        if (!sender) return c.json({ error: "Your account not found" }, 404);
        if (!target) return c.json({ error: "User not found" }, 404);

        if (sender.following.includes(targetId)) return c.json({ error: "Already following" }, 400);
        if (sender.pendingRequests.sent.includes(targetId)) return c.json({ error: "Request already sent" }, 400);

        await Promise.all([
            User.findOneAndUpdate({ spotifyId: profile.id }, { $push: { "pendingRequests.sent": targetId } }),
            User.findOneAndUpdate({ spotifyId: targetId }, { $push: { "pendingRequests.received": profile.id } }),
        ]);

        return c.json({ message: "Follow request sent!" });
    });

    app.post("/api/follow/accept/:spotifyId", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const requesterId = c.req.param("spotifyId");

        await Promise.all([
            User.findOneAndUpdate(
                { spotifyId: profile.id },
                {
                    $addToSet: { followers: requesterId, following: requesterId },
                    $pull: { "pendingRequests.received": requesterId },
                }
            ),
            User.findOneAndUpdate(
                { spotifyId: requesterId },
                {
                    $addToSet: { followers: profile.id, following: profile.id },
                    $pull: { "pendingRequests.sent": profile.id },
                }
            ),
        ]);

        return c.json({ message: "Follow request accepted!" });
    });

    app.post("/api/follow/decline/:spotifyId", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const requesterId = c.req.param("spotifyId");

        await Promise.all([
            User.findOneAndUpdate({ spotifyId: profile.id }, { $pull: { "pendingRequests.received": requesterId } }),
            User.findOneAndUpdate({ spotifyId: requesterId }, { $pull: { "pendingRequests.sent": profile.id } }),
        ]);

        return c.json({ message: "Declined" });
    });

    app.get("/api/follow/requests", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const user = await User.findOne({ spotifyId: profile.id });
        if (!user) return c.json({ error: "User not found" }, 404);

        const requests = await User.find({
            spotifyId: { $in: user.pendingRequests.received as string[] }
        }).select("spotifyId displayName profileImage");

        return c.json({ requests });
    });

    app.get("/api/friends", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const user = await User.findOne({ spotifyId: profile.id });
        if (!user) return c.json({ error: "User not found" }, 404);

        const mutualIds = user.following.filter((id: string) => user.followers.includes(id));
        const friends = await User.find({
            spotifyId: { $in: mutualIds as string[] }
        }).select("spotifyId displayName profileImage");

        return c.json({ friends });
    });

    app.get("/api/friends/:spotifyId", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const targetId = c.req.param("spotifyId");
        const currentUser = await User.findOne({ spotifyId: profile.id });
        if (!currentUser) return c.json({ error: "User not found" }, 404);

        const isMutual = currentUser.following.includes(targetId) &&
                         currentUser.followers.includes(targetId);

        if (!isMutual) return c.json({ error: "Must be mutual followers" }, 403);

        const friend = await User.findOne({ spotifyId: targetId })
            .select("spotifyId displayName profileImage topArtists topTracks");

        return c.json(friend);
    });

    app.get("/api/compare/:spotifyId", async (c) => {
        const profile = await getAuthUser(c);
        if (!profile) return c.json({ error: "Not authenticated" }, 401);

        const targetId = c.req.param("spotifyId");
        const currentUser = await User.findOne({ spotifyId: profile.id }).lean();
        if (!currentUser) return c.json({ error: "User not found" }, 404);

        const isMutual = (currentUser.following as string[]).includes(targetId) &&
            (currentUser.followers as string[]).includes(targetId);
        if (!isMutual) return c.json({ error: "Must be mutual followers" }, 403);

        const friend = await User.findOne({ spotifyId: targetId }).lean();
        if (!friend) return c.json({ error: "Friend not found" }, 404);

        // Use medium term as primary comparison data
        const myArtists  = ((currentUser.topArtists as any)?.medium || []) as any[];
        const myTracks   = ((currentUser.topTracks  as any)?.medium || []) as any[];
        const friendArtists = ((friend.topArtists as any)?.medium || []) as any[];
        const friendTracks  = ((friend.topTracks  as any)?.medium || []) as any[];

        // Also grab short and long term for bonus scoring
        const myArtistsShort  = ((currentUser.topArtists as any)?.short || []) as any[];
        const myArtistsLong   = ((currentUser.topArtists as any)?.long  || []) as any[];
        const friArtistsShort = ((friend.topArtists as any)?.short || []) as any[];
        const friArtistsLong  = ((friend.topArtists as any)?.long  || []) as any[];

        const friendArtistIds      = new Set(friendArtists.map((a: any) => a.id));
        const friendTrackIds       = new Set(friendTracks.map((t: any) => t.id));
        const myArtistIds          = new Set(myArtists.map((a: any) => a.id));
        const friendArtistIdsShort = new Set(friArtistsShort.map((a: any) => a.id));
        const friendArtistIdsLong  = new Set(friArtistsLong.map((a: any) => a.id));
        const myArtistIdsShort     = new Set(myArtistsShort.map((a: any) => a.id));
        const myArtistIdsLong      = new Set(myArtistsLong.map((a: any) => a.id));

        const sharedArtists      = myArtists.filter((a: any) => friendArtistIds.has(a.id));
        const sharedTracks       = myTracks.filter((t: any) => friendTrackIds.has(t.id));
        const yourUniqueArtists  = myArtists.filter((a: any) => !friendArtistIds.has(a.id));
        const friendUniqueArtists = friendArtists.filter((a: any) => !myArtistIds.has(a.id));

        // Weighted compatibility score
        // 40% medium artist overlap
        const artistOverlap = myArtists.length > 0
            ? sharedArtists.length / Math.max(myArtists.length, friendArtists.length)
            : 0;

        // 30% medium track overlap
        const trackOverlap = myTracks.length > 0
            ? sharedTracks.length / Math.max(myTracks.length, friendTracks.length)
            : 0;

        // 20% cross-time consistency bonus (shared artists across ALL time ranges)
        const crossTimeShared = sharedArtists.filter((a: any) =>
            (friendArtistIdsShort.has(a.id) || myArtistIdsShort.has(a.id)) &&
            (friendArtistIdsLong.has(a.id)  || myArtistIdsLong.has(a.id))
        ).length;
        const crossTimeBonus = sharedArtists.length > 0
            ? crossTimeShared / sharedArtists.length
            : 0;

        // 10% popularity similarity (both mainstream or both niche)
        const myAvgPop  = myArtists.reduce((s: number, a: any) => s + (a.popularity || 0), 0) / (myArtists.length || 1);
        const friAvgPop = friendArtists.reduce((s: number, a: any) => s + (a.popularity || 0), 0) / (friendArtists.length || 1);
        const popSimilarity = 1 - Math.abs(myAvgPop - friAvgPop) / 100;

        const compatibilityScore = Math.round(
            (artistOverlap  * 0.40 +
                trackOverlap   * 0.30 +
                crossTimeBonus * 0.20 +
                popSimilarity  * 0.10) * 100
        );

        const formatTracks = (tracks: any[]) => tracks.map((t: any) => ({
            id: t.id,
            name: t.name,
            artists: (t.artists as string[]).map((name) => ({ name })),
            album: { name: t.albumName },
            albumImage: t.albumImage,
        }));

        return c.json({
            friend: {
                spotifyId:    friend.spotifyId,
                displayName:  friend.displayName,
                profileImage: friend.profileImage,
            },
            sharedArtists,
            sharedTracks:       formatTracks(sharedTracks),
            yourUniqueArtists,
            friendUniqueArtists,
            yourTopTracks:      formatTracks(myTracks),
            friendTopTracks:    formatTracks(friendTracks),
            compatibilityScore,
        });
    });

    return app;
};