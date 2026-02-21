# Troubleshooting

▶️ _If you need help or have a question, you can open an [issue](https://github.com/ArchiveBox/ArchiveBox/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) or reach out on [Twitter](https://twitter.com/theSquashSH)._

What are you having an issue with?:

- [Installing ArchiveBox](#installing)
- [Upgrading ArchiveBox](Upgrading-or-Merging-Archives.md)
- [Configuring ArchiveBox](Configuration.md)
- [Archiving content with ArchiveBox](#archiving)
- [Hosting your collection publicly](#hosting-the-archive)
- [Database and filesystem issues](#database)

---

## Installing

If using `archivebox` without Docker, make sure you've followed the full guide in the [Install](Install.md) instructions first. Then check here for help depending on what component you need help with.

Then make sure `archivebox` is installed available in your `$PATH`.

```bash
apt show archivebox      # show info about the apt-installed version of archivebox
brew info archivebox     # show info about the brew-installed version of archivebox
pip show archivebox      # show info about the pip-installed version of archivebox

echo $PATH               # show the directories your system is searching for binaries
which -a archivebox      # show all installed archivebox binaries available
which archivebox         # show which archivebox binary is being called
```

**⭐️ Show the full archivebox version info + info about all installed dependencies:**

```bash
archivebox version       # shows lots of useful info about installed dependencies and more
```

(ensure the version shown is the most recent available from [Releases](https://github.com/ArchiveBox/ArchiveBox/releases))

### Python

Make sure you have at least Python 3.13 installed on your system.

```bash
python3 --version
pip --version
pip install --upgrade pip setuptools
```

### Chromium/Google Chrome

For more info, see the [Chromium Install](Chromium-Install.md) page.

ArchiveBox depends on being able to access a `chromium-browser`/`google-chrome` executable. The executable used defaults to `chromium-browser` but can be manually specified with the environment variable `CHROME_BINARY`:

```bash
env CHROME_BINARY=/usr/local/bin/chromium-browser archivebox add ~/Downloads/bookmarks_export.html
```

1. Test to make sure you have Chrome on your `$PATH` with:

```bash
which chromium-browser || which google-chrome
```

2. If a path is displayed, the next step is to check that it's runnable:

```bash
chromium-browser --version || google-chrome --version
```

3. If a version is displayed and it's `<111`, upgrade it:

```bash
apt upgrade chromium-browser -y
# OR
brew cask upgrade chromium-browser
```

4. If a version is displayed and it's `>=111`, make sure ArchiveBox is running the right one:

```bash
env CHROME_BINARY=/path/from/step/1/chromium-browser archivebox version
```

### Wget & Curl

If you're missing `wget` or `curl`, simply install them using `apt` or your package manager of choice. If wget times out or randomly fails, upgrade it to the most recent version.

### Bun Dependencies

Bun packages like `readability`, `singlefile`, etc. are auto-installed by `archivebox setup` into `data/bun/node_modules`.

```bash
bun --version          # make sure you have bun installed

cd ~/archivebox/data   # go into your data directory
archivebox setup       # auto-installs all JS dependencies

archivebox version     # show version full info to make sure they're loaded correctly
```

---

## Archiving

### No links parsed from export file

Please open an [issue](https://github.com/ArchiveBox/ArchiveBox/issues) with a description of where you got the export, and preferably your export file attached (you can redact the links). We'll fix the parser to support your format.

### Lots of skipped sites

If you ran the archiver once, it won't re-download sites subsequent times, it will only download new links. If you haven't already run it, make sure you have a working internet connection and that the parsed URLs look correct.

### Lots of errors

Make sure you have all the dependencies installed and that you're able to visit the links from your browser normally. Open an [issue](https://github.com/ArchiveBox/ArchiveBox/issues) with a description of the errors if you're still having problems.

### Lots of broken links from the index

Not all sites can be effectively archived with each method, that's why it's best to use a combination of `wget`, PDFs, and screenshots. If it seems like more than 10-20% of sites in the archive are broken, open an [issue](https://github.com/ArchiveBox/ArchiveBox/issues).

### Removing unwanted links from the index

```bash
archivebox remove --help
```

---

## Hosting the Archive

If you're having issues trying to host the archive via nginx, make sure you already have nginx running with SSL. Open an [issue](https://github.com/ArchiveBox/ArchiveBox/issues) if you have problem with a particular nginx config.

### Docker Permissions issues

Try Setting `PUID` & `PGID`: [Configuration: PUID/PGID](Configuration.md#puid--pgid)

Try using [`bindfs`](https://github.com/clecherbauer/docker-volume-bindfs) to work around issues by remapping permissions:

```yaml
services:
  archivebox:
    volumes:
      - archivebox-data:/data

volumes:
  archivebox-data:
    driver: lebokus/bindfs:latest
    driver_opts:
      sourcePath: "${EXTERNAL_MOUNT_PARENT}/external-parent/external/archivebox"
      map: "33/911:@33/@911"
```

---

## Database

Database and filesystem issues are uncommon but do come up from time to time (especially when using networked storage, large archives, or multiple ArchiveBox processes for a single collection).

_ℹ️ Generally, these commands can help you resolve most issues:_

```bash
archivebox init                 # upgrade the archivebox collection
archivebox init --setup         # upgrade the archivebox collection and all dependencies
archivebox update --index-only  # force an upgrade of some of the archivebox index/collection files
archivebox server --debug       # run the server with more verbose debug log output
archivebox shell                # access the Python API / Django management shell
sqlite3 index.sqlite3           # access the SQLite3 SQL database shell
```

### Filesystem doesn't support FSYNC (e.g. network mounts)

The `index.sqlite3` file must be stored on a filesystem that supports FSYNC (most local filesystems) in order to ensure SQLite3 database integrity. However, the `./archive` folder can be on a NAS or other filesystem that does not support FSYNC.

- https://github.com/ArchiveBox/ArchiveBox/issues/742
- https://github.com/ArchiveBox/ArchiveBox/issues/894

### Database and filesystem contention issues when running multiple ArchiveBox processes

ArchiveBox can sometimes struggle when archiving many links in parallel with multiple ArchiveBox processes trying to write to the database at the same time, leading to errors like this:

```
Unable to create the django_migrations table (database is locked)
```

- https://github.com/ArchiveBox/ArchiveBox/issues/946
- https://www.sqlite.org/lockingv3.html

### Database migrations errors or upgrade issues

Migration or upgrade issues happen occasionally with some niche setups or when skipping major versions during archiving. Always backup your archive before upgrading, but know that migrations are deterministic and atomic using Django's migration system.

```bash
archivebox init  # this usually applies any necessary migrations (atomically and idempotently, safe to run multiple times)
```

More info:

- https://github.com/ArchiveBox/ArchiveBox/issues/705
- https://docs.djangoproject.com/en/4.0/topics/migrations/

### Repairing a corrupted SQLite3 database file

A corrupted database file can theoretically only happen if an external process or filesystem error corrupts the SQLite3 database.

**Error output:**

```
sqlite3.DatabaseError: database disk image is malformed
```

**Steps to fix:**

```bash
cd ~/archivebox/data
echo '.dump' | sqlite3 index.sqlite3 | sqlite3 repaired_index.sqlite3
mv index.sqlite3 corrupt_index.sqlite3
mv repaired_index.sqlite3 index.sqlite3
```

More info:

- https://github.com/ArchiveBox/ArchiveBox/issues/955
- https://stackoverflow.com/questions/5274202/sqlite3-database-or-disk-is-full-the-database-disk-image-is-malformed

---

See here for more info:

- [Upgrading or Merging Archives](Upgrading-or-Merging-Archives.md)
- https://github.com/ArchiveBox/ArchiveBox/issues?q=is%3Aissue+is%3Aopen+label%3Abug
