// [REQ-17 MVC - Controller] [REQ-28] Chat messages over HTTP:
// history / search / edit / delete. (Sending is done over Socket.io.)
const {
  findMessageById,
  listMessages,
  updateMessageText,
  deleteMessage
} = require('../models/Message');
const { findGroupById, isGroupMember } = require('../models/StudyGroup');
const { isString, validateMessageText } = require('../utils/validators');
const escapeRegex = require('../utils/escapeRegex');
const { emitToGroupChat } = require('../sockets/chatSocket');

// Loads the group and checks that the user is a member.
// Sends the error response itself and returns null when not allowed.
async function loadGroupForMember(groupId, userId, res) {
  const group = await findGroupById(groupId);
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return null;
  }
  if (!isGroupMember(group, userId)) {
    res.status(403).json({ error: 'Only members of this group can use its chat' });
    return null;
  }
  return group;
}

// Loads a message and checks: it exists, I am its sender, and I am still a
// member of its group. Returns the message, or null after sending an error.
async function loadOwnMessage(messageId, userId, res, action) {
  const message = await findMessageById(messageId);
  if (!message) {
    res.status(404).json({ error: 'Message not found' });
    return null;
  }
  // [REQ-21] Only the sender - even the group owner can't change others' messages
  if (message.sender.toString() !== userId) {
    res.status(403).json({ error: `You can only ${action} your own messages` });
    return null;
  }
  const group = await loadGroupForMember(message.group, userId, res);
  if (!group) return null;
  return message;
}

// GET /api/messages/group/:id?q=text - chat history, or search in it
async function getGroupMessages(req, res) {
  const q = req.query.q;
  if (q !== undefined && (!isString(q) || q.length > 50)) {
    return res.status(400).json({ error: 'Search text must be at most 50 characters' });
  }

  const group = await loadGroupForMember(req.params.id, req.userId, res);
  if (!group) return;

  const searchRegex = q && q.trim() ? new RegExp(escapeRegex(q.trim()), 'i') : null;
  const messages = await listMessages(group._id, searchRegex);
  res.json({ messages });
}

// PUT /api/messages/:id { text } - edit my own message
async function editMessage(req, res) {
  const body = req.body || {};
  const textError = validateMessageText(body.text);
  if (textError) {
    return res.status(400).json({ error: textError });
  }

  const message = await loadOwnMessage(req.params.id, req.userId, res, 'edit');
  if (!message) return;

  const updated = await updateMessageText(message._id, body.text.trim());
  // Real-time: everyone in the room sees the edit
  emitToGroupChat(message.group, 'messageUpdated', updated);
  res.json({ message: updated });
}

// DELETE /api/messages/:id - delete my own message
async function removeMessage(req, res) {
  const message = await loadOwnMessage(req.params.id, req.userId, res, 'delete');
  if (!message) return;

  await deleteMessage(message._id);
  // Real-time: everyone in the room removes it
  emitToGroupChat(message.group, 'messageDeleted', {
    messageId: message._id.toString(),
    groupId: message.group.toString()
  });
  res.json({ message: 'Message deleted' });
}

module.exports = { getGroupMessages, editMessage, removeMessage };
