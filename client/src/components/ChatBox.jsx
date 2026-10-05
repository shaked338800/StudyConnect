import { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import socket from '../socket';
import { getGroupMessages, updateMessage, deleteMessage } from '../api/messagesApi';
import { notify } from '../jquery/notify';

const MAX_LENGTH = 1000;

function formatTime(date) {
  return new Date(date).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// [REQ-28] Real-time chat of one study group.
// - History, search, edit and delete use jQuery $.ajax (HTTP).
// - Joining the room and sending new messages use Socket.io.
// - New / edited / deleted messages arrive as Socket.io events.
function ChatBox({ groupId, user, onChatClosed }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const listRef = useRef(null);

  // Live events are ignored while search results are shown
  const searchActiveRef = useRef(false);
  searchActiveRef.current = searchActive;

  async function loadHistory() {
    try {
      const data = await getGroupMessages(groupId);
      setMessages(data.messages);
    } catch {
      // toast shown by the global ajaxError handler
    }
  }

  // Join the room + load history; listen to the room's events
  useEffect(() => {
    function joinRoom() {
      socket.emit('joinGroupChat', groupId, (res) => {
        if (res && res.error) notify(res.error, 'error');
      });
    }

    function handleNew(message) {
      if (message.group !== groupId || searchActiveRef.current) return;
      setMessages((prev) => [...prev, message]);
    }
    function handleUpdated(message) {
      if (message.group !== groupId) return;
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    }
    function handleDeleted(data) {
      if (data.groupId !== groupId) return;
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    }
    function handleClosed(data) {
      if (data.groupId !== groupId) return;
      notify(data.reason, 'info');
      onChatClosed();
    }
    // After a lost connection comes back: re-join and reload what we missed
    function handleReconnect() {
      joinRoom();
      loadHistory();
    }

    socket.on('newMessage', handleNew);
    socket.on('messageUpdated', handleUpdated);
    socket.on('messageDeleted', handleDeleted);
    socket.on('chatClosed', handleClosed);
    socket.on('connect', handleReconnect);

    if (socket.connected) joinRoom();
    loadHistory();

    // Cleanup when the chat is closed or the page changes
    return () => {
      socket.off('newMessage', handleNew);
      socket.off('messageUpdated', handleUpdated);
      socket.off('messageDeleted', handleDeleted);
      socket.off('chatClosed', handleClosed);
      socket.off('connect', handleReconnect);
      socket.emit('leaveGroupChat', groupId);
    };
  }, [groupId]);

  // [REQ-25 jQuery] Smoothly scroll to the newest message. jQuery only
  // animates scrollTop of the element React gave us - it adds/removes nothing.
  useEffect(() => {
    const list = listRef.current;
    if (list && !searchActive) {
      $(list).stop().animate({ scrollTop: list.scrollHeight }, 300);
    }
  }, [messages, searchActive]);

  function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed === '') {
      setSendError('Write a message first');
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setSendError(`At most ${MAX_LENGTH} characters`);
      return;
    }
    if (!socket.connected) {
      setSendError('Not connected to the chat server');
      return;
    }
    setSendError('');
    setSending(true);

    // The server saves the message and broadcasts "newMessage" to the room
    // (also to us), so we do NOT add it to the list here.
    socket.emit('sendMessage', { groupId, text: trimmed }, (res) => {
      setSending(false);
      if (res && res.error) {
        notify(res.error, 'error');
      } else {
        setText('');
      }
    });
  }

  async function handleSearch(e) {
    e.preventDefault();
    const q = searchText.trim();
    if (q === '') return handleClearSearch();
    if (q.length > 50) {
      notify('Search text must be at most 50 characters', 'error');
      return;
    }
    try {
      const data = await getGroupMessages(groupId, q);
      setMessages(data.messages);
      setSearchActive(true);
    } catch {
      // global ajaxError toast
    }
  }

  function handleClearSearch() {
    setSearchText('');
    setSearchActive(false);
    loadHistory();
  }

  function startEdit(message) {
    setEditingId(message._id);
    setEditText(message.text);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const trimmed = editText.trim();
    if (trimmed === '' || trimmed.length > MAX_LENGTH) {
      notify(`A message must be 1-${MAX_LENGTH} characters`, 'error');
      return;
    }
    try {
      // The server broadcasts "messageUpdated" - that updates our list too
      await updateMessage(editingId, trimmed);
      setEditingId(null);
    } catch {
      // e.g. 403 - global ajaxError toast
    }
  }

  async function handleDelete(message) {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(message._id); // server broadcasts "messageDeleted"
    } catch {
      // global ajaxError toast
    }
  }

  return (
    <div className="chat">
      <form className="search-bar" onSubmit={handleSearch} noValidate>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search messages in this chat"
          maxLength={50}
        />
        <button className="btn" type="submit">Search</button>
        <button className="btn btn-secondary" type="button" onClick={handleClearSearch}>Clear</button>
      </form>
      {searchActive && (
        <p className="result-info">
          Search results for "{searchText.trim()}" - {messages.length} message{messages.length === 1 ? '' : 's'}.
          Clear the search to see live messages.
        </p>
      )}

      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && <p className="muted center-text">No messages yet.</p>}
        {messages.map((m) => {
          const mine = m.sender && m.sender._id === user._id;
          return (
            <div key={m._id} className={'chat-message' + (mine ? ' mine' : '')}>
              <div className="chat-meta">
                <strong>{m.sender ? m.sender.fullName : 'unknown'}</strong>
                <span className="muted"> @{m.sender ? m.sender.username : '?'} · {formatTime(m.createdAt)}</span>
                {m.edited && <span className="muted"> (edited)</span>}
              </div>

              {editingId === m._id ? (
                <form className="chat-edit" onSubmit={saveEdit} noValidate>
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} maxLength={MAX_LENGTH} />
                  <button className="btn" type="submit">Save</button>
                  <button className="btn btn-secondary" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                </form>
              ) : (
                <p className="chat-text">{m.text}</p>
              )}

              {/* Only my own messages get Edit/Delete (the server checks again: 403) */}
              {mine && editingId !== m._id && (
                <div className="chat-actions">
                  <button className="link-button" onClick={() => startEdit(m)}>Edit</button>
                  <button className="link-button danger-link" onClick={() => handleDelete(m)}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form className="chat-send" onSubmit={handleSend} noValidate>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          maxLength={MAX_LENGTH}
        />
        <button className="btn" type="submit" disabled={sending}>Send</button>
      </form>
      {sendError && <p className="field-error">{sendError}</p>}
    </div>
  );
}

export default ChatBox;
