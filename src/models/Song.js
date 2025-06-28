const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema({
  title:    { type: String, required: true },
  artist:   { type: String, required: true },
  album:    { type: String },
  duration: { type: String }, // or Number (seconds)
}, { timestamps: true });

const Song = mongoose.models.Song || mongoose.model("Song", SongSchema);
module.exports = Song;