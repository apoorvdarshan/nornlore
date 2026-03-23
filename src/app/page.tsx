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

const ORNAMENTS = ["/quill-ornament.png", "/owl-ornament.png", "/wand-ornament.png"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function NpSelect({
  value, onChange, placeholder, options,
}: {
  value: string; onChange: (val: string) => void; placeholder: string;
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
    <div className={`np-select ${open ? "open" : ""}`} ref={ref}>
      <button type="button" className="np-select-trigger" onClick={() => setOpen(!open)} aria-label={placeholder}>
        <span className={value ? "" : "placeholder"}>{selectedLabel}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="np-select-arrow">
          <path d="M3 6 L8 11 L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="np-select-dropdown" initial={{ opacity: 0, y: -4, scaleY: 0.95 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={{ opacity: 0, y: -4, scaleY: 0.95 }} transition={{ duration: 0.12 }}>
            {options.map((opt) => (
              <button key={opt.value} type="button" className={`np-select-option ${opt.value === value ? "selected" : ""}`} onClick={() => { onChange(opt.value); setOpen(false); }}>
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WikiImage({ slug, title, cover }: { slug: string; title: string; cover?: boolean }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const width = cover ? 800 : 400;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.originalimage?.source && cover) {
          setSrc(d.originalimage.source);
        } else if (d.thumbnail?.source) {
          setSrc(d.thumbnail.source.replace(/\/\d+px-/, `/${width}px-`));
        }
      })
      .catch(() => {});
  }, [slug, cover]);

  if (!src) return null;

  return (
    <div className="article-image">
      <img src={src} alt={title} loading="lazy" />
      <div className="article-image-caption">{title}</div>
    </div>
  );
}

function LeadStory({ fact }: { fact: Fact }) {
  const hasImage = (fact.type === "person" || fact.type === "event") && fact.wikipediaSlug;

  const fillerText = fact.description.length < 200
    ? " The full account of these remarkable circumstances, as pieced together by our most diligent correspondents, reveals a tapestry of events that would astound even the most seasoned chronicler. Witnesses to these proceedings have described scenes of such import that the very fabric of the age was altered irrevocably. Our reporters continue to investigate."
    : "";

  return (
    <motion.article className="lead-story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
      <div className="lead-kicker">
        <span className="exclusive-badge">Exclusive</span>
        {TYPE_LABELS[fact.type]} · {fact.year}
      </div>
      <h2 className="lead-headline">{fact.title}</h2>
      <div className="lead-subhead">A chronicle of events most extraordinary, as recorded by the enchanted quills of the Nornlore press corps</div>

      <div className={`lead-body ${hasImage ? "" : "no-image"}`}>
        {hasImage && (
          <div className="lead-image-col">
            <WikiImage slug={fact.wikipediaSlug!} title={fact.title} cover />
          </div>
        )}
        <div className="lead-text-col">
          <p className="lead-desc">
            <span className="drop-cap">{fact.description.charAt(0)}</span>
            {fact.description.slice(1)}{fillerText}
          </p>
          {fact.wikipediaSlug && (
            <a className="article-read-more" href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`} target="_blank" rel="noopener noreferrer">
              Full Report p.4 →
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ColumnStory({ fact, index }: { fact: Fact; index: number }) {
  const hasImage = (fact.type === "person" || fact.type === "event") && fact.wikipediaSlug;
  const isFeatured = index < 2;

  return (
    <motion.article className={`col-story ${isFeatured ? "featured" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.04 + index * 0.03 }}>
      <div className="col-kicker">{TYPE_LABELS[fact.type]}</div>
      <h3 className="col-headline">{fact.title}</h3>
      <div className="col-year">{fact.year}</div>
      {hasImage && <WikiImage slug={fact.wikipediaSlug!} title={fact.title} />}
      <p className="col-desc">{fact.description}</p>
      {fact.wikipediaSlug && (
        <a className="article-read-more" href={`https://en.wikipedia.org/wiki/${fact.wikipediaSlug}`} target="_blank" rel="noopener noreferrer">
          p.{index + 2} →
        </a>
      )}
    </motion.article>
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
    const params = new URLSearchParams(window.location.search);
    const d = params.get("date");
    if (d && /^\d{2}-\d{2}$/.test(d)) {
      setMonth(d.split("-")[0]);
      setDay(d.split("-")[1]);
      navigateToDate(d);
    }
  }, []);

  const navigateToDate = useCallback((key: string) => {
    setDateKey(key);
    setFacts(shuffle(data[key] || []));
    setFilter("all");
    setView("cards");
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
    navigator.clipboard.writeText(url).then(() => showToast("Link copied!"));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  useEffect(() => {
    const handler = () => {
      const p = new URLSearchParams(window.location.search);
      const d = p.get("date");
      if (d && /^\d{2}-\d{2}$/.test(d)) navigateToDate(d);
      else setView("landing");
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [navigateToDate]);

  const filters = [
    { key: "all", label: "All" },
    { key: "person", label: "Births" },
    { key: "event", label: "World Affairs" },
    { key: "music", label: "Music" },
    { key: "movie", label: "Pictures" },
  ];

  const leadStory = filtered[0];
  const columnStories = filtered.slice(1);

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div key="landing" className="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="newspaper-page">
              <motion.div className="rule-heavy" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.05, duration: 0.4 }} style={{ transformOrigin: "center" }} />

              <motion.div className="masthead-corner-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="masthead-corner">bewitch · beguile<br />conjure · enchant</div>
                <div className="masthead-corner" style={{ textAlign: "right" }}>spellbind · divine<br />foretell · charm</div>
              </motion.div>

              <motion.div className="masthead-tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.3 }}>
                ★ The Wizard World&apos;s Most Beguiling Broadsheet ★
              </motion.div>

              <motion.div className="masthead-ornaments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <img src="/owl-ornament.png" className="masthead-ornament-img" alt="" aria-hidden="true" />
                <div>
                  <div className="masthead-banner"><img src="/newspaper-header.png" alt="" aria-hidden="true" /></div>
                  <h1 className="masthead-title">Nornlore</h1>
                  <div className="masthead-subtitle">The Enchanted Chronicle</div>
                </div>
                <img src="/wand-ornament.png" className="masthead-ornament-img" alt="" aria-hidden="true" />
              </motion.div>

              <motion.div className="rule-double-inv" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.4 }} style={{ transformOrigin: "center" }} />

              <motion.div className="masthead-info-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.3 }}>
                <span>Est. Since Time Immemorial</span><span>★</span>
                <span>Price: 5 Knuts</span><span>★</span>
                <span>Editor: Barnabas Cuffe</span><span>★</span>
                <span>Enchanted Edition</span>
              </motion.div>

              <motion.div className="rule-thin" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.3 }} style={{ transformOrigin: "center" }} />

              <motion.div className="landing-cta" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
                <h2 className="cta-headline">What History Shares Your Birthday?</h2>
                <p className="cta-subtitle">Enter your date of birth to reveal the extraordinary events, legendary figures, and enchanted tales woven into your day.</p>
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
              </motion.div>

              <div className="scroll-divider"><img src="/scroll-divider.png" alt="" aria-hidden="true" /></div>

              <motion.div className="rule-double" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.3 }} style={{ transformOrigin: "center" }} />

              <motion.div className="landing-bottom-bar" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.8, duration: 0.4 }}>
                <span>Births</span><span>★</span><span>Events</span><span>★</span>
                <span>Music</span><span>★</span><span>Pictures</span><span>★</span>
                <span>366 Dates</span><span>★</span><span>2,594 Tales</span>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="app" className="app-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="newspaper-page">
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="rule-heavy" />
                <div className="paper-masthead-row">
                  <button className="back-btn" onClick={goBack}>← Back</button>
                  <div className="paper-masthead-center">
                    <div className="masthead-tagline-sm">The Enchanted Chronicle</div>
                    <div className="masthead-title-sm">Nornlore</div>
                  </div>
                  <button className="share-btn" onClick={handleShare}>Share</button>
                </div>
                <div className="rule-double-inv" />
                <div className="masthead-info-bar">
                  <span>{headerDateStr}</span><span>★</span>
                  <span>Enchanted Edition</span><span>★</span>
                  <span>{filtered.length} {filtered.length === 1 ? "tale" : "tales"}</span>
                </div>
                <div className="rule-thin" />
              </motion.div>

              <motion.div className="filter-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08, duration: 0.25 }}>
                {filters.map((f) => (
                  <button key={f.key} className={`filter-pill ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </motion.div>

              {filtered.length > 0 ? (
                <div key={filter}>
                  {leadStory && <LeadStory fact={leadStory} />}
                  {columnStories.length > 0 && (
                    <div className="section-rule"><span className="section-rule-text">More Chronicles</span></div>
                  )}
                  {columnStories.length > 0 && (
                    <div className="columns-grid">
                      {columnStories.map((fact, i) => (
                        <ColumnStory key={`${fact.title}-${fact.year}-${i}`} fact={fact} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data"><div className="no-data-text">The presses have no record for this date.<br /><em>Perhaps the archives have been bewitched.</em></div></div>
              )}

              <div className="paper-footer">
                <div className="rule-double" />
                <div className="paper-footer-bar">
                  <span>Potions 3</span><span>★</span><span>Spells 5</span><span>★</span>
                  <span>Hocus-Pocus 7</span><span>★</span><span>Ministry Affairs 11</span><span>★</span><span>Games 7</span>
                </div>
                <div className="rule-thin" />
                <div className="paper-footer-text">Nornlore — All tales verified by the Dept. of Historical Sorcery — &quot;Nobody Wastes the Daily Prophet&quot;</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`toast ${toastMsg ? "show" : ""}`}>{toastMsg}</div>
    </>
  );
}
