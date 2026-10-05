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
  return Post.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true });
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

module.exports = {
  createPost,
  findPostById,
  findPostDetails,
  listPosts,
  searchPosts,
  updatePost,
  deletePost,
  deletePostsByGroup,
  deletePostsByAuthor
};
