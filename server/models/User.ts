import mongoose from "mongoose";

const artistSchema = {
    id: String,
    name: String,
    imageUrl: String,
    popularity: Number,
}

const trackSchema = {
    id: String,
    name: String,
    artists: [String],
    albumName: String,
    albumImage: String,
    popularity: Number,
}

const userSchema = new mongoose.Schema({
    spotifyId: { type: String, required: true, unique: true },
    displayName: String,
    email: { type: String },
    profileImage: { type: String },
    topArtists: {
        short:  [artistSchema],
        medium: [artistSchema],
        long:   [artistSchema],
    },
    topTracks: {
        short:  [trackSchema],
        medium: [trackSchema],
        long: [trackSchema],
    },
    following: [{ type: String }],
    followers: [{ type: String }],
    pendingRequests: {
        sent: [{ type: String }],
        received: [{ type: String }],
    },
    lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);