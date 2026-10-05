// [REQ-17 MVC - Controller] [REQ-19 StudyGroup: Create / Update / Delete / List / Search]
const {
  createGroup,
  findGroupById,
  findGroupDetails,
  listGroups,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  isGroupMember,
  searchGroups
} = require('../models/StudyGroup');
const { deletePostsByGroup } = require('../models/Post');
const { isString, validateGroup, parseGroupSearch } = require('../utils/validators');
const escapeRegex = require('../utils/escapeRegex');

// [REQ-21] Is this user the owner of the group?
// group.owner is an ObjectId, req.userId is a string - so compare as strings.
function isOwner(group, userId) {
  return group.owner.toString() === userId;
}

// Only these fields come from the request body. owner and members can
// never be set by the client.
function pickGroupFields(body) {
  return {
    name: body.name.trim(),
    description: (body.description || '').trim(),
    course: body.course.trim(),
    institution: (body.institution || '').trim(),
    studyFormat: body.studyFormat,
    maxMembers: body.maxMembers
  };
}

// GET /api/groups?q=text - list all groups, or a simple search
async function getGroups(req, res) {
  const q = req.query.q;

  if (q !== undefined && (!isString(q) || q.length > 50)) {
    return res.status(400).json({ error: 'Search text must be at most 50 characters' });
  }

  const search = q && q.trim() ? new RegExp(escapeRegex(q.trim()), 'i') : null;
  const groups = await listGroups(search);
  res.json({ groups });
}

// [REQ-20] Advanced search #2
// GET /api/groups/search?course=&institution=&studyFormat=&openSpots=true
// All parameters are optional and are combined with AND.
async function advancedSearchGroups(req, res) {
  const { error, filters } = parseGroupSearch(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  const groups = await searchGroups({
    courseRegex: filters.course ? new RegExp(escapeRegex(filters.course), 'i') : null,
    institutionRegex: filters.institution ? new RegExp(escapeRegex(filters.institution), 'i') : null,
    studyFormat: filters.studyFormat,
    onlyOpenSpots: filters.onlyOpenSpots
  });
  res.json({ groups });
}

// GET /api/groups/:id
async function getGroup(req, res) {
  const group = await findGroupDetails(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  res.json({ group });
}

// POST /api/groups - the logged-in user becomes owner + first member
async function createNewGroup(req, res) {
  const body = req.body || {};

  const error = validateGroup(body);
  if (error) {
    return res.status(400).json({ error });
  }

  // Duplicate name -> MongoDB 11000 -> errorHandler sends 409
  const group = await createGroup(pickGroupFields(body), req.userId);
  res.status(201).json({ group: await findGroupDetails(group._id) });
}

// PUT /api/groups/:id - owner only
async function updateExistingGroup(req, res) {
  const body = req.body || {};

  const error = validateGroup(body);
  if (error) {
    return res.status(400).json({ error });
  }

  const group = await findGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  if (!isOwner(group, req.userId)) {
    return res.status(403).json({ error: 'Only the group owner can edit this group' });
  }
  if (body.maxMembers < group.members.length) {
    return res.status(400).json({
      error: `Max members cannot be less than the current number of members (${group.members.length})`
    });
  }

  await updateGroup(group._id, pickGroupFields(body));
  res.json({ group: await findGroupDetails(group._id) });
}

// DELETE /api/groups/:id - owner only
async function deleteExistingGroup(req, res) {
  const group = await findGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  if (!isOwner(group, req.userId)) {
    return res.status(403).json({ error: 'Only the group owner can delete this group' });
  }

  // Deleting a group also deletes its posts (later: its chat messages too)
  await deletePostsByGroup(group._id);
  await deleteGroup(group._id);
  res.json({ message: 'Group deleted' });
}

// POST /api/groups/:id/join
async function joinGroup(req, res) {
  const group = await findGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  if (isGroupMember(group, req.userId)) {
    return res.status(409).json({ error: 'You are already a member of this group' });
  }
  if (group.members.length >= group.maxMembers) {
    return res.status(409).json({ error: 'This group is full' });
  }

  // addMember checks "not a member" and "not full" again inside the
  // database update itself, in case someone else joined a moment ago.
  const updated = await addMember(group._id, req.userId);
  if (!updated) {
    return res.status(409).json({ error: 'This group is full' });
  }
  res.json({ group: await findGroupDetails(group._id) });
}

// POST /api/groups/:id/leave
async function leaveGroup(req, res) {
  const group = await findGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  // A group must always have an owner, so the owner cannot just leave.
  if (isOwner(group, req.userId)) {
    return res.status(400).json({ error: 'The owner cannot leave the group. Delete the group instead.' });
  }
  if (!isGroupMember(group, req.userId)) {
    return res.status(409).json({ error: 'You are not a member of this group' });
  }

  await removeMember(group._id, req.userId);
  res.json({ group: await findGroupDetails(group._id) });
}

module.exports = {
  getGroups,
  advancedSearchGroups,
  getGroup,
  createNewGroup,
  updateExistingGroup,
  deleteExistingGroup,
  joinGroup,
  leaveGroup
};
