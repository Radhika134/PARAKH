const cleanText = (text) => {
  if (!text) return '';

  // 1. Remove non-printable characters except standard whitespace
  let cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');

  // 2. Replace multiple line breaks with a single newline or space
  cleaned = cleaned.replace(/(\r\n|\n|\r){2,}/g, '\n');

  // 3. Replace multiple spaces/tabs with a single space
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

  // 4. Trim leading and trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
};

module.exports = {
  cleanText
};
