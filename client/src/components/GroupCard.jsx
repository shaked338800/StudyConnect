// One group in the Groups list.
function GroupCard({ group, currentUserId, onOpen }) {
  const memberCount = group.members.length;
  const isMember = group.members.includes(currentUserId); // members are ids here
  const isFull = memberCount >= group.maxMembers;

  return (
    <div className="group-card" onClick={() => onOpen(group._id)}>
      <h3>{group.name}</h3>
      <p className="muted">{group.course}{group.institution ? ' · ' + group.institution : ''}</p>
      {group.description && <p className="group-description">{group.description}</p>}
      <div className="badges">
        <span className="badge">{group.studyFormat}</span>
        <span className="badge">{memberCount}/{group.maxMembers} members</span>
        {isMember && <span className="badge badge-good">Member</span>}
        {!isMember && isFull && <span className="badge badge-bad">Full</span>}
      </div>
      <p className="muted small">Owner: {group.owner ? group.owner.fullName : 'unknown'}</p>
    </div>
  );
}

export default GroupCard;
