import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { BIBLE_BOOKS, ALL_BOOKS, THEMES, COMMENTARY_SOURCES, getVerses as fetchVerses, searchVerses as searchBible, generateCommentary as genCommentary } from "./data/bible.js";
import { usePersisted } from "./utils/storage.js";

// ============================================================
// SACRED SCRIPTURE — Full Bible Study Application
// ============================================================

// Verses are now loaded from bundled KJV data or bible-api.com
// See src/data/bible.js for the data loading logic

// ---- LOCAL STORAGE HELPERS ----
function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(`sacred_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}
function saveToStorage(key, value) {
  try { localStorage.setItem(`sacred_${key}`, JSON.stringify(value)); } catch {}
}

// ---- ICONS (inline SVG components) ----
const Icon = ({ d, size = 20, className = "", stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const BookOpenIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const SearchIcon = ({ size, className }) => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={size} className={className} />;
const ChevronLeft = ({ size, className }) => <Icon d="M15 18l-6-6 6-6" size={size} className={className} />;
const ChevronRight = ({ size, className }) => <Icon d="M9 18l6-6-6-6" size={size} className={className} />;
const ChevronDown = ({ size, className }) => <Icon d="M6 9l6 6 6-6" size={size} className={className} />;
const PlusIcon = ({ size, className }) => <Icon d="M12 5v14M5 12h14" size={size} className={className} />;
const TrashIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const EditIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const XIcon = ({ size, className }) => <Icon d="M18 6L6 18M6 6l12 12" size={size} className={className} />;
const StarIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const CheckIcon = ({ size, className }) => <Icon d="M20 6L9 17l-5-5" size={size} className={className} />;
const CopyIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const MenuIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const HomeIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ClockIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const UsersIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const MicIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const SettingsIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const StickyNoteIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.5 3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V8.5L15.5 3z" /><polyline points="14 3 14 8 21 8" />
  </svg>
);
const SparklesIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);
const BookmarkIcon = ({ size, className }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

// THEMES, COMMENTARY_SOURCES imported from data/bible.js

// Commentary sources and generation are imported from data/bible.js

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function SacredScripture() {
  const [page, setPage] = useState("library");
  const [currentBook, setCurrentBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [theme, setTheme] = useState(() => loadFromStorage("theme", "light"));
  const [fontSize, setFontSize] = useState(() => loadFromStorage("fontSize", 18));
  const [lineHeight, setLineHeight] = useState(() => loadFromStorage("lineHeight", 1.8));
  const [fontFamily, setFontFamily] = useState(() => loadFromStorage("fontFamily", "serif"));
  const [notes, setNotes] = useState(() => loadFromStorage("notes", []));
  const [memoryVerses, setMemoryVerses] = useState(() => loadFromStorage("memoryVerses", []));
  const [studyPlans, setStudyPlans] = useState(() => loadFromStorage("studyPlans", []));
  const [bookmarks, setBookmarks] = useState(() => loadFromStorage("bookmarks", []));
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { saveToStorage("theme", theme); }, [theme]);
  useEffect(() => { saveToStorage("fontSize", fontSize); }, [fontSize]);
  useEffect(() => { saveToStorage("lineHeight", lineHeight); }, [lineHeight]);
  useEffect(() => { saveToStorage("fontFamily", fontFamily); }, [fontFamily]);
  useEffect(() => { saveToStorage("notes", notes); }, [notes]);
  useEffect(() => { saveToStorage("memoryVerses", memoryVerses); }, [memoryVerses]);
  useEffect(() => { saveToStorage("studyPlans", studyPlans); }, [studyPlans]);
  useEffect(() => { saveToStorage("bookmarks", bookmarks); }, [bookmarks]);

  const navigateTo = useCallback((book, chapter) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setPage("reader");
    window.scrollTo(0, 0);
  }, []);

  const t = THEMES[theme];

  const pageProps = {
    theme, setTheme, t, fontSize, setFontSize, lineHeight, setLineHeight,
    fontFamily, setFontFamily, currentBook, currentChapter, setCurrentBook,
    setCurrentChapter, navigateTo, setPage, notes, setNotes, memoryVerses,
    setMemoryVerses, studyPlans, setStudyPlans, bookmarks, setBookmarks,
    searchQuery, setSearchQuery,
  };

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: "all 0.3s ease" }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Navigation */}
      <nav style={{
        background: theme === "dark" ? "rgba(26,21,18,0.95)" : "rgba(255,251,245,0.95)",
        backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <button onClick={() => setPage("library")} style={{
            background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: t.text,
            fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.02em",
          }}>
            <span style={{ fontSize: 24 }}>✦</span>
            Sacred Scripture
          </button>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
            {[
              { id: "library", label: "Library", icon: <BookOpenIcon size={16} /> },
              { id: "search", label: "Search", icon: <SearchIcon size={16} /> },
              { id: "memory", label: "Memory", icon: <StarIcon size={16} /> },
              { id: "plans", label: "Plans", icon: <ClockIcon size={16} /> },
              { id: "community", label: "Community", icon: <UsersIcon size={16} /> },
              { id: "sermons", label: "Sermons", icon: <MicIcon size={16} /> },
            ].map(item => (
              <button key={item.id} onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                style={{
                  background: page === item.id ? (theme === "dark" ? "rgba(232,213,190,0.12)" : "rgba(139,115,85,0.1)") : "none",
                  border: "none", cursor: "pointer", color: page === item.id ? t.text : t.secondary,
                  padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn"
            style={{ background: "none", border: "none", cursor: "pointer", color: t.text, padding: 8 }}>
            {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{
            padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 2,
            borderTop: `1px solid ${t.border}`,
          }} className="mobile-menu">
            {[
              { id: "library", label: "Library", icon: <BookOpenIcon size={18} /> },
              { id: "search", label: "Search", icon: <SearchIcon size={18} /> },
              { id: "memory", label: "Memory Verses", icon: <StarIcon size={18} /> },
              { id: "plans", label: "Study Plans", icon: <ClockIcon size={18} /> },
              { id: "community", label: "Community", icon: <UsersIcon size={18} /> },
              { id: "sermons", label: "Sermons", icon: <MicIcon size={18} /> },
            ].map(item => (
              <button key={item.id} onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                style={{
                  background: page === item.id ? (theme === "dark" ? "rgba(232,213,190,0.1)" : "rgba(139,115,85,0.08)") : "none",
                  border: "none", cursor: "pointer", color: page === item.id ? t.text : t.secondary,
                  padding: "12px 16px", borderRadius: 8, fontSize: 15, fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 10,
                  textAlign: "left", width: "100%",
                }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 80px" }}>
        {page === "library" && <LibraryPage {...pageProps} />}
        {page === "reader" && <ReaderPage {...pageProps} />}
        {page === "search" && <SearchPage {...pageProps} />}
        {page === "memory" && <MemoryVersesPage {...pageProps} />}
        {page === "plans" && <StudyPlansPage {...pageProps} />}
        {page === "community" && <CommunityPage {...pageProps} />}
        {page === "sermons" && <SermonsPage {...pageProps} />}
      </main>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        .mobile-menu { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-menu { display: flex !important; }
        }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.85; }
        input:focus, textarea:focus, select:focus { outline: none; box-shadow: 0 0 0 2px rgba(180,140,80,0.3); }
        ::selection { background: rgba(180,140,80,0.3); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.3s ease forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,115,85,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ============================================================
// LIBRARY PAGE
// ============================================================
function LibraryPage({ t, theme, navigateTo, setPage }) {
  const [testament, setTestament] = useState("old");
  const [hoveredBook, setHoveredBook] = useState(null);

  const books = testament === "old" ? BIBLE_BOOKS.old : BIBLE_BOOKS.new;

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "40px 0 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600,
          margin: "0 0 12px", letterSpacing: "-0.01em", lineHeight: 1.1,
        }}>
          Sacred Scripture
        </h1>
        <p style={{
          fontFamily: "'Crimson Pro', serif", fontSize: 18, color: t.secondary,
          maxWidth: 500, margin: "0 auto", lineHeight: 1.6, fontStyle: "italic",
        }}>
          Your word is a lamp to my feet and a light to my path — Psalm 119:105
        </p>
      </div>

      {/* Quick Access Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 12, marginBottom: 40,
      }}>
        {[
          { label: "Search", icon: <SearchIcon size={20} />, page: "search", color: "#B48C50" },
          { label: "Memory", icon: <StarIcon size={20} />, page: "memory", color: "#C4956A" },
          { label: "Plans", icon: <ClockIcon size={20} />, page: "plans", color: "#8B7355" },
          { label: "Community", icon: <UsersIcon size={20} />, page: "community", color: "#A07850" },
          { label: "Sermons", icon: <MicIcon size={20} />, page: "sermons", color: "#9B7B5E" },
        ].map(card => (
          <button key={card.label} onClick={() => setPage(card.page)}
            style={{
              background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
              padding: "20px 16px", cursor: "pointer", color: t.text,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
              transition: "all 0.2s", textAlign: "center",
            }}>
            <div style={{ color: card.color }}>{card.icon}</div>
            {card.label}
          </button>
        ))}
      </div>

      {/* Testament Toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.surface, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["old", "new"].map(tab => (
          <button key={tab} onClick={() => setTestament(tab)}
            style={{
              background: testament === tab ? (theme === "dark" ? "#3D3028" : "#fff") : "transparent",
              border: "none", cursor: "pointer", padding: "10px 24px", borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
              color: testament === tab ? t.text : t.secondary,
              boxShadow: testament === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}>
            {tab === "old" ? "Old Testament" : "New Testament"}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8,
      }}>
        {books.map((book, idx) => (
          <button key={book.name} onClick={() => navigateTo(book.name, 1)}
            onMouseEnter={() => setHoveredBook(book.name)}
            onMouseLeave={() => setHoveredBook(null)}
            className="slide-up"
            style={{
              background: hoveredBook === book.name
                ? (theme === "dark" ? "rgba(232,213,190,0.08)" : "rgba(180,140,80,0.06)")
                : t.surface,
              border: `1px solid ${hoveredBook === book.name ? "rgba(180,140,80,0.3)" : t.border}`,
              borderRadius: 10, padding: "14px 16px", cursor: "pointer",
              textAlign: "left", color: t.text, transition: "all 0.2s",
              animationDelay: `${idx * 20}ms`,
            }}>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
              {book.name}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary }}>
              {book.chapters} chapters
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// READER PAGE
// ============================================================
function ReaderPage({
  t, theme, fontSize, setFontSize, lineHeight, setLineHeight, fontFamily, setFontFamily,
  currentBook, currentChapter, navigateTo, setPage, notes, setNotes,
  memoryVerses, setMemoryVerses, bookmarks, setBookmarks,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showCommentary, setShowCommentary] = useState(false);
  const [commentarySource, setCommentarySource] = useState("ai");
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

  const bookInfo = ALL_BOOKS.find(b => b.name === currentBook);
  const totalChapters = bookInfo ? bookInfo.chapters : 1;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchVerses(currentBook, currentChapter).then(v => {
      setVerses(v);
      setLoading(false);
    });
  }, [currentBook, currentChapter]);

  const chapterNotes = notes.filter(n => n.book === currentBook && n.chapter === currentChapter);

  const isBookmarked = bookmarks.some(b => b.book === currentBook && b.chapter === currentChapter);

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => !(b.book === currentBook && b.chapter === currentChapter)));
    } else {
      setBookmarks([...bookmarks, { book: currentBook, chapter: currentChapter, date: new Date().toISOString() }]);
    }
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      book: currentBook, chapter: currentChapter,
      verse: selectedVerse, content: noteText,
      date: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setNoteText("");
  };

  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));

  const updateNote = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content: noteText } : n));
    setEditingNoteId(null);
    setNoteText("");
  };

  const addToMemory = (verse) => {
    const exists = memoryVerses.some(m => m.book === currentBook && m.chapter === currentChapter && m.verse === verse.verse);
    if (exists) return;
    setMemoryVerses([...memoryVerses, {
      id: Date.now().toString(),
      book: currentBook, chapter: currentChapter, verse: verse.verse,
      text: verse.text, ease_factor: 2.5, interval: 1,
      next_review: new Date().toISOString(), review_count: 0,
      date_added: new Date().toISOString(),
    }]);
  };

  const ff = fontFamily === "serif" ? "'Crimson Pro', serif" : "'DM Sans', sans-serif";

  return (
    <div className="fade-in">
      {/* Chapter Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button onClick={() => setPage("library")}
            style={{
              background: "none", border: "none", cursor: "pointer", color: t.secondary,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 4,
              padding: "4px 0", marginBottom: 8,
            }}>
            <ChevronLeft size={14} /> Library
          </button>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
            margin: 0, letterSpacing: "-0.01em",
          }}>
            {currentBook} {currentChapter}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={toggleBookmark}
            style={{
              background: isBookmarked ? "rgba(180,140,80,0.15)" : t.surface,
              border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px",
              cursor: "pointer", color: isBookmarked ? "#B48C50" : t.secondary,
              display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
            <BookmarkIcon size={16} /> {isBookmarked ? "Saved" : "Bookmark"}
          </button>
          <button onClick={() => setShowNotes(!showNotes)}
            style={{
              background: showNotes ? "rgba(180,140,80,0.15)" : t.surface,
              border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px",
              cursor: "pointer", color: showNotes ? "#B48C50" : t.secondary,
              display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
            <StickyNoteIcon size={16} /> Notes {chapterNotes.length > 0 && `(${chapterNotes.length})`}
          </button>
          <button onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? "rgba(180,140,80,0.15)" : t.surface,
              border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px",
              cursor: "pointer", color: showSettings ? "#B48C50" : t.secondary,
            }}>
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: 20, marginBottom: 24,
        }}>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em", color: t.secondary }}>
            Reading Settings
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 8 }}>Theme</label>
              <div style={{ display: "flex", gap: 6 }}>
                {Object.entries(THEMES).map(([key, val]) => (
                  <button key={key} onClick={() => { saveToStorage("theme", key); window.location.reload(); }}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: `2px solid ${theme === key ? "#B48C50" : val.border}`,
                      background: val.bg, cursor: "pointer", position: "relative",
                    }}>
                    {theme === key && <CheckIcon size={14} className="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 8 }}>
                Font Size: {fontSize}px
              </label>
              <input type="range" min={14} max={28} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                style={{ width: "100%", accentColor: "#B48C50" }} />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 8 }}>
                Line Height: {lineHeight}
              </label>
              <input type="range" min={1.4} max={2.4} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)}
                style={{ width: "100%", accentColor: "#B48C50" }} />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 8 }}>Font Style</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ id: "serif", label: "Serif" }, { id: "sans", label: "Sans" }].map(f => (
                  <button key={f.id} onClick={() => setFontFamily(f.id)}
                    style={{
                      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                      background: fontFamily === f.id ? "rgba(180,140,80,0.15)" : "transparent",
                      border: `1px solid ${fontFamily === f.id ? "rgba(180,140,80,0.3)" : t.border}`,
                      color: t.text, fontFamily: f.id === "serif" ? "'Crimson Pro', serif" : "'DM Sans', sans-serif",
                      fontSize: 14,
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Verse Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1.5s infinite" }}>✦</div>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, color: t.secondary, fontStyle: "italic" }}>
                  Loading scripture...
                </p>
              </div>
            ) : (
            <>
            {verses.map((verse) => (
              <span key={verse.verse}
                onClick={() => { setSelectedVerse(verse.verse); setShowCommentary(true); }}
                style={{
                  cursor: "pointer", fontFamily: ff, fontSize, lineHeight,
                  transition: "background 0.2s",
                  borderRadius: 4, padding: "2px 0",
                  background: selectedVerse === verse.verse ? "rgba(180,140,80,0.12)" : "transparent",
                }}>
                <sup style={{
                  fontSize: fontSize * 0.6, fontWeight: 600, color: "#B48C50",
                  marginRight: 4, fontFamily: "'DM Sans', sans-serif",
                  verticalAlign: "super",
                }}>{verse.verse}</sup>
                {verse.text}{" "}
              </span>
            ))}
            </>
            )}
          </div>

          {/* Chapter Navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 48, paddingTop: 24, borderTop: `1px solid ${t.border}`,
          }}>
            <button
              onClick={() => currentChapter > 1 && navigateTo(currentBook, currentChapter - 1)}
              disabled={currentChapter <= 1}
              style={{
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                padding: "12px 20px", cursor: currentChapter > 1 ? "pointer" : "default",
                color: currentChapter > 1 ? t.text : t.secondary, opacity: currentChapter > 1 ? 1 : 0.4,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
              }}>
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Chapter selector */}
            <select value={currentChapter} onChange={e => navigateTo(currentBook, +e.target.value)}
              style={{
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
                padding: "8px 12px", color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                cursor: "pointer",
              }}>
              {Array.from({ length: totalChapters }, (_, i) => (
                <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
              ))}
            </select>

            <button
              onClick={() => currentChapter < totalChapters && navigateTo(currentBook, currentChapter + 1)}
              disabled={currentChapter >= totalChapters}
              style={{
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                padding: "12px 20px", cursor: currentChapter < totalChapters ? "pointer" : "default",
                color: currentChapter < totalChapters ? t.text : t.secondary,
                opacity: currentChapter < totalChapters ? 1 : 0.4,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
              }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Notes Sidebar */}
        {showNotes && (
          <div className="slide-up" style={{
            width: 320, flexShrink: 0, background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 12, padding: 20, position: "sticky", top: 80,
            maxHeight: "calc(100vh - 100px)", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", color: t.secondary }}>
                Notes
              </h3>
              <button onClick={() => setShowNotes(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary }}>
                <XIcon size={16} />
              </button>
            </div>

            {/* Add Note */}
            <div style={{ marginBottom: 16 }}>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note..."
                style={{
                  width: "100%", padding: 12, border: `1px solid ${t.border}`, borderRadius: 8,
                  background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 14,
                  resize: "vertical", minHeight: 80, lineHeight: 1.6,
                }} />
              <button onClick={editingNoteId ? () => updateNote(editingNoteId) : addNote}
                style={{
                  width: "100%", marginTop: 8, padding: "10px 16px", borderRadius: 8,
                  background: "#B48C50", color: "#fff", border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                }}>
                {editingNoteId ? "Update Note" : "Save Note"}
              </button>
            </div>

            {/* Notes List */}
            {chapterNotes.map(note => (
              <div key={note.id} style={{
                padding: 12, background: t.bg, borderRadius: 8, marginBottom: 8,
                border: `1px solid ${t.border}`,
              }}>
                {note.verse && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#B48C50", fontWeight: 600, marginBottom: 4 }}>
                    Verse {note.verse}
                  </div>
                )}
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, lineHeight: 1.6, margin: "0 0 8px" }}>
                  {note.content}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.secondary }}>
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setEditingNoteId(note.id); setNoteText(note.content); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, padding: 4 }}>
                      <EditIcon size={14} />
                    </button>
                    <button onClick={() => deleteNote(note.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, padding: 4 }}>
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {chapterNotes.length === 0 && (
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: t.secondary, fontStyle: "italic", textAlign: "center", padding: 20 }}>
                No notes for this chapter yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Commentary Modal */}
      {showCommentary && selectedVerse && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowCommentary(false)}>
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{
            background: t.bg, borderRadius: 16, padding: 28, maxWidth: 600, width: "100%",
            maxHeight: "80vh", overflowY: "auto", border: `1px solid ${t.border}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#B48C50", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  Commentary
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, margin: 0 }}>
                  {currentBook} {currentChapter}:{selectedVerse}
                </h2>
              </div>
              <button onClick={() => setShowCommentary(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, padding: 4 }}>
                <XIcon size={20} />
              </button>
            </div>

            {/* Verse Text */}
            <div style={{
              padding: 16, background: t.surface, borderRadius: 10, marginBottom: 20,
              borderLeft: "3px solid #B48C50",
            }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                {verses.find(v => v.verse === selectedVerse)?.text}
              </p>
            </div>

            {/* Source Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {COMMENTARY_SOURCES.map(src => (
                <button key={src.id} onClick={() => setCommentarySource(src.id)}
                  style={{
                    background: commentarySource === src.id ? "rgba(180,140,80,0.15)" : "transparent",
                    border: `1px solid ${commentarySource === src.id ? "rgba(180,140,80,0.3)" : t.border}`,
                    borderRadius: 8, padding: "8px 14px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.text,
                    whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <span>{src.icon}</span> {src.label}
                </button>
              ))}
            </div>

            {/* Commentary Content */}
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.8 }}>
              {genCommentary(currentBook, currentChapter, selectedVerse, commentarySource).text
                .split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <h4 key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, margin: "16px 0 8px" }}>{line.replace(/\*\*/g, "")}</h4>;
                  }
                  if (line.startsWith("- ")) {
                    return <p key={i} style={{ margin: "4px 0", paddingLeft: 16 }}>• {line.slice(2)}</p>;
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i} style={{ margin: "8px 0" }}>{line.replace(/\*\*/g, "")}</p>;
                })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
              <button onClick={() => {
                const v = verses.find(v => v.verse === selectedVerse);
                if (v) addToMemory(v);
              }}
                style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
                  padding: "8px 14px", cursor: "pointer", color: t.text,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                }}>
                <StarIcon size={14} /> Memorize
              </button>
              <button onClick={() => {
                setNoteText(genCommentary(currentBook, currentChapter, selectedVerse, commentarySource).text);
                setShowNotes(true);
                setShowCommentary(false);
              }}
                style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
                  padding: "8px 14px", cursor: "pointer", color: t.text,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                }}>
                <StickyNoteIcon size={14} /> Save as Note
              </button>
              <button onClick={() => navigator.clipboard?.writeText(verses.find(v => v.verse === selectedVerse)?.text || "")}
                style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
                  padding: "8px 14px", cursor: "pointer", color: t.text,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                }}>
                <CopyIcon size={14} /> Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SEARCH PAGE
