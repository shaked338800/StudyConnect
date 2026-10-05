import { useEffect, useState } from 'react';
import PostForm from '../components/PostForm';
import VideoPlayer from '../components/VideoPlayer';
import { getPost, updatePost, deletePost } from '../api/postsApi';
import { notify } from '../jquery/notify';

// [REQ-19 Post - Update + Delete] Full post page.
// Edit/Delete are only SHOWN to the author; the server checks again (403).
function PostPage({ postId, user, onNavigate }) {
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getPost(postId);
        setPost(data.post);
      } catch {
        setNotFound(true); // toast shown by global ajaxError
      }
    }
    loadPost();
  }, [postId]);

  // Back to the group's page for group posts, otherwise to the posts list
  function goBack() {
    if (post && post.group) {
      onNavigate('group', { groupId: post.group._id });
    } else {
      onNavigate('posts');
    }
  }

  if (notFound) {
    return (
      <section className="card">
        <button className="link-button" onClick={() => onNavigate('posts')}>&larr; Back to Posts</button>
        <p className="muted">This post could not be loaded.</p>
      </section>
    );
  }

  if (!post) {
    return <section className="card"><p className="muted">Loading post...</p></section>;
  }

  const isAuthor = post.author && post.author._id === user._id;

  async function handleUpdate(data) {
    const result = await updatePost(post._id, data);
    setPost(result.post);
    setEditing(false);
    notify('Post updated', 'success');
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deletePost(post._id);
      notify('Post deleted', 'info');
      goBack();
    } catch {
      // global ajaxError toast
    }
  }

  return (
    <section className="card">
      <button className="link-button" onClick={goBack}>
        &larr; Back to {post.group ? post.group.name : 'Posts'}
      </button>

      {editing ? (
        <>
          <h2>Edit post</h2>
          <PostForm post={post} submitLabel="Save changes" onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </>
      ) : (
        <article>
          <h2>{post.title}</h2>
          <p className="muted">
            By{' '}
            <button className="link-button" onClick={() => onNavigate('user', { userId: post.author._id })}>
              {post.author.fullName}
            </button>
            {' '}· {new Date(post.createdAt).toLocaleString()}
            {post.updatedAt !== post.createdAt && ' (edited)'}
            {post.group && (
              <>
                {' '}· in{' '}
                <button className="link-button" onClick={() => onNavigate('group', { groupId: post.group._id })}>
                  {post.group.name}
                </button>
              </>
            )}
          </p>
          <div className="badges"><span className="badge">{post.course}</span></div>

          {/* white-space: pre-wrap keeps the line breaks the author typed */}
          <p className="post-content">{post.content}</p>

          {/* [REQ-26] HTML5 video. key: a changed URL creates a fresh player */}
          {post.videoUrl && (
            <div className="post-video">
              <h3>Video</h3>
              <VideoPlayer key={post.videoUrl} src={post.videoUrl} />
            </div>
          )}

          {isAuthor && (
            <div className="button-row">
              <button className="btn" onClick={() => setEditing(true)}>Edit post</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete post</button>
            </div>
          )}
        </article>
      )}
    </section>
  );
}

export default PostPage;
