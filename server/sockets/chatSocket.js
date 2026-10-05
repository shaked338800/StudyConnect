// [REQ-28 Socket.io] Real-time group chat.
//
// - Socket.io is attached to the same HTTP server as Express (see server.js).
// - The Express session middleware also runs for Socket.io, so we know which
//   user is connected from their login cookie - the client never sends its id.
// - Each StudyGroup has its own "room" ("group:<id>"). Only members may join
//   it, and a message is broadcast only to that room.
const { Server } = require('socket.io');
const sessionMiddleware = require('../config/session');
const { findGroupById, isGroupMember } = require('../models/StudyGroup');
const { createMessage } = require('../models/Message');
const { isValidObjectId, validateMessageText } = require('../utils/validators');

let io = null; // set once by initChat(), used by the emit helpers below

function roomName(groupId) {
  return 'group:' + groupId;
}

// Checks that groupId is valid, the group exists and the user is a member.
// Returns { group } or { error }.
async function checkMembership(groupId, userId) {
  if (!isValidObjectId(groupId)) {
    return { error: 'Invalid group id' };
  }
  const group = await findGroupById(groupId);
  if (!group) {
    return { error: 'Group not found' };
  }
  if (!isGroupMember(group, userId)) {
    return { error: 'Only members of this group can use its chat' };
  }
  return { group };
}

// The client may call socket.emit(event, data, callback). If it did not pass a
// callback (or passed something else), use an empty function so we never crash.
function safeCallback(callback) {
  return typeof callback === 'function' ? callback : () => {};
}

function initChat(httpServer) {
  io = new Server(httpServer, {
    maxHttpBufferSize: 100 * 1024 // 100 KB per socket message is plenty for chat text
  });

  // Run the same express-session middleware for Socket.io's HTTP handshake,
  // so socket.request.session is the user's login session.
  io.engine.use(sessionMiddleware);

  // [REQ-21] Reject the connection if the user is not logged in
  io.use((socket, next) => {
    const session = socket.request.session;
    if (!session || !session.userId) {
      return next(new Error('You must be logged in to use the chat'));
    }
    socket.data.userId = session.userId; // identity comes from the session only
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    // Enter a group's chat room (members only)
    socket.on('joinGroupChat', async (groupId, callback) => {
      const reply = safeCallback(callback);
      try {
        const { error } = await checkMembership(groupId, userId);
        if (error) return reply({ error });

        // One open chat at a time: leave any other group room first
        for (const room of socket.rooms) {
          if (room.startsWith('group:') && room !== roomName(groupId)) {
            socket.leave(room);
          }
        }
        socket.join(roomName(groupId));
        reply({ ok: true });
      } catch (err) {
        console.error('joinGroupChat error:', err);
        reply({ error: 'Could not join the chat' });
      }
    });

    socket.on('leaveGroupChat', (groupId) => {
      if (isValidObjectId(groupId)) {
        socket.leave(roomName(groupId));
      }
    });

    // Send a new message: validate -> check membership -> save in MongoDB ->
    // broadcast to everyone in the room (including the sender)
    socket.on('sendMessage', async (data, callback) => {
      const reply = safeCallback(callback);
      try {
        if (!data || typeof data !== 'object') {
          return reply({ error: 'Invalid message data' });
        }
        const textError = validateMessageText(data.text);
        if (textError) return reply({ error: textError });

        // Checked again on every message: someone who left the group can't send
        const { error } = await checkMembership(data.groupId, userId);
        if (error) return reply({ error });

        const message = await createMessage({
          groupId: data.groupId,
          senderId: userId, // from the session - any "sender" in data is ignored
          text: data.text.trim()
        });

        io.to(roomName(data.groupId)).emit('newMessage', message);
        reply({ ok: true, message });
      } catch (err) {
        console.error('sendMessage error:', err);
        reply({ error: 'Could not send the message' });
      }
    });
  });

  return io;
}

// ---------- Helpers used by the HTTP controllers ----------

// Broadcast an event to everyone in a group's chat room
function emitToGroupChat(groupId, event, data) {
  if (io) {
    io.to(roomName(groupId.toString())).emit(event, data);
  }
}

// A user left the group: remove their open sockets from the room,
// so they stop receiving that group's messages immediately.
async function removeUserFromGroupChat(groupId, userId) {
  if (!io) return;
  const room = roomName(groupId.toString());
  const sockets = await io.in(room).fetchSockets();
  for (const s of sockets) {
    if (s.data.userId === userId) {
      s.leave(room);
      s.emit('chatClosed', { groupId: groupId.toString(), reason: 'You are no longer a member of this group' });
    }
  }
}

// The group was deleted: tell everyone in the room and empty it
function closeGroupChat(groupId) {
  if (!io) return;
  const room = roomName(groupId.toString());
  io.to(room).emit('chatClosed', { groupId: groupId.toString(), reason: 'This group was deleted' });
  io.in(room).socketsLeave(room);
}

module.exports = { initChat, emitToGroupChat, removeUserFromGroupChat, closeGroupChat };
