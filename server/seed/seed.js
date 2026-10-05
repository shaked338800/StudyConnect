// [REQ-23] Demo data seed for the development database.
//
// Usage (from the server folder):
//   npm run seed                 -> if the database already has data: shows the counts and
//                                   changes NOTHING. If it is empty: inserts the demo data.
//   npm run seed -- --confirm    -> REPLACES all StudyConnect users, groups, posts and messages
//                                   with the demo data. (Or set SEED_CONFIRM=YES.)
//
// Safety:
// - Never deletes anything without --confirm / SEED_CONFIRM=YES.
// - Refuses to run on a database whose name contains "test".
// - Uses the same validators and model functions as the app, so passwords are
//   hashed with bcrypt and every schema / membership rule still applies.
const mongoose = require('mongoose');
const { createUser } = require('../models/User');
const { createGroup, addMember, findGroupById, isGroupMember } = require('../models/StudyGroup');
const { createPost } = require('../models/Post');
const { createMessage } = require('../models/Message');
const { validateRegister, validateGroup, validatePost, validateMessageText } = require('../utils/validators');
const { DEMO_PASSWORD, users, groups, posts, messages } = require('./demoData');

const COLLECTIONS = ['users', 'studygroups', 'posts', 'messages'];
const MODEL_NAMES = ['User', 'StudyGroup', 'Post', 'Message'];

// "2026-03-04 11:40" -> Date in local time
function toDate(text) {
  const [day, time] = text.split(' ');
  const [year, month, date] = day.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, date, hours, minutes);
}

// Fail loudly if the demo data breaks one of the app's own validation rules
function mustBeValid(error, what) {
  if (error) throw new Error(`Invalid demo data (${what}): ${error}`);
}

// The models always set createdAt to "now". To spread posts over past months
// (for the D3 charts) we change the dates directly in the collection afterwards.
async function setDates(collectionName, id, date) {
  await mongoose.connection.db
    .collection(collectionName)
    .updateOne({ _id: id }, { $set: { createdAt: date, updatedAt: date } });
}

async function countExisting() {
  const counts = {};
  for (const name of COLLECTIONS) {
    counts[name] = await mongoose.connection.db.collection(name).countDocuments();
  }
  return counts;
}

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyconnect';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const dbName = mongoose.connection.name;
  console.log(`Connected to database "${dbName}"`);

  if (/test/i.test(dbName)) {
    throw new Error(`Refusing to seed "${dbName}": test databases are never seeded.`);
  }

  const confirmed = process.argv.includes('--confirm') || process.env.SEED_CONFIRM === 'YES';
  const existing = await countExisting();
  const hasData = Object.values(existing).some((n) => n > 0);

  if (hasData && !confirmed) {
    console.log('\nThe database already contains data:', existing);
    console.log('Nothing was changed. To REPLACE it with the demo data run:');
    console.log('  npm run seed -- --confirm\n');
    return;
  }

  // Make sure the unique indexes (username, email, group name) exist
  await Promise.all(MODEL_NAMES.map((name) => mongoose.model(name).init()));

  if (hasData) {
    console.log('Deleting existing data:', existing);
    for (const name of MODEL_NAMES) {
      await mongoose.model(name).deleteMany({});
    }
  }

  // 1. Users (createUser hashes the password with bcrypt)
  const userIds = {};
  for (const u of users) {
    const data = { ...u, password: DEMO_PASSWORD };
    mustBeValid(validateRegister(data), `user ${u.username}`);
    const user = await createUser(data);
    userIds[u.username] = user._id.toString();
  }

  // 2. Groups: the owner is the first member, then the other members join
  const groupIds = {};
  for (const g of groups) {
    const { key, owner, members, ...fields } = g;
    mustBeValid(validateGroup(fields), `group ${g.name}`);
    const group = await createGroup(fields, userIds[owner]);
    for (const member of members) {
      const updated = await addMember(group._id, userIds[member]); // respects maxMembers
      if (!updated) throw new Error(`Could not add ${member} to ${g.name} (full?)`);
    }
    groupIds[key] = group._id;
  }

  // 3. Posts: a group post is only created if its author is a member (same rule as the app)
  for (const [author, course, groupKey, date, title, content, videoUrl = ''] of posts) {
    const fields = { title, content, course, videoUrl };
    mustBeValid(validatePost(fields), `post "${title}"`);
    if (groupKey) {
      const group = await findGroupById(groupIds[groupKey]);
      if (!isGroupMember(group, userIds[author])) {
        throw new Error(`${author} is not a member of ${groupKey} - cannot post "${title}"`);
      }
      fields.group = groupIds[groupKey];
    }
    const post = await createPost(fields, userIds[author]);
    await setDates('posts', post._id, toDate(date));
  }

  // 4. Chat messages: only from members of that group
  for (const [groupKey, sender, date, text] of messages) {
    mustBeValid(validateMessageText(text), `message "${text}"`);
    const group = await findGroupById(groupIds[groupKey]);
    if (!isGroupMember(group, userIds[sender])) {
      throw new Error(`${sender} is not a member of ${groupKey} - cannot send "${text}"`);
    }
    const message = await createMessage({ groupId: group._id, senderId: userIds[sender], text: text.trim() });
    await setDates('messages', message._id, toDate(date));
  }

  console.log('\nDemo data created:', await countExisting());
  console.log(`Demo users: ${users.map((u) => u.username).join(', ')}`);
  console.log(`Demo password for every user: ${DEMO_PASSWORD}\n`);
}

seed()
  .catch((err) => {
    console.error('\nSeed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
