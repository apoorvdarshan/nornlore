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

const RUNE_CHARS = "ᚠᚢᚦᚨᛒᛗᛉᛊᛏᛞᛟᛝ".split("");

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

// ---------- Floating Runes ----------
function FloatingRunes() {
  const [runes, setRunes] = useState<{ id: number; char: string; left: number; size: number; dur: number; delay: number }[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      char: RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
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
        <div className={`card-badge ${fact.type}`}>
          <BadgeIcon type={fact.type} />
          {fact.type}
        </div>
        <div className="card-year">{fact.year}</div>
        <div className="card-title">{fact.title}</div>
        <p className="card-desc">{fact.description}</p>

        {(fact.type === "person" || fact.type === "event") && fact.wikipediaSlug && (
          <WikiImage slug={fact.wikipediaSlug} title={fact.title} />
        )}

        {fact.type === "music" && fact.spotifyTrackId && (
          <div className="card-embed">
            <iframe
              src={`https://open.spotify.com/embed/track/${fact.spotifyTrackId}?theme=0`}
              height="152"
              allow="encrypted-media"
              loading="lazy"
            />
          </div>
        )}

        {(fact.type === "movie" || fact.type === "event") && fact.youtubeId && (
          <div className="card-embed">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${fact.youtubeId}`}
              height="200"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {fact.wikipediaSlug && (
          <a
            className="card-link"
            href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the full tale →
          </a>
        )}
      </div>
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

            <motion.div
              className="landing-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              The Threads of Fate
            </motion.div>

            <motion.h1
              className="landing-title"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Nornlore
            </motion.h1>

            <motion.p
              className="landing-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
            >
              Discover the history woven into your birthday
            </motion.p>

            <motion.svg
              className="knot-divider"
              viewBox="0 0 500 20"
              fill="none"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.3, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <path
                d="M0 10 Q25 0, 50 10 Q75 20, 100 10 Q125 0, 150 10 Q175 20, 200 10 Q225 0, 250 10 Q275 20, 300 10 Q325 0, 350 10 Q375 20, 400 10 Q425 0, 450 10 Q475 20, 500 10"
                stroke="#d4a843"
                strokeWidth="1.5"
              />
              <path
                d="M0 10 Q25 20, 50 10 Q75 0, 100 10 Q125 20, 150 10 Q175 0, 200 10 Q225 20, 250 10 Q275 0, 300 10 Q325 20, 350 10 Q375 0, 400 10 Q425 20, 450 10 Q475 0, 500 10"
                stroke="#d4a843"
                strokeWidth="1.5"
              />
            </motion.svg>

            <motion.form
              className="date-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <div className="form-frame">
                <span className="form-corner tl" />
                <span className="form-corner tr" />
                <span className="form-corner bl" />
                <span className="form-corner br" />
                <div className="date-inputs">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    aria-label="Month"
                  >
                    <option value="" disabled>
                      Month
                    </option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, "0")}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="date-separator">·</span>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    aria-label="Day"
                  >
                    <option value="" disabled>
                      Day
                    </option>
                    {Array.from({ length: 31 }, (_, i) => {
                      const v = String(i + 1).padStart(2, "0");
                      return (
                        <option key={v} value={v}>
                          {i + 1}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <motion.button
                type="submit"
                className="reveal-btn"
                disabled={!month || !day}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Reveal Your Fate
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
