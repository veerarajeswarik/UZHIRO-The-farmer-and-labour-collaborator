const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Chat history is stored ONLY when the farmer explicitly opts in
 * (saveHistory: true on a given request) - per the "store chat history only
 * if the user is authenticated and has consented" rule. One growing
 * conversation per user for this prototype (not multiple named threads).
 */
const aiConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIConversation', aiConversationSchema);
