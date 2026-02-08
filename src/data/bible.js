// Bible book metadata
export const BIBLE_BOOKS = {
  old: [
    { name: 'Genesis', chapters: 50, abbr: 'Gen' },
    { name: 'Exodus', chapters: 40, abbr: 'Exod' },
    { name: 'Leviticus', chapters: 27, abbr: 'Lev' },
    { name: 'Numbers', chapters: 36, abbr: 'Num' },
    { name: 'Deuteronomy', chapters: 34, abbr: 'Deut' },
    { name: 'Joshua', chapters: 24, abbr: 'Josh' },
    { name: 'Judges', chapters: 21, abbr: 'Judg' },
    { name: 'Ruth', chapters: 4, abbr: 'Ruth' },
    { name: '1 Samuel', chapters: 31, abbr: '1 Sam' },
    { name: '2 Samuel', chapters: 24, abbr: '2 Sam' },
    { name: '1 Kings', chapters: 22, abbr: '1 Kgs' },
    { name: '2 Kings', chapters: 25, abbr: '2 Kgs' },
    { name: '1 Chronicles', chapters: 29, abbr: '1 Chr' },
    { name: '2 Chronicles', chapters: 36, abbr: '2 Chr' },
    { name: 'Ezra', chapters: 10, abbr: 'Ezra' },
    { name: 'Nehemiah', chapters: 13, abbr: 'Neh' },
    { name: 'Esther', chapters: 10, abbr: 'Esth' },
    { name: 'Job', chapters: 42, abbr: 'Job' },
    { name: 'Psalms', chapters: 150, abbr: 'Ps' },
    { name: 'Proverbs', chapters: 31, abbr: 'Prov' },
    { name: 'Ecclesiastes', chapters: 12, abbr: 'Eccl' },
    { name: 'Song of Solomon', chapters: 8, abbr: 'Song' },
    { name: 'Isaiah', chapters: 66, abbr: 'Isa' },
    { name: 'Jeremiah', chapters: 52, abbr: 'Jer' },
    { name: 'Lamentations', chapters: 5, abbr: 'Lam' },
    { name: 'Ezekiel', chapters: 48, abbr: 'Ezek' },
    { name: 'Daniel', chapters: 12, abbr: 'Dan' },
    { name: 'Hosea', chapters: 14, abbr: 'Hos' },
    { name: 'Joel', chapters: 3, abbr: 'Joel' },
    { name: 'Amos', chapters: 9, abbr: 'Amos' },
    { name: 'Obadiah', chapters: 1, abbr: 'Obad' },
    { name: 'Jonah', chapters: 4, abbr: 'Jonah' },
    { name: 'Micah', chapters: 7, abbr: 'Mic' },
    { name: 'Nahum', chapters: 3, abbr: 'Nah' },
    { name: 'Habakkuk', chapters: 3, abbr: 'Hab' },
    { name: 'Zephaniah', chapters: 3, abbr: 'Zeph' },
    { name: 'Haggai', chapters: 2, abbr: 'Hag' },
    { name: 'Zechariah', chapters: 14, abbr: 'Zech' },
    { name: 'Malachi', chapters: 4, abbr: 'Mal' },
  ],
  new: [
    { name: 'Matthew', chapters: 28, abbr: 'Matt' },
    { name: 'Mark', chapters: 16, abbr: 'Mark' },
    { name: 'Luke', chapters: 24, abbr: 'Luke' },
    { name: 'John', chapters: 21, abbr: 'John' },
    { name: 'Acts', chapters: 28, abbr: 'Acts' },
    { name: 'Romans', chapters: 16, abbr: 'Rom' },
    { name: '1 Corinthians', chapters: 16, abbr: '1 Cor' },
    { name: '2 Corinthians', chapters: 13, abbr: '2 Cor' },
    { name: 'Galatians', chapters: 6, abbr: 'Gal' },
    { name: 'Ephesians', chapters: 6, abbr: 'Eph' },
    { name: 'Philippians', chapters: 4, abbr: 'Phil' },
    { name: 'Colossians', chapters: 4, abbr: 'Col' },
    { name: '1 Thessalonians', chapters: 5, abbr: '1 Thess' },
    { name: '2 Thessalonians', chapters: 3, abbr: '2 Thess' },
    { name: '1 Timothy', chapters: 6, abbr: '1 Tim' },
    { name: '2 Timothy', chapters: 4, abbr: '2 Tim' },
    { name: 'Titus', chapters: 3, abbr: 'Titus' },
    { name: 'Philemon', chapters: 1, abbr: 'Phlm' },
    { name: 'Hebrews', chapters: 13, abbr: 'Heb' },
    { name: 'James', chapters: 5, abbr: 'Jas' },
    { name: '1 Peter', chapters: 5, abbr: '1 Pet' },
    { name: '2 Peter', chapters: 3, abbr: '2 Pet' },
    { name: '1 John', chapters: 5, abbr: '1 John' },
    { name: '2 John', chapters: 1, abbr: '2 John' },
    { name: '3 John', chapters: 1, abbr: '3 John' },
    { name: 'Jude', chapters: 1, abbr: 'Jude' },
    { name: 'Revelation', chapters: 22, abbr: 'Rev' },
  ],
};

