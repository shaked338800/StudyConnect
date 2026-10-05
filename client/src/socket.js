// [REQ-28 Socket.io] The single Socket.io connection of the app.
// autoConnect: false - App.jsx connects after login and disconnects on logout.
// The browser sends the login cookie with the connection automatically
// (same origin), so the server knows who we are from the session.
import { io } from 'socket.io-client';

const socket = io({ autoConnect: false });

export default socket;
