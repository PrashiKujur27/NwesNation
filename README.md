# NewsNation 📰

> **GOOD MORNING NATION!** — Your advanced real-time news portal.

A production-grade news website featuring live headlines, category filtering, search, bookmarks, dark/light themes, voice search, breaking news slider, and trending stories.

---

## 🚀 Quick Start

### 1. Get Your Free API Key
This project uses the **GNews API** (free tier: 100 requests/day).

1. Go to [https://gnews.io/](https://gnews.io/)
2. Sign up for a free account
3. Copy your API key from the dashboard

### 2. Add Your API Key

Open `js/app.js` and replace line 12:

```js
API_KEY: 'YOUR_GNEWS_API_KEY_HERE',
```
with:
```js
API_KEY: 'your_actual_key_here',
```

### 3. Run Locally

Simply open `index.html` in your browser — no build step required!

**Or** use VS Code Live Server extension for the best experience:
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Right-click `index.html` → **Open with Live Server**

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌐 Live News | Real-time headlines via GNews API |
| 📂 Categories | Tech, Sports, Business, Entertainment, Health, Science |
| 🔍 Search | Keyword search with 500ms debounce |
| 🎙 Voice Search | Web Speech API integration |
| ⭐ Bookmarks | Save articles, persists in localStorage |
| 🎠 Breaking Slider | Auto-advancing carousel with manual controls |
| 📈 Trending | Top 7 trending stories sidebar |
| 📺 Ticker | Auto-scrolling breaking news ticker |
| 🌙 Dark / Light Mode | Vivid multi-color themes (not just blue/black/white) |
| 📱 Responsive | Full mobile + tablet + desktop support |
| ⚡ Caching | 15-minute cache to respect API rate limits |
| 💀 Skeleton Loading | Smooth skeleton screens while fetching |

---

## 📁 Project Structure

```
NewsNation/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # All styles (CSS variables + dark/light themes)
├── js/
│   └── app.js          # All JS logic (API, rendering, state)
└── README.md           # You are here
```

---

## 🎨 Design Highlights

- **Fonts**: Playfair Display (headlines) + DM Sans (body) + Space Mono (labels)
- **Dark theme**: Deep navy/indigo background with orange, teal, rose, amber, violet, cyan accents
- **Light theme**: Warm cream/parchment background with deep accent versions
- **Animations**: Card entrance animations, slider transitions, ticker scroll, live dot pulse

---

## 🌍 Push to GitHub

```bash
# From inside the NewsNation folder:
git init
git add .
git commit -m "Initial commit: NewsNation news portal"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/NewsNation.git
git branch -M main
git push -u origin main
```

---

## 📌 Notes

- **No API key?** The app auto-detects and runs on rich demo data so you can preview it instantly.
- **CORS**: GNews API supports browser-side fetch. No backend needed.
- **Rate limits**: Free tier is 100 requests/day. The 15-min cache means normal usage stays well within limits.

---

## 🛠 Tech Stack

- Vanilla HTML5 + CSS3 + JavaScript (ES2022)
- GNews API
- Google Fonts
- No frameworks, no bundlers — runs anywhere

---

*Built with ❤️ — Good Morning Nation!*
