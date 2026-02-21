# Security Overview

> 💬 We offer [consulting services](https://docs.monadical.com/s/archivebox-consulting-services) to set up, secure, and maintain ArchiveBox on your preferred hosting environment.  
> We use this revenue (from corporate clients who can afford to pay) to support open source development and keep ArchiveBox free.

## Web UI Permissions

```bash
archivebox config --set PUBLIC_INDEX=False      # require login to access the list of Snapshots
archivebox config --set PUBLIC_SNAPSHOTS=False  # require login to access Snapshot content
archivebox config --set PUBLIC_ADD_VIEW=False   # require log-in to submit new URLs for archiving

archivebox manage [createsuperuser|changepassword] # create/modify admin UI users
```

See [Setting Up Authentication](Setting-up-Authentication.md) for more...

---

## ArchiveBox Use-Cases

### Archiving Public Content Only ⭐️ `[Default, recommended for most people]`

This is the default (lax) mode, intended for archiving public (non-secret) URLs without authenticating the headless browser. This is the mode used if you're archiving news articles, audio, video, etc. browser bookmarks to a folder published on your webserver.

The default mode should not be used for archiving entire browser history or authenticated private content like Google Docs, paywalled content, invite-only subreddits, private photo share urls, etc.

```bash
# (these are the defaults)
archivebox config --set SAVE_ARCHIVE_DOT_ORG=True
archivebox config --set CHROME_USER_DATA_DIR=None
archivebox config --set COOKIES_FILE=None
```

### Archiving Content Behind Log-Ins 🚨 `[Advanced users only]`

ArchiveBox is able to archive content that requires authentication or cookies, but it comes with some caveats. Create dedicated logins for archiving to access paywalled content, private forums, LAN-only content, etc. then share them with ArchiveBox via Chrome profile + cookies.txt file.

```bash
archivebox config --set SAVE_ARCHIVE_DOT_ORG=False
archivebox config --set CHROME_USER_DATA_DIR=/path/to/chrome/profile
archivebox config --set COOKIES_FILE=/path/to/cookies.txt
```

➡️ For full instructions on setting up a Chromium user profile see: [Chromium Install: Setting up a Chromium User Profile](Chromium-Install.md#setting-up-a-chromium-user-profile)

If you're importing private links or authenticated content, make sure to keep your archive folder private with conservative permissions, as it may contain archived content with secret session tokens or pieces of your user data.

### ⚠️ Things to watch out for: ⚠️

- Any cookies / secret state present in a Chrome user profile or `cookies.txt` file may be reflected in server responses and saved in the Snapshot output (e.g. in `headers.json`) making it visible in cleartext to anyone viewing the Snapshot. **Don't use your personal Chrome profile for archiving!**
- Any secret tokens embedded in URLs (e.g. secret invite links, Google Doc URLs, etc.) will be visible on `archive.org` as the URLs are not filtered when saving to `archive.org` (disable submitting to Archive.org entirely with `SAVE_ARCHIVE_DOT_ORG=False`)
- The domain portion in archived URLs is sent to a favicon service in order to retrieve an icon more reliably. If leaking domains is a concern, you can change the [`FAVICON_PROVIDER`](Configuration.md#save_favicon) or disable favicon fetching entirely with `SAVE_FAVICON=False`
- Viewing malicious archived JS could allow an attacker to access your other archive items + the admin interface (JS executes on the same origin as the admin panel right now). Set `SAVE_WGET=False SAVE_DOM=False` to disable the risky extractors entirely or avoid viewing their output directly in a browser.

---

### Publishing

> **Caution:** Re-hosting untrusted archived content on a domain can potentially compromise _all apps on that domain_!  
> (including other subdomains)

Make sure you thoroughly understand the dangers of [hosting untrusted HTML/JS/CSS that may be captured during archiving](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), and how viewing it can enable [CSRF attacks](https://en.wikipedia.org/wiki/Cross-site_request_forgery) across all apps on the same domain.

The industry standard approach is to use a separate domain for untrusted content (e.g. Github uses `githubusercontent.com` and Google uses `googleusercontent.com`). If hosting ArchiveBox publicly, keep it on an isolated domain.

To protect the Admin dashboard, it's also recommended to serve all content under `/archive/` on a separate domain from `/admin/`:

- https://demo.archivebox.io: only serves `/`, redirects `/archive/*` to `demo-static.`
- https://demo-static.archivebox.io: only serves `/archive/`, redirects everything else to `demo.`

Published archives automatically include a `robots.txt` `Disallow: /` to block search engines from indexing them.

More info:

- [Publishing Your Archive](Publishing-Your-Archive.md)
- [Publishing Your Archive: Security Concerns](Publishing-Your-Archive.md#security-concerns)
- https://en.wikipedia.org/wiki/Cross-site_request_forgery
- https://github.com/ArchiveBox/ArchiveBox/issues/239

---

## Do not run as root

> **Warning:** Did you run a command in Docker with `exec` instead of `run` by accident?  
> Make sure you use `docker run` instead of `docker exec` to run ArchiveBox commands.
>
> ✅ `docker compose run archivebox manage createsuperuser`  
> ✅ `docker run -it -v $PWD:/data archivebox/archivebox manage createsuperuser`
>
> ❌ `docker compose exec archivebox manage createsuperuser`  
> ❌ `docker exec -it archivebox manage createsuperuser`

Do not run ArchiveBox as root for a number of reasons:

- Chrome will execute as root and fail immediately because Chrome sandboxing is pointless when the data directory is opened as root
- All dependencies will be run as root, if any of them have a vulnerability that's exploited by sites you're archiving you're opening yourself up to full system compromise
- ArchiveBox does lots of HTML parsing, filesystem access, and shell command execution. A bug in any one of those subsystems could potentially lead to deleted/damaged data on your hard drive, or full system compromise unless restricted to a user that only has permissions to access the directories needed

**Instead, you should run ArchiveBox under a separate user account with less privileged access:**

```bash
useradd -r -g archivebox -G audio,video archivebox  # the audio & video groups are used by chrome
mkdir -p /home/archivebox/data
chown -R archivebox:archivebox /home/archivebox
...
sudo -u archivebox archivebox add ...
```

---

## Output Folder

### Database

The ArchiveBox database is an unencrypted, uncompressed SQLite3 `index.sqlite3` file on disk. Make sure to protect your database file adequately as anyone who can read it can read your entire collection contents. Passwords for the admin users are stored as salted and PBKDF2 hashed strings in the `auth_user` table.

More info:

- [Usage: Disk Layout](Usage.md#disk-layout)
- [Upgrading or Merging Archives](Upgrading-or-Merging-Archives.md)

### Filesystem

How much are you planning to archive? If it's only 1-50 pages a day, you can probably just stick it in a normal folder on your hard drive, but if you want to go over 100 pages a day, you will likely want to put your archive on a compressed/deduplicated/encrypted disk image or filesystem like ZFS.

#### Purging entries

Unless `--yes --delete` is passed to `archivebox remove`, Snapshots removed from the index remain in the filesystem and their `./archive/<timestamp>` folders need to be deleted manually. You can search for a URL on the filesystem using `grep -a -r "https://example.com/url/to/search/for"`.

#### Permissions

Consider what permissioning to apply to your archive folder carefully. Limit access to the fewest possible users by checking folder ownership and setting [`OUTPUT_PERMISSIONS`](Configuration.md#output_permissions) accordingly.

[`PUID` & `PGID`](Configuration.md#puid--pgid) can be set when running with Docker to control what user and group ArchiveBox expects to own the data directory within the container.

More info:

- [Usage: Disk Layout](Usage.md#disk-layout)
- https://github.com/ArchiveBox/ArchiveBox#output-formats
- [Troubleshooting: Database](Troubleshooting.md#database)
