/**
 * Escapes regex special characters so user-supplied search text is always
 * treated as a literal substring, never as a regex pattern. Without this,
 * a crafted query string (e.g. a pathological alternation) could cause
 * catastrophic backtracking (ReDoS) or unexpected matches.
 */
function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
