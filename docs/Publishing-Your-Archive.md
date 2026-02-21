# Publishing Your Archive

There are two ways to publish your archive: using the `archivebox server` or by exporting and hosting it as static HTML.

## 1. Use the built-in web server

```bash
# set the permissions depending on how public/locked down you want it to be
archivebox config --set PUBLIC_INDEX=True
archivebox config --set PUBLIC_SNAPSHOTS=True
archivebox config --set PUBLIC_ADD_VIEW=True

# create an admin username and password for yourself
archivebox manage createsuperuser

# then start the webserver and open the web UI in your browser
archivebox server 0.0.0.0:8000
open http://127.0.0.1:8000
```

This server is enabled out-of-the-box if you're using `docker-compose` to run ArchiveBox, and there is a commented-out example nginx config with SSL set up as well. If hosting publicly, it's essential to place an SSL termination server in front of ArchiveBox (e.g. [`traefik`](https://github.com/traefik/traefik), [`caddy`](https://caddyserver.com/docs/automatic-https#activation), or [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)).

> **Tip (Advanced):** You can use nginx to serve the static `/archive/` dir directly from the filesystem to increase performance.  
> To protect the `/admin/` dashboard, it should ideally be served from a [different domain](#security-concerns) using redirects.

## 2. Export and host it as static HTML

```bash
archivebox list --html --with-headers > index.html
archivebox list --json --with-headers > index.json

# then upload the entire output folder containing index.html and archive/ somewhere
# e.g. github pages or another static hosting provider

# you can also serve it with the simple python HTTP server
python3 -m http.server --bind 0.0.0.0 --directory . 8000
open http://127.0.0.1:8000
```

Here's a sample nginx configuration that works to serve your static archive folder:

```nginx
location / {
    alias       /path/to/your/ArchiveBox/data/;
    index       index.html;
    autoindex   on;
    try_files   $uri $uri/ =404;
}
```

Make sure you're not running any content as CGI or PHP, you only want to serve static files!

---

## Security Concerns

> **Caution:** Re-hosting untrusted archived content on a domain can potentially compromise _all apps on that domain_!  
> (including other subdomains)

Make sure you thoroughly understand the dangers of [hosting untrusted HTML/JS/CSS that may be captured during archiving](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), and how viewing it can enable [CSRF attacks](https://en.wikipedia.org/wiki/Cross-site_request_forgery) across all apps on the same domain.

(This is why we don't support serving ArchiveBox from a subdirectory like `myapps.example.com/archivebox/`, it's too dangerous to share domains)

The industry standard approach is to use a separate domain for untrusted content (e.g. Github uses `githubusercontent.com` and Google uses `googleusercontent.com`).

### Protecting the Admin Dashboard

To protect the Admin dashboard, it's also recommended to serve all content under `/archive/` on a separate domain from `/admin/`:

- https://demo.archivebox.io: only serves `/`, redirects `/archive/*` to `demo-static.`
- https://demo-static.archivebox.io: only serves `/archive/`, redirects everything else to `demo.`

> Note: This is still recommended, but less critical if your `/archive/` folder does not contain any archived JS (e.g. if you set `SAVE_WGET=False` and `SAVE_DOM=False`).

More info:

- [Security Overview](Security-Overview.md)
- [Security Overview: Things to Watch Out For](Security-Overview.md#️-things-to-watch-out-for-️)

---

## Copyright Concerns

> **Warning:** Be aware that some sites you archive may not allow you to rehost their content publicly for copyright reasons, it's up to you to host responsibly and respond to takedown requests appropriately based on the laws in your jurisdiction.

Archiving for personal backups, research, and some other use-cases are covered by [fair use copyright exemptions](https://guides.library.oregonstate.edu/copyright/libraries) in the USA, but if your archive can deprive the original author of revenue (e.g. if you rehost it for profit), then your use case might no longer be covered and you have to respond to DMCA takedown notices.

**As a general rule of thumb:**

- Copies cannot be made for commercial purposes
- The copying cannot be systematic (e.g., to replace subscriptions)
- All copies made must include a notice stating that the materials may be protected under copyright.

Please modify the [`FOOTER_INFO`](Configuration.md#footer_info) config variable to add your contact info to the footer of your index.

Note: ArchiveBox prevents search engines from indexing your archives using [`/robots.txt`](https://github.com/ArchiveBox/ArchiveBox/blob/dev/archivebox/templates/static/robots.txt#L2) by default.

#### Further Reading: USA Copyright Law & Fair Use Exemptions

- https://www.copyright.gov/title17/
- https://help.archive.org/help/rights/
- https://blog.archive.org/2024/03/01/fair-use-in-action-at-the-internet-archive/
- https://fairuse.stanford.edu/2003/11/10/digital_preservation_and_copyr/
- https://guides.library.oregonstate.edu/copyright/libraries
