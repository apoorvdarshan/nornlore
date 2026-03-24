"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
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
      {!isGif && <div className="photo-caption">{title}</div>}
    </div>
  );
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > maxLen * 0.4 ? cut.slice(0, lastPeriod + 1) : cut.slice(0, cut.lastIndexOf(" ")) + "...";
}

/* ── Article text with wiki extract ── */
function ArticleText({ fact, maxLen }: { fact: Fact; maxLen: number }) {
  const wikiText = useWikiExtract(fact.wikipediaSlug);
  const desc = fact.description;
  const extra = wikiText && !wikiText.startsWith(desc.slice(0, 40))
    ? ` ${wikiText}`
    : wikiText.length > desc.length ? ` ${wikiText.slice(desc.length)}` : "";
  const fullText = truncate(desc + extra, maxLen);
  return (
    <>
      <span className="drop-cap">{fullText.charAt(0)}</span>
      {fullText.slice(1)}
      {fact.wikipediaSlug && (
        <span className="read-more">
          {" "}<a href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`} target="_blank" rel="noopener noreferrer">
            Full Report →
          </a>
        </span>
      )}
    </>
  );
}

/* ── Small article text (no drop cap) ── */
function SmallText({ fact, maxLen }: { fact: Fact; maxLen: number }) {
  const wikiText = useWikiExtract(fact.wikipediaSlug);
  const desc = fact.description;
  const extra = wikiText && !wikiText.startsWith(desc.slice(0, 40))
    ? ` ${wikiText}`
    : wikiText.length > desc.length ? ` ${wikiText.slice(desc.length)}` : "";
  return <>{truncate(desc + extra, maxLen)}</>;
}

export default function Home() {
  const [view, setView] = useState<"landing" | "prophet">("landing");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateKey, setDateKey] = useState("");
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
    setDateKey(key);
    setFacts(shuffle(data[key] || []));
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

  // Split facts into hero + rest
  const hero = facts[0];
  const secondary = facts.slice(1, 3); // 2nd and 3rd events
  const remaining = facts.slice(3); // rest

  // Stable filler indices from dateKey
  const s = dateKey || "default";
  const ad1 = stableIndex(s + "a1", MAGICAL_ADS.length);
  const ad2 = stableIndex(s + "a2", MAGICAL_ADS.length);
  const ad3 = stableIndex(s + "a3", MAGICAL_ADS.length);
  const n1 = stableIndex(s + "n1", NOTICES.length);
  const n2 = stableIndex(s + "n2", NOTICES.length);
  const n3 = stableIndex(s + "n3", NOTICES.length);
  const w1 = stableIndex(s + "w1", WEATHER.length);
  const m1 = stableIndex(s + "m1", MINI_HEADLINES.length);
  const m2 = stableIndex(s + "m2", MINI_HEADLINES.length);
  const m3 = stableIndex(s + "m3", MINI_HEADLINES.length);
  const m4 = stableIndex(s + "m4", MINI_HEADLINES.length);
  const m5 = stableIndex(s + "m5", MINI_HEADLINES.length);
  const m6 = stableIndex(s + "m6", MINI_HEADLINES.length);
  const m7 = stableIndex(s + "m7", MINI_HEADLINES.length);
  const m8 = stableIndex(s + "m8", MINI_HEADLINES.length);

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
                  ✦ DISCOVER what famous events share your birthday ✦ Notable births, world affairs, musical enchantments &amp; moving pictures ✦ Enter your date below to read the chronicle ✦ Over 2,594 historical tales verified by the Department of Historical Sorcery ✦
                </span>
              </div>
              <div className="newspaper-body">
                <div className="landing-spread">
                  {/* Left scattered photos */}
                  <div className="scatter-col scatter-left">
                    {[
                      { gif: "Apollo_11.gif", caption: "Apollo 11", date: "07-20" },
                      { gif: "Marilyn_Monroe.gif", caption: "Marilyn Monroe", date: "06-01" },
                      { gif: "Woodstock.gif", caption: "Woodstock", date: "08-15" },
                      { gif: "Elvis_Presley.gif", caption: "Elvis Presley", date: "01-08" },
                    ].map((item, i) => (
                      <div key={item.gif} className={`scatter-photo scatter-l${i}`} onClick={() => navigateToDate(item.date)} role="button" tabIndex={0}>
                        <div className="photo-box photo-moving">
                          <img src={`/gifs/${item.gif}`} alt={item.caption} loading="lazy" />
                        </div>
                        <div className="scatter-caption">{item.caption}</div>
                      </div>
                    ))}
                  </div>

                  {/* Center content */}
                  <div className="landing-center">
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

                  {/* Right scattered photos */}
                  <div className="scatter-col scatter-right">
                    {[
                      { gif: "Michael_Jackson.gif", caption: "Michael Jackson", date: "08-29" },
                      { gif: "Fall_of_the_Berlin_Wall.gif", caption: "Berlin Wall Falls", date: "11-09" },
                      { gif: "Nelson_Mandela.gif", caption: "Nelson Mandela", date: "07-18" },
                      { gif: "Sinking_of_the_RMS_Titanic.gif", caption: "RMS Titanic", date: "04-15" },
                    ].map((item, i) => (
                      <div key={item.gif} className={`scatter-photo scatter-r${i}`} onClick={() => navigateToDate(item.date)} role="button" tabIndex={0}>
                        <div className="photo-box photo-moving">
                          <img src={`/gifs/${item.gif}`} alt={item.caption} loading="lazy" />
                        </div>
                        <div className="scatter-caption">{item.caption}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: "2px solid var(--rule)", borderBottom: "1px solid var(--rule)", padding: "6px 0" }}>
                  <div className="landing-bottom">
                    <span>Births</span><span>✦</span><span>Events</span><span>✦</span>
                    <span>Music</span><span>✦</span><span>Pictures</span><span>✦</span>
                    <span>366 Dates</span><span>✦</span><span>2,594 Tales</span>
                  </div>
                </div>
              </div>
              <div className="paper-footer">
                <div className="footer-flavor">
                  Nornlore is published on enchanted parchment · Owl subscriptions welcome · Back issues by Floo request only
                </div>
                <div className="footer-disclaimer">
                  DISCLAIMER: Historical facts are real and sourced from public records. All magical theming, wizarding references,
                  fictional advertisements, and newspaper styling are satirical and for entertainment purposes only.
                </div>
                <div className="footer-links">
                  <Link href="/terms">Terms</Link>
                  <span>·</span>
                  <Link href="/privacy">Privacy</Link>
                  <span>·</span>
                  <a href="https://github.com/apoorvdarshan/nornlore" target="_blank" rel="noopener noreferrer">Source Code</a>
                  <span>·</span>
                  <a href="#" target="_blank" rel="noopener noreferrer">Vote on Product Hunt</a>
                </div>
                <div className="footer-credit">
                  Made by <a href="https://apoorvdarshan.com" target="_blank" rel="noopener noreferrer">Apoorv Darshan</a>
                </div>
                <div className="footer-socials">
                  <a href="https://github.com/apoorvdarshan" target="_blank" rel="noopener noreferrer">GitHub</a>
                  <span>·</span>
                  <a href="https://linkedin.com/in/apoorvdarshan" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <span>·</span>
                  <a href="https://x.com/apoorvdarshan" target="_blank" rel="noopener noreferrer">X</a>
                  <span>·</span>
                  <a href="https://apoorvdarshan.com" target="_blank" rel="noopener noreferrer">Blog</a>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="prophet-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="paper">
              {/* ════ MASTHEAD ════ */}
              <div className="masthead">
                <div className="masthead-top">
                  <span className="masthead-link" onClick={goBack}>← BACK TO FRONT PAGE</span>
                  <span className="masthead-link" onClick={handleShare}>SHARE THIS EDITION</span>
                </div>
                <div className="masthead-decor-left">bewitch · beguile</div>
                <div className="masthead-decor-right">spellbind · conjure · enchant</div>
                <div className="masthead-logo">Nornlore</div>
                <div className="masthead-tagline">The Enchanted Chronicle of Historical Record</div>
                <hr className="masthead-rule" />
              </div>

              {/* ════ INFO BAR (like Daily Prophet sub-masthead) ════ */}
              <div className="info-bar">
                <div className="info-cell info-cell-border">
                  <strong>NATIONAL WEATHER</strong><br />
                  {WEATHER[w1]}
                </div>
                <div className="info-cell info-cell-border">
                  <strong>ZODIAC ★ ASPECTS</strong><br />
                  ☽ · ♍ virgo · ☿ · ☉ luna app.
                </div>
                <div className="info-cell">
                  <strong>FIRST-SECOND EDITION</strong><br />
                  N° {stableIndex(s, 99999)} · {headerDateStr.toUpperCase()}<br />
                  <em style={{ fontSize: "0.55rem" }}>Letters to the Editor by owl to Nornlore, Diagon Alley</em>
                </div>
              </div>

              {facts.length > 0 ? (
                <div className="prophet-body">

                  {/* ════ EXCLUSIVE STAMP + HERO HEADLINE ════ */}
                  <div className="hero-zone">
                    <div className="exclusive-stamp">★ EXCLUSIVE ★</div>

                    {/* Main hero content — LEFT (wide) */}
                    <div className="hero-main">
                      <div className="hero-kicker">{TYPE_LABELS[hero.type]} · {hero.year}</div>
                      <h1 className="hero-headline">{hero.title.toUpperCase()}</h1>
                      <div className="hero-sub">
                        {SUBHEADLINES[hero.type]?.[stableIndex(hero.title, SUBHEADLINES[hero.type].length)]}
                      </div>

                      <div className="hero-content">
                        {hero.wikipediaSlug && (
                          <WikiPhoto slug={hero.wikipediaSlug} title={hero.title} />
                        )}
                        <p className="hero-text">
                          <ArticleText fact={hero} maxLen={1400} />
                        </p>
                      </div>
                    </div>

                    {/* Sidebar — RIGHT (narrow) */}
                    {secondary.length > 0 && (
                      <div className="hero-sidebar">
                        <div className="sidebar-exclusive">
                          <span className="sidebar-exclusive-label">ALSO THIS DAY</span>
                          <h3 className="sidebar-hl">{secondary[0].title.toUpperCase()}</h3>
                          <div className="sidebar-type">{TYPE_LABELS[secondary[0].type]} · {secondary[0].year}</div>
                          <p className="sidebar-text"><SmallText fact={secondary[0]} maxLen={200} /></p>
                          {secondary[0].wikipediaSlug && (
                            <a className="sidebar-more" href={`https://en.wikipedia.org/wiki/${secondary[0].wikipediaSlug}`} target="_blank" rel="noopener noreferrer">Full Report →</a>
                          )}
                        </div>
                        {secondary.length > 1 && (
                          <div className="sidebar-exclusive sidebar-exclusive-2">
                            <h3 className="sidebar-hl-sm">{secondary[1].title.toUpperCase()}</h3>
                            <div className="sidebar-type">{TYPE_LABELS[secondary[1].type]} · {secondary[1].year}</div>
                            <p className="sidebar-text"><SmallText fact={secondary[1]} maxLen={120} /></p>
                          </div>
                        )}
                        <div className="sidebar-ad">
                          <div className="ad-label">ADVERTISEMENT</div>
                          {MAGICAL_ADS[ad1]}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ════ MID-SECTION: remaining stories + filler ════ */}
                  {remaining.length > 0 && (
                    <div className="stories-grid">
                      {remaining.map((fact, i) => {
                        const hasSideFiller = i === 0;
                        return (
                          <div key={fact.title + i} className={`story-cell ${hasSideFiller ? "story-cell-wide" : ""}`}>
                            {/* Small filler headline above some stories */}
                            {i % 2 === 0 && (
                              <div className="cell-mini-hl">{MINI_HEADLINES[stableIndex(s + "cm" + i, MINI_HEADLINES.length)]}</div>
                            )}
                            <h2 className="story-headline">{fact.title.toUpperCase()}</h2>
                            <div className="story-kicker">{TYPE_LABELS[fact.type]} · {fact.year}</div>
                            <div className="story-body">
                              {fact.wikipediaSlug && (
                                <WikiPhoto slug={fact.wikipediaSlug} title={fact.title} />
                              )}
                              <p className="story-text">
                                <span className="drop-cap-sm">{fact.description.charAt(0)}</span>
                                <SmallText fact={fact} maxLen={400} />
                                {fact.wikipediaSlug && (
                                  <span className="read-more">
                                    {" "}<a href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`} target="_blank" rel="noopener noreferrer">Full Report →</a>
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Filler cells to fill gaps */}
                      <div className="filler-cell">
                        <div className="filler-hl">{MINI_HEADLINES[m5]}</div>
                        <p className="filler-text">{NOTICES[n1]}</p>
                      </div>
                      <div className="filler-cell">
                        <div className="filler-hl">{MINI_HEADLINES[m6]}</div>
                        <p className="filler-text">{NOTICES[n2]}</p>
                      </div>
                    </div>
                  )}

                  {/* ════ BOTTOM DENSE ZONE ════ */}
                  <div className="bottom-zone">
                    {/* Left: notices & weather */}
                    <div className="bottom-col bottom-col-notices">
                      <div className="bottom-section-label">WEATHER OUTLOOK</div>
                      <p className="bottom-tiny">{WEATHER[w1]}</p>
                      <div className="bottom-section-label">NOTICES &amp; CLASSIFIEDS</div>
                      <p className="bottom-tiny">{NOTICES[n1]}</p>
                      <p className="bottom-tiny">{NOTICES[n2]}</p>
                      <p className="bottom-tiny">{NOTICES[n3]}</p>
                    </div>

                    {/* Center: mini headlines stack */}
                    <div className="bottom-col bottom-col-headlines">
                      <div className="bottom-mini-hl">{MINI_HEADLINES[m1]}</div>
                      <div className="bottom-mini-hl">{MINI_HEADLINES[m2]}</div>
                      <div className="bottom-mini-hl">{MINI_HEADLINES[m3]}</div>
                      <div className="bottom-mini-hl">{MINI_HEADLINES[m4]}</div>
                      <div className="bottom-mini-hl">{MINI_HEADLINES[m7]}</div>
                      <div className="bottom-mini-hl">{MINI_HEADLINES[m8]}</div>
                    </div>

                    {/* Right: ad boxes */}
                    <div className="bottom-col bottom-col-ads">
                      <div className="bottom-ad">
                        <div className="ad-label">ADVERTISEMENT</div>
                        {MAGICAL_ADS[ad2]}
                      </div>
                      <div className="bottom-ad">
                        <div className="ad-label">ADVERTISEMENT</div>
                        {MAGICAL_ADS[ad3]}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="no-data">The presses have no record for this date.<br /><em>Perhaps the archives have been bewitched.</em></div>
              )}

              {/* ════ BOTTOM TICKER ════ */}
              <div className="prophet-ticker">
                <span className="ticker-scores">
                  — e.limus <strong>{stableIndex(s + "t1", 10)}</strong>
                  {" "}— jobs <strong>{stableIndex(s + "t2", 12)}</strong>
                  {" "}.{" "}heath <strong>{stableIndex(s + "t3", 15)}</strong>
                  {" "}— MINISTRY AFFAIRS <strong>{stableIndex(s + "t4", 20)}</strong>
                  {" "}— sports <strong>{stableIndex(s + "t5", 18)}</strong>
                </span>
              </div>

              <div className="paper-footer">
                <div className="footer-flavor">
                  Nornlore is published on enchanted parchment · Owl subscriptions welcome
                </div>
                <div className="footer-disclaimer">
                  Historical facts are real. All magical theming is satirical and for entertainment.
                </div>
                <div className="footer-links">
                  <Link href="/terms">Terms</Link>
                  <span>·</span>
                  <Link href="/privacy">Privacy</Link>
                  <span>·</span>
                  <a href="https://github.com/apoorvdarshan/nornlore" target="_blank" rel="noopener noreferrer">Source</a>
                </div>
                <div className="footer-credit">
                  Made by <a href="https://apoorvdarshan.com" target="_blank" rel="noopener noreferrer">Apoorv Darshan</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`toast ${toastMsg ? "show" : ""}`}>{toastMsg}</div>
    </>
  );
}
