<p align="center">
  <img src="public/favicon.png" alt="Nornlore" width="80" />
</p>

# Nornlore

**What history shares your birthday?** Enter your birth date and discover the famous people, world events, music releases, and movies tied to your exact day in history — presented as a magical Daily Prophet-style newspaper.

**Live:** [nornlore.apoorvdarshan.com](https://nornlore.apoorvdarshan.com)

## Features

- All events for a date on one dense Daily Prophet-style newspaper page
- Giant headlines, drop caps, halftone photos, filler headlines, magical ads, weather, classifieds
- 1,747 animated GIFs — "moving photographs" for historical events and famous people
- Wikipedia extracts fetched at runtime for rich article content
- Themed loading screen with printing press animation
- Iconic GIFs scattered on landing page (Apollo 11, Marilyn Monroe, Elvis, etc.)
- Mobile responsive with horizontal-scroll photo strips
- Shareable date links (`?date=MM-DD`)
- SEO optimized with Open Graph, Twitter Cards, JSON-LD structured data, sitemap
- Vercel Analytics integration
- Terms of Use and Privacy Policy pages

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## Contributing Data

All birthday data lives in `src/data/birthdays.json`. The file is keyed by `MM-DD` date strings. Each key maps to an array of fact objects.

### Fact Object Schema

```json
{
  "type": "person | event | music | movie",
  "title": "Name or title of the fact",
  "year": 1969,
  "description": "A short, compelling description",
  "wikipediaSlug": "Wikipedia_Article_Title",
  "spotifyTrackId": "spotify track ID or null",
  "youtubeId": "YouTube video ID or null"
}
```

### Field Details

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | One of: `person`, `event`, `music`, `movie` |
| `title` | Yes | Display name |
| `year` | Yes | The year of the event/birth/release |
| `description` | Yes | 1-2 sentence description |
| `wikipediaSlug` | No | Wikipedia article slug for fetching thumbnails and extracts |
| `spotifyTrackId` | No | Spotify track ID for embedded player (music type) |
| `youtubeId` | No | YouTube video ID for embedded trailer (movie/event types) |

## Data Sources

- **Wikipedia** — Thumbnails and extracts fetched at runtime via the [REST API](https://en.wikipedia.org/api/rest_v1/)
- **Historical facts** — Manually curated and verified

## Tech Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [Motion](https://motion.dev) (animations)
- [Vercel Analytics](https://vercel.com/analytics)
- Google Fonts: UnifrakturMaguntia, IM Fell English, IM Fell DW Pica, Playfair Display, Cinzel Decorative

## Project Structure

```
src/
  app/
    page.tsx          — Landing page + newspaper view
    layout.tsx        — Root layout, SEO meta, analytics
    globals.css       — All styles (newspaper theme)
    terms/page.tsx    — Terms of Use
    privacy/page.tsx  — Privacy Policy
    robots.ts         — Search engine crawl rules
    sitemap.ts        — XML sitemap
  data/
    birthdays.json    — All historical facts (keyed by MM-DD)
    fillerContent.ts  — Magical ads, notices, weather, headlines
public/
  gifs/               — 1,747 animated GIFs
  showcase/           — 8 iconic GIFs for landing page
  favicon.ico         — Serif N favicon
  og-image.png        — Open Graph social preview image
```

## Disclaimer

Historical facts presented are real and sourced from publicly available data. All magical theming, wizarding references, fictional advertisements, and newspaper styling are satirical and for entertainment purposes only.

## Author

Made by [Apoorv Darshan](https://apoorvdarshan.com)

- [GitHub](https://github.com/aopv)
- [LinkedIn](https://linkedin.com/in/apoorvdarshan)
- [X / Twitter](https://x.com/apoorvdarshan)
- [Blog](https://apoorvdarshan.com)

## License

See [LICENSE](LICENSE).
