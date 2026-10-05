// A short preview of a post in a list. Clicking it opens the post page.
const PREVIEW_LENGTH = 200;

function PostCard({ post, onOpen, showGroup = true }) {
  const preview = post.content.length > PREVIEW_LENGTH
    ? post.content.slice(0, PREVIEW_LENGTH) + '...'
    : post.content;

  return (
    <div className="post-card" onClick={() => onOpen(post._id)}>
      <h3>{post.title}</h3>
      <p className="muted small">
        {post.author ? post.author.fullName : 'unknown'} · {new Date(post.createdAt).toLocaleDateString()}
        {showGroup && post.group && <> · in <strong>{post.group.name}</strong></>}
      </p>
      <p className="post-preview">{preview}</p>
      <div className="badges">
        <span className="badge">{post.course}</span>
        {post.videoUrl && <span className="badge">video</span>}
      </div>
    </div>
  );
}

export default PostCard;
