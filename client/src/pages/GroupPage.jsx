import { useEffect, useState } from 'react';
import GroupForm from '../components/GroupForm';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import ChatBox from '../components/ChatBox';
import { getGroup, updateGroup, deleteGroup, joinGroup, leaveGroup } from '../api/groupsApi';
import { getPosts, createPost } from '../api/postsApi';
import { notify } from '../jquery/notify';

// [REQ-19 StudyGroup - Update + Delete] + Join / Leave
// The Edit/Delete buttons are only SHOWN to the owner, but the server checks
// ownership again (403) - hiding a button is not security.
function GroupPage({ groupId, user, onNavigate }) {
  const [group, setGroup] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);
  const [writingPost, setWritingPost] = useState(false);
  const [showChat, setShowChat] = useState(false);

  async function loadPosts() {
    try {
      const data = await getPosts({ group: groupId });
      setPosts(data.posts);
    } catch {
      // toast shown by global ajaxError
    }
  }

  useEffect(() => {
    async function loadGroup() {
      try {
        const data = await getGroup(groupId);
        setGroup(data.group);
        loadPosts();
      } catch {
        setNotFound(true); // toast shown by global ajaxError
      }
    }
    loadGroup();
  }, [groupId]);

  if (notFound) {
    return (
      <section className="card">
        <button className="link-button" onClick={() => onNavigate('groups')}>&larr; Back to Groups</button>
        <p className="muted">This group could not be loaded.</p>
      </section>
    );
  }

  if (!group) {
    return <section className="card"><p className="muted">Loading group...</p></section>;
  }

  // Here owner and members are populated objects ({ _id, username, fullName })
  const isOwner = group.owner._id === user._id;
  const isMember = group.members.some((m) => m._id === user._id);
  const isFull = group.members.length >= group.maxMembers;

  // Runs a join/leave request and shows the updated group
  async function runAction(request, successMessage) {
    setBusy(true);
    try {
      const data = await request(group._id);
      setGroup(data.group);
      notify(successMessage, 'success');
    } catch {
      // e.g. "This group is full" - global ajaxError toast
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(data) {
    const result = await updateGroup(group._id, data);
    setGroup(result.group);
    setEditing(false);
    notify('Group updated', 'success');
  }

  // New post inside this group (the server checks that I am a member)
  async function handleCreatePost(data) {
    await createPost({ ...data, group: group._id });
    setWritingPost(false);
    notify('Post published in ' + group.name, 'success');
    loadPosts();
  }

  async function handleDelete() {
    if (!window.confirm('Delete the group "' + group.name + '" and all its posts? This cannot be undone.')) return;
    try {
      await deleteGroup(group._id);
      notify('Group deleted', 'info');
      onNavigate('groups');
    } catch {
      // global ajaxError toast
    }
  }

  return (
    <>
      <section className="card">
        <button className="link-button" onClick={() => onNavigate('groups')}>&larr; Back to Groups</button>

        {editing ? (
          <>
            <h2>Edit group</h2>
            <GroupForm group={group} submitLabel="Save changes" onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
          </>
        ) : (
          <>
            <h2>{group.name}</h2>
            <div className="badges">
              <span className="badge">{group.studyFormat}</span>
              <span className="badge">{group.members.length}/{group.maxMembers} members</span>
              {isOwner && <span className="badge badge-good">You are the owner</span>}
              {!isOwner && isMember && <span className="badge badge-good">Member</span>}
            </div>
            <p><strong>Course:</strong> {group.course}</p>
            <p><strong>Institution:</strong> {group.institution || '-'}</p>
            <p><strong>Description:</strong> {group.description || '-'}</p>
            <p className="muted">
              Owner: {group.owner.fullName} (@{group.owner.username}) · Created {new Date(group.createdAt).toLocaleDateString()}
            </p>

            <div className="button-row">
              {!isMember && (
                <button className="btn" disabled={busy || isFull} onClick={() => runAction(joinGroup, 'You joined the group')}>
                  {isFull ? 'Group is full' : 'Join group'}
                </button>
              )}
              {isMember && !isOwner && (
                <button className="btn btn-secondary" disabled={busy} onClick={() => runAction(leaveGroup, 'You left the group')}>
                  Leave group
                </button>
              )}
              {isOwner && (
                <>
                  <button className="btn" onClick={() => setEditing(true)}>Edit group</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Delete group</button>
                </>
              )}
            </div>
          </>
        )}
      </section>

      {/* [REQ-28] Group chat - members only (the server checks membership too) */}
      <section className="card">
        <div className="card-title-row">
          <h3>Group chat</h3>
          {isMember && (
            <button className="btn" onClick={() => setShowChat(!showChat)}>
              {showChat ? 'Close chat' : 'Open chat'}
            </button>
          )}
        </div>
        {!isMember && <p className="muted small">Join the group to use its chat.</p>}
        {isMember && showChat && (
          <ChatBox groupId={group._id} user={user} onChatClosed={() => setShowChat(false)} />
        )}
      </section>

      <section className="card">
        <div className="card-title-row">
          <h3>Posts in this group ({posts.length})</h3>
          {isMember && !writingPost && (
            <button className="btn" onClick={() => setWritingPost(true)}>+ New post</button>
          )}
        </div>
        {!isMember && <p className="muted small">Join the group to post here.</p>}

        {writingPost && (
          <div className="inner-form">
            <PostForm submitLabel="Publish" onSubmit={handleCreatePost} onCancel={() => setWritingPost(false)} />
          </div>
        )}

        {posts.length === 0 && <p className="muted">No posts in this group yet.</p>}
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} showGroup={false} onOpen={(postId) => onNavigate('post', { postId })} />
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Members ({group.members.length})</h3>
        <ul className="user-list">
          {group.members.map((m) => (
            <li key={m._id} className="user-item" onClick={() => onNavigate('user', { userId: m._id })}>
              <div className="avatar">{m.fullName.charAt(0).toUpperCase()}</div>
              <div>
                <strong>{m.fullName}</strong> <span className="muted">@{m.username}</span>
                {m._id === group.owner._id && <span className="badge badge-good">Owner</span>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default GroupPage;