// ============================================================
function SearchPage({ t, theme, navigateTo, searchQuery, setSearchQuery }) {
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearched(true);
    const found = await searchBible(searchQuery);
    setResults(found);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: "rgba(180,140,80,0.3)", color: "inherit", borderRadius: 2, padding: "0 2px" }}>{part}</mark>
        : part
    );
  };

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, margin: "0 0 24px" }}>
        Search Scripture
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search for words, phrases, or references..."
          style={{
            flex: 1, padding: "14px 18px", borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.surface, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 16,
          }} />
        <button onClick={handleSearch}
          style={{
            background: "#B48C50", color: "#fff", border: "none", borderRadius: 10,
            padding: "14px 24px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
          }}>
          <SearchIcon size={16} /> Search
        </button>
      </div>

      {/* Popular Searches */}
      {!searched && (
        <div>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: t.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Popular Passages
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "Genesis 1", book: "Genesis", chapter: 1 },
              { label: "Psalm 23", book: "Psalms", chapter: 23 },
              { label: "John 3:16", book: "John", chapter: 3 },
              { label: "Romans 8", book: "Romans", chapter: 8 },
              { label: "Matthew 5", book: "Matthew", chapter: 5 },
              { label: "Proverbs 3", book: "Proverbs", chapter: 3 },
            ].map(p => (
              <button key={p.label} onClick={() => navigateTo(p.book, p.chapter)}
                style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20,
                  padding: "8px 16px", cursor: "pointer", color: t.text,
                  fontFamily: "'Crimson Pro', serif", fontSize: 14,
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.secondary, marginBottom: 16 }}>
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          {results.map((r, i) => (
            <button key={i} onClick={() => navigateTo(r.book, r.chapter)}
              className="slide-up"
              style={{
                display: "block", width: "100%", textAlign: "left", background: t.surface,
                border: `1px solid ${t.border}`, borderRadius: 10, padding: 16, marginBottom: 8,
                cursor: "pointer", color: t.text, animationDelay: `${i * 50}ms`,
              }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#B48C50", marginBottom: 6 }}>
                {r.book} {r.chapter}:{r.verse}
              </div>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                {highlightText(r.text, searchQuery)}
              </p>
            </button>
          ))}
          {results.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: t.secondary }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, fontStyle: "italic" }}>
                No results found. Try a different search term.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginTop: 8 }}>
                Tip: Run "npm run fetch-bible" to download the complete ASV for full-text search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MEMORY VERSES PAGE