export const ALL_BOOKS = [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new];

export const THEMES = {
  light: { bg: '#FFFBF5', text: '#3D2E1F', secondary: '#8B7355', surface: '#FFF8F0', border: '#E8D5BE', accent: '#B48C50' },
  sepia: { bg: '#F5EDDA', text: '#3D2E1F', secondary: '#6B5B47', surface: '#EDE4D0', border: '#D4C4A8', accent: '#A07850' },
  dark:  { bg: '#1A1512', text: '#E8D5BE', secondary: '#A89274', surface: '#2A2118', border: '#3D3028', accent: '#C4A060' },
};

export const COMMENTARY_SOURCES = [
  { id: 'ai', label: 'AI Study Notes', icon: '✦' },
  { id: 'matthew_henry', label: 'Matthew Henry', icon: '📖' },
  { id: 'john_calvin', label: 'John Calvin', icon: '⛪' },
  { id: 'albert_barnes', label: 'Albert Barnes', icon: '📜' },
  { id: 'john_macarthur', label: 'John MacArthur', icon: '🎓' },
];

// Attempt to load bundled ASV data — falls back to API fetch
let asvData = null;
let loadAttempted = false;

export async function loadBibleData() {
  if (asvData) return asvData;
  if (loadAttempted) return null;
  loadAttempted = true;
  try {
    const res = await fetch('/asv.json');
    if (res.ok) {
      asvData = await res.json();
      return asvData;
    }
  } catch {
    // File not available — that's fine, we'll use the API
  }
  console.log('ASV data not bundled — fetching from bible-api.com');
  return null;
}

// Fetch verses from bundled data or bible-api.com
export async function getVerses(book, chapter) {
  // Try bundled data first
  const data = await loadBibleData();
  if (data && data[book] && data[book][chapter]) {
    const chapterData = data[book][chapter];
    return Object.entries(chapterData)
      .map(([num, text]) => ({ verse: parseInt(num), text }))
      .sort((a, b) => a.verse - b.verse);
  }

  // Fallback: fetch from bible-api.com
  try {
    const encoded = encodeURIComponent(`${book} ${chapter}`);
    const res = await fetch(`https://bible-api.com/${encoded}?translation=asv`);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    if (json.verses) {
      return json.verses.map(v => ({ verse: v.verse, text: v.text.trim() }));
    }
  } catch (err) {
    console.error('Failed to fetch from API:', err);
  }

  // Last resort: return placeholder
  return [{ verse: 1, text: `[Unable to load ${book} ${chapter}. Please check your connection or run: npm run fetch-bible]` }];
}

// Search across all loaded verses
export async function searchVerses(query) {
  const results = [];
  const data = await loadBibleData();
  if (!data) return results;

  const q = query.toLowerCase();
  for (const [book, chapters] of Object.entries(data)) {
    for (const [chapter, verses] of Object.entries(chapters)) {
      for (const [verse, text] of Object.entries(verses)) {
        if (text.toLowerCase().includes(q)) {
          results.push({ book, chapter: parseInt(chapter), verse: parseInt(verse), text });
          if (results.length >= 100) return results;
        }
      }
    }
  }
  return results;
}

export function generateCommentary(book, chapter, verse, source) {
  const ref = `${book} ${chapter}:${verse}`;
  const commentaries = {
    ai: `This verse speaks to the foundational truth of God's creative power and sovereign authority. The language carries deep theological significance, pointing to God's intentional design and purposeful creation.\n\nKey Themes:\n• Divine sovereignty and creative power\n• The purposeful nature of God's actions\n• The relationship between Creator and creation\n\nApplication: Consider how this truth shapes your understanding of your own purpose and place in God's design. Every detail of creation reflects His intentional love and wisdom.`,
    matthew_henry: `Here we observe the wisdom of the Almighty displayed in every particular of His workmanship. The sacred historian records these events with a simplicity that befits the majesty of the subject. We are taught that nothing exists by chance, but all things proceed from the counsel of His will.\n\nLet the reader meditate upon the condescension of God, who has seen fit to reveal these matters to us, that we might know Him more truly and serve Him more faithfully.`,
    john_calvin: `We must first observe that Moses does not speak philosophically, but accommodates his discourse to the common understanding. The Lord has designed to instruct the unlearned, and therefore has used popular language.\n\nThe substance of the doctrine is that the world was not made of itself, nor of pre-existing matter, but was created by the sovereign will and power of God alone.`,
    albert_barnes: `The original term used here carries significant weight in the Hebrew. This passage has been the subject of extensive scholarly discussion regarding its precise meaning and implications.\n\nThe context surrounding this verse illuminates its significance within the broader narrative of Scripture, connecting themes that span from Genesis to Revelation.`,
    john_macarthur: `This is a straightforward declaration of divine truth. The plain reading of this text leaves no room for ambiguity. God's Word here establishes a foundational principle that undergirds all of Christian theology.\n\nPractical Application: Believers should take confidence in the clear teaching of Scripture and order their lives accordingly. This verse calls us to trust, obey, and worship the God who has made Himself known through His Word.`,
  };
  return { ref, text: commentaries[source] || commentaries.ai };
}
