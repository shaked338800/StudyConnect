// [REQ-24] Makes user text safe to use inside a MongoDB $regex.
// Without this, a search like "c++" or "(" would throw "invalid regular
// expression" or match things the user did not type.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
