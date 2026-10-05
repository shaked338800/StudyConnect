# StudyConnect

StudyConnect is a social network for students. Students create profiles, form study
groups, share study posts (with optional videos), chat with their group in real time,
search posts and groups with advanced filters, view live statistics charts, draw quick
study sketches, and generate an AI multiple-choice quiz from any post.

## Main features

- **Accounts** - register, log in / log out, edit or delete your own profile, browse and search people.
  Your email is visible only to you.
- **Study groups** - create, edit and delete (owner only), browse, search, join and leave.
  A group never exceeds its maximum number of members.
- **Posts** - create, edit and delete your own posts, standalone or inside a group you belong to;
  keyword search; optional `.mp4` / `.webm` video.
- **Advanced searches** - posts by keyword, course, author and date range; groups by course,
  institution, study format and open spots. All filters can be combined.
- **Group chat** - real-time chat per study group (Socket.io), saved in MongoDB:
  send, edit or delete your own messages, chat history and chat search. Members only.
- **Statistics** - two D3.js charts calculated from the database: posts per course and posts per month.
- **Video** - HTML5 `<video>` player with React controls (play/pause, restart, speed).
- **Study Sketch** - HTML5 `<canvas>` drawing pad with color, brush size, Clear and Download PNG.
- **AI Quiz** - generates 3 multiple-choice questions from a post using Google Gemini (called from the server).

## Technologies

| Part | Technology |
|---|---|
| Server | Node.js, Express 5, Socket.io, express-session (login sessions), bcryptjs (password hashing) |
| Database | MongoDB with Mongoose |
| Client | React 19, jQuery 3 (`$.ajax` for every HTTP request), D3.js 7, socket.io-client, HTML5 video/canvas, CSS3 |
| Build tool | Vite (compiles the React client) |
| AI | Google Gemini API, called by the server with Node's built-in `fetch` |

## Prerequisites

- **Node.js 20.19 or newer** (tested with Node 24) - includes npm.
- **MongoDB Community Server**, running locally on port **27017**.
  On Windows 10 use **MongoDB 8.0.x** (tested with 8.0.32) - MongoDB 8.3 does not start on Windows 10.
  When installed "as a Windows service", MongoDB starts automatically. To check / start it (PowerShell):
  ```powershell
  Get-Service MongoDB          # should say: Running
  Start-Service MongoDB        # run in an Administrator PowerShell if it is stopped
  ```
- *(Optional)* a Google Gemini API key for the AI quiz - see [Environment variables](#environment-variables).

**MongoDB must be running before you seed the database or start the server.**

## Installation

```powershell
# from the project folder (the one that contains "server" and "client")
cd server
npm ci
copy .env.example .env        # macOS/Linux: cp .env.example .env
cd ..\client
npm ci
```

Then edit `server/.env` as described below.

## Environment variables

All settings are in **`server/.env`** (created from `server/.env.example`). This file is never
committed to Git.

| Variable | Meaning |
|---|---|
| `PORT` | Port of the server. Default `3000`. |
| `MONGO_URI` | MongoDB connection. Default `mongodb://127.0.0.1:27017/studyconnect`. |
| `SESSION_SECRET` | Secret used to sign the login session cookie. Replace the placeholder with a long random string. You can generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `AI_API_KEY` | Google Gemini API key for the AI quiz. Leave empty to run without AI. |
| `AI_MODEL` | Gemini model name. Default `gemini-3.5-flash-lite`. Change it only if Google retires that model. |

### Gemini setup (optional)

1. Create a free API key at <https://aistudio.google.com/apikey>.
2. Put it **only** in `server/.env`: `AI_API_KEY=your-key-here`
3. Restart the server (the `.env` file is read when the server starts).

The key stays on the server: the browser never receives it.

**Without a key** the application works normally; only the AI quiz shows the message
*"The AI quiz is not available: the server has no AI_API_KEY configured."*
The quiz also needs an internet connection and a post with at least 80 characters of content.

## Demo data (seed)

With MongoDB running:

```powershell
cd server
npm run seed
```

- On an **empty** database this inserts the demo data:
  6 users, 6 study groups, 44 posts (spread over about 11 months) and 32 chat messages.
- If the database **already has data**, `npm run seed` only prints the counts and changes **nothing**.
- To **replace** all StudyConnect data with a fresh copy of the demo data:
  ```powershell
  npm run seed -- --confirm
  ```
  This deletes all existing users, groups, posts and messages first. Log in again afterwards.
- The seed refuses to run on a database whose name contains `test`.

### Demo accounts

All demo users have the password **`Demo1234`**:

| Username | Name | Institution |
|---|---|---|
| `alice` | Alice Cohen | Technion |
| `bob` | Bob Levi | Technion |
| `maya` | Maya Friedman | Tel Aviv University |
| `daniel` | Daniel Mizrahi | Hebrew University |
| `noa` | Noa Shapiro | Tel Aviv University |
| `amit` | Amit Peretz | Ben-Gurion University |

## Running

### Production / submission mode (recommended)

Express serves the API, the real-time chat and the built React app on **one port**:

```powershell
cd client
npm run build                 # creates client/dist - run again after changing client code
cd ..\server
npm start
```

Open **<http://localhost:3000>**.

### Development mode (two terminals)

```powershell
# Terminal 1
cd server
npm run dev                   # Express on port 3000, restarts when a server file is saved

# Terminal 2
cd client
npm run dev                   # Vite on port 5173 (forwards /api and /socket.io to port 3000)
```

Open **<http://localhost:5173>**.

Notes:
- Logins are kept in the server's memory, so restarting the server logs everyone out.
- The app switches pages inside one page, so always start from the home address
  (`http://localhost:3000/`), not from a typed sub-path.

## Two-user chat demo

1. Start the app (production mode) and seed the demo data.
2. Open a **normal browser window** at <http://localhost:3000> and log in as **`alice`**.
3. Open a **private / incognito window** (it has separate cookies) at the same address and log in as **`bob`**.
4. In both windows: **Groups -> Algorithms Night Owls -> Open chat**. The saved chat history appears.
5. Send a message in one window - it appears in the other immediately, without refreshing.
   Edit or delete your own message and the change appears in the other window too.

## Where each requirement is implemented

| Requirement | Where |
|---|---|
| Node.js + Express server | `server/server.js`, `server/app.js` |
| MongoDB | `server/config/db.js`, `server/models/` |
| MVC | Model: `server/models/` (the only code that uses Mongoose) - Controller: `server/controllers/` + `server/routes/` - View: the React client in `client/src/` |
| Models (4) | `User.js`, `StudyGroup.js`, `Post.js`, `Message.js` in `server/models/` |
| Create / Update / Delete / List / Search for every model | User: Register, My Profile, People pages - StudyGroup: Groups and Group pages - Post: Posts and Post pages - Message: group chat (`client/src/components/ChatBox.jsx`) |
| Advanced searches (2 x 3+ parameters) | `client/src/components/PostSearchForm.jsx`, `GroupSearchForm.jsx`; `server/utils/validators.js` (`parsePostSearch`, `parseGroupSearch`); `searchPosts` / `searchGroups` in the models |
| Login, permissions, private data | `server/controllers/authController.js`, `server/config/session.js`, `server/middleware/requireAuth.js`; ownership checks (403) in the controllers |
| Validation (client + server) | `client/src/utils/validation.js`, `server/utils/validators.js`, `server/middleware/errorHandler.js` |
| jQuery / AJAX | `client/src/api/*.js` (all HTTP requests use `$.ajax`), `client/src/jquery/` (global AJAX handlers, notifications), animated chat scrolling in `ChatBox.jsx` |
| React | the whole client: `client/src/` |
| Video | `client/src/components/VideoPlayer.jsx`; sample videos in `client/public/videos/` |
| Canvas | `client/src/components/SketchCanvas.jsx` (Sketch page) |
| CSS3 (text-shadow, transition, multiple-columns, @font-face, border-radius) | `client/src/styles/main.css`, `client/src/styles/fonts.css` |
| Socket.io chat | `server/sockets/chatSocket.js`, `client/src/socket.js`, `client/src/components/ChatBox.jsx` |
| D3.js statistics (2 charts) | `client/src/components/charts/`; data from `countPostsByCourse` / `countPostsByMonth` in `server/models/Post.js` |
| AI (Gemini quiz) | `server/services/aiService.js`, `server/controllers/aiController.js`, `client/src/components/AiQuiz.jsx` |
| Demo data | `server/seed/` |

Code that satisfies an assignment requirement is also tagged with comments like `[REQ-25 ...]`.
To list them, search the project for `REQ-` in your editor, or run (from the project folder):

```bash
grep -rn "REQ-" server client/src --exclude-dir=node_modules
```

## Secrets

`server/.env` holds the session secret and the Gemini key and is **never committed** (see `.gitignore`).
`server/.env.example` lists the variables without real values.
