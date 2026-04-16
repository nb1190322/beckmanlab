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

    return app;
};