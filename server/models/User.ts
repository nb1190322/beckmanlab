import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    spotifyId: { type: String, required: true, unique: true },
    displayName: String,
    email: { type: String },
    profileImage: { type: String },
    topArtists: [
        {
            id: String,
            name: String,
            genres: [String],
            imageUrl: String,
            popularity: Number,
        }
    ],
    topTracks: [
        {
            id: String,
            name: String,
            artists: [String],
            albumName: String,
            albumImage: String,
            popularity: Number,
        }
    ],
    following: [{ type: String }],
    followers: [{ type: String }],
    pendingRequests: {
        sent: [{ type: String }],
        received: [{ type: String }],
    },
    lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);