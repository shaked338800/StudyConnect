// [REQ-17 MVC - Controller] [REQ-19 Post: Create / Update / Delete / List / Search]
const {
  createPost,
  findPostById,
  findPostDetails,
  listPosts,
  updatePost,
  deletePost
} = require('../models/Post');
const { findGroupById, isGroupMember } = require('../models/StudyGroup');
const { isString, isValidObjectId, validatePost } = require('../utils/validators');
const escapeRegex = require('../utils/escapeRegex');

// [REQ-21] Is this user the author of the post?
// post.author is an ObjectId, req.userId is a string - so compare as strings.
function isAuthor(post, userId) {
  return post.author.toString() === userId;
}

// Only these fields come from the request body. The author is never taken
// from the body, and the group is handled separately (only on create).
function pickPostFields(body) {
  return {
    title: body.title.trim(),
    content: body.content.trim(),
    course: body.course.trim(),
    videoUrl: (body.videoUrl || '').trim()
  };
}

// GET /api/posts?q=text&group=<groupId>
// List posts, a simple keyword search, and/or only the posts of one group
async function getPosts(req, res) {
  const { q, group } = req.query;

  if (q !== undefined && (!isString(q) || q.length > 50)) {
    return res.status(400).json({ error: 'Search text must be at most 50 characters' });
  }
  if (group !== undefined && !isValidObjectId(group)) {
    return res.status(400).json({ error: 'Invalid group id' });
  }

  const searchRegex = q && q.trim() ? new RegExp(escapeRegex(q.trim()), 'i') : null;
  const posts = await listPosts({ searchRegex, groupId: group });
  res.json({ posts });
}

// GET /api/posts/:id
async function getPost(req, res) {
  const post = await findPostDetails(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ post });
}

// POST /api/posts - the logged-in user is always the author
async function createNewPost(req, res) {
  const body = req.body || {};

  const error = validatePost(body);
  if (error) {
    return res.status(400).json({ error });
  }

  const fields = pickPostFields(body);

  // Optional group: it must exist, and only its members may post in it
  if (body.group !== undefined && body.group !== null && body.group !== '') {
    if (!isValidObjectId(body.group)) {
      return res.status(400).json({ error: 'Invalid group id' });
    }
    const group = await findGroupById(body.group);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (!isGroupMember(group, req.userId)) {
      return res.status(403).json({ error: 'You must be a member of this group to post in it' });
    }
    fields.group = group._id;
  }

  const post = await createPost(fields, req.userId);
  res.status(201).json({ post: await findPostDetails(post._id) });
}

// PUT /api/posts/:id - author only. Author and group cannot be changed.
async function updateExistingPost(req, res) {
  const body = req.body || {};

  const error = validatePost(body);
  if (error) {
    return res.status(400).json({ error });
  }

  const post = await findPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (!isAuthor(post, req.userId)) {
    return res.status(403).json({ error: 'Only the author can edit this post' });
  }

  await updatePost(post._id, pickPostFields(body));
  res.json({ post: await findPostDetails(post._id) });
}

// DELETE /api/posts/:id - author only
async function deleteExistingPost(req, res) {
  const post = await findPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (!isAuthor(post, req.userId)) {
    return res.status(403).json({ error: 'Only the author can delete this post' });
  }

  await deletePost(post._id);
  res.json({ message: 'Post deleted' });
}

module.exports = { getPosts, getPost, createNewPost, updateExistingPost, deleteExistingPost };
