# Roadmap

▶️ _Comment here to discuss the contribution roadmap:  
[Official Roadmap Discussion](https://github.com/ArchiveBox/ArchiveBox/issues/120)._

---

## Planned Specification

(this is not set in stone, just a rough estimate)

### `v0.7: Schema improvements` ✅ Complete

- ✅ move config loading logic into settings.py
- ✅ move all the extractors into "plugin" style folders that register their own config
- ✅ make `out_dir`, `link_dir`, `extractor_dir`, naming consistent across codebase via plugin system
- ✅ remove `timestamps` as primary keys in favor of UUIDs — [#74](https://github.com/ArchiveBox/ArchiveBox/issues/74)
- ✅ create a migration system for folder layout independent of the index
- ✅ make `Tag` a real model `ManyToMany` with Snapshots
- ✅ allow multiple Snapshots of the same site over time + CLI / UI to manage those
- ✅ upgrade from Django 3 to Django 5/6 — [#988](https://github.com/ArchiveBox/ArchiveBox/issues/988)

### `v0.8: Security` 🛠 Mostly Complete

- ✅ Add CSRF/CSP/XSS protection to rendered archive pages
- ✅ Provide secure reverse proxy config in docker-compose.yml (nginx example)
- ✅ Create UX flow for users to setup session cookies / auth for archiving private sites
  - ✅ cookies for wget, curl, etc. low-level commands (`COOKIES_FILE` option)
  - ✅ Chrome user profile setup for Chrome archiving methods (`CHROME_USER_DATA_DIR` option)
  - ✅ Docker VNC setup guide for logging into sites in ArchiveBox's browser
- ✅ REST API with token/session/header authentication (`/api/v1/` with `django-ninja`)
- ✅ LDAP authentication support
- ✅ Reverse proxy authentication (header-based SSO support)

### `v0.9: Performance` 🛠 In Progress (current: v0.9.3)

- ✅ Break up archiving process into tasks on a queue that a worker pool executes
  - ✅ Custom `Orchestrator` + `Worker` pool system in `archivebox/workers/`
  - ✅ `CrawlWorker` and snapshot-level workers with state machines
  - ✅ `supervisord`-based process management
- ✅ Plugin-based extractor hooks (`on_Snapshot__*.js`, `on_Crawl__*.py`) for lifecycle management
- ✅ Chrome tab management via CDP (Chrome DevTools Protocol) using `chrome_utils.js`
- ✅ Switch from Node.js/npm to [Bun](https://bun.sh) for JS plugin execution (faster startup, unified install/run/test toolchain)
- 🛠 Keep browser sessions open across multiple snapshots (reduce open/close overhead)
- 🛠 Multi-user support with separate personas/credentials
- 📅 Remove Seed model (v0.9.x — Crawl model now stores URLs directly, Seed model removed)

### `v1.0: Full headless browser control` 🛠 In Progress

- ✅ Run user-scripts / extensions in the context of the page during archiving (via plugin hooks)
  - ✅ `ublock` — uBlock Origin ad blocking extension support
  - ✅ `istilldontcareaboutcookies` — Cookie banner dismissal
  - ✅ `modalcloser` — Modal dialog dismissal
  - ✅ `infiniscroll` — Infinite scroll handler
  - ✅ `twocaptcha` — 2captcha CAPTCHA solver integration
- ✅ Community userscripts for unrolling twitter threads, reddit threads, youtube comment sections, etc.
  - ✅ `twitter_thread_unroll` — expand "Show more replies" and thread continuations on Twitter/X
  - ✅ `reddit_thread_expand` — expand collapsed comments and "load more" on Reddit
  - ✅ `youtube_comments_expand` — scroll and expand replies in YouTube comment sections
- 📅 pywb-based headless browser session recording and WARC replay
- ✅ Archive proxy support
  - ✅ Support sending upstream requests through an external proxy (`UPSTREAM_PROXY` config, supported by `wget` and `chrome`)
  - 📅 Support for exposing a proxy that archives all downstream traffic

...

### `v2.0 Federated or distributed archiving + paid hosted service offering` 📅 Future

- 📅 ZFS / Merkle tree for storing archive output subresource hashes
- 📅 DHT for assigning Merkle tree hash:file shards to nodes
- 📅 Tag system for tagging certain hashes with human-readable names, e.g. title, url, tags, filetype etc.
- 📅 Distributed tag lookup system

---

### Major long-term changes

- ✅ Release **`pip`, `apt`, `pkg`, and `brew` packaged distributions** for installing ArchiveBox
- ✅ Add an **optional web GUI** for managing sources, adding new links, and viewing the archive
- ✅ Switch to Django + **SQLite DB with migrations system** & JSON/HTML export for managing archive schema changes and persistence
- ✅ Move extractors into **modular plugin system** allowing importing individual components
- ✅ **Support storing multiple snapshots** of pages over time
- ✅ Support custom user **puppeteer/playwright scripts** and **browser extensions** to run while archiving
- ✅ Full-text search of extracted text with ripgrep/Sonic/SQLite backends
- ✅ Download closed-caption subtitles from YouTube and other video sites (`yt-dlp` integration)
- ✅ Upgrade from Django 3 to Django 6+
- ✅ REST API via `django-ninja` with multiple auth methods
- ✅ Task queue / worker pool with custom `Orchestrator` + `Worker` system
- ✅ Switch from Node.js/npm to [Bun](https://bun.sh) for JS plugin execution
- 🛠 Switch to SHA256 of URL as unique link ID (UUIDs currently, migration to content hashes pending)
- 📅 Support named collections of archived content with different user access permissions
- 📅 Support sharing archived assets via DHT + torrent / IPFS / ZeroNet / other sharing system

### Smaller planned features

- ✅ Body text extraction to markdown (using `readability-js` and mercury)
- ✅ Featured image / thumbnail extraction (via screenshot plugin)
- ✅ Full-text search of extracted text with Sonic/ripgrep/SQLite
- ✅ Download closed-caption subtitles from YouTube and other video sites
- 📅 Support pushing pages to multiple 3rd-party services using ArchiveNow instead of just archive.org
- 📅 Auto-tagging links based on important/frequent keywords in extracted text (like Pocket)
- 📅 Automatic article summary paragraphs from extracted text with NLP summarization library
- 📅 Try pulling dead sites from archive.org and other sources if original is down
- 📅 And more in the [issues list](https://github.com/ArchiveBox/ArchiveBox/issues/)...

---

**IMPORTANT**: _Please don't work on any of these major long-term tasks without [contacting me first](https://nicksweeting.com/blog#Contact-Me), work is already in progress for many of these, and I may have to reject your PR if it doesn't align with the existing work!_

---

## Past Releases

To see how this spec has been scheduled / implemented / released so far, read these pull requests:

- ✅ v0.1.x pre-git-history (~2017)
- ✅ [v0.2.x](https://github.com/ArchiveBox/ArchiveBox/tree/483a3bef9e2b1a7b80611947a3be99b0cf4f9959) (~2018/12)
- ✅ [v0.3.x](https://github.com/ArchiveBox/ArchiveBox/pull/197) (~2019/03)
- ✅ [v0.4.x](https://github.com/ArchiveBox/ArchiveBox/pull/207) (~2019/04)
- ✅ [v0.5.x](https://github.com/ArchiveBox/ArchiveBox/pull/552) (~2020/11)
- ✅ [v0.6.x](https://github.com/ArchiveBox/ArchiveBox/pull/680) (~2021/03)
- 🏖️ `sabbatical / coding hiatus during 2022`
- ✅ [v0.7.x](https://github.com/ArchiveBox/ArchiveBox/pull/721) (~2023/11)
- ✅ [v0.8.x](https://github.com/ArchiveBox/ArchiveBox/pull/1311) (~2024/05)
- 🛠 v0.9.x in progress (current: v0.9.3)...
- 📅 v1.0 up next...

---

## UI / UX Improvements Planned

- https://github.com/ArchiveBox/ArchiveBox/issues/1358
- https://github.com/ArchiveBox/ArchiveBox/issues/1273
- https://github.com/ArchiveBox/ArchiveBox/issues/988
- https://github.com/ArchiveBox/ArchiveBox/issues/930

---

## New Extractors Planned

- `gallery-dl`: https://github.com/ArchiveBox/ArchiveBox/issues/564
- `forum-dl`: https://github.com/ArchiveBox/ArchiveBox/issues/1368 _(plugin stub exists: `archivebox/plugins/forumdl/`)_
- `scihub-dl`: https://github.com/ArchiveBox/ArchiveBox/issues/720 _(plugin stub exists: `archivebox/plugins/papersdl/`)_
- `cad-dl`: https://github.com/ArchiveBox/ArchiveBox/issues/668
- `aria2`: https://github.com/ArchiveBox/ArchiveBox/issues/1355
- `podcast-archiver`: https://github.com/ArchiveBox/ArchiveBox/issues/1357
- `bdfr`: https://github.com/ArchiveBox/ArchiveBox/issues/778
- `cutycapt` screenshots: https://github.com/ArchiveBox/ArchiveBox/issues/253
- sourcemap downloader: https://github.com/ArchiveBox/ArchiveBox/issues/1291

[ArchiveBox Developer Documentation: Contributing a New Extractor](https://github.com/ArchiveBox/ArchiveBox#contributing-a-new-extractor)

### Social Media

- Instagram
  - https://github.com/instaloader/instaloader (instagram downloader)
- Telegram
  - https://github.com/iyear/tdl (telegram downloader)
- TikTok
  - https://github.com/charmparticle/tiktokget (tiktok downloader using yt-dlp)
- Twitter
  - https://github.com/HoloArchivists/twspace-dl (twitter spaces archiver)

### Video/Streams

- https://github.com/soimort/you-get ⭐️
- https://github.com/lay295/TwitchDownloader
- https://github.com/ihabunek/twitch-dl
- https://github.com/iawia002/lux (generic video/audio downloader)
- https://github.com/wukko/cobalt (generic video/audio downloader)

### Audio/Music

- https://github.com/nathom/streamrip (Qobuz, Tidal, Deezer and SoundCloud)
- https://github.com/spotDL/spotify-downloader
- https://github.com/iheanyi/bandcamp-dl

### Photos/Images/Comics

- https://github.com/mikf/gallery-dl ⭐️
- https://github.com/Bionus/imgbrd-grabber (generic image board downloader)
- https://github.com/metafates/mangal (manga downloader)

### Text/Forums

- https://github.com/mikwielgus/forum-dl ⭐️
- https://github.com/AndyTheFactory/newspaper4k ⭐️
- https://github.com/extractus/article-extractor

### MOOC/Educational Content

- https://github.com/coursera-dl/coursera-dl
- https://github.com/rand-net/khan-dl
- https://github.com/Puyodead1/udemy-downloader

### Re-Archiving / WARC Creation

- https://github.com/hartator/wayback-machine-downloader
- https://github.com/ArchiveTeam/grab-site
- https://github.com/oduwsdl/archivenow
- https://github.com/internetarchive/heritrix3

### Other

- https://github.com/KurtBestor/Hitomi-Downloader
- https://github.com/matlink/gplaycli (Google Play store Android app downloader)
- https://github.com/AlphaSlayer1964/kemono-dl (Patreon, gumroad, etc. archiver)
