# Configuration

Configuration of ArchiveBox is done by using the `archivebox config` command, modifying the `ArchiveBox.conf` file in the data folder, or by using environment variables. All three methods work equivalently when using Docker as well.

_Some equivalent examples of setting some configuration options:_

```bash
archivebox config --set CHROME_BINARY=google-chrome-stable
# OR
echo "CHROME_BINARY=google-chrome-stable" >> ArchiveBox.conf
# OR
env CHROME_BINARY=google-chrome-stable archivebox add ~/Downloads/bookmarks_export.html
```

Environment variables take precedence over the config file, which is useful if you only want to use a certain option temporarily during a single run.

**Available Configuration Options:**

- [General Settings:](#general-settings) Archiving process, output format, and timing.
- [Archive Method Toggles:](#archive-method-toggles) On/off switches for methods.
- [Archive Method Options:](#archive-method-options) Method tunables and parameters.
- [Shell Options:](#shell-options) Format & behavior of CLI output.
- [Dependency Options:](#dependency-options) Specify exact paths to dependencies.

_In case this document is ever out of date, it's recommended to read the code that loads the config directly: [`archivebox/config.py`](https://github.com/ArchiveBox/ArchiveBox/blob/master/archivebox/config.py) ➡️_

---

## General Settings

_General options around the archiving process, output format, and timing._

---

#### `OUTPUT_PERMISSIONS`

**Possible Values:** [`755`]/`644`/...  
Permissions to set the output directory and file contents to.

---

#### `PUID` / `PGID`

**Possible Values:** [`911`]/`1000`/...

_Note: Only applicable for Docker users, settable via environment variables only._

User and Group ID that the data directory should be owned by. We recommend leaving this as the default `911` and running `chown -R 911:$(id -g) ./data` outside Docker.

`PUID=0` is not allowed ([do not run as root](Security-Overview.md#do-not-run-as-root)), `PGID=0` is allowed but **not recommended**.

More info:

- https://docs.linuxserver.io/general/understanding-puid-and-pgid/
- https://github.com/ArchiveBox/ArchiveBox/issues/1304

---

#### `ONLY_NEW`

**Possible Values:** [`True`]/`False`  
Toggle whether or not to attempt rechecking old links when adding new ones, or leave old incomplete links alone and only archive the new links.

---

#### `TIMEOUT`

**Possible Values:** [`60`]/`120`/...  
Maximum allowed download time per archive method for each link in seconds. Do not set this to anything less than `15` seconds as it will cause Chrome to hang indefinitely.

---

#### `MEDIA_TIMEOUT`

**Possible Values:** [`3600`]/`120`/...  
Maximum allowed download time for fetching media when `SAVE_MEDIA=True` in seconds.

---

#### `ADMIN_USERNAME` / `ADMIN_PASSWORD`

**Possible Values:** [`None`]/`"admin"`/...

Only used on first run / initial setup in Docker. ArchiveBox will create an admin user with the specified username and password when these options are found in the environment.

More info:

- [Setting up Authentication](Setting-up-Authentication.md)
- [Docker: Configuration](Docker.md#configuration)

---

#### `PUBLIC_INDEX` / `PUBLIC_SNAPSHOTS` / `PUBLIC_ADD_VIEW`

**Possible Values:** [`True`]/`False`  
Configure whether or not login is required to use each area of ArchiveBox.

```bash
archivebox manage createsuperuser  # set a password before disabling public access

# these are the default values
archivebox config --set PUBLIC_INDEX=True        # True = allow users to view main snapshots list without logging in
archivebox config --set PUBLIC_SNAPSHOTS=True    # True = allow users to view snapshot content without logging in
archivebox config --set PUBLIC_ADD_VIEW=False    # True = allow users to submit new URLs to archive without logging in
```

More info:

- [Setting up Authentication](Setting-up-Authentication.md)
- [Usage: UI Usage](Usage.md#ui-usage)

---

#### `CUSTOM_TEMPLATES_DIR`

**Possible Values:** [`None`]/`/path/to/custom_templates`/...

Path to a directory containing custom html/css/images for overriding the default UI styling.

---

#### `REVERSE_PROXY_USER_HEADER`

**Possible Values:** [`Remote-User`]/`X-Remote-User`/...

HTTP header containing user name from authenticated proxy. More info: [Setting up Authentication](Setting-up-Authentication.md)

---

#### `REVERSE_PROXY_WHITELIST`

**Possible Values:** [`<empty string>`]/`172.16.0.0/16`/...

Comma separated list of IP CIDRs which are allowed to use reverse proxy authentication.

---

#### `LOGOUT_REDIRECT_URL`

**Possible Values:** [`/`]/`https://example.com/some/other/app`/...

URL to redirect users back to on logout when using reverse proxy authentication.

---

#### `LDAP`

**Possible Values:** [`False`]/`True`

Whether to use an external LDAP server for authentication.

```bash
pip install archivebox[ldap]
```

More info: [Setting up Authentication: LDAP](Setting-up-Authentication.md#ldap-authentication)

---

#### `SNAPSHOTS_PER_PAGE`

**Possible Values:** [`40`]/`100`/...

Maximum number of Snapshots to show per page on Snapshot list pages.

---

#### `FOOTER_INFO`

**Possible Values:** [`Content is hosted for personal archiving purposes only. Contact server owner for any takedown requests.`]/...  
Some text to display in the footer of the archive index.

---

#### `URL_DENYLIST`

**Possible Values:** [`\.(css|js|otf|ttf|woff|woff2|gstatic\.com|googleapis\.com/css)(\?.*)?$`]/`.+\.exe$`/...

A regex expression used to exclude certain URLs from archiving.

```python
>>> import re
>>> URL_DENYLIST = r'^http(s)?:\/\/(.+\.)?(youtube\.com)|(amazon\.com)\/.*$'
>>> URL_DENYLIST_PTN = re.compile(URL_DENYLIST, re.IGNORECASE | re.UNICODE | re.MULTILINE)
>>> bool(URL_DENYLIST_PTN.search('https://test.youtube.com/example.php?abc=123'))
True   # this URL would not be archived
```

> **Note:** These options used to be called `URL_WHITELIST` & `URL_BLACKLIST` before [`v0.7.1`](https://github.com/ArchiveBox/ArchiveBox/releases).

---

#### `URL_ALLOWLIST`

**Possible Values:** [`None`]/`^http(s)?:\/\/(.+)?example\.com\/?.*$`/...

A regex expression used to exclude all URLs that don't match the given pattern from archiving.

---

## Archive Method Toggles

_High-level on/off switches for all the various methods used to archive URLs._

---

#### `SAVE_TITLE`

**Possible Values:** [`True`]/`False`  
Attempt to parse the link's title from the first `<title></title>` tag found in the response.

#### `SAVE_FAVICON`

**Possible Values:** [`True`]/`False`  
Fetch and save favicon for the URL from Google's public favicon service.

#### `SAVE_WGET`

**Possible Values:** [`True`]/`False`  
Fetch page with wget and save responses into folders for each domain.

#### `SAVE_WARC`

**Possible Values:** [`True`]/`False`  
Save a timestamped WARC archive of all the page requests and responses during the wget archive process.

#### `SAVE_PDF`

**Possible Values:** [`True`]/`False`  
Print page as PDF.

#### `SAVE_SCREENSHOT`

**Possible Values:** [`True`]/`False`  
Fetch a screenshot of the page.

#### `SAVE_DOM`

**Possible Values:** [`True`]/`False`  
Fetch the DOM of the page after page JS has been run, and save it as an HTML file.

#### `SAVE_SINGLEFILE`

**Possible Values:** [`True`]/`False`  
Fetch the page using SingleFile, which combines all page resources into a single self-contained HTML file.

#### `SAVE_READABILITY`

**Possible Values:** [`True`]/`False`  
Fetch the article content using `readability-js` to extract the main text content.

#### `SAVE_MERCURY`

**Possible Values:** [`True`]/`False`  
Fetch the article content using the Mercury Web Parser.

#### `SAVE_GIT`

**Possible Values:** [`True`]/`False`  
Clone git repos hosted at URLs when detected.

#### `SAVE_MEDIA`

**Possible Values:** [`True`]/`False`  
Download audio/video files when found.

#### `SAVE_ARCHIVE_DOT_ORG`

**Possible Values:** [`True`]/`False`  
Submit all archived URLs to archive.org.

---

## Archive Method Options

---

#### `RESOLUTION`

**Possible Values:** [`1440,2000`]/`1920,1080`/...  
Width and height of the screenshot.

#### `WGET_USER_AGENT`

**Possible Values:** [`Mozilla/5.0 ...`]/...  
User agent to use with wget.

#### `CHROME_USER_AGENT`

**Possible Values:** [`Mozilla/5.0 ...`]/...  
User agent to use with Chrome.

#### `COOKIES_FILE`

**Possible Values:** [`None`]/`/path/to/cookies.txt`/...

Path to a cookies.txt file to use for wget archiving. [Netscape cookies format](https://github.com/ArchiveBox/ArchiveBox/wiki/Configuration#cookies_file).

#### `CHROME_USER_DATA_DIR`

**Possible Values:** [`None`]/`/path/to/chrome/profile`/...

Path to a Chrome user data directory to use for Chrome-based archiving. Allows logging into sites.

#### `CHROME_HEADLESS`

**Possible Values:** [`True`]/`False`  
Whether to run Chrome in headless mode.

#### `CHROME_SANDBOX`

**Possible Values:** [`True`]/`False`  
Whether to use Chrome's sandbox security feature (disable inside Docker if needed).

#### `GIT_DOMAINS`

**Possible Values:** [`github.com,bitbucket.org,gitlab.com`]/...  
Comma-separated list of domains to attempt git cloning from.

#### `FAVICON_PROVIDER`

**Possible Values:** [`https://www.google.com/s2/favicons?domain={domain}`]/...  
URL template for fetching favicons.

---

## Shell Options

---

#### `USE_COLOR`

**Possible Values:** [`True`]/`False`  
Whether to use colored output in the CLI.

#### `SHOW_PROGRESS`

**Possible Values:** [`True`]/`False`  
Whether to show progress bars in the CLI.

---

## Dependency Options

---

#### `WGET_BINARY`

**Possible Values:** [`wget`]/`/usr/local/bin/wget`/...  
Path to the wget binary.

#### `CURL_BINARY`

**Possible Values:** [`curl`]/`/usr/local/bin/curl`/...  
Path to the curl binary.

#### `GIT_BINARY`

**Possible Values:** [`git`]/`/usr/bin/git`/...  
Path to the git binary.

#### `YTDLP_BINARY`

**Possible Values:** [`yt-dlp`]/`/usr/local/bin/yt-dlp`/...  
Path to the yt-dlp binary.

#### `CHROME_BINARY`

**Possible Values:** [`chromium-browser`]/`google-chrome`/`/path/to/chromium`/...  
Path to the Chrome/Chromium binary.  
More info: [Chromium Install](Chromium-Install.md)

#### `NODE_BINARY`

**Possible Values:** [`node`]/`/usr/local/bin/node`/...  
Path to the Node.js binary.

#### `RIPGREP_BINARY`

**Possible Values:** [`rg`]/`/usr/local/bin/rg`/...  
Path to the ripgrep binary.
