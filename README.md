# Nornlore

**What history shares your birthday?** Enter your birth date and discover the famous people, world events, music releases, and movies tied to your exact day in history.

A static web app built with [Astro](https://astro.build), deployed to GitHub Pages. No backend, no paid APIs — fully offline data with runtime Wikipedia thumbnails.

## Live Site

[https://apoorvdarshan.github.io/nornlore/](https://apoorvdarshan.github.io/nornlore/)

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
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

### Media Rules

- **person** / **event**: Set `wikipediaSlug` to fetch a thumbnail and extract at runtime
- **music**: Set `spotifyTrackId` for an embedded Spotify player (30s preview)
- **movie**: Set `youtubeId` for an embedded YouTube trailer

To add a new date, add a new `"MM-DD"` key with an array of facts. Aim for a good mix of types per date.

## Data Sources

- **Wikipedia** — Thumbnails and extracts fetched at runtime via the [REST API](https://en.wikipedia.org/api/rest_v1/)
- **Spotify** — Embedded player iframes (no API key needed)
- **YouTube** — Embedded video iframes (no API key needed)
- **Historical facts** — Manually curated and verified

## Tech Stack

- [Astro](https://astro.build) (static output)
- Vanilla JS (no framework)
- CSS scroll snap (mobile-first, touch-friendly)
- Google Fonts: Cinzel + Lora

## License

See [LICENSE](LICENSE).