// ============================================================
function MemoryVersesPage({ t, theme, memoryVerses, setMemoryVerses, navigateTo }) {
  const [reviewMode, setReviewMode] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newRef, setNewRef] = useState({ book: "Genesis", chapter: 1, verse: 1 });

  const dueForReview = memoryVerses.filter(v => new Date(v.next_review) <= new Date());

  const handleReview = (quality) => {
    // SM-2 algorithm
    const verse = dueForReview[currentReview];
    let { ease_factor, interval, review_count } = verse;
    if (quality >= 3) {
      if (review_count === 0) interval = 1;
      else if (review_count === 1) interval = 6;
      else interval = Math.round(interval * ease_factor);
      ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      interval = 1;
    }
    if (ease_factor < 1.3) ease_factor = 1.3;
    const next = new Date();
    next.setDate(next.getDate() + interval);

    setMemoryVerses(memoryVerses.map(v =>
      v.id === verse.id ? { ...v, ease_factor, interval, next_review: next.toISOString(), review_count: review_count + 1 } : v
    ));
    setShowAnswer(false);
    if (currentReview < dueForReview.length - 1) {
      setCurrentReview(currentReview + 1);
    } else {
      setReviewMode(false);
      setCurrentReview(0);
    }
  };

  const addVerse = async () => {
    const verseData = await fetchVerses(newRef.book, newRef.chapter);
    const v = verseData.find(vv => vv.verse === newRef.verse) || verseData[0];
    if (!v) return;
    const exists = memoryVerses.some(m => m.book === newRef.book && m.chapter === newRef.chapter && m.verse === v.verse);
    if (exists) return;
    setMemoryVerses([...memoryVerses, {
      id: Date.now().toString(), book: newRef.book, chapter: newRef.chapter,
      verse: v.verse, text: v.text, ease_factor: 2.5, interval: 1,
      next_review: new Date().toISOString(), review_count: 0,
      date_added: new Date().toISOString(),
    }]);
    setAddMode(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, margin: "0 0 4px" }}>
            Memory Verses
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.secondary, margin: 0 }}>
            {memoryVerses.length} verses · {dueForReview.length} due for review
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {dueForReview.length > 0 && !reviewMode && (
            <button onClick={() => { setReviewMode(true); setCurrentReview(0); setShowAnswer(false); }}
              style={{
                background: "#B48C50", color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 500,
              }}>
              Review ({dueForReview.length})
            </button>
          )}
          <button onClick={() => setAddMode(!addMode)}
            style={{
              background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
              padding: "10px 16px", cursor: "pointer", color: t.text,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              display: "flex", alignItems: "center", gap: 6,
            }}>
            <PlusIcon size={16} /> Add
          </button>
        </div>
      </div>

      {/* Add Verse Modal */}
      {addMode && (
        <div className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 4 }}>Book</label>
              <select value={newRef.book} onChange={e => setNewRef({ ...newRef, book: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                {ALL_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ width: 80 }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 4 }}>Chapter</label>
              <input type="number" min={1} value={newRef.chapter} onChange={e => setNewRef({ ...newRef, chapter: +e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
            </div>
            <div style={{ width: 80 }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, display: "block", marginBottom: 4 }}>Verse</label>
              <input type="number" min={1} value={newRef.verse} onChange={e => setNewRef({ ...newRef, verse: +e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
            </div>
            <button onClick={addVerse} style={{
              background: "#B48C50", color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
            }}>Add Verse</button>
          </div>
        </div>
      )}

      {/* Review Mode */}
      {reviewMode && dueForReview.length > 0 && (
        <div className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16,
          padding: 32, textAlign: "center", marginBottom: 32,
        }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#B48C50", fontWeight: 600, marginBottom: 8 }}>
            {currentReview + 1} of {dueForReview.length}
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, margin: "0 0 16px" }}>
            {dueForReview[currentReview].book} {dueForReview[currentReview].chapter}:{dueForReview[currentReview].verse}
          </h3>

          {showAnswer ? (
            <>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontSize: 20, lineHeight: 1.7,
                fontStyle: "italic", maxWidth: 500, margin: "0 auto 24px",
              }}>
                "{dueForReview[currentReview].text}"
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                {[
                  { label: "Hard", quality: 2, color: "#C77C5A" },
                  { label: "Good", quality: 4, color: "#B48C50" },
                  { label: "Easy", quality: 5, color: "#7A9B6D" },
                ].map(btn => (
                  <button key={btn.label} onClick={() => handleReview(btn.quality)}
                    style={{
                      background: btn.color, color: "#fff", border: "none", borderRadius: 10,
                      padding: "12px 28px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14, fontWeight: 500,
                    }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button onClick={() => setShowAnswer(true)}
              style={{
                background: "#B48C50", color: "#fff", border: "none", borderRadius: 10,
                padding: "14px 40px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 500,
              }}>
              Show Verse
            </button>
          )}
        </div>
      )}

      {/* Verse List */}
      {memoryVerses.map((v, i) => (
        <div key={v.id} className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
          padding: 16, marginBottom: 8, animationDelay: `${i * 30}ms`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#B48C50", marginBottom: 6 }}>
                {v.book} {v.chapter}:{v.verse}
              </div>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.6, margin: "0 0 8px" }}>
                {v.text}
              </p>
              <div style={{ display: "flex", gap: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.secondary }}>
                <span>Reviews: {v.review_count}</span>
                <span>Interval: {v.interval}d</span>
                <span>Next: {new Date(v.next_review).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={() => setMemoryVerses(memoryVerses.filter(m => m.id !== v.id))}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, padding: 4 }}>
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
      ))}

      {memoryVerses.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: t.secondary }}>
          <StarIcon size={40} className="" />
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 18, fontStyle: "italic", marginTop: 16 }}>
            No memory verses yet. Add your first verse to begin memorizing.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDY PLANS PAGE
