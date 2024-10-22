import { htmlToText } from './htmlToText'

interface ContentScriptResult {
  html: string | null
  text: string | null
}

export async function getTabContent(tabId: number): Promise<ContentScriptResult> {
  return new Promise((resolve) => {
    chrome.scripting
      .executeScript({
        target: { tabId },
        func: getContentScript,
      })
      .then(([injectionResult]) => {
        resolve(injectionResult.result ?? { html: null, text: null })
      })
      .catch((error) => {
        console.error('Error getting tab content', error)
        resolve({ html: null, text: null })
      })
  })
}

export async function getTabContentAsText(tabId: number): Promise<string | null> {
  const content = await getTabContent(tabId)
  const text = content.text || (content.html ? htmlToText(content.html) : null)

  return text
}

async function getContentScript(): Promise<ContentScriptResult> {
  // The reason this function looks so bad is because you can only execute
  // one function - a contentscript can't call out to any other functions.

  const html = document.documentElement.outerHTML
  let text = null

  if (document.location.hostname.includes('youtube.com')) {
    const showTranscriptButton: HTMLElement | null = document.querySelector(
      'button[aria-label="Show transcript"]',
    )

    if (showTranscriptButton) {
      showTranscriptButton.click()

      let transcript: Element | null = null

      // Retry 5 times to get the transcript
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        transcript = document.querySelector('ytd-transcript-segment-list-renderer')

        if (transcript) {
          break
        }
      }

      if (transcript?.textContent) {
        const cleanedTranscript = transcript.textContent
          .replace(/\n\d+(?:\:\d+)?/g, '')
          .replace(/\n+/g, ' ')
          .trim()

        text = cleanedTranscript
      }
    }
  }

  return { html, text }
}
