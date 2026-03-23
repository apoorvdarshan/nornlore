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

  // Split stories for irregular newspaper layout
  const hero = filtered[0];
  const sidebar = filtered.slice(1, 3);   // sidebar stories next to hero
  const midBanner = filtered[3];          // wide mid-banner story
  const tripleRow = filtered.slice(4, 7); // 3 uneven columns
  const dualRow = filtered.slice(7, 9);   // 2-col split
  const restRows = filtered.slice(9);     // remaining stories in masonry

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
                  <>
                    {/* TOP SECTION: Hero + sidebar stacked stories */}
                    <div className="top-spread">
                      {hero && (
                        <div className="hero-main">
                          <div className="hero-kicker">⚡ {TYPE_LABELS[hero.type]} · {hero.year}</div>
                          <h1 className="hero-headline">{hero.title.toUpperCase()}</h1>
                          <div className="byline">By the Nornlore Press Corps &nbsp;|&nbsp; Verified by the Dept. of Historical Sorcery</div>
                          {(hero.type === "person" || hero.type === "event") && hero.wikipediaSlug && (
                            <WikiPhoto slug={hero.wikipediaSlug} title={hero.title} />
                          )}
                          <div className="article-text">
                            <p>
                              <span className="drop-cap-letter">{hero.description.charAt(0)}</span>
                              {hero.description.slice(1)}
                              {hero.description.length < 200 && " The full account of these remarkable circumstances, as pieced together by our most diligent correspondents, reveals a tapestry of events that would astound even the most seasoned chronicler of historical curiosities. Witnesses described scenes of such extraordinary import that the very fabric of the age was altered irrevocably."}
                            </p>
                            {hero.wikipediaSlug && (
                              <p style={{ marginTop: "8px", fontStyle: "italic", fontSize: "0.75rem", color: "var(--faded)" }}>
                                <a href={`https://en.wikipedia.org/wiki/${hero.wikipediaSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                                  Full report continues on page 4 →
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {sidebar.length > 0 && (
                        <div className="sidebar-stack">
                          {sidebar.map((fact, i) => (
                            <div className="sidebar-story" key={`side-${i}`}>
                              <div className="hero-kicker">{TYPE_LABELS[fact.type]}</div>
                              <h2 className={i === 0 ? "sidebar-headline-big" : "sidebar-headline-sm"}>{fact.title.toUpperCase()}</h2>
                              <div className="byline">{fact.year}</div>
                              {(fact.type === "person" || fact.type === "event") && fact.wikipediaSlug && (
                                <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} />
                              )}
                              <p className="col-text">{fact.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* MID BANNER — wide story across full width */}
                    {midBanner && (
                      <div className="mid-banner">
                        <div className="mid-banner-text">
                          <div className="hero-kicker">{TYPE_LABELS[midBanner.type]} · {midBanner.year}</div>
                          <h2 className="mid-banner-headline">{midBanner.title.toUpperCase()}</h2>
                          <p className="col-text">{midBanner.description}</p>
                        </div>
                        {(midBanner.type === "person" || midBanner.type === "event") && midBanner.wikipediaSlug && (
                          <div className="mid-banner-img">
                            <WikiPhoto slug={midBanner.wikipediaSlug} title={midBanner.title} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* TRIPLE ROW — uneven 3 columns */}
                    {tripleRow.length > 0 && (
                      <div className="triple-uneven">
                        {tripleRow.map((fact, i) => (
                          <div className={`triple-story triple-story-${i}`} key={`tri-${i}`}>
                            <div className="hero-kicker">{TYPE_LABELS[fact.type]}</div>
                            <h2 className={i === 1 ? "col-headline-lg" : "col-headline"}>{i === 1 ? fact.title.toUpperCase() : fact.title}</h2>
                            <div className="byline">{fact.year}</div>
                            {(fact.type === "person" || fact.type === "event") && fact.wikipediaSlug && (
                              <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} floatRight={i !== 1} />
                            )}
                            <p className="col-text">{fact.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* DUAL ROW — 2 unequal columns */}
                    {dualRow.length > 0 && (
                      <div className="dual-split">
                        {dualRow.map((fact, i) => (
                          <div className={`dual-story dual-story-${i}`} key={`dual-${i}`}>
                            <div className="hero-kicker">{TYPE_LABELS[fact.type]}</div>
                            <h2 className={i === 0 ? "col-headline-lg" : "col-headline"}>{fact.title}</h2>
                            <div className="byline">{fact.year}</div>
                            {(fact.type === "person" || fact.type === "event") && fact.wikipediaSlug && (
                              <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} floatRight={i === 1} />
                            )}
                            <p className="col-text">{fact.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* REMAINING — masonry-style irregular grid */}
                    {restRows.length > 0 && (
                      <div className="masonry-grid">
                        {restRows.map((fact, i) => (
                          <div className={`masonry-item masonry-item-${i % 5}`} key={`rest-${i}`}>
                            <div className="hero-kicker">{TYPE_LABELS[fact.type]}</div>
                            <h2 className={i % 3 === 0 ? "col-headline-lg" : "col-headline"}>{i % 3 === 0 ? fact.title.toUpperCase() : fact.title}</h2>
                            <div className="byline">{fact.year}</div>
                            {(fact.type === "person" || fact.type === "event") && fact.wikipediaSlug && (
                              <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} floatRight={i % 2 === 0} />
                            )}
                            <p className="col-text">{fact.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
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
