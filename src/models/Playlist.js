const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
  playlistName: { type: String, required: true },
  description:  { type: String },
  coverUrl:     { type: String },
  songs:        [{
    spotifyId:    { type: String, required: true },
    title:        { type: String, required: true },
    artist:       { type: String, required: true },
    album:        { type: String },
    duration:     { type: String },
    albumImage:   { type: String },
    spotifyUrl:   { type: String },
    addedAt:      { type: Date, default: Date.now }
  }],
  owner:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith:   [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", PlaylistSchema);
module.exports = Playlist;