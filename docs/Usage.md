# Usage

▶️ _Make sure the dependencies are [fully installed](Install.md) before running any ArchiveBox commands._

**ArchiveBox API Reference:**

- [CLI Usage](#cli-usage): Docs and examples for the ArchiveBox command line interface.
- [Admin UI Usage](#ui-usage): Docs and screenshots for the outputted HTML archive interface.
- [Browser Extension Usage](#browser-extension-usage): Docs and screenshots for the browser extension.
- [Disk Layout](#disk-layout): Description of the archive folder structure and contents.

**Related:**

- [Docker](Docker.md): Learn about ArchiveBox usage with Docker and Docker Compose
- [Configuration](Configuration.md): Learn about the various archive method options
- [Scheduled Archiving](Scheduled-Archiving.md): Learn how to set up automatic daily archiving
- [Publishing Your Archive](Publishing-Your-Archive.md): Learn how to host your archive for others to access
- [Troubleshooting](Troubleshooting.md): Resources if you encounter any problems

---

## CLI Usage

All three of these ways of running ArchiveBox are equivalent and interchangeable:

- `archivebox [subcommand] [...args]`  
  _Using the PyPI package via `pip install archivebox`_
- `docker run ... archivebox/archivebox [subcommand] [...args]`  
  _Using the official Docker image_
- `docker-compose run archivebox [subcommand] [...args]`  
  _Using the official Docker image w/ Docker Compose_

You can share a single archivebox data directory between Docker and non-Docker instances as well, allowing you to run the server in a container but still execute CLI commands on the host for example.

For more examples see [README: Usage](https://github.com/ArchiveBox/ArchiveBox#-cli-usage) and [Docker](Docker.md) pages.

---

### Run ArchiveBox with configuration options

You can set environment variables in your shell profile, a config file, or by using the `env` command.

```bash
# set config via the CLI
archivebox config --set MEDIA_MAX_SIZE=750mb

# OR modify the config file directly
echo 'MEDIA_MAX_SIZE=750mb' >> ArchiveBox.conf

# OR use environment variables
env MEDIA_MAX_SIZE=750mb archivebox add 'https://example.com'
```

See [Configuration](Configuration.md) page for more details.

> **Tip:** You can run ArchiveBox commands from anywhere (without having to `cd` into a data directory first):  
> `/usr/bin/env --chdir=/path/to/archivebox/data archivebox update`

---

### Import a single URL

```bash
archivebox add 'https://example.com'
# OR
echo 'https://example.com' | archivebox add
```

You can also add `--depth=1` to any of these commands if you want to recursively archive the URLs and all URLs one hop away. (e.g. all the outlinks on a page + the page).

### Import a list of URLs from a text file

```bash
cat urls_to_archive.txt | archivebox add
# OR
archivebox add < urls_to_archive.txt
# OR
curl 'https://example.com/some/rss/feed.xml' | archivebox add
# OR
archivebox add --depth=1 'https://example.com/some/rss/feed.xml'
```

You can also pipe in RSS, XML, Netscape, or any of the other [supported import formats](Quickstart.md#2-get-your-list-of-urls-to-archive) via stdin.

```bash
archivebox add < ~/Downloads/browser_bookmarks_export.html
# OR
archivebox add < ~/Downloads/pinboard_bookmarks.json
# OR
archivebox add < ~/Downloads/any_text_containing_urls.txt
```

---

### Import list of links from browser history

Look in the `bin/` folder of this repo to find a script to parse your browser's SQLite history database for URLs.

```bash
./bin/export-browser-history --chrome
archivebox add < output/sources/chrome_history.json
# or
./bin/export-browser-history --firefox
archivebox add < output/sources/firefox_history.json
# or
./bin/export-browser-history --safari
archivebox add < output/sources/safari_history.json
```

---

## UI Usage

```bash
# configure which areas you want to require login to use vs make publicly available
archivebox config --set PUBLIC_INDEX=False
archivebox config --set PUBLIC_SNAPSHOTS=False
archivebox config --set PUBLIC_ADD_VIEW=False

archivebox manage createsuperuser  # set an admin password to use for any areas requiring login
archivebox server 0.0.0.0:8000     # start the archivebox web server

open http://127.0.0.1:8000         # open the admin UI in a browser to view your archive
```

_See the [Configuration Wiki](Configuration.md#public_index--public_snapshots--public_add_view) and [Security Wiki](Security-Overview.md#archiving-private-content) for more info._

Or if you prefer to generate a [static HTML index](https://github.com/ArchiveBox/ArchiveBox#static-archive-exporting) instead of using the built-in web server, you can run `archivebox list --html --with-headers > ./index.html` and then open `./index.html` in a browser.

### Explanation of buttons in the web UI - admin snapshots list

A logged-in admin user may select ☑️ one or more snapshots from the list and perform Snapshot actions:

- **Search** — Search text in the Snapshot title, URL, tags, or archived content (supports regex with the default ripgrep search backend)
- **Tags** — Start typing in the field to select some tags, then click `+` to add them or `-` to remove them from the checked snapshots
- **Title** — Pull the latest title and favicon without doing a full snapshot
- **Pull** — Finish downloading the Snapshot, pulls any missing/failed outputs/extractors methods. Resumes running the same archiving steps as when you add new URL.
- **Re-Snapshot** — Re-archive the original URL from scratch as a new separate snapshot.
- **Reset** — Keep the Snapshot entry, but delete all its archive results and redownload them from scratch immediately.
- **Delete** — Delete a snapshot and all its archive results entirely. This action cannot be undone.

---

## Browser Extension Usage

Set up the official [ArchiveBox Browser Extension](https://github.com/ArchiveBox/archivebox-browser-extension) to submit URLs directly from your browser to ArchiveBox.

1. Install the extension in your browser:
   - [Google Chrome / Edge / All Chromium-based browsers...](https://chrome.google.com/webstore/detail/habonpimjphpdnmcfkaockjnffodikoj)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/archivebox-exporter/)

2. Log into your ArchiveBox server's admin UI in the same browser where you installed the extension, e.g.  
   [`http://localhost:8000/admin/`](http://localhost:8000/admin/) or `https://demo.archivebox.io/admin/`  
   The extension will re-use your admin UI login session to submit URLs to your server.

3. Click the ArchiveBox extension in your browser and set `Config > ArchiveBox Base URL` to your server's URL, e.g. `http://localhost:8000` or `https://demo.archivebox.io`

4. ✅ Done! Test it out: `Right-click on any page > ArchiveBox Exporter > Archive Current Page`

**More Info:**

- https://github.com/ArchiveBox/archivebox-browser-extension
- https://github.com/ArchiveBox/archivebox-browser-extension#setup
- https://github.com/ArchiveBox/archivebox-browser-extension#features

---

## Disk Layout

The `OUTPUT_DIR` folder (usually whatever folder you run the `archivebox` command in), contains the UI HTML and archived data with the structure outlined below.

Simply back up the entire `data/` folder to back up your archive, e.g. `zip -r data.backup.zip data`.

```
data/
  index.sqlite3        # Main index of all archived URLs
  ArchiveBox.conf      # Main config file in ini format

  archive/
    155243135/        # Archived links are stored in folders by timestamp
      index.json     # Index/details page for individual archived link
      index.html

      # Archive method outputs:
      warc/
      media/
      git/
      ...

  sources/             # Each imported URL list is saved as a copy here
    getpocket.com-1552432264.txt
    stdin-1552291774.txt
    ...
```

### Large Archives

I've found it takes about an hour to download 1000 articles, and they'll take up roughly 1GB.  
Those numbers are from running it single-threaded on my i5 machine with 50mbps down. YMMV.

Storage requirements go up immensely if you're using `FETCH_MEDIA=True` and are archiving many pages with audio & video.

You can try to run it in parallel by manually splitting your URLs into separate chunks:

```bash
archivebox add < urls_chunk_1.txt &
archivebox add < urls_chunk_2.txt &
archivebox add < urls_chunk_3.txt &
```

Users have reported running it with 50k+ bookmarks with success.

---

## SQL Shell Usage

Explore the SQLite3 DB a bit to see what's available using the SQLite3 shell:

```bash
cd ~/archivebox/data
sqlite3 index.sqlite3

# example usage:
SELECT * FROM core_snapshot;
UPDATE auth_user SET email = 'someNewEmail@example.com' WHERE username = 'someUsernameHere';
...
```

More info:

- https://github.com/ArchiveBox/ArchiveBox#-sqlpythonfilesystem-usage
- [Upgrading or Merging Archives](Upgrading-or-Merging-Archives.md)

---

## Python Shell Usage

Explore the Python API a bit to see what's available using the archivebox shell:

**Python API Documentation:** https://docs.archivebox.io/dev/apidocs/index.html

```bash
$ archivebox shell

# Shell Plus Model Imports
from core.models import Snapshot
from django.contrib.auth.models import Group, Permission, User
from archivebox.core.models import Snapshot, User
from archivebox import *

# run Python API queries/function calls directly
>>> print(Snapshot.objects.filter(is_archived=True).count())
24

# get help info on an object or function
>>> help(Snapshot)
```

For more info and example usage:

- https://github.com/ArchiveBox/ArchiveBox/wiki/Upgrading-or-Merging-Archives#example-adding-a-new-user-with-a-hashed-password
- https://github.com/ArchiveBox/ArchiveBox/blob/dev/archivebox/main.py
