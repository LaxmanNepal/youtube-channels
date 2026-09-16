# Laxman Nepal YouTube Command Center

Live multi-channel dashboard using **YouTube Data API v3** for channel data and official YouTube channel thumbnails.

## Channels

- @laxmannepalofficial
- @laxmannepalenglish
- @iamfromhetauda
- @hamrotechnicalknowledge
- @laxmannepalvlogs
- @lifeoflaxman
- @ShreeKathaGhar
- @LaxmanLoFi
- @LNN1053
- @TheLaxmanNepal

## What it shows

- Total subscribers, lifetime views and video count
- Current subscriber ranking
- Subscriber share visualization
- Search and sorting
- Per-channel cards with the official YouTube channel logo/avatar
- Refresh control and data-mode timestamp
- Responsive iPhone-inspired liquid glass UI
- Creator planning, growth and monetization sections

## How channel logos are fetched

The repository uses **YouTube Data API v3 `channels.list`** with `forHandle` and `part=snippet,statistics`. The `snippet.thumbnails` returned by YouTube is used as the official channel logo source.

The GitHub Actions snapshot job downloads that YouTube thumbnail into `data/avatars/` and stores both the local path and original YouTube thumbnail URL in the snapshot. This lets the dashboard continue showing logos without exposing a server API key in the browser.

Logo priority in the dashboard:

1. Cached logo downloaded from the YouTube Data API
2. Official YouTube thumbnail URL returned by the API
3. Initial-letter fallback if both are unavailable

## API key

For production, keep the YouTube Data API key in the GitHub Actions secret named `YOUTUBE_API_KEY`. Do **not** commit a private API key into `config.js`.

The snapshot workflow runs daily, can be started manually with **Run workflow**, and also bootstraps after normal pushes. Its bot-created snapshot commit is ignored by the same workflow so it cannot loop forever.

If browser-side live refresh is desired, a separate browser key can be placed in `config.js`, but it must be restricted to the exact deployed domain and to the YouTube Data API only. A browser key is visible to visitors.

## Deploy

This is a static site. GitHub Pages or another static host can serve the repository root directly.
