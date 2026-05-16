/* ============================================================
   NewsNation — Main App
   Uses GNews API (free tier, 100 req/day)
   Get your free key at: https://gnews.io/
   Replace API_KEY below with your key.
   ============================================================ */

const CONFIG = {
  API_KEY: '29a1a6a4c3c271d1f4fa8ac4349ca178', // ← Replace this
  BASE_URL: 'https://gnews.io/api/v4',
  PAGE_SIZE: 9,
  CACHE_TTL: 15 * 60 * 1000, // 15 minutes
};

/* ---- State ---- */
const state = {
  currentCat: 'general',
  currentPage: 1,
  allArticles: [],
  displayedCount: 0,
  bookmarks: JSON.parse(localStorage.getItem('nn_bookmarks') || '[]'),
  searchQuery: '',
  isLoading: false,
  theme: localStorage.getItem('nn_theme') || 'dark',
};

/* ---- Category → color class mapping ---- */
const CAT_CLASS = {
  technology: 'cat--technology',
  sports: 'cat--sports',
  business: 'cat--business',
  entertainment: 'cat--entertainment',
  health: 'cat--health',
  science: 'cat--science',
  general: 'cat--general',
  india: 'cat--india',
};

/* ---- Cache ---- */
const cache = new Map();
function cacheSet(key, data) { cache.set(key, { data, ts: Date.now() }); }
function cacheGet(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CONFIG.CACHE_TTL) { cache.delete(key); return null; }
  return e.data;
}

/* ============================================================
   API CALLS
   ============================================================ */
async function fetchNews(category = 'general', query = '', page = 1) {
  const cacheKey = `${category}|${query}|${page}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  let url;
  if (query) {
    // Search: add India context if india category
    const q = category === 'india' ? `${query} India` : query;
    url = `${CONFIG.BASE_URL}/search?q=${encodeURIComponent(q)}&lang=en&max=${CONFIG.PAGE_SIZE}&page=${page}&token=${CONFIG.API_KEY}`;
  } else if (category === 'india') {
    // India-specific: search for India news (GNews free tier supports search with country keyword)
    url = `${CONFIG.BASE_URL}/search?q=India&lang=en&country=in&max=${CONFIG.PAGE_SIZE}&page=${page}&token=${CONFIG.API_KEY}`;
  } else {
    const topicMap = {
      general: 'world',
      technology: 'technology',
      sports: 'sports',
      business: 'business',
      entertainment: 'entertainment',
      health: 'health',
      science: 'science',
    };
    const topic = topicMap[category] || 'world';
    url = `${CONFIG.BASE_URL}/top-headlines?topic=${topic}&lang=en&max=${CONFIG.PAGE_SIZE}&page=${page}&token=${CONFIG.API_KEY}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  cacheSet(cacheKey, data.articles || []);
  return data.articles || [];
}

async function fetchBreaking() {
  const cacheKey = 'breaking';
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const url = `${CONFIG.BASE_URL}/top-headlines?topic=world&lang=en&max=6&token=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  cacheSet(cacheKey, data.articles || []);
  return data.articles || [];
}

/* ============================================================
   DEMO DATA (used when no API key is set)
   ============================================================ */
function getDemoArticles(category = 'general') {
  const globalDemos = [
    {
      title: "Global AI Summit Reaches Landmark Agreement on Safety Standards",
      description: "World leaders and tech executives gathered in Geneva to sign a historic accord setting baseline safety requirements for advanced AI systems, marking a turning point in international AI governance.",
      url: "#",
      image: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=600&q=80",
      publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      source: { name: "World Tech Report" },
    },
    {
      title: "Breakthrough in Quantum Computing Achieves 1,000-Qubit Milestone",
      description: "Scientists at a leading research institute have demonstrated a quantum processor operating at 1,000 qubits with record-low error rates, opening doors to previously unsolvable computational problems.",
      url: "#",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
      publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      source: { name: "Science Today" },
    },
    {
      title: "Market Rally: Global Stocks Surge on Positive Economic Data",
      description: "Major indices around the world climbed sharply after unexpected strong employment data and consumer confidence figures suggested economic resilience despite ongoing geopolitical tensions.",
      url: "#",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
      publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      source: { name: "Financial Wire" },
    },
    {
      title: "Space Agency Unveils Plans for Permanent Lunar Research Base by 2030",
      description: "In an ambitious announcement, the agency outlined a phased construction plan for a permanent human habitat on the Moon's south pole, leveraging water ice deposits for life support.",
      url: "#",
      image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
      publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      source: { name: "Space Insider" },
    },
    {
      title: "New Climate Study Reveals Oceans Absorbing Heat Faster Than Predicted",
      description: "A comprehensive decade-long study tracking ocean temperatures across all major basins found that warming is accelerating at a pace exceeding even the most pessimistic climate models.",
      url: "#",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
      publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      source: { name: "Climate Monitor" },
    },
    {
      title: "Revolutionary Battery Technology Promises EV Range of 1,000 Miles",
      description: "A startup has announced a solid-state battery cell achieving energy density three times current lithium-ion packs with a 20-minute fast charge, potentially transforming the electric vehicle industry.",
      url: "#",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
      publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      source: { name: "EV News Network" },
    },
    {
      title: "Championship Finals Draw Record 2 Billion Viewers Worldwide",
      description: "The global sporting spectacle shattered all previous viewership records as fans from 195 countries tuned in to watch the dramatic final, cementing the event as the most-watched in history.",
      url: "#",
      image: "https://images.unsplash.com/photo-1540747913346-19212a4c0f31?w=600&q=80",
      publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
      source: { name: "Sports Central" },
    },
    {
      title: "Medical Trial Shows Alzheimer's Drug Halts Cognitive Decline in 70% of Patients",
      description: "Phase 3 results from a multinational trial of a novel tau-targeting antibody therapy showed statistically significant halt in cognitive decline, raising hopes for millions of patients worldwide.",
      url: "#",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
      publishedAt: new Date(Date.now() - 16 * 3600000).toISOString(),
      source: { name: "Health Science Journal" },
    },
    {
      title: "Tech Giant Announces Open-Source AI Model Rivaling Proprietary Systems",
      description: "In a move that sent shockwaves through the AI industry, a major tech company released a fully open-source language model that benchmarks indicate matches or surpasses leading closed models.",
      url: "#",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
      publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      source: { name: "TechCrunch Daily" },
    },
    {
      title: "Historic Peace Agreement Signed Between Long-Rival Nations",
      description: "After two years of secret negotiations, diplomats announced a comprehensive peace framework covering trade, border disputes, and cultural exchange, described as the most significant diplomatic achievement of the decade.",
      url: "#",
      image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=600&q=80",
      publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      source: { name: "World Affairs Today" },
    },
    {
      title: "New Survey: 60% of Remote Workers Prefer Hybrid Model Over Full Office Return",
      description: "A comprehensive survey of 50,000 knowledge workers across 40 countries found strong preference for hybrid arrangements, with productivity metrics showing no significant difference from fully in-office work.",
      url: "#",
      image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&q=80",
      publishedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
      source: { name: "Work Futures" },
    },
    {
      title: "Archaeologists Uncover 3,000-Year-Old Lost City Beneath Amazon Rainforest",
      description: "Using advanced LiDAR scanning technology, a research team has mapped an extensive pre-Columbian urban complex covering over 2,000 square kilometres, fundamentally changing our understanding of ancient Amazonian civilisations.",
      url: "#",
      image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80",
      publishedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
      source: { name: "Discovery Science" },
    },
  ];

  // ---- INDIA-SPECIFIC DEMO ARTICLES ----
  const indiaDemos = [
    {
      title: "ISRO Successfully Launches Chandrayaan-4 Mission Toward the Moon",
      description: "India's space agency ISRO has executed a flawless launch of Chandrayaan-4 from Sriharikota, aiming to bring back the first lunar soil samples ever collected by India, marking a giant leap for the nation's space programme.",
      url: "#",
      image: "https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=600&q=80",
      publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      source: { name: "NDTV" },
    },
    {
      title: "India's GDP Growth Hits 7.8% in Latest Quarter, Outpaces All G20 Economies",
      description: "India retains its position as the world's fastest-growing major economy for the third consecutive quarter, with the finance ministry attributing the surge to record manufacturing output and robust domestic consumption.",
      url: "#",
      image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&q=80",
      publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      source: { name: "The Hindu" },
    },
    {
      title: "Team India Wins Cricket World Cup Final in Thrilling Last-Over Victory",
      description: "The Indian cricket team clinched the ICC World Cup title at the Narendra Modi Stadium in Ahmedabad, defeating Australia by 2 wickets in a nail-biting final that saw Virat Kohli score a match-winning century.",
      url: "#",
      image: "https://images.unsplash.com/photo-1540747913346-19212a4c0f31?w=600&q=80",
      publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      source: { name: "Times of India" },
    },
    {
      title: "Bengaluru Startup Raises ₹2,000 Crore in India's Largest AI Funding Round",
      description: "A Bengaluru-based artificial intelligence startup focused on vernacular language models has secured ₹2,000 crore in Series C funding, the largest AI-focused venture round ever raised in India, with backers including Tiger Global and Sequoia India.",
      url: "#",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
      publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
      source: { name: "Economic Times" },
    },
    {
      title: "Delhi Metro Phase 5 Gets Cabinet Approval; 20 New Stations Planned",
      description: "The Union Cabinet has approved the Phase 5 expansion of the Delhi Metro network, which will add 20 new stations and 65 km of track, connecting previously underserved areas of the National Capital Region.",
      url: "#",
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80",
      publishedAt: new Date(Date.now() - 9 * 3600000).toISOString(),
      source: { name: "Hindustan Times" },
    },
    {
      title: "India Launches World's Largest Free Solar Energy Programme for Farmers",
      description: "The government has rolled out the expanded PM-KUSUM scheme, targeting the installation of 35 lakh solar pumps across agricultural land, aimed at cutting electricity bills for farmers and reducing carbon emissions from the farming sector.",
      url: "#",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
      publishedAt: new Date(Date.now() - 11 * 3600000).toISOString(),
      source: { name: "Indian Express" },
    },
    {
      title: "IIT Bombay Researchers Develop Low-Cost Cancer Detection Device",
      description: "Scientists at IIT Bombay have developed a portable, AI-driven biosensor that can detect four types of cancer from a drop of blood in under 30 minutes at a cost of under ₹500, potentially transforming early diagnosis in rural India.",
      url: "#",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
      publishedAt: new Date(Date.now() - 13 * 3600000).toISOString(),
      source: { name: "Science India" },
    },
    {
      title: "UPI Crosses 15 Billion Transactions in a Single Month for the First Time",
      description: "The Unified Payments Interface recorded a historic 15.08 billion transactions worth ₹20.64 lakh crore in a single month, cementing India's position as the global leader in real-time digital payments infrastructure.",
      url: "#",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
      publishedAt: new Date(Date.now() - 15 * 3600000).toISOString(),
      source: { name: "Business Standard" },
    },
    {
      title: "Nita Ambani Elected as First Indian Member of International Olympic Committee",
      description: "Nita Ambani has been elected as a full member of the International Olympic Committee, becoming the first Indian woman to hold the position. Her election is seen as a significant step toward India hosting the 2036 Summer Olympics.",
      url: "#",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
      publishedAt: new Date(Date.now() - 17 * 3600000).toISOString(),
      source: { name: "Zee News" },
    },
    {
      title: "India Opens World's Highest Railway Station at 3,800 Metres in Himachal Pradesh",
      description: "The Indian Railways inaugurated the world's highest railway station at Tabo in Himachal Pradesh's Spiti Valley at an altitude of 3,800 metres, completing a decades-long engineering project that required tunnelling through the Himalayan range.",
      url: "#",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
      publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      source: { name: "India Today" },
    },
    {
      title: "Bollywood's 'Mahakaal' Breaks All-Time Box Office Record with ₹1,500 Crore Opening",
      description: "The mythological epic 'Mahakaal' has shattered all box office records with a ₹1,500 crore worldwide opening weekend, surpassing the previous record set by Baahubali and triggering a new wave of big-budget Indian mythology films.",
      url: "#",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
      publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      source: { name: "Bollywood Hungama" },
    },
    {
      title: "India Deploys AI-Powered Flood Warning System Across 10 Major River Basins",
      description: "The National Disaster Management Authority has activated an AI-powered early flood warning network across 10 major river basins, capable of predicting flood events 72 hours in advance with 94% accuracy, expected to protect over 5 crore people.",
      url: "#",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80",
      publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(),
      source: { name: "Dainik Bhaskar" },
    },
  ];

  // Return India demos for india category
  if (category === 'india') return indiaDemos;

  // Filter global by category
  if (category === 'technology') return globalDemos.filter((_, i) => [0, 1, 5, 8].includes(i));
  if (category === 'sports') return globalDemos.filter((_, i) => [6].includes(i)).concat(globalDemos.slice(0, 4));
  if (category === 'business') return globalDemos.filter((_, i) => [2, 10].includes(i)).concat(globalDemos.slice(0, 3));
  if (category === 'health') return globalDemos.filter((_, i) => [7].includes(i)).concat(globalDemos.slice(0, 5));
  if (category === 'science') return globalDemos.filter((_, i) => [1, 3, 4, 11].includes(i));
  if (category === 'entertainment') return globalDemos.filter((_, i) => [6, 9].includes(i)).concat(globalDemos.slice(0, 4));
  // general = mix of global + top India stories
  return [...globalDemos.slice(0, 9), ...indiaDemos.slice(0, 3)];
}

/* ============================================================
   RENDER HELPERS
   ============================================================ */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function imgOrFallback(url) {
  return url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

/* ============================================================
   SKELETON LOADERS
   ============================================================ */
function renderSkeletons(count = 6) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-card news-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   CARD RENDER
   ============================================================ */
function renderNewsCard(article, index = 0) {
  const isSaved = state.bookmarks.some(b => b.url === article.url);
  const catClass = CAT_CLASS[state.currentCat] || 'cat--general';
  const delay = (index % CONFIG.PAGE_SIZE) * 60;
  return `
    <article class="news-card" style="animation-delay:${delay}ms"
      data-url="${article.url}"
      onclick="openArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
      <div class="news-card-img-wrap">
        <img class="news-card-img" src="${imgOrFallback(article.image)}"
          alt="${truncate(article.title, 60)}"
          onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'" />
        <span class="news-card-cat-badge ${catClass}">${state.currentCat}</span>
      </div>
      <div class="news-card-body">
        <h3 class="news-card-title">${article.title}</h3>
        <p class="news-card-desc">${truncate(article.description, 120)}</p>
        <div class="news-card-footer">
          <div>
            <div class="news-card-meta">${article.source?.name || 'Unknown'}</div>
            <div class="news-card-meta">${timeAgo(article.publishedAt)}</div>
          </div>
          <div class="news-card-actions" onclick="event.stopPropagation()">
            <button class="card-action-btn ${isSaved ? 'saved' : ''}"
              onclick="toggleBookmark(${JSON.stringify(article).replace(/"/g, '&quot;')}, this)">
              ${isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <a class="card-action-btn" href="${article.url}" target="_blank" rel="noopener"
              onclick="event.stopPropagation()">Read →</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

/* ============================================================
   ARTICLE MODAL
   ============================================================ */
function openArticle(article) {
  const modal = document.getElementById('articleModal');
  const body = document.getElementById('modalBody');
  const isSaved = state.bookmarks.some(b => b.url === article.url);
  body.innerHTML = `
    ${article.image ? `<img class="modal-img" src="${article.image}"
      onerror="this.style.display='none'" alt="${truncate(article.title, 60)}" />` : ''}
    <div class="modal-cat">${state.currentCat}</div>
    <h2 class="modal-title">${article.title}</h2>
    <div class="modal-meta">
      <span>📰 ${article.source?.name || 'Unknown'}</span>
      <span>🕐 ${timeAgo(article.publishedAt)}</span>
    </div>
    <p class="modal-desc">${article.description || 'No description available.'}</p>
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
      <a class="modal-read-btn" href="${article.url}" target="_blank" rel="noopener">
        Read Full Article →
      </a>
      <button class="modal-read-btn" style="background:var(--${isSaved ? 'accent4' : 'surface2'});color:var(--text)"
        onclick="toggleBookmark(${JSON.stringify(article).replace(/"/g, '&quot;')}, this)">
        ${isSaved ? '★ Saved' : '☆ Save'}
      </button>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('articleModal').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('articleModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   MAIN NEWS LOAD
   ============================================================ */
async function loadNews(cat = state.currentCat, reset = true) {
  if (state.isLoading) return;
  state.isLoading = true;
  const grid = document.getElementById('newsGrid');

  if (reset) {
    state.currentPage = 1;
    state.allArticles = [];
    state.displayedCount = 0;
    grid.innerHTML = renderSkeletons();
  }

  try {
    let articles;
    if (CONFIG.API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
      await new Promise(r => setTimeout(r, 800)); // Simulate latency
      articles = getDemoArticles(cat);
    } else {
      articles = await fetchNews(cat, state.searchQuery, state.currentPage);
    }
    state.allArticles.push(...articles);

    if (reset) grid.innerHTML = '';
    if (articles.length === 0) {
      if (reset) grid.innerHTML = `
        <div class="empty-state">
          <h3>No stories found</h3>
          <p>Try a different category or search term.</p>
        </div>`;
    } else {
      articles.forEach((a, i) => {
        grid.insertAdjacentHTML('beforeend', renderNewsCard(a, state.displayedCount + i));
      });
      state.displayedCount += articles.length;
    }

    const loadBtn = document.getElementById('loadMoreBtn');
    loadBtn.disabled = articles.length < CONFIG.PAGE_SIZE;
    loadBtn.textContent = articles.length < CONFIG.PAGE_SIZE ? 'All stories loaded' : 'Load More Stories';

  } catch (err) {
    console.error(err);
    if (reset) grid.innerHTML = `
      <div class="error-state">
        <h3>⚡ Couldn't load news</h3>
        <p>Check your API key in js/app.js or your internet connection.</p>
        <button class="retry-btn" onclick="loadNews()">Retry</button>
      </div>`;
  }
  state.isLoading = false;
}

/* ============================================================
   FEATURED STORY
   ============================================================ */
async function loadFeatured() {
  let articles;
  try {
    if (CONFIG.API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
      articles = getDemoArticles('general');
    } else {
      articles = await fetchBreaking();
    }
    const a = articles[0];
    if (!a) return;
    document.getElementById('featuredStory').innerHTML = `
      <img class="featured-img" src="${imgOrFallback(a.image)}"
        onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'"
        alt="${truncate(a.title, 80)}" />
      <div class="featured-overlay"></div>
      <div class="featured-body">
        <span class="featured-cat">Top Story</span>
        <h2 class="featured-title">${a.title}</h2>
        <p class="featured-desc">${truncate(a.description, 140)}</p>
        <div class="featured-footer">
          <span class="featured-meta">${a.source?.name || ''} · ${timeAgo(a.publishedAt)}</span>
          <button class="featured-read-btn"
            onclick="openArticle(${JSON.stringify(a).replace(/"/g, '&quot;')})">
            Read Story
          </button>
        </div>
      </div>
    `;
  } catch (e) { console.error('Featured load error', e); }
}

/* ============================================================
   BREAKING SLIDER
   ============================================================ */
let sliderIndex = 0;
let sliderItems = [];

async function loadSlider() {
  try {
    if (CONFIG.API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
      sliderItems = getDemoArticles('general').slice(0, 6);
    } else {
      sliderItems = await fetchBreaking();
    }
    renderSlider();
    startSliderAuto();
  } catch (e) { console.error('Slider error', e); }
}

function renderSlider() {
  const track = document.getElementById('sliderTrack');
  track.innerHTML = sliderItems.map(a => `
    <div class="slider-card" onclick="openArticle(${JSON.stringify(a).replace(/"/g, '&quot;')})">
      <img class="slider-card-img" src="${imgOrFallback(a.image)}"
        onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'"
        alt="${truncate(a.title, 60)}" />
      <div class="slider-card-body">
        <div class="slider-card-cat">${a.source?.name || 'News'}</div>
        <h3 class="slider-card-title">${a.title}</h3>
        <div class="slider-card-meta">🕐 ${timeAgo(a.publishedAt)}</div>
      </div>
    </div>
  `).join('');
}

function updateSliderPosition() {
  const cardWidth = document.querySelector('.slider-card')?.offsetWidth || 300;
  const gap = 20;
  document.getElementById('sliderTrack').style.transform =
    `translateX(-${sliderIndex * (cardWidth + gap)}px)`;
}

document.getElementById('sliderNext').addEventListener('click', () => {
  const maxVisible = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
  if (sliderIndex < sliderItems.length - maxVisible) sliderIndex++;
  updateSliderPosition();
});
document.getElementById('sliderPrev').addEventListener('click', () => {
  if (sliderIndex > 0) sliderIndex--;
  updateSliderPosition();
});

let sliderAuto;
function startSliderAuto() {
  sliderAuto = setInterval(() => {
    const maxVisible = window.innerWidth > 1024 ? 3 : 1;
    if (sliderIndex < sliderItems.length - maxVisible) sliderIndex++;
    else sliderIndex = 0;
    updateSliderPosition();
  }, 5000);
}

/* ============================================================
   TRENDING
   ============================================================ */
async function loadTrending() {
  let articles;
  try {
    if (CONFIG.API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
      articles = getDemoArticles('general').slice(0, 7);
    } else {
      articles = await fetchBreaking();
    }
    document.getElementById('trendingList').innerHTML = articles.slice(0, 7).map((a, i) => `
      <li class="trending-item"
        onclick="openArticle(${JSON.stringify(a).replace(/"/g, '&quot;')})">
        <span class="trending-num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <div class="trending-title">${a.title}</div>
          <div class="trending-src">${a.source?.name || ''} · ${timeAgo(a.publishedAt)}</div>
        </div>
      </li>
    `).join('');
  } catch (e) { console.error('Trending error', e); }
}

/* ============================================================
   TICKER
   ============================================================ */
async function loadTicker() {
  let articles;
  try {
    if (CONFIG.API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
      articles = getDemoArticles('general').slice(0, 8);
    } else {
      articles = await fetchBreaking();
    }
    const text = articles.map(a => `📰 ${a.title}`).join('   ●   ');
    document.getElementById('tickerTrack').textContent = text;
  } catch (e) { console.error('Ticker error', e); }
}

/* ============================================================
   SEARCH
   ============================================================ */
const searchInput = document.getElementById('searchInput');
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.searchQuery = searchInput.value.trim();
    if (state.searchQuery.length > 2 || state.searchQuery.length === 0) {
      loadNews(state.currentCat, true);
    }
  }, 500);
});
document.getElementById('searchClear').addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  loadNews(state.currentCat, true);
});
document.getElementById('searchToggle').addEventListener('click', () => {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) searchInput.focus();
});

/* ============================================================
   CATEGORY TABS
   ============================================================ */
document.getElementById('catTabs').addEventListener('click', e => {
  const tab = e.target.closest('.cat-tab');
  if (!tab) return;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.currentCat = tab.dataset.cat;
  state.searchQuery = '';
  searchInput.value = '';
  loadNews(state.currentCat, true);
});

// Nav links also switch categories
document.getElementById('mainNav').addEventListener('click', e => {
  const link = e.target.closest('.nav-link');
  if (!link) return;
  e.preventDefault();
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  link.classList.add('active');
  state.currentCat = link.dataset.cat;
  // Sync cat tabs
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === state.currentCat);
  });
  loadNews(state.currentCat, true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('mainNav').classList.remove('open');
});

/* LOAD MORE */
document.getElementById('loadMoreBtn').addEventListener('click', () => {
  state.currentPage++;
  loadNews(state.currentCat, false);
});

/* ============================================================
   BOOKMARKS
   ============================================================ */
function toggleBookmark(article, btn) {
  const idx = state.bookmarks.findIndex(b => b.url === article.url);
  if (idx > -1) {
    state.bookmarks.splice(idx, 1);
    btn.textContent = '☆ Save';
    btn.classList.remove('saved');
    showToast('Removed from bookmarks');
  } else {
    state.bookmarks.push(article);
    btn.textContent = '★ Saved';
    btn.classList.add('saved');
    showToast('Saved to bookmarks');
  }
  localStorage.setItem('nn_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkCount();
  renderBookmarkList();
}
window.toggleBookmark = toggleBookmark;

function updateBookmarkCount() {
  const el = document.getElementById('bookmarkCount');
  el.textContent = state.bookmarks.length || '';
}

function renderBookmarkList() {
  const list = document.getElementById('bookmarksList');
  if (!state.bookmarks.length) {
    list.innerHTML = '<p class="empty-msg">No saved stories yet.</p>';
    return;
  }
  list.innerHTML = state.bookmarks.map(a => `
    <div class="bookmark-item"
      onclick="openArticle(${JSON.stringify(a).replace(/"/g, '&quot;')})">
      <div class="bookmark-item-title">${a.title}</div>
      <div class="bookmark-item-meta">${a.source?.name || ''} · ${timeAgo(a.publishedAt)}</div>
    </div>
  `).join('');
}

document.getElementById('bookmarkBtn').addEventListener('click', () => {
  document.getElementById('bookmarksPanel').classList.add('open');
  document.getElementById('overlay').classList.add('show');
});
document.getElementById('closeBookmarks').addEventListener('click', closePanel);
document.getElementById('overlay').addEventListener('click', closePanel);
function closePanel() {
  document.getElementById('bookmarksPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function setTheme(t) {
  state.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('nn_theme', t);
}
document.getElementById('themeToggle').addEventListener('click', () => {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
});
setTheme(state.theme);

/* ============================================================
   MOBILE NAV
   ============================================================ */
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});

/* ============================================================
   VOICE SEARCH
   ============================================================ */
const voiceBtn = document.getElementById('voiceBtn');
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SR();
  recog.lang = 'en-US'; recog.interimResults = false;
  recog.onresult = e => {
    const q = e.results[0][0].transcript;
    searchInput.value = q;
    state.searchQuery = q;
    document.getElementById('searchBar').classList.add('open');
    loadNews(state.currentCat, true);
    showToast(`🎙 Searching for "${q}"`);
  };
  recog.onstart = () => voiceBtn.classList.add('listening');
  recog.onend   = () => voiceBtn.classList.remove('listening');
  recog.onerror = () => {
    voiceBtn.classList.remove('listening');
    showToast('Voice search unavailable');
  };
  voiceBtn.addEventListener('click', () => recog.start());
} else {
  voiceBtn.style.display = 'none';
}

/* ============================================================
   GREETING / DATE
   ============================================================ */
function updateGreeting() {
  const h = new Date().getHours();
  let label = 'GOOD MORNING NATION!';
  if (h >= 12 && h < 17) label = 'GOOD AFTERNOON NATION!';
  else if (h >= 17 && h < 21) label = 'GOOD EVENING NATION!';
  else if (h >= 21) label = 'GOOD NIGHT NATION!';
  document.getElementById('greetingTime').textContent = label;

  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('liveDate').textContent = new Date().toLocaleDateString('en-US', opts);
}

/* ============================================================
   FOOTER CATEGORY LINKS
   ============================================================ */
document.querySelectorAll('.footer-cats a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const cat = e.currentTarget.dataset.cat;
    state.currentCat = cat;
    document.querySelectorAll('.cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === cat);
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.cat === cat);
    });
    loadNews(cat, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 2500);
}
window.showToast = showToast;
window.openArticle = openArticle;

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  updateGreeting();
  updateBookmarkCount();
  renderBookmarkList();

  // Hide loader
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1800);

  // Load all sections concurrently
  await Promise.all([
    loadFeatured(),
    loadSlider(),
    loadTrending(),
    loadTicker(),
    loadNews('general', true),
  ]);
}

document.addEventListener('DOMContentLoaded', init);

// Refresh data every 15 minutes
setInterval(async () => {
  cache.clear();
  await Promise.all([loadFeatured(), loadSlider(), loadTrending(), loadTicker()]);
  loadNews(state.currentCat, true);
}, CONFIG.CACHE_TTL);
