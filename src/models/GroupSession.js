const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSessionSchema = new Schema({
  inviteCode: { type: String, required: true, unique: true },
  members:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admin:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nowPlaying: { type: Schema.Types.ObjectId, ref: 'Song' },
  queue:      [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  messages:   [{
    sender:   { type: Schema.Types.ObjectId, ref: 'User' },
    content:  { type: String },
    timestamp:{ type: Date, default: Date.now }
  }]
}, { timestamps: true });

const GroupSession = mongoose.models.GroupSession || mongoose.model("GroupSession", GroupSessionSchema);
module.exports = GroupSession;