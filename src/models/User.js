const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  bio:       {type: String},
  location:  {type: String},
  groups:    [{ type: Schema.Types.ObjectId, ref: 'GroupSession' }],
  likedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  playlists:  [{ type: Schema.Types.ObjectId, ref: 'Playlist' }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;