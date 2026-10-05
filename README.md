# StudyConnect

A social network for students: study groups, posts, real-time group chat, statistics and an AI study quiz.

**Stack:** React + jQuery (client) · Node.js + Express (server) · MongoDB (Mongoose) · Socket.io · D3.js

## Project structure (MVC)

| MVC part   | Folder |
|------------|--------|
| Model      | `server/models/` (Mongoose schemas + data functions) |
| Controller | `server/controllers/` (+ `server/routes/` mapping URLs to controllers) |
| View       | `client/` (React app; all server calls use jQuery `$.ajax`) |

Every place in the code that satisfies an assignment requirement is tagged with `[REQ-<number> ...]`.
To list them all: `grep -rn "REQ-" server client/src`

## Requirements

- Node.js **20.19 or newer**
- MongoDB Community Server running locally on port 27017

> **MongoDB version note (Windows 10):** on our Windows 10 development machine, **MongoDB 8.0.x**
> (tested: 8.0.32) is the compatible version. MongoDB 8.2/8.3 builds do not start on Windows 10
> (`mongod.exe` fails with `0xC0000139`, a missing Windows API entry point), and the Windows service
> times out without writing a log. On Windows 10, install 8.0.x:
> https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.32-signed.msi

## First-time setup

```bash
# 1. Server
cd server
npm install
cp .env.example .env      # Windows (cmd): copy .env.example .env

# 2. Client
cd ../client
npm install
```

## Running in development (two terminals)

```bash
# Terminal 1
cd server
npm run dev               # Express on http://localhost:3000 (restarts on file changes)

# Terminal 2
cd client
npm run dev               # React on http://localhost:5173 (open this one)
```

## Running for the demo / lab (one terminal)

```bash
cd client
npm run build             # creates client/dist
cd ../server
npm start                 # serves API + built React app on http://localhost:3000
```

## Demo data (seed)

```bash
cd server
npm run seed               # empty database: inserts the demo data
                           # database with data: shows the counts and changes NOTHING
npm run seed -- --confirm  # REPLACES all users, groups, posts and messages with the demo data
```

The demo data (`server/seed/demoData.js`): 6 users, 6 study groups, 44 posts spread over
about 11 months, and 32 chat messages. Every demo user has the password **`Demo1234`**
(stored as a bcrypt hash): `alice`, `bob`, `maya`, `daniel`, `noa`, `amit`.
The seed never runs on a database whose name contains `test`.

## Secrets

`server/.env` holds configuration and secrets and is **never committed** (see `.gitignore`).
`server/.env.example` lists the required variables without real values.
