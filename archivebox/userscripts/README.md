# ArchiveBox Community Userscripts

These are ready-to-use JavaScript hooks that run inside the headless browser during archiving.
They improve archival quality for specific sites by expanding collapsed content before the
snapshot is taken.

## How to Install

Copy (or symlink) the desired script into your ArchiveBox `plugins/` directory inside a plugin
folder so that the hook system picks it up automatically:

```bash
# From your DATA_DIR (where index.sqlite3 lives):
mkdir -p plugins/twitter_thread_unroll
cp /path/to/archivebox/userscripts/twitter_thread_unroll.js \
   plugins/twitter_thread_unroll/on_Snapshot__46_twitter_thread_unroll.js

# Restart or re-run archivebox for the hook to be discovered:
archivebox status
```

The numeric prefix in the filename (`__46_`) controls execution order relative to other hooks
(screenshot runs at `__50_`, so `__46_` runs just before it).

## Available Userscripts

| Script | Sites | What it does |
|--------|-------|--------------|
| `twitter_thread_unroll.js` | twitter.com, x.com | Expands "Show more replies", loads full threads |
| `reddit_thread_expand.js` | reddit.com, old.reddit.com | Expands collapsed comment chains |
| `youtube_comments_expand.js` | youtube.com | Scrolls to load more comments |

## Environment Variables

Each script honours a `<SCRIPTNAME>_ENABLED` env var (default `true`) and
`<SCRIPTNAME>_TIMEOUT` (default `30` seconds).

## Contributing

Community userscript contributions are welcome!  A good userscript:

- Reads its enable flag (`process.env.<NAME>_ENABLED`) and exits early if disabled
- Connects to the existing Chrome session via `../chrome/cdp_url.txt`
- Uses `page.evaluate()` to manipulate the DOM
- Writes a one-line JSONL status to stdout on completion
- Is idempotent (safe to run more than once)

See the existing built-in plugins under `archivebox/plugins/infiniscroll/` and
`archivebox/plugins/modalcloser/` for reference implementations.
