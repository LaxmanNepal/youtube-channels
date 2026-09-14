# Laxman Nepal YouTube Command Center

Live multi-channel dashboard using **YouTube Data API v3 only** for channel data.

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
- Per-channel live cards with avatar and metrics
- Refresh control and live timestamp
- Responsive iPhone-inspired liquid glass UI
- Motivation/focus panel based on real current totals

The app uses `channels.list` with `forHandle` and `part=snippet,statistics`. It does not use SocialBlade or another analytics provider, and it does not fabricate growth numbers.

## API key

The browser must have a YouTube Data API key. `app.js` intentionally does not contain the supplied key, because this repository is public and committing API credentials is unsafe.

For local/private deployment, set `window.YOUTUBE_API_KEY` before loading `app.js`, or replace the placeholder with a key that is restricted to the exact deployed domain and YouTube Data API only.

If deploying on GitHub Pages, create a restricted browser key in Google Cloud. A browser key is visible to visitors, so **HTTP referrer restrictions are mandatory**. Do not use an unrestricted server credential here.

## Deploy

This is a static site. GitHub Pages can serve the repository root directly.
