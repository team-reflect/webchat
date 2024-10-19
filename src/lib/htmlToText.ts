import { Readability } from '@mozilla/readability'

export function htmlToText(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Create a new Readability object
  const reader = new Readability(doc)

  // Parse the content
  const article = reader.parse()

  // Return the article content or a default message if parsing fails
  return article ? trimWhitespace(article.textContent) : null
}

function trimWhitespace(text: string): string {
  // Trims duplicate whitespaces and newlines
  return text.replace(/\s+/g, ' ').trim()
}
