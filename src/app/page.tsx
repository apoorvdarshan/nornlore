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

// Cache for Wikipedia extracts to avoid refetching
const wikiExtractCache: Record<string, string> = {};

function useWikiExtract(slug: string | null): string {
  const [extract, setExtract] = useState<string>("");
  useEffect(() => {
    if (!slug) return;
    if (wikiExtractCache[slug]) { setExtract(wikiExtractCache[slug]); return; }
    // Use MediaWiki action API for extended article text
    const title = decodeURIComponent(slug);
    fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&exchars=3000&format=json&origin=*`)
      .then((r) => r.json())
      .then((d) => {
        const pages = d.query?.pages;
        if (!pages) return;
        const page = Object.values(pages)[0] as { extract?: string };
        // Clean up Wikipedia section headers (== Header ==) and extra whitespace
        const text = (page?.extract || "").replace(/={2,}[^=]+=+/g, "").replace(/\n{2,}/g, " ").trim();
        wikiExtractCache[slug] = text;
        setExtract(text);
      })
      .catch(() => {});
  }, [slug]);
  return extract;
}

function WikiPhoto({ slug, title, floatRight }: { slug: string; title: string; floatRight?: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [isGif, setIsGif] = useState(false);

  useEffect(() => {
    // Try local GIF first, then fall back to Wikipedia
    const gifPath = `/gifs/${slug}.gif`;
    const img = new Image();
    img.onload = () => { setSrc(gifPath); setIsGif(true); };
    img.onerror = () => {
      // Fallback to Wikipedia
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
    <div className={`photo-box ${isGif ? "photo-moving" : ""} ${floatRight ? "float-right" : ""}`}>
      <img src={src} alt={title} loading="lazy" />
      {!isGif && <div className="photo-caption">{title}</div>}
    </div>
  );
}

function truncateAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > maxLen * 0.4 ? cut.slice(0, lastPeriod + 1) + ".." : cut.slice(0, cut.lastIndexOf(" ")) + "...";
}

function StoryText({ fact, maxLength = 600 }: { fact: Fact; maxLength?: number }) {
  const wikiText = useWikiExtract(fact.wikipediaSlug);
  const desc = fact.description;
  const extra = wikiText && !wikiText.startsWith(desc.slice(0, 40))
    ? ` ${wikiText}`
    : wikiText.length > desc.length ? ` ${wikiText.slice(desc.length)}` : "";
  const full = desc + extra;
  return <>{truncateAtSentence(full, maxLength)}</>;
}

function HeroArticleText({ fact, showPhoto }: { fact: Fact; showPhoto?: boolean }) {
  const wikiText = useWikiExtract(fact.wikipediaSlug);
  const desc = fact.description;
  const extra = wikiText && !wikiText.startsWith(desc.slice(0, 40))
    ? ` ${wikiText}`
    : wikiText.length > desc.length ? ` ${wikiText.slice(desc.length)}` : "";
  const fullText = truncateAtSentence(desc + extra, 1200);
  return (
    <div className="article-text">
      {showPhoto && fact.wikipediaSlug && (
        <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} />
      )}
      <p>
        <span className="drop-cap-letter">{fullText.charAt(0)}</span>
        {fullText.slice(1)}
      </p>
      {fact.wikipediaSlug && (
        <p style={{ marginTop: "8px", fontStyle: "italic", fontSize: "0.75rem", color: "var(--faded)" }}>
          <a href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Full report continues on page 4 →
          </a>
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"landing" | "cards">("landing");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [filter, setFilter] = useState("all");
  const [facts, setFacts] = useState<Fact[]>([]);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("date");
    if (d && /^\d{2}-\d{2}$/.test(d)) {
      setMonth(d.split("-")[0]); setDay(d.split("-")[1]); navigateToDate(d);
    }
  }, []);

  const navigateToDate = useCallback((key: string) => {
    setDateKey(key); setFacts(shuffle(data[key] || [])); setFilter("all"); setView("cards");
    const url = new URL(window.location.href); url.searchParams.set("date", key); history.pushState(null, "", url);
  }, []);

  const goBack = useCallback(() => {
    setView("landing");
    const url = new URL(window.location.href); url.searchParams.delete("date"); history.pushState(null, "", url);
  }, []);

  const filtered = useMemo(() => filter === "all" ? facts : facts.filter((f) => f.type === filter), [facts, filter]);

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

  useEffect(() => {
    const h = () => { const p = new URLSearchParams(window.location.search); const d = p.get("date");
      if (d && /^\d{2}-\d{2}$/.test(d)) navigateToDate(d); else setView("landing"); };
    window.addEventListener("popstate", h); return () => window.removeEventListener("popstate", h);
  }, [navigateToDate]);

  const filters = [
    { key: "all", label: "All" }, { key: "person", label: "Births" },
    { key: "event", label: "World Affairs" }, { key: "music", label: "Music" }, { key: "movie", label: "Pictures" },
  ];

  // Split stories: hero at full width, everything else in masonry
  const hero = filtered[0];
  const stories = filtered.slice(1); // all non-hero stories go into masonry

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();

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
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="paper">
              {/* Masthead */}
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
                  <span>{filtered.length} {filtered.length === 1 ? "TALE" : "TALES"} RECORDED</span>
                </div>
              </div>

              {/* Filter as ticker-style bar */}
              <div className="filter-bar">
                {filters.map((f) => (
                  <button key={f.key} className={`filter-pill ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="newspaper-body">
                {filtered.length === 0 ? (
                  <div className="no-data">The presses have no record for this date.<br /><em>Perhaps the archives have been bewitched.</em></div>
                ) : (
                  <div className="prophet-layout">
                    {/* SLOT A: Hero — spans 2 cols, big photo + big headline */}
                    {filtered[0] && (
                      <div className="slot slot-a">
                        <div className="hero-kicker">⚡ {TYPE_LABELS[filtered[0].type]} · {filtered[0].year}</div>
                        <h1 className="hero-headline">{filtered[0].title.toUpperCase()}</h1>
                        <div className="byline">By the Nornlore Press Corps</div>
                        {(filtered[0].type === "person" || filtered[0].type === "event") && filtered[0].wikipediaSlug && (
                          <WikiPhoto slug={filtered[0].wikipediaSlug} title={filtered[0].title} />
                        )}
                        <HeroArticleText fact={filtered[0]} showPhoto={false} />
                      </div>
                    )}

                    {/* SLOT B: Sidebar tall — right col, no photo, text-heavy */}
                    {filtered[1] && (
                      <div className="slot slot-b">
                        <div className="hero-kicker">{TYPE_LABELS[filtered[1].type]}</div>
                        <h2 className="slot-b-headline">{filtered[1].title.toUpperCase()}</h2>
                        <div className="byline">{filtered[1].year}</div>
                        <div className="col-text"><StoryText fact={filtered[1]} maxLength={500} /></div>
                      </div>
                    )}

                    {/* SLOT C: Mid-left — medium photo float right */}
                    {filtered[2] && (
                      <div className="slot slot-c">
                        <div className="hero-kicker">{TYPE_LABELS[filtered[2].type]}</div>
                        <h2 className="col-headline-lg">{filtered[2].title.toUpperCase()}</h2>
                        <div className="byline">{filtered[2].year}</div>
                        <div className="col-text">
                          {(filtered[2].type === "person" || filtered[2].type === "event") && filtered[2].wikipediaSlug && (
                            <WikiPhoto slug={filtered[2].wikipediaSlug} title={filtered[2].title} floatRight />
                          )}
                          <StoryText fact={filtered[2]} maxLength={450} />
                        </div>
                      </div>
                    )}

                    {/* SLOT D: Mid-right — small photo float left */}
                    {filtered[3] && (
                      <div className="slot slot-d">
                        <div className="hero-kicker">{TYPE_LABELS[filtered[3].type]}</div>
                        <h2 className="col-headline">{filtered[3].title}</h2>
                        <div className="byline">{filtered[3].year}</div>
                        <div className="col-text">
                          {(filtered[3].type === "person" || filtered[3].type === "event") && filtered[3].wikipediaSlug && (
                            <WikiPhoto slug={filtered[3].wikipediaSlug} title={filtered[3].title} />
                          )}
                          <StoryText fact={filtered[3]} maxLength={350} />
                        </div>
                      </div>
                    )}

                    {/* SLOT E: Bottom-left — text only, small */}
                    {filtered[4] && (
                      <div className="slot slot-e">
                        <div className="hero-kicker">{TYPE_LABELS[filtered[4].type]}</div>
                        <h2 className="col-headline">{filtered[4].title}</h2>
                        <div className="byline">{filtered[4].year}</div>
                        <div className="col-text"><StoryText fact={filtered[4]} maxLength={250} /></div>
                      </div>
                    )}

                    {/* SLOT F: Bottom-center — medium with photo */}
                    {filtered[5] && (
                      <div className="slot slot-f">
                        <div className="hero-kicker">{TYPE_LABELS[filtered[5].type]}</div>
                        <h2 className="col-headline-lg">{filtered[5].title.toUpperCase()}</h2>
                        <div className="byline">{filtered[5].year}</div>
                        {(filtered[5].type === "person" || filtered[5].type === "event") && filtered[5].wikipediaSlug && (
                          <WikiPhoto slug={filtered[5].wikipediaSlug} title={filtered[5].title} />
                        )}
                        <div className="col-text"><StoryText fact={filtered[5]} maxLength={350} /></div>
                      </div>
                    )}

                    {/* SLOT G: Bottom-right — small text only */}
                    {filtered[6] && (
                      <div className="slot slot-g">
                        <div className="hero-kicker">{TYPE_LABELS[filtered[6].type]}</div>
                        <h2 className="col-headline">{filtered[6].title}</h2>
                        <div className="byline">{filtered[6].year}</div>
                        <div className="col-text"><StoryText fact={filtered[6]} maxLength={250} /></div>
                      </div>
                    )}

                    {/* SLOT H: Extra row — any remaining stories */}
                    {filtered.length > 7 && (
                      <div className="slot slot-h">
                        {filtered.slice(7).map((fact, i) => (
                          <div className="extra-story" key={`extra-${i}`}>
                            <span className="hero-kicker">{TYPE_LABELS[fact.type]}</span>
                            <h2 className="col-headline">{fact.title}</h2>
                            <span className="byline">{fact.year}</span>
                            <div className="col-text"><StoryText fact={fact} maxLength={200} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
