// Simple filter for inappropriate words and HTML sanitization

const BLOCKED_WORDS = [
  "anjing",
  "babi",
  "bangsat",
  "kontol",
  "memek",
  "pantek",
  "itil",
  "pepek",
  "ngentot",
  "bajingan",
  "fuck",
  "shit",
  "asshole",
  "bitch",
];

export function sanitizeNickname(input: string): string {
  // Strip HTML tags and excessive whitespace
  return input.replace(/<[^>]*>?/gm, "").trim();
}

export function isNicknameAllowed(nickname: string): boolean {
  const clean = nickname.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const word of BLOCKED_WORDS) {
    if (clean.includes(word)) {
      return false;
    }
  }
  return true;
}
