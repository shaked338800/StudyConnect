// [REQ-17 MVC - Model] [REQ-18] StudyGroup model.
// Only files in models/ use Mongoose. Controllers call the functions exported here.
const mongoose = require('mongoose');

const STUDY_FORMATS = ['online', 'in-person', 'hybrid'];

const studyGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Group name is required'], trim: true, minlength: 3, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    course: { type: String, required: [true, 'Course is required'], trim: true, minlength: 2, maxlength: 60 },
    institution: { type: String, trim: true, maxlength: 80, default: '' },
    studyFormat: {
      type: String,
      required: true,
      enum: { values: STUDY_FORMATS, message: 'Study format must be online, in-person or hybrid' }
    },
    maxMembers: { type: Number, required: true, min: 2, max: 100 },
    // References to User documents (relationship User N-N StudyGroup)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

// Group names are unique without caring about upper/lower case:
// "Calculus 1" and "calculus 1" count as the same name.
studyGroupSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

studyGroupSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);

// Which user fields to show when we "populate" owner / members
const USER_SUMMARY = 'username fullName';

// ---------- Data functions used by the controllers ----------

// The creator becomes the owner AND the first member
function createGroup(data, ownerId) {
  return StudyGroup.create({ ...data, owner: ownerId, members: [ownerId] });
}

// Plain group (owner/members are just ids) - used for permission checks
function findGroupById(id) {
  return StudyGroup.findById(id);
}

// Group with owner and members filled in with names - used for the Group page
function findGroupDetails(id) {
  return StudyGroup.findById(id)
    .populate('owner', USER_SUMMARY)
    .populate('members', USER_SUMMARY);
}

// List groups, newest first; if searchRegex is given, match name / course / institution
function listGroups(searchRegex) {
  const filter = searchRegex
    ? { $or: [{ name: searchRegex }, { course: searchRegex }, { institution: searchRegex }] }
    : {};
  return StudyGroup.find(filter)
    .populate('owner', USER_SUMMARY)
    .sort({ createdAt: -1 })
    .limit(100);
}

function updateGroup(id, changes) {
  return StudyGroup.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true });
}

function deleteGroup(id) {
  return StudyGroup.findByIdAndDelete(id);
}

// Adds a member in ONE atomic database operation. The filter only matches if
// the user is not a member yet AND the group is not full, so two people
// joining at the same moment can never push the group over maxMembers.
// Returns null when nothing was updated.
function addMember(groupId, userId) {
  return StudyGroup.findOneAndUpdate(
    {
      _id: groupId,
      members: { $ne: userId },
      $expr: { $lt: [{ $size: '$members' }, '$maxMembers'] }
    },
    { $addToSet: { members: userId } },
    { new: true }
  );
}

function removeMember(groupId, userId) {
  return StudyGroup.findByIdAndUpdate(groupId, { $pull: { members: userId } }, { new: true });
}

// Used when a user deletes their account
function countGroupsOwnedBy(userId) {
  return StudyGroup.countDocuments({ owner: userId });
}

function removeUserFromAllGroups(userId) {
  return StudyGroup.updateMany({ members: userId }, { $pull: { members: userId } });
}

module.exports = {
  STUDY_FORMATS,
  createGroup,
  findGroupById,
  findGroupDetails,
  listGroups,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  countGroupsOwnedBy,
  removeUserFromAllGroups
};
