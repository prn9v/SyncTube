const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
  name:      { type: String, required: true },
  descripion:{typr: String},
  coverUrl:  { type: String },
  songs:    [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  owner:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", PlaylistSchema);
module.exports = Playlist;