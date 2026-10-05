// [REQ-17 MVC - Controller] [AI feature] AI quiz for a post.
const { findPostById } = require('../models/Post');
const { generateQuiz, AiError } = require('../services/aiService');

const MIN_CONTENT_LENGTH = 80;     // a quiz needs some real material
const COOLDOWN_MS = 10 * 1000;     // one quiz per user every 10 seconds
const lastRequestByUser = new Map(); // userId -> time of the last AI request (in memory)

// POST /api/posts/:id/ai-quiz -> { quiz: { questions: [...] } }
// The quiz is returned to the browser only - it is not saved in MongoDB.
async function generatePostQuiz(req, res) {
  const post = await findPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.content.trim().length < MIN_CONTENT_LENGTH) {
    return res.status(400).json({
      error: `This post is too short for a quiz (at least ${MIN_CONTENT_LENGTH} characters of content are needed).`
    });
  }

  // Simple protection against many paid/limited AI calls in a row
  const now = Date.now();
  const last = lastRequestByUser.get(req.userId) || 0;
  if (now - last < COOLDOWN_MS) {
    const seconds = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    return res.status(429).json({ error: `Please wait ${seconds} seconds before generating another quiz.` });
  }
  lastRequestByUser.set(req.userId, now);

  try {
    // Only the study material is passed on - no author, no user data
    const quiz = await generateQuiz({ title: post.title, course: post.course, content: post.content });
    res.json({ quiz });
  } catch (err) {
    if (err instanceof AiError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err; // unexpected -> central errorHandler (500)
  }
}

module.exports = { generatePostQuiz };
