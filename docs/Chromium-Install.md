# Chrome / Chromium Setup

By default, ArchiveBox looks for any existing installed version of Chrome/Chromium and uses it if found. You can optionally install a specific version and set the environment variable `CHROME_BINARY` to force ArchiveBox to use that one, e.g.:

- `CHROME_BINARY=google-chrome-beta`
- `CHROME_BINARY=/usr/bin/chromium-browser`
- `CHROME_BINARY='/Applications/Chromium.app/Contents/MacOS/Chromium'`
- `CHROME_BINARY='~/Library/Caches/ms-playwright/chromium-857950/chrome-mac/Chromium.app/Contents/MacOS/Chromium'`

If you don't already have Chrome installed, we recommend installing Chromium instead of Google Chrome, as it's the open-source fork that doesn't send as much tracking data to Google.

**Check for existing Chrome/Chromium install:**

```bash
google-chrome --version | chromium-browser --version
Google Chrome 122.0.6261.49 beta     # should be >v111
```

## Installing Chromium

### ⭐️ Any OS (recommended)

[`playwright`](https://playwright.dev/python/docs/browsers) (by the Microsoft team) and [`puppeteer`](https://github.com/puppeteer/puppeteer) (by the Google team) are two options to get stable, repeatable Chromium distributions on many OSs.

```bash
pip install --upgrade --ignore-installed playwright
playwright install --with-deps chromium

# alternatively use puppeteer to get Chromium instead of playwright:
npm install puppeteer
```

### macOS

```bash
brew install --cask chromium
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install chromium-browser
# or on some systems:
sudo apt install chromium
```

## Installing Google Chrome

### macOS

```bash
brew install --cask google-chrome
```

### Ubuntu/Debian

```bash
wget -q -O - 'https://dl-ssl.google.com/linux/linux_signing_key.pub' | sudo apt-key add -
echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome
```

## Troubleshooting Chromium Install

If you encounter problems setting up Google Chrome or Chromium, see the [Troubleshooting](Troubleshooting.md#chromiumgoogle-chrome) page.

---

## Setting Up a Chromium User Profile

You may choose to set up a Chrome/Chromium user profile in order to use your cookies/sessions to log into sites behind authentication/paywall during archiving.

> **Warning:** We strongly recommend you use **[separate burner credentials dedicated to archiving](https://docs.sweeting.me/s/cookie-dilemma)**, e.g. don't provide cookies for your normal daily Facebook/Instagram/Google/etc. accounts as server responses and page content will often contain your name/email/PII, session cookies, private tokens, etc. which then get preserved in your snapshots for eternity.

### Docker VNC Setup

If using ArchiveBox in Docker, the easiest way to set up session credentials is by remote controlling the ArchiveBox Chrome browser over VNC.

1. Enable the `novnc` server in your `docker-compose.yml`:

```yaml
services:
    archivebox:
        volumes:
            - ./data/personas/Default:/data/personas/Default
        environment:
            - CHROME_USER_DATA_DIR=/data/personas/Default/chrome_profile
            - DISPLAY=novnc:0.0
            
    novnc:
        image: theasp/novnc:latest
        environment:
            - DISPLAY_WIDTH=1920
            - DISPLAY_HEIGHT=1080
            - RUN_XTERM=no
        ports:
            - "8080:8080"
```

2. Start the `novnc` window server container

```bash
docker compose up -d novnc
```

3. Start ArchiveBox's Chrome inside Docker

```bash
docker compose run archivebox /usr/bin/chromium-browser \
  --user-data-dir=/data/personas/Default/chrome_profile \
  --profile-directory=Default \
  --disable-gpu --disable-features=dbus --disable-dev-shm-usage \
  --start-maximized --no-sandbox --disable-setuid-sandbox --no-zygote \
  --disable-sync --no-first-run
```

4. Open [`http://localhost:8080/vnc.html`](http://localhost:8080/vnc.html) in your browser. You should see a remote linux desktop with Chrome open, allowing you to log into any sites you want to archive.

5. ✅ Close the browser, stop & remove novnc, and then run archivebox normally. It will use the saved Chrome profile going forward.

### Non-Docker Setup (Local Host)

```bash
# tell archivebox where you want to store your Chrome profile
archivebox config --set CHROME_USER_DATA_DIR=/Users/alice/.archivebox_chrome

# find your CHROME_BINARY path
archivebox version | grep -i chrome

# macOS example (using Google Chrome.app)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --user-data-dir=~/ArchiveBox/personas/Default/chrome_profile

# Linux example (using Playwright Chromium)
/root/.cache/ms-playwright/chromium-1105/chrome-linux/chrome \
  --user-data-dir=~/archivebox/data/personas/Default/chrome_profile
```

Once it's open, log in to all the sites you want to be logged in to for archiving, then close/quit Chrome.

✅ All ArchiveBox extractors that use Chrome (e.g. Screenshot, PDF, DOM, Singlefile) should now use that profile.

### Non-Docker Setup (Remote Host)

1. Make sure you are running the same OS and have the same version of Chrome installed as the host running ArchiveBox
2. Follow the `Non-Docker Setup (Local Host)` steps above to create a Chrome profile locally
3. Rsync your chrome profile from your local machine to the remote archivebox host:
   ```bash
   rsync --archive /path/to/profile remotehost:/path/to/profile/on/remote/host
   ```
4. Configure ArchiveBox on the remote host to use the `rsync`'ed Chrome profile:
   ```bash
   archivebox config --set CHROME_USER_DATA_DIR=/path/to/profile/on/remote/host
   ```

---

## More Info & Troubleshooting

- https://github.com/ArchiveBox/ArchiveBox/issues/952
- [Security Overview: Archiving Private Content](Security-Overview.md#archiving-content-behind-log-ins)
- [Configuration: CHROME_USER_DATA_DIR](Configuration.md#chrome_user_data_dir)
- [Configuration: COOKIES_FILE](Configuration.md#cookies_file)