// ============================================================
function StudyPlansPage({ t, theme, studyPlans, setStudyPlans, navigateTo }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: "", description: "", readings: [] });
  const [newReading, setNewReading] = useState({ book: "Genesis", chapter: 1 });

  const createPlan = () => {
    if (!newPlan.title.trim()) return;
    setStudyPlans([...studyPlans, {
      id: Date.now().toString(), ...newPlan,
      status: "active", created: new Date().toISOString(),
      readings: newPlan.readings.map(r => ({ ...r, completed: false })),
    }]);
    setNewPlan({ title: "", description: "", readings: [] });
    setShowCreate(false);
  };

  const toggleReading = (planId, readingIdx) => {
    setStudyPlans(studyPlans.map(p => {
      if (p.id !== planId) return p;
      const readings = p.readings.map((r, i) => i === readingIdx ? { ...r, completed: !r.completed } : r);
      const allDone = readings.every(r => r.completed);
      return { ...p, readings, status: allDone ? "completed" : "active" };
    }));
  };

  const deletePlan = (id) => setStudyPlans(studyPlans.filter(p => p.id !== id));

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, margin: 0 }}>
          Study Plans
        </h1>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{
            background: "#B48C50", color: "#fff", border: "none", borderRadius: 10,
            padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
          }}>
          <PlusIcon size={16} /> New Plan
        </button>
      </div>

      {/* Create Plan */}
      {showCreate && (
        <div className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: 20, marginBottom: 24,
        }}>
          <input value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })}
            placeholder="Plan title..."
            style={{
              width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`,
              background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 16, marginBottom: 8,
            }} />
          <textarea value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
            placeholder="Description..."
            style={{
              width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`,
              background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 14,
              resize: "vertical", minHeight: 60, marginBottom: 12,
            }} />

          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Readings ({newPlan.readings.length})
          </div>
          {newPlan.readings.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, padding: "6px 12px", background: t.bg, borderRadius: 8, fontSize: 14, fontFamily: "'Crimson Pro', serif" }}>
              <span style={{ flex: 1 }}>{r.book} {r.chapter}</span>
              <button onClick={() => setNewPlan({ ...newPlan, readings: newPlan.readings.filter((_, j) => j !== i) })}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary }}>
                <XIcon size={14} />
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <select value={newReading.book} onChange={e => setNewReading({ ...newReading, book: e.target.value })}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              {ALL_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <input type="number" min={1} value={newReading.chapter} onChange={e => setNewReading({ ...newReading, chapter: +e.target.value })}
              style={{ width: 70, padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
            <button onClick={() => setNewPlan({ ...newPlan, readings: [...newPlan.readings, { ...newReading }] })}
              style={{ background: "rgba(180,140,80,0.15)", border: `1px solid rgba(180,140,80,0.3)`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "#B48C50", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              Add
            </button>
          </div>

          <button onClick={createPlan} disabled={!newPlan.title.trim() || newPlan.readings.length === 0}
            style={{
              width: "100%", marginTop: 16, padding: "12px 20px", borderRadius: 10,
              background: newPlan.title.trim() && newPlan.readings.length > 0 ? "#B48C50" : t.border,
              color: "#fff", border: "none", cursor: newPlan.title.trim() && newPlan.readings.length > 0 ? "pointer" : "default",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
            }}>
            Create Plan
          </button>
        </div>
      )}

      {/* Plans List */}
      {studyPlans.map((plan, idx) => {
        const completed = plan.readings.filter(r => r.completed).length;
        const progress = plan.readings.length > 0 ? (completed / plan.readings.length) * 100 : 0;
        return (
          <div key={plan.id} className="slide-up" style={{
            background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
            padding: 20, marginBottom: 12, animationDelay: `${idx * 40}ms`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>
                  {plan.title}
                </h3>
                {plan.description && (
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: t.secondary, margin: 0 }}>
                    {plan.description}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
                  padding: "4px 10px", borderRadius: 20,
                  background: plan.status === "completed" ? "rgba(122,155,109,0.15)" : "rgba(180,140,80,0.15)",
                  color: plan.status === "completed" ? "#7A9B6D" : "#B48C50",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {plan.status}
                </span>
                <button onClick={() => deletePlan(plan.id)} style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, padding: 4 }}>
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 4, background: t.border, borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#B48C50", borderRadius: 2, width: `${progress}%`, transition: "width 0.3s" }} />
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.secondary, marginBottom: 12 }}>
              {completed} of {plan.readings.length} completed
            </div>

            {/* Readings */}
            {plan.readings.map((r, i) => (
              <button key={i} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "8px 12px", borderRadius: 8, border: "none",
                background: r.completed ? "rgba(122,155,109,0.08)" : "transparent",
                cursor: "pointer", color: t.text, textAlign: "left", marginBottom: 2,
              }}
                onClick={() => toggleReading(plan.id, i)}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${r.completed ? "#7A9B6D" : t.border}`,
                  background: r.completed ? "#7A9B6D" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {r.completed && <CheckIcon size={12} className="" style={{ color: "#fff" }} />}
                </div>
                <span style={{
                  fontFamily: "'Crimson Pro', serif", fontSize: 14,
                  textDecoration: r.completed ? "line-through" : "none",
                  color: r.completed ? t.secondary : t.text,
                }}
                  onClick={(e) => { e.stopPropagation(); navigateTo(r.book, r.chapter); }}>
                  {r.book} {r.chapter}
                </span>
              </button>
            ))}
          </div>
        );
      })}

      {studyPlans.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: t.secondary }}>
          <ClockIcon size={40} />
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 18, fontStyle: "italic", marginTop: 16 }}>
            No study plans yet. Create your first plan to start your journey.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMMUNITY PAGE
// ============================================================
function CommunityPage({ t, theme }) {
  const [groups, setGroups] = useState(() => loadFromStorage("studyGroups", [
    {
      id: "1", name: "Morning Devotions", description: "Daily morning scripture study and prayer",
      members: ["You", "Sarah M.", "David K."], invite_code: "MORN2024", is_public: true,
      discussions: [
        { id: "d1", author: "Sarah M.", content: "Today's reading was so encouraging! Psalm 23 never gets old.", date: "2025-02-04T09:30:00Z" },
        { id: "d2", author: "David K.", content: "Agreed! The shepherd metaphor is so powerful.", date: "2025-02-04T10:15:00Z" },
      ],
    },
    {
      id: "2", name: "Deep Dive Theology", description: "Weekly exploration of theological concepts",
      members: ["You", "Pastor James", "Rachel T.", "Mark L."], invite_code: "DEEP2024", is_public: false,
      discussions: [],
    },
  ]));
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", is_public: true });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => { saveToStorage("studyGroups", groups); }, [groups]);

  const createGroup = () => {
    if (!newGroup.name.trim()) return;
    const group = {
      id: Date.now().toString(), ...newGroup,
      members: ["You"], invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      discussions: [],
    };
    setGroups([...groups, group]);
    setNewGroup({ name: "", description: "", is_public: true });
    setShowCreate(false);
  };

  const postMessage = (groupId) => {
    if (!newMessage.trim()) return;
    setGroups(groups.map(g => g.id === groupId ? {
      ...g, discussions: [...g.discussions, {
        id: Date.now().toString(), author: "You",
        content: newMessage, date: new Date().toISOString(),
      }],
    } : g));
    setNewMessage("");
  };

  const activeGroup = groups.find(g => g.id === selectedGroup);

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, margin: 0 }}>
          Community
        </h1>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{
            background: "#B48C50", color: "#fff", border: "none", borderRadius: 10,
            padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
          }}>
          <PlusIcon size={16} /> New Group
        </button>
      </div>

      {showCreate && (
        <div className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: 20, marginBottom: 24,
        }}>
          <input value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder="Group name..."
            style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 16, marginBottom: 8 }} />
          <textarea value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
            placeholder="Description..."
            style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 14, resize: "vertical", minHeight: 60, marginBottom: 12 }} />
          <button onClick={createGroup} style={{
            width: "100%", padding: "12px 20px", borderRadius: 10, background: "#B48C50",
            color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          }}>Create Group</button>
        </div>
      )}

      {/* Group Detail View */}
      {activeGroup ? (
        <div className="slide-up">
          <button onClick={() => setSelectedGroup(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
            <ChevronLeft size={14} /> Back to Groups
          </button>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, margin: "0 0 4px" }}>{activeGroup.name}</h2>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: t.secondary, margin: "0 0 12px" }}>{activeGroup.description}</p>
            <div style={{ display: "flex", gap: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary }}>
              <span>{activeGroup.members.length} members</span>
              <span>Code: {activeGroup.invite_code}</span>
            </div>
          </div>

          {/* Discussions */}
          <div style={{ marginBottom: 16 }}>
            {activeGroup.discussions.map(d => (
              <div key={d.id} style={{ padding: 14, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#B48C50" }}>{d.author}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: t.secondary }}>{new Date(d.date).toLocaleString()}</span>
                </div>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{d.content}</p>
              </div>
            ))}
          </div>

          {/* Post Message */}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && postMessage(activeGroup.id)}
              placeholder="Share your thoughts..."
              style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 14 }} />
            <button onClick={() => postMessage(activeGroup.id)}
              style={{ background: "#B48C50", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>
              Post
            </button>
          </div>
        </div>
      ) : (
        /* Groups List */
        groups.map((g, i) => (
          <button key={g.id} onClick={() => setSelectedGroup(g.id)} className="slide-up"
            style={{
              display: "block", width: "100%", textAlign: "left", background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 8,
              cursor: "pointer", color: t.text, animationDelay: `${i * 40}ms`,
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>{g.name}</h3>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: t.secondary, margin: 0 }}>{g.description}</p>
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: "4px 10px", borderRadius: 20,
                background: g.is_public ? "rgba(122,155,109,0.15)" : "rgba(180,140,80,0.15)",
                color: g.is_public ? "#7A9B6D" : "#B48C50", fontWeight: 600,
              }}>{g.is_public ? "Public" : "Private"}</div>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, marginTop: 8 }}>
              {g.members.length} members · {g.discussions.length} discussions
            </div>
          </button>
        ))
      )}
    </div>
  );
}

// ============================================================
// SERMONS PAGE
// ============================================================
function SermonsPage({ t, theme }) {
  const [sermons, setSermons] = useState(() => loadFromStorage("sermons", [
    {
      id: "1", title: "Walking in Faith", speaker: "Pastor James Williams",
      date: "2025-02-02", book: "Hebrews", chapter: 11, verses: "1-6",
      transcript: "Faith is the substance of things hoped for, the evidence of things not seen. Today we explore what it means to truly walk by faith and not by sight...",
      summary: "An exploration of Hebrews 11, focusing on the practical aspects of living by faith in daily life. Key emphasis on trusting God's promises even when circumstances seem contrary.",
      key_points: ["Faith requires action, not just belief", "Biblical heroes faced real struggles", "God honors persistent faith", "Faith grows through testing"],
    },
  ]));
  const [showCreate, setShowCreate] = useState(false);
  const [newSermon, setNewSermon] = useState({ title: "", speaker: "", book: "Genesis", chapter: 1, verses: "", transcript: "" });
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { saveToStorage("sermons", sermons); }, [sermons]);

  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const saveSermon = () => {
    if (!newSermon.title.trim()) return;
    const sermon = {
      id: Date.now().toString(), ...newSermon,
      date: new Date().toISOString().slice(0, 10),
      summary: `Summary of "${newSermon.title}" — This sermon explores the themes found in ${newSermon.book} ${newSermon.chapter}${newSermon.verses ? ":" + newSermon.verses : ""}. ${newSermon.transcript.slice(0, 100)}...`,
      key_points: ["Main theological theme", "Practical application", "Call to action"],
    };
    setSermons([...sermons, sermon]);
    setNewSermon({ title: "", speaker: "", book: "Genesis", chapter: 1, verses: "", transcript: "" });
    setShowCreate(false);
    setRecordingTime(0);
  };

  const activeSermon = sermons.find(s => s.id === selectedSermon);

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, margin: 0 }}>
          Sermons
        </h1>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{
            background: "#B48C50", color: "#fff", border: "none", borderRadius: 10,
            padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
          }}>
          <PlusIcon size={16} /> Record
        </button>
      </div>

      {showCreate && (
        <div className="slide-up" style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: 20, marginBottom: 24,
        }}>
          <input value={newSermon.title} onChange={e => setNewSermon({ ...newSermon, title: e.target.value })}
            placeholder="Sermon title..."
            style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 16, marginBottom: 8 }} />
          <input value={newSermon.speaker} onChange={e => setNewSermon({ ...newSermon, speaker: e.target.value })}
            placeholder="Speaker name..."
            style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 8 }} />

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <select value={newSermon.book} onChange={e => setNewSermon({ ...newSermon, book: e.target.value })}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              {ALL_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <input type="number" min={1} value={newSermon.chapter} onChange={e => setNewSermon({ ...newSermon, chapter: +e.target.value })}
              placeholder="Ch"
              style={{ width: 70, padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
            <input value={newSermon.verses} onChange={e => setNewSermon({ ...newSermon, verses: e.target.value })}
              placeholder="Verses"
              style={{ width: 100, padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
          </div>

          {/* Recording UI */}
          <div style={{
            background: t.bg, borderRadius: 10, padding: 20, textAlign: "center",
            marginBottom: 12, border: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
              background: isRecording ? "rgba(220,80,80,0.15)" : "rgba(180,140,80,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", border: `2px solid ${isRecording ? "#DC5050" : "#B48C50"}`,
              animation: isRecording ? "pulse 1.5s infinite" : "none",
            }} onClick={toggleRecording}>
              <MicIcon size={24} className="" style={{ color: isRecording ? "#DC5050" : "#B48C50" }} />
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 600, color: isRecording ? "#DC5050" : t.text }}>
              {formatTime(recordingTime)}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: t.secondary, marginTop: 4 }}>
              {isRecording ? "Recording..." : "Tap to record"}
            </div>
          </div>

          <textarea value={newSermon.transcript} onChange={e => setNewSermon({ ...newSermon, transcript: e.target.value })}
            placeholder="Sermon notes / transcript..."
            style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontFamily: "'Crimson Pro', serif", fontSize: 14, resize: "vertical", minHeight: 100, marginBottom: 12 }} />

          <button onClick={saveSermon} style={{
            width: "100%", padding: "12px 20px", borderRadius: 10, background: "#B48C50",
            color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          }}>Save Sermon</button>
        </div>
      )}

      {/* Sermon Detail */}
      {activeSermon ? (
        <div className="slide-up">
          <button onClick={() => setSelectedSermon(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: t.secondary, fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
            <ChevronLeft size={14} /> Back
          </button>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#B48C50", fontWeight: 600, marginBottom: 4 }}>
              {activeSermon.book} {activeSermon.chapter}{activeSermon.verses ? ":" + activeSermon.verses : ""}
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 4px" }}>
              {activeSermon.title}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.secondary, margin: "0 0 20px" }}>
              {activeSermon.speaker} · {activeSermon.date}
            </p>

            {activeSermon.summary && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: t.secondary, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Summary</h4>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{activeSermon.summary}</p>
              </div>
            )}

            {activeSermon.key_points && activeSermon.key_points.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: t.secondary, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Key Points</h4>
                {activeSermon.key_points.map((point, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ color: "#B48C50", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                    <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.6 }}>{point}</span>
                  </div>
                ))}
              </div>
            )}

            {activeSermon.transcript && (
              <div>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: t.secondary, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Notes / Transcript</h4>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{activeSermon.transcript}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sermon List */
        sermons.map((s, i) => (
          <button key={s.id} onClick={() => setSelectedSermon(s.id)} className="slide-up"
            style={{
              display: "block", width: "100%", textAlign: "left", background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 8,
              cursor: "pointer", color: t.text, animationDelay: `${i * 40}ms`,
            }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#B48C50", fontWeight: 600, marginBottom: 4 }}>
              {s.book} {s.chapter}{s.verses ? ":" + s.verses : ""}
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>{s.title}</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.secondary, margin: 0 }}>
              {s.speaker} · {s.date}
            </p>
          </button>
        ))
      )}

      {sermons.length === 0 && !showCreate && (
        <div style={{ textAlign: "center", padding: 60, color: t.secondary }}>
          <MicIcon size={40} />
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 18, fontStyle: "italic", marginTop: 16 }}>
            No sermons recorded yet. Start recording to capture and study sermons.
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
