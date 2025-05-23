# Reflect Webchat

Reflect Webchat is a Chrome extension that provides an AI-powered chat interface for web pages. It allows users to interact with an AI assistant to ask questions or perform tasks related to the content of the current web page.

## Features

- AI-powered chat interface
- Support for multiple AI providers (OpenAI and Anthropic) and custom keys
- Automatic context extraction from web pages and YouTube videos
- Uses prompt caching to reduce costs
- Markdown rendering for chat messages
- Dark mode support

## Notes

- This extension is built for Chrome and will not work in other browsers (such as Arc).

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Build the extension:
   ```
   pnpm build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder in the project directory

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
