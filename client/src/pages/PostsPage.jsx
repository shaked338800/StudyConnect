import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import { getPosts, createPost } from '../api/postsApi';
import { getGroups } from '../api/groupsApi';
import { notify } from '../jquery/notify';

// [REQ-19 Post - Create + List + Search]
function PostsPage({ user, onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchError, setSearchError] = useState('');
  const [creating, setCreating] = useState(false);
  const [myGroupOptions, setMyGroupOptions] = useState([]);

  async function loadPosts(q) {
    try {
      const data = await getPosts({ q });
      setPosts(data.posts);
      setLoaded(true);
    } catch {
      // toast shown by the global ajaxError handler
    }
  }

  useEffect(() => {
    loadPosts('');
  }, []);

  // When the create form opens, load the groups I am a member of
  // (only members may post in a group)
  async function openCreateForm() {
    setCreating(true);
    try {
      const data = await getGroups('');
      const mine = data.groups.filter((g) => g.members.includes(user._id));
      setMyGroupOptions(mine.map((g) => ({ value: g._id, label: g.name })));
    } catch {
      setMyGroupOptions([]);
    }
  }

  async function handleCreate(data) {
    const result = await createPost(data);
    notify('Post published', 'success');
    onNavigate('post', { postId: result.post._id });
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchText.trim().length > 50) {
      setSearchError('Search text must be at most 50 characters');
      return;
    }
    setSearchError('');
    loadPosts(searchText.trim());
  }

  function handleClear() {
    setSearchText('');
    setSearchError('');
    loadPosts('');
  }

  return (
    <>
      <section className="card">
        <div className="card-title-row">
          <h2>Posts</h2>
          {!creating && <button className="btn" onClick={openCreateForm}>+ New post</button>}
        </div>

        {creating && (
          <div className="inner-form">
            <h3>Write a post</h3>
            <PostForm groupOptions={myGroupOptions} submitLabel="Publish" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
          </div>
        )}

        <form className="search-bar" onSubmit={handleSearch} noValidate>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search posts by keyword (title, content or course)"
            maxLength={50}
          />
          <button className="btn" type="submit">Search</button>
          <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
        </form>
        {searchError && <p className="field-error">{searchError}</p>}
      </section>

      {loaded && posts.length === 0 && (
        <section className="card"><p className="muted">No posts found.</p></section>
      )}

      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onOpen={(postId) => onNavigate('post', { postId })} />
        ))}
      </div>
    </>
  );
}

export default PostsPage;
