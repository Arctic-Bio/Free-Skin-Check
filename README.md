# SkinSight — Static AI Skin Analyzer

SkinSight is a **static, client-side web application** that lets users capture or upload a skin photo, answer a few basic questions, and receive an **AI-assisted skin analysis** using their own API key for **OpenAI** or **Google Gemini**.

> **Disclaimer:** This tool is for **informational purposes only** and is **not a substitute for professional medical advice, diagnosis, or treatment**.

## Features

* **Entirely client-side** — no server needed, API keys are never uploaded.
* **Multi-step UI** with:

  * Intro & consent
  * Skin questionnaire (age, skin tone, concerns)
  * Photo capture via camera or file upload
  * AI provider & API key entry
  * Review & confirmation
* **AI analysis** using OpenAI Chat Completions or Google Gemini.
* **Privacy-first design**: Your image and API key never leave your browser except for direct AI provider API requests.

## How It Works

1. User provides **age, skin tone, concerns**, and **consent**.
2. User captures or uploads a **skin image**.
3. User selects an **AI provider** and enters their **API key**.
4. The app builds a structured **analysis prompt** containing user context and the base64-encoded image.
5. The request is sent **directly from the browser** to the AI provider's API.
6. The AI returns **JSON-formatted** results, displayed to the user.

## Demo

This app runs **entirely in a browser**. To test it:

1. Download this repository.
2. Open `index.html` in a modern browser.
3. Provide your own OpenAI or Google Gemini API key.
4. Follow the step-by-step UI to receive an analysis.

## Requirements

* Modern web browser with camera access support.
* An API key for **OpenAI** or **Google Gemini**.
* Basic understanding that this is **not a medical tool**.

## File Structure

```
index.html  # Single-file app containing HTML, CSS, and JavaScript
```

## Using OpenAI API

1. Get an API key from [OpenAI Platform](https://platform.openai.com/).
2. Select **OpenAI** in the "AI Provider" dropdown.
3. Enter your API key in the provided field.
4. Complete the steps and receive your skin analysis.

## Using Google Gemini API

1. Get an API key from [Google AI Studio](https://makersuite.google.com/).
2. Select **Google Gemini** in the "AI Provider" dropdown.
3. Enter your API key in the provided field.
4. Complete the steps and receive your skin analysis.

## Security & Privacy

* **No backend server**: All processing is done in the browser.
* **Your API key stays in your browser**.
* **Images are only sent to your selected AI provider**.
* **No data is stored or logged** by this app.

## Example JSON Output

```json
{
  "summary": "Mild acne on the forehead",
  "observations": ["Slight redness", "Small closed comedones"],
  "likely_causes": ["Hormonal changes", "Excess sebum production"],
  "recommendations": [
    "Cleanse twice daily with a gentle cleanser",
    "Use a light, non-comedogenic moisturizer",
    "Consider incorporating salicylic acid treatment"
  ],
  "follow_up": "Reassess after 4 weeks"
}
```

## Installation & Local Use

1. Clone or download this repository.

```bash
git clone https://github.com/yourusername/skinsight.git
```

2. Open `index.html` in your browser.
3. Follow on-screen steps.

*No build process is required*—the app uses **Tailwind CDN** and runs as a single HTML file.

## Roadmap

* [ ] Add image preprocessing (lighting normalization).
* [ ] Improve JSON parsing robustness.
* [ ] Support additional AI providers.

## License

MIT License — feel free to use, modify, and distribute.

---

**Note:** Always consult a licensed dermatologist for any medical concerns.

