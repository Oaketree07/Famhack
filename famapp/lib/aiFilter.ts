// Rule-based + AI feedback quality filter
export function filterFeedbackRuleBased(keepDoing: string, improve: string): { isUseful: boolean; reason: string } {
  const combined = `${keepDoing} ${improve}`.toLowerCase().trim()

  // Too short
  if (combined.length < 5) return { isUseful: false, reason: 'too_short' }

  // Spam keywords
  const spamWords = ['skibidi', 'toilet', 'rizz', 'sigma', 'no comment', 'idk', 'dunno', 'nothing', 'lol', 'lmao', 'xd', '😂', '🤣']
  for (const word of spamWords) {
    if (combined.includes(word)) return { isUseful: false, reason: `spam_keyword:${word}` }
  }

  // Only emojis / symbols
  const textOnly = combined.replace(/[\p{Emoji}\s]/gu, '')
  if (textOnly.length < 3) return { isUseful: false, reason: 'only_emojis' }

  // Repeated characters
  if (/(.)\1{4,}/.test(combined)) return { isUseful: false, reason: 'repeated_chars' }

  return { isUseful: true, reason: '' }
}

export function getBadgeLevel(eventCount: number): { level: string; next: number } {
  if (eventCount >= 12) return { level: 'gold', next: 0 }
  if (eventCount >= 7) return { level: 'silver', next: 12 - eventCount }
  if (eventCount >= 3) return { level: 'bronze', next: 7 - eventCount }
  return { level: 'none', next: 3 - eventCount }
}
