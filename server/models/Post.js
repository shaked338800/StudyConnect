// [REQ-17 MVC - Model] [REQ-18] Post model.
// Only files in models/ use Mongoose. Controllers call the functions exported here.
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    // Relationship User 1-N Post: every post has exactly one author
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Relationship StudyGroup 1-N Post: optional - null means a standalone post
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', default: null },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 100 },
    content: { type: String, required: [true, 'Content is required'], trim: true, minlength: 1, maxlength: 5000 },
    course: { type: String, required: [true, 'Course is required'], trim: true, minlength: 2, maxlength: 60 },
    // Shown with a video player in Phase 7
    videoUrl: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { timestamps: true }
);

postSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Post = mongoose.model('Post', postSchema);

// Fill author / group ids with a few readable fields (never the author's email)
function populatePost(query) {
  return query.populate('author', 'username fullName').populate('group', 'name');
}

// ---------- Data functions used by the controllers ----------

function createPost(data, authorId) {
  return Post.create({ ...data, author: authorId });
}

// Plain post (author/group are just ids) - used for permission checks
function findPostById(id) {
  return Post.findById(id);
}

// Post with author and group names - used for display
function findPostDetails(id) {
  return populatePost(Post.findById(id));
}

// List posts, newest first.
// - searchRegex: optional, matched against title / content / course
// - groupId:     optional, only posts of this group
function listPosts({ searchRegex, groupId } = {}) {
  const filter = {};
  if (searchRegex) {
    filter.$or = [{ title: searchRegex }, { content: searchRegex }, { course: searchRegex }];
  }
  if (groupId) {
    filter.group = groupId;
  }
  return populatePost(Post.find(filter).sort({ createdAt: -1 }).limit(100));
}

// [REQ-20] Advanced search #1. Every filter that is given is ADDED to the
// MongoDB filter object, so a post must match ALL of them (logical AND).
//   keywordRegex - title OR content contains it
//   courseRegex  - course contains it
//   authorId     - exact author
//   dateFrom / dateTo - createdAt between them (each one optional)
function searchPosts({ keywordRegex, courseRegex, authorId, dateFrom, dateTo }) {
  const filter = {};
  if (keywordRegex) {
    filter.$or = [{ title: keywordRegex }, { content: keywordRegex }];
  }
  if (courseRegex) {
    filter.course = courseRegex;
  }
  if (authorId) {
    filter.author = authorId;
  }
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = dateFrom; // greater than or equal
    if (dateTo) filter.createdAt.$lte = dateTo;     // less than or equal
  }
  return populatePost(Post.find(filter).sort({ createdAt: -1 }).limit(100));
}

function updatePost(id, changes) {
  return Post.findByIdAndUpdate(id, { $set: changes }, { returnDocument: 'after', runValidators: true });
}

function deletePost(id) {
  return Post.findByIdAndDelete(id);
}

// Used when a study group is deleted
function deletePostsByGroup(groupId) {
  return Post.deleteMany({ group: groupId });
}

// Used when a user deletes their account
function deletePostsByAuthor(authorId) {
  return Post.deleteMany({ author: authorId });
}

// ---------- [REQ-29] Statistics (aggregation pipelines) ----------

const TOP_COURSES = 10;

// Number of posts per course, biggest first.
// "Calculus 1" and "calculus 1" are counted as the same course: we group by
// the lower-case name and show the first spelling we meet.
// If there are more than 10 courses, the rest are summed into "Other".
async function countPostsByCourse() {
  const rows = await Post.aggregate([
    {
      $group: {
        _id: { $toLower: '$course' },  // one group per course name (any case)
        course: { $first: '$course' }, // a display name for it
        count: { $sum: 1 }             // add 1 for every post in the group
      }
    },
    { $sort: { count: -1, _id: 1 } }   // most posts first, then A-Z
  ]);

  const result = rows.slice(0, TOP_COURSES).map((r) => ({ course: r.course, count: r.count }));
  const rest = rows.slice(TOP_COURSES);
  if (rest.length > 0) {
    result.push({ course: 'Other', count: rest.reduce((sum, r) => sum + r.count, 0) });
  }
  return result;
}

// Dates are grouped in the server's own time zone (the same one the advanced
// search uses), so a post written at 00:30 on Feb 1 counts for February.
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Number of posts per month, oldest first.
// We group by YEAR + MONTH, so January 2026 and January 2027 stay separate.
// Months with no posts are filled in with 0, so the line chart doesn't
// connect e.g. January straight to April as if nothing happened in between.
async function countPostsByMonth() {
  const rows = await Post.aggregate([
    {
      $group: {
        _id: {
          year: { $year: { date: '$createdAt', timezone: TIME_ZONE } },
          month: { $month: { date: '$createdAt', timezone: TIME_ZONE } }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } } // chronological order
  ]);
  if (rows.length === 0) return [];

  // Walk month by month from the first to the last month that has posts
  const counts = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));
  const first = rows[0]._id;
  const last = rows[rows.length - 1]._id;
  const result = [];
  let year = first.year;
  let month = first.month;
  while (year < last.year || (year === last.year && month <= last.month)) {
    result.push({
      year,
      month,
      label: `${year}-${String(month).padStart(2, '0')}`, // e.g. "2026-03"
      count: counts.get(`${year}-${month}`) || 0
    });
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

module.exports = {
  createPost,
  findPostById,
  findPostDetails,
  listPosts,
  searchPosts,
  updatePost,
  deletePost,
  deletePostsByGroup,
  deletePostsByAuthor,
  countPostsByCourse,
  countPostsByMonth
};
