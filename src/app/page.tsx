"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import birthdayData from "@/data/birthdays.json";

const data = birthdayData as Record<string, Fact[]>;

interface Fact {
  type: "person" | "event" | "music" | "movie";
  title: string;
  year: number;
  description: string;
  wikipediaSlug: string | null;
  spotifyTrackId: string | null;
  youtubeId: string | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOODLE_CHARS = "·✦·○·◇·✧·△·".split("");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- SVG Icons ----------
function BadgeIcon({ type }: { type: string }) {
  const props = { width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor" };
  switch (type) {
    case "person":
      return <svg {...props}><circle cx="8" cy="5" r="3" strokeWidth="1.4" /><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeWidth="1.4" /></svg>;
    case "event":
      return <svg {...props}><circle cx="8" cy="8" r="6" strokeWidth="1.4" /><path d="M8 2v3M8 11v3M2 8h3M11 8h3" strokeWidth="1.2" /></svg>;
    case "music":
      return <svg {...props}><path d="M6 13V4l8-2v9" strokeWidth="1.4" /><circle cx="4" cy="13" r="2" strokeWidth="1.4" /><circle cx="12" cy="11" r="2" strokeWidth="1.4" /></svg>;
    case "movie":
      return <svg {...props}><rect x="1" y="3" width="14" height="10" rx="1" strokeWidth="1.4" /><path d="M6 6l5 3-5 3V6z" strokeWidth="1.2" fill="currentColor" opacity="0.4" /></svg>;
    default:
      return null;
  }
}

// ---------- Custom Doodle Select ----------
function DoodleSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className={`doodle-select ${open ? "open" : ""}`} ref={ref}>
      <button
        type="button"
        className="doodle-select-trigger"
        onClick={() => setOpen(!open)}
        aria-label={placeholder}
      >
        <span className={value ? "" : "placeholder"}>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="doodle-select-arrow">
          <path d="M5 8 L10 13 L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="doodle-select-dropdown"
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`doodle-select-option ${opt.value === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Floating Runes ----------
function FloatingRunes() {
  const [runes, setRunes] = useState<{ id: number; char: string; left: number; size: number; dur: number; delay: number }[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      char: DOODLE_CHARS[Math.floor(Math.random() * DOODLE_CHARS.length)],
      left: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 20 + Math.random() * 25,
      delay: Math.random() * 15,
    }));
    setRunes(initial);
  }, []);

  return (
    <div className="rune-field">
      {runes.map((r) => (
        <span
          key={r.id}
          className="rune-float"
          style={{
            left: `${r.left}%`,
            fontSize: `${r.size}rem`,
            animationDuration: `${r.dur}s`,
            animationDelay: `${r.delay}s`,
          }}
        >
          {r.char}
        </span>
      ))}
    </div>
  );
}

// ---------- Wiki Image Fetcher ----------
function WikiImage({ slug, title }: { slug: string; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [extract, setExtract] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.thumbnail?.source) setSrc(d.thumbnail.source);
        if (d.extract) {
          const text = d.extract.length > 160 ? d.extract.slice(0, 157) + "..." : d.extract;
          setExtract(text);
        }
      })
      .catch(() => {});
  }, [slug]);

  return (
    <>
      {src ? (
        <div className="card-image">
          <img src={src} alt={title} loading="lazy" />
        </div>
      ) : (
        <div className="card-image placeholder">ᚨ</div>
      )}
      {extract && <p className="card-wiki-extract">{extract}</p>}
    </>
  );
}

// ---------- Card Component ----------
function FactCard({ fact, index }: { fact: Fact; index: number }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className={`card-accent ${fact.type}`} />
      <div className="card-body">
        <div className="card-top-row">
          <div className={`card-badge ${fact.type}`}>
            <BadgeIcon type={fact.type} />
            {fact.type}
          </div>
          <span className="card-year">{fact.year}</span>
        </div>
        <div className="card-title">{fact.title}</div>
        <p className="card-desc">{fact.description}</p>
        {fact.wikipediaSlug && (
          <a
            className="card-link"
            href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more →
          </a>
        )}
      </div>

      {(fact.type === "person" || fact.type === "event") && fact.wikipediaSlug && (
        <WikiImage slug={fact.wikipediaSlug} title={fact.title} />
      )}
    </motion.div>
  );
}

// ---------- Main Page ----------
export default function Home() {
  const [view, setView] = useState<"landing" | "cards">("landing");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [filter, setFilter] = useState("all");
  const [facts, setFacts] = useState<Fact[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [scrollIdx, setScrollIdx] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("date");
    if (d && /^\d{2}-\d{2}$/.test(d)) {
      const parts = d.split("-");
      setMonth(parts[0]);
      setDay(parts[1]);
      navigateToDate(d);
    }
  }, []);

  const navigateToDate = useCallback((key: string) => {
    setDateKey(key);
    setFacts(shuffle(data[key] || []));
    setFilter("all");
    setView("cards");
    setScrollIdx(0);
    const url = new URL(window.location.href);
    url.searchParams.set("date", key);
    history.pushState(null, "", url);
  }, []);

  const goBack = useCallback(() => {
    setView("landing");
    const url = new URL(window.location.href);
    url.searchParams.delete("date");
    history.pushState(null, "", url);
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? facts : facts.filter((f) => f.type === filter)),
    [facts, filter]
  );

  const headerDateStr = useMemo(() => {
    if (!dateKey) return "";
    const [m, d] = dateKey.split("-");
    return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
  }, [dateKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (month && day) navigateToDate(`${month}-${day}`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?date=${dateKey}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link copied!");
    });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  // Scroll counter
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || filtered.length <= 1) return;
    const onScroll = () => {
      const isMobile = window.innerWidth <= 640;
      const pos = isMobile ? deck.scrollTop : deck.scrollLeft;
      const cards = deck.querySelectorAll(".card");
      if (!cards.length) return;
      const size = isMobile ? (cards[0] as HTMLElement).offsetHeight : (cards[0] as HTMLElement).offsetWidth;
      const gap = isMobile ? 16 : 24;
      const idx = Math.round(pos / (size + gap));
      setScrollIdx(Math.max(0, Math.min(idx, filtered.length - 1)));
    };
    deck.addEventListener("scroll", onScroll, { passive: true });
    return () => deck.removeEventListener("scroll", onScroll);
  }, [filtered.length, view]);

  // Popstate
  useEffect(() => {
    const handler = () => {
      const p = new URLSearchParams(window.location.search);
      const d = p.get("date");
      if (d && /^\d{2}-\d{2}$/.test(d)) {
        navigateToDate(d);
      } else {
        setView("landing");
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [navigateToDate]);

  const filters = [
    { key: "all", label: "All Tales" },
    { key: "person", label: "People" },
    { key: "event", label: "Events" },
    { key: "music", label: "Music" },
    { key: "movie", label: "Movies" },
  ];

  return (
    <>
      <FloatingRunes />

      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            className="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="landing-bg-glow" />

            {/* Coffee ring stains */}
            <motion.div
              className="coffee-ring coffee-ring-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.06 }}
              transition={{ delay: 1.2, duration: 1.5 }}
            />
            <motion.div
              className="coffee-ring coffee-ring-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.04 }}
              transition={{ delay: 1.8, duration: 1.5 }}
            />

            {/* Subtle compass rose background */}
            <motion.div
              className="occult-circle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.04, scale: 1 }}
              transition={{ delay: 0.1, duration: 2, ease: "easeOut" }}
            >
              <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
                <circle cx="250" cy="250" r="200" stroke="#b0a090" strokeWidth="0.8" />
                <circle cx="250" cy="250" r="160" stroke="#b0a090" strokeWidth="0.5" strokeDasharray="4 8" />
                <circle cx="250" cy="250" r="100" stroke="#b0a090" strokeWidth="0.6" />
                {/* Compass points */}
                <line x1="250" y1="45" x2="250" y2="455" stroke="#b0a090" strokeWidth="0.4" />
                <line x1="45" y1="250" x2="455" y2="250" stroke="#b0a090" strokeWidth="0.4" />
                <line x1="105" y1="105" x2="395" y2="395" stroke="#b0a090" strokeWidth="0.3" />
                <line x1="395" y1="105" x2="105" y2="395" stroke="#b0a090" strokeWidth="0.3" />
              </svg>
            </motion.div>

            <motion.div
              className="landing-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              ~ what happened on your birthday? ~
            </motion.div>

            <motion.h1
              className="landing-title"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Nornlore
            </motion.h1>

            <motion.p
              className="landing-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
            >
              Discover the history woven into your birthday
            </motion.p>

            {/* Elegant ornamental divider */}
            <motion.svg
              className="hand-divider"
              viewBox="0 0 320 24"
              fill="none"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.3, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <line x1="0" y1="12" x2="140" y2="12" stroke="#b0a090" strokeWidth="0.8" />
              <circle cx="160" cy="12" r="4" stroke="#b0a090" strokeWidth="0.8" fill="none" />
              <circle cx="160" cy="12" r="1.5" fill="#c05a3c" opacity="0.5" />
              <line x1="180" y1="12" x2="320" y2="12" stroke="#b0a090" strokeWidth="0.8" />
            </motion.svg>

            <motion.form
              className="date-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <div className="form-frame">
                {/* Corner flourishes */}
                {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                  <svg key={pos} className={`form-corner ${pos}`} width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d={pos === "tl" ? "M2 14 Q2 2 14 2" : pos === "tr" ? "M4 2 Q16 2 16 14" : pos === "bl" ? "M2 4 Q2 16 14 16" : "M4 16 Q16 16 16 4"}
                      stroke="#b0a090" strokeWidth="1" fill="none"
                    />
                  </svg>
                ))}
                <div className="date-inputs">
                  <DoodleSelect
                    value={month}
                    onChange={setMonth}
                    placeholder="Month"
                    options={MONTHS.map((m, i) => ({
                      value: String(i + 1).padStart(2, "0"),
                      label: m,
                    }))}
                  />
                  <span className="date-separator">·</span>
                  <DoodleSelect
                    value={day}
                    onChange={setDay}
                    placeholder="Day"
                    options={Array.from({ length: 31 }, (_, i) => ({
                      value: String(i + 1).padStart(2, "0"),
                      label: String(i + 1),
                    }))}
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                className="reveal-btn"
                disabled={!month || !day}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Show me! →
              </motion.button>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="app-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.header
              className="app-header"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="back-btn" onClick={goBack}>
                ← New Date
              </button>
              <span className="header-date">{headerDateStr}</span>
              <button className="share-btn" onClick={handleShare}>
                Share
              </button>
            </motion.header>

            <motion.div
              className="filter-bar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`filter-pill ${filter === f.key ? "active" : ""}`}
                  onClick={() => { setFilter(f.key); setScrollIdx(0); }}
                >
                  {f.label}
                </button>
              ))}
            </motion.div>

            <div className="card-counter">
              {filtered.length > 0
                ? filtered.length > 1
                  ? `${scrollIdx + 1} / ${filtered.length}`
                  : "1 tale"
                : ""}
            </div>

            {filtered.length > 0 ? (
              <div className="card-deck" ref={deckRef} key={filter}>
                {filtered.map((fact, i) => (
                  <FactCard key={`${fact.title}-${fact.year}-${i}`} fact={fact} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                className="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="no-data-rune">ᚨ</div>
                <div className="no-data-text">
                  The Norns have no records for this date
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`toast ${toastMsg ? "show" : ""}`}>{toastMsg}</div>
    </>
  );
}
