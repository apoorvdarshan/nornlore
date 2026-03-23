"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import birthdayData from "@/data/birthdays.json";
import {
  stableIndex,
  MAGICAL_ADS,
  NOTICES,
  WEATHER,
  MINI_HEADLINES,
  TICKER_ITEMS,
  SUBHEADLINES,
} from "@/data/fillerContent";

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

const TYPE_LABELS: Record<string, string> = {
  person: "Notable Birth",
  event: "World Affairs",
  music: "Musical Enchantments",
  movie: "Moving Pictures",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function NpSelect({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const label = options.find((o) => o.value === value)?.label || placeholder;
  return (
    <div className={`np-select ${open ? "open" : ""}`} ref={ref}>
      <button type="button" className="np-select-trigger" onClick={() => setOpen(!open)}>
        <span className={value ? "" : "placeholder"}>{label}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="np-select-arrow">
          <path d="M3 6 L8 11 L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="np-select-dropdown" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}>
            {options.map((o) => (
              <button key={o.value} type="button" className={`np-select-option ${o.value === value ? "selected" : ""}`} onClick={() => { onChange(o.value); setOpen(false); }}>
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Cache for Wikipedia extracts
const wikiExtractCache: Record<string, string> = {};

function useWikiExtract(slug: string | null): string {
  const [extract, setExtract] = useState<string>("");
  useEffect(() => {
    if (!slug) return;
    if (wikiExtractCache[slug]) { setExtract(wikiExtractCache[slug]); return; }
    const title = decodeURIComponent(slug);
    fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&exchars=3000&format=json&origin=*`)
      .then((r) => r.json())
      .then((d) => {
        const pages = d.query?.pages;
        if (!pages) return;
        const page = Object.values(pages)[0] as { extract?: string };
        const text = (page?.extract || "").replace(/={2,}[^=]+=+/g, "").replace(/\n{2,}/g, " ").trim();
        wikiExtractCache[slug] = text;
        setExtract(text);
      })
      .catch(() => {});
  }, [slug]);
  return extract;
}

function WikiPhoto({ slug, title }: { slug: string; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [isGif, setIsGif] = useState(false);

  useEffect(() => {
    const gifPath = `/gifs/${slug}.gif`;
    const img = new Image();
    img.onload = () => { setSrc(gifPath); setIsGif(true); };
    img.onerror = () => {
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.thumbnail?.source) setSrc(d.thumbnail.source.replace(/\/\d+px-/, `/500px-`));
        })
        .catch(() => {});
    };
    img.src = gifPath;
  }, [slug]);

  if (!src) return null;
  return (
    <div className={`photo-box ${isGif ? "photo-moving" : ""}`}>
      <img src={src} alt={title} loading="lazy" />
      {isGif && <div className="photo-caption">Moving Photograph</div>}
      {!isGif && <div className="photo-caption">{title}</div>}
    </div>
  );
}

function truncateAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > maxLen * 0.4 ? cut.slice(0, lastPeriod + 1) : cut.slice(0, cut.lastIndexOf(" ")) + "...";
}

function ProphetArticle({ fact }: { fact: Fact }) {
  const wikiText = useWikiExtract(fact.wikipediaSlug);
  const desc = fact.description;
  const extra = wikiText && !wikiText.startsWith(desc.slice(0, 40))
    ? ` ${wikiText}`
    : wikiText.length > desc.length ? ` ${wikiText.slice(desc.length)}` : "";
  const fullText = truncateAtSentence(desc + extra, 800);

  return (
    <div className="prophet-story">
      {fact.wikipediaSlug && (
        <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} />
      )}
      <div className="prophet-text">
        <p>
          <span className="drop-cap">{fullText.charAt(0)}</span>
          {fullText.slice(1)}
        </p>
        {fact.wikipediaSlug && (
          <p className="prophet-continued">
            <a href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`} target="_blank" rel="noopener noreferrer">
              Full report continues on page 4 →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function ProphetFiller({ fact, facts, currentIndex }: { fact: Fact; facts: Fact[]; currentIndex: number }) {
  const seed = fact.title;
  const adIdx = stableIndex(seed, MAGICAL_ADS.length);
  const ad2Idx = stableIndex(seed + "2", MAGICAL_ADS.length);
  const noticeIdx = stableIndex(seed, NOTICES.length);
  const notice2Idx = stableIndex(seed + "x", NOTICES.length);
  const weatherIdx = stableIndex(seed, WEATHER.length);
  const mini1 = stableIndex(seed, MINI_HEADLINES.length);
  const mini2 = stableIndex(seed + "b", MINI_HEADLINES.length);
  const mini3 = stableIndex(seed + "c", MINI_HEADLINES.length);
  const mini4 = stableIndex(seed + "d", MINI_HEADLINES.length);
  const mini5 = stableIndex(seed + "e", MINI_HEADLINES.length);

  // Teaser for next story
  const nextIdx = (currentIndex + 1) % facts.length;
  const nextFact = facts[nextIdx];
  const prevIdx = (currentIndex - 1 + facts.length) % facts.length;
  const prevFact = facts[prevIdx];

  return (
    <>
      {/* TOP STRIP — mini stories */}
      <div className="prophet-top-strip">
        <div className="mini-story">
          <div className="mini-headline">{MINI_HEADLINES[mini1]}</div>
          <div className="mini-text">{NOTICES[noticeIdx]}</div>
        </div>
        <div className="mini-story">
          <div className="mini-headline">{MINI_HEADLINES[mini2]}</div>
          <div className="mini-text">{WEATHER[weatherIdx]}</div>
        </div>
        <div className="mini-story mini-story-last">
          <div className="mini-headline">{MINI_HEADLINES[mini3]}</div>
          <div className="mini-text">Full Report Pg. {stableIndex(seed, 12) + 2}</div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="prophet-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">ALSO IN THIS EDITION</div>
          <div className="sidebar-teaser">
            <h3>{nextFact.title.toUpperCase()}</h3>
            <div className="sidebar-teaser-type">{TYPE_LABELS[nextFact.type]} · {nextFact.year}</div>
            <p>{truncateAtSentence(nextFact.description, 120)}</p>
          </div>
          {facts.length > 2 && (
            <div className="sidebar-teaser">
              <h3>{prevFact.title}</h3>
              <div className="sidebar-teaser-type">{TYPE_LABELS[prevFact.type]} · {prevFact.year}</div>
              <p>{truncateAtSentence(prevFact.description, 80)}</p>
            </div>
          )}
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-fillers">
          <div className="sidebar-mini-hl">{MINI_HEADLINES[mini4]}</div>
          <div className="sidebar-mini-hl">{MINI_HEADLINES[mini5]}</div>
        </div>
        <div className="prophet-ad-box">
          <div className="ad-label">ADVERTISEMENT</div>
          {MAGICAL_ADS[adIdx]}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="prophet-bottom-left">
        <div className="prophet-notices-box">
          <div className="notices-label">WEATHER OUTLOOK</div>
          <p>{WEATHER[weatherIdx]}</p>
          <div className="notices-label" style={{ marginTop: "8px" }}>NOTICES &amp; CLASSIFIEDS</div>
          <p>{NOTICES[noticeIdx]}</p>
          <p>{NOTICES[notice2Idx]}</p>
        </div>
      </div>
      <div className="prophet-bottom-right">
        <div className="prophet-ad-box">
          <div className="ad-label">ADVERTISEMENT</div>
          {MAGICAL_ADS[ad2Idx]}
        </div>
        <div className="prophet-ad-box" style={{ marginTop: "8px" }}>
          <div className="ad-label">ADVERTISEMENT</div>
          {MAGICAL_ADS[(ad2Idx + 3) % MAGICAL_ADS.length]}
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [view, setView] = useState<"landing" | "prophet">("landing");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [facts, setFacts] = useState<Fact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const directionRef = useRef(1);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("date");
    if (d && /^\d{2}-\d{2}$/.test(d)) {
      setMonth(d.split("-")[0]); setDay(d.split("-")[1]); navigateToDate(d);
    }
  }, []);

  const navigateToDate = useCallback((key: string) => {
    setDateKey(key);
    setFacts(shuffle(data[key] || []));
    setCurrentIndex(0);
    setView("prophet");
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

  const goNext = useCallback(() => {
    if (currentIndex < facts.length - 1) {
      directionRef.current = 1;
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, facts.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      directionRef.current = -1;
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (view !== "prophet") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, goNext, goPrev]);

  useEffect(() => {
    const h = () => {
      const p = new URLSearchParams(window.location.search);
      const d = p.get("date");
      if (d && /^\d{2}-\d{2}$/.test(d)) navigateToDate(d);
      else setView("landing");
    };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, [navigateToDate]);

  const headerDateStr = useMemo(() => {
    if (!dateKey) return "";
    const [m, d] = dateKey.split("-");
    return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
  }, [dateKey]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (month && day) navigateToDate(`${month}-${day}`); };
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?date=${dateKey}`).then(() => showToast("Link copied!"));
  };
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  const currentFact = facts[currentIndex];

  // Ticker content — deterministic per date
  const tickerStr = useMemo(() => {
    const items: string[] = [];
    for (let i = 0; i < TICKER_ITEMS.length; i++) {
      items.push(TICKER_ITEMS[i]);
    }
    return items.join("  ·  ");
  }, []);

  // Swipe handling
  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 80) goPrev();
    else if (info.offset.x < -80) goNext();
  }, [goNext, goPrev]);

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="paper">
              <div className="masthead">
                <div className="masthead-top">
                  <span>EST. SINCE TIME IMMEMORIAL</span>
                  <span>ENCHANTED EDITION · FLOO NETWORK CERTIFIED</span>
                </div>
                <div className="masthead-logo">Nornlore</div>
                <div className="masthead-tagline">The Wizarding World&apos;s Chronicle of Historical Record</div>
                <hr className="masthead-rule" />
                <div className="edition-bar">
                  <span>VOL. MMXXVI · ENCHANTED BROADSHEET</span>
                  <span>⚡ 366 DATES · 2,594 TALES ⚡</span>
                  <span>FIVE KNUTS — {dateStr}</span>
                </div>
              </div>

              <div className="ticker-banner">
                <span className="ticker-text">
                  ✦ DISCOVER what famous events share your birthday ✦ Notable births, world affairs, musical enchantments & moving pictures ✦ Enter your date below to read the chronicle ✦ Over 2,594 historical tales verified by the Department of Historical Sorcery ✦
                </span>
              </div>

              <div className="newspaper-body">
                <div className="landing-cta">
                  <h2 className="cta-headline">WHAT HISTORY SHARES YOUR BIRTHDAY?</h2>
                  <p className="cta-subtitle">
                    Enter your date of birth below to reveal the extraordinary events,
                    legendary figures, and enchanted tales woven into your day.
                  </p>
                  <form className="date-form" onSubmit={handleSubmit}>
                    <div className="date-inputs">
                      <NpSelect value={month} onChange={setMonth} placeholder="Month" options={MONTHS.map((m, i) => ({ value: String(i + 1).padStart(2, "0"), label: m }))} />
                      <span className="date-separator">·</span>
                      <NpSelect value={day} onChange={setDay} placeholder="Day" options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1).padStart(2, "0"), label: String(i + 1) }))} />
                    </div>
                    <motion.button type="submit" className="reveal-btn" disabled={!month || !day} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Read the Chronicle
                    </motion.button>
                  </form>
                </div>

                <div style={{ borderTop: "2px solid var(--rule)", borderBottom: "1px solid var(--rule)", padding: "6px 0", marginTop: "8px" }}>
                  <div className="landing-bottom">
                    <span>Births</span><span>✦</span><span>Events</span><span>✦</span>
                    <span>Music</span><span>✦</span><span>Pictures</span><span>✦</span>
                    <span>366 Dates</span><span>✦</span><span>2,594 Tales</span>
                  </div>
                </div>
              </div>

              <div className="paper-footer">
                Nornlore is published on enchanted parchment · Owl subscriptions welcome · Back issues by Floo request only<br />
                © Since Time Immemorial · All tales verified by the Department of Historical Sorcery
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`prophet-${currentIndex}`}
            initial={{ x: directionRef.current * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: directionRef.current * -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
          >
            <div className="paper">
              {/* MASTHEAD */}
              <div className="masthead">
                <div className="masthead-top">
                  <span style={{ cursor: "pointer" }} onClick={goBack}>← BACK TO FRONT PAGE</span>
                  <span style={{ cursor: "pointer" }} onClick={handleShare}>SHARE THIS EDITION</span>
                </div>
                <div className="masthead-logo">Nornlore</div>
                <div className="masthead-tagline">The Enchanted Chronicle</div>
                <hr className="masthead-rule" />
                <div className="edition-bar">
                  <span>{headerDateStr.toUpperCase()} EDITION</span>
                  <span>⚡ ENCHANTED BROADSHEET ⚡</span>
                  <span>PAGE {currentIndex + 1} OF {facts.length}</span>
                </div>
              </div>

              {/* SUB-MASTHEAD BAR */}
              <div className="prophet-subbar">
                <span>National Weather</span>
                <span>Zodiacs</span>
                <span>Exports</span>
                <span>Quidditch</span>
                <span>Obituaries</span>
                <span>Classifieds</span>
              </div>

              {currentFact ? (
                <div className="prophet-page">
                  {/* FILLER: top strip + sidebar + bottom */}
                  <ProphetFiller fact={currentFact} facts={facts} currentIndex={currentIndex} />

                  {/* MAIN HEADLINE AREA */}
                  <div className="prophet-headline-area">
                    <span className="prophet-exclusive">⚡ {TYPE_LABELS[currentFact.type]}</span>
                    <h1 className="prophet-headline">{currentFact.title.toUpperCase()}</h1>
                    <div className="prophet-subheadline">
                      {SUBHEADLINES[currentFact.type]?.[stableIndex(currentFact.title, SUBHEADLINES[currentFact.type].length)]}
                    </div>
                    <div className="prophet-byline">
                      By the Nornlore Press Corps · Verified by the Dept. of Historical Sorcery · {currentFact.year}
                    </div>
                  </div>

                  {/* MAIN STORY — photo + article */}
                  <ProphetArticle fact={currentFact} />
                </div>
              ) : (
                <div className="no-data">The presses have no record for this date.<br /><em>Perhaps the archives have been bewitched.</em></div>
              )}

              {/* BOTTOM TICKER */}
              <div className="prophet-ticker">
                <span className="ticker-text">{tickerStr}</span>
              </div>

              {/* NAV ARROWS */}
              <button
                className={`prophet-nav prophet-nav-prev ${currentIndex === 0 ? "prophet-nav-disabled" : ""}`}
                onClick={goPrev}
                disabled={currentIndex === 0}
                aria-label="Previous event"
              >◄</button>
              <button
                className={`prophet-nav prophet-nav-next ${currentIndex === facts.length - 1 ? "prophet-nav-disabled" : ""}`}
                onClick={goNext}
                disabled={currentIndex === facts.length - 1}
                aria-label="Next event"
              >►</button>

              <div className="paper-footer">
                Nornlore is published on enchanted parchment · Owl subscriptions welcome<br />
                All tales verified by the Department of Historical Sorcery · &quot;Nobody Wastes the Daily Prophet&quot;
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`toast ${toastMsg ? "show" : ""}`}>{toastMsg}</div>
    </>
  );
}
