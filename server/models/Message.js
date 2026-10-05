// [REQ-17 MVC - Model] Message model (group chat, requirement 28).
// Only files in models/ use Mongoose. Controllers / socket handlers call the functions exported here.
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Relationship StudyGroup 1-N Message: the chat room this message belongs to
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
    // Relationship User 1-N Message: who wrote it (always the logged-in user)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: [true, 'Message text is required'], trim: true, minlength: 1, maxlength: 1000 },
    edited: { type: Boolean, default: false } // true after the sender edits it
  },
  { timestamps: true }
);

// Speeds up "messages of this group, ordered by time"
messageSchema.index({ group: 1, createdAt: -1 });

messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Message = mongoose.model('Message', messageSchema);

const HISTORY_LIMIT = 50;

function populateMessage(query) {
  return query.populate('sender', 'username fullName');
}

// ---------- Data functions ----------

async function createMessage({ groupId, senderId, text }) {
  const message = await Message.create({ group: groupId, sender: senderId, text });
  return populateMessage(Message.findById(message._id));
}

// Plain message (sender/group are ids) - used for permission checks
function findMessageById(id) {
  return Message.findById(id);
}

// The last 50 messages of a group, oldest first (the order a chat shows them).
// If searchRegex is given, only messages whose text matches it.
async function listMessages(groupId, searchRegex) {
  const filter = { group: groupId };
  if (searchRegex) {
    filter.text = searchRegex;
  }
  const newestFirst = await populateMessage(
    Message.find(filter).sort({ createdAt: -1 }).limit(HISTORY_LIMIT)
  );
  return newestFirst.reverse();
}

function updateMessageText(id, text) {
  return populateMessage(
    Message.findByIdAndUpdate(id, { $set: { text, edited: true } }, { returnDocument: 'after', runValidators: true })
  );
}

function deleteMessage(id) {
  return Message.findByIdAndDelete(id);
}

// Used when a study group is deleted
function deleteMessagesByGroup(groupId) {
  return Message.deleteMany({ group: groupId });
}

// Used when a user deletes their account
function deleteMessagesBySender(senderId) {
  return Message.deleteMany({ sender: senderId });
}

module.exports = {
  createMessage,
  findMessageById,
  listMessages,
  updateMessageText,
  deleteMessage,
  deleteMessagesByGroup,
  deleteMessagesBySender
};
