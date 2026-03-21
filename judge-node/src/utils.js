// Output normalization and helpers
function normalizeOutput(output) {
  return String(output).replace(/\s+/g, '').trim();
}

module.exports = { normalizeOutput };
