function parseHashtags(value) {
  if (!value) return [];

  const rawTags = Array.isArray(value)
    ? value
    : String(value)
        .split(',')
        .map((tag) => tag.trim());

  return [
    ...new Set(
      rawTags
        .map((tag) => String(tag).replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean)
        .filter((tag) => tag.length <= 100)
    ),
  ];
}

module.exports = { parseHashtags };
