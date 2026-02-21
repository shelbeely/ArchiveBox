# Docker

## Overview

Running ArchiveBox with Docker allows you to manage it in a container without exposing it to the rest of your system. ArchiveBox generally works the same in Docker as it does outside Docker. You can even use `pip`-installed ArchiveBox and Docker ArchiveBox in tandem, as they both share the same data directory format.

- [Overview](#overview)
- [Docker Compose](#docker-compose) ⭐️ (recommended)
  - [Setup](#setup)
  - [Upgrading](Upgrading-or-Merging-Archives.md#upgrading-with-docker-compose)
  - [Usage](#usage)
  - [Accessing the data](#accessing-the-data)
  - [Configuration](#configuration)
- [Plain Docker](#plain-docker)
  - [Setup](#setup-1)
  - [Upgrading](Upgrading-or-Merging-Archives.md#upgrading-with-plain-docker)
  - [Usage](#usage-1)
  - [Accessing the data](#accessing-the-data-1)
  - [Configuration](#configuration-1)

**Official Docker Hub image: [`hub.docker.com/r/archivebox/archivebox`](https://hub.docker.com/r/archivebox/archivebox)**

```bash
docker pull archivebox/archivebox:latest
```

Published [Docker tags](https://hub.docker.com/r/archivebox/archivebox/tags):

- `:latest`, `:stable` (latest stable release, the default)
- `:x.x` and `:x.x.x` for specific versions (e.g. `:0.7` or `:0.7.2`)
- `:dev` for unstable alpha builds (breaks often, only for developers and willing beta testers)
- `:sha-xxxxxxx` for builds of specific git commits (to test or pin specific PRs or commits)

> **Important:** Make sure Docker is **[installed](https://docs.docker.com/install/#supported-platforms)** and up-to-date before following any instructions below!  
> To check installed version, run: `docker --version` (must be `>=17.04.0`)

---

## Docker Compose

### Setup

A full [`docker-compose.yml`](https://github.com/ArchiveBox/ArchiveBox/blob/dev/docker-compose.yml) file is provided with all the extras included.  
You can uncomment sections within it to enable extra features, or run the basic version as-is.

```bash
# create a folder to store your data (can be anywhere)
mkdir -p ~/archivebox/data && cd ~/archivebox

# download the compose file into the directory
curl -fsSL 'https://docker-compose.archivebox.io' > docker-compose.yml
# (shortcut for getting https://raw.githubusercontent.com/ArchiveBox/ArchiveBox/stable/docker-compose.yml)

# initialize your collection and create an admin user for the Web UI (or set ADMIN_USERNAME/ADMIN_PASSWORD env vars)
docker compose run archivebox init
docker compose run archivebox manage createsuperuser
```

To use [Sonic](https://github.com/valeriansaliou/sonic) for improved full-text search:

```bash
# download the sonic config file into your data folder (e.g. ~/archivebox)
curl -fsSL 'https://raw.githubusercontent.com/ArchiveBox/ArchiveBox/dev/etc/sonic.cfg' > sonic.cfg

# then uncomment the sonic-related sections in docker-compose.yml
nano docker-compose.yml

# to backfill any existing archive data into the search index, run:
docker compose run archivebox update --index-only
```

### Upgrading

See the wiki page on [Upgrading or Merging Archives](Upgrading-or-Merging-Archives.md#upgrading-with-docker-compose) for instructions. ➡️

### Usage

You can use `docker compose run archivebox [subcommand]` just like the non-Docker `archivebox [subcommand]` CLI.

First, make sure you're `cd`'ed into the same folder as your `docker-compose.yml` file (e.g. `~/archivebox`):

```bash
docker compose run archivebox help

# Add an individual URL
docker compose run archivebox add 'https://example.com'
# OR
echo 'https://example.com' | docker compose run -T archivebox add

# Add multiple URLs
docker compose run -T archivebox add < ~/Downloads/example_urls.txt

# OR ingest URLs from a file mounted inside Docker
docker compose run archivebox add --depth=1 /data/sources/example_urls.txt

# OR pipe in URLs from a remote source
curl 'https://example.com/some/rss/feed.xml' | docker compose run archivebox add
docker compose run archivebox add --depth=1 'https://example.com/some/rss/feed.xml'
```

### Accessing the data

The outputted archive data is stored in `data/` (relative to the project root), or whatever folder path you specified in the `docker-compose.yml` `volumes:` section.

To access the results directly via the filesystem, open `./data/archive/<timestamp>/index.html`.

To use the web UI, start the server with:

```bash
docker compose up         # add -d to run in the background
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Configuration

The recommended way configure ArchiveBox in Docker Compose is using `archivebox config --set ...` or by editing `ArchiveBox.conf`.

```bash
docker compose run archivebox config --set MEDIA_MAX_SIZE=750mb
# OR
echo 'MAX_MEDIA_SIZE=750mb' >> ./data/ArchiveBox.conf
```

You can also set environment variables in that container's `environment:` section in `docker-compose.yml`:

```yaml
services:
    archivebox:
        environment:
            - USE_COLOR=False
            - SHOW_PROGRESS=False
            - CHECK_SSL_VALIDITY=False
            - RESOLUTION=1900,1820
            - MEDIA_TIMEOUT=512000
```

If you want to access your archive server with HTTPS, put a reverse proxy like Nginx or Caddy in front of `http://127.0.0.1:8000` to do SSL termination. See the example [ArchiveBox nginx container](https://github.com/ArchiveBox/ArchiveBox/blob/dev/docker-compose.yml) and [`nginx.conf`](https://github.com/ArchiveBox/ArchiveBox/blob/dev/etc/nginx.conf).

---

## Plain Docker

### Setup

```bash
docker pull archivebox/archivebox

mkdir -p ~/archivebox/data && cd ~/archivebox/data
docker run -it -v $PWD:/data archivebox/archivebox init --setup
```

If you encounter permissions issues, you may need configure user/group ownership explicitly with [`PUID`/`PGID`](Configuration.md#puid--pgid).

### Upgrading

See the wiki page on [Upgrading or Merging Archives](Upgrading-or-Merging-Archives.md#upgrading-with-plain-docker) for instructions. ➡️

### Usage

```bash
# Make sure you're cd'ed into your collection data folder
docker run -it -v $PWD:/data archivebox/archivebox help

# Add a single URL
docker run -it -v $PWD:/data archivebox/archivebox add 'https://example.com'
# OR
echo 'https://example.com' | docker run -i -v $PWD:/data archivebox/archivebox add

# Add multiple URLs at once
docker run -i -v $PWD:/data archivebox/archivebox add < urls.txt
# OR
curl 'https://example.com/some/rss/feed.xml' | docker run -i -v $PWD:/data archivebox/archivebox add

# Archive recursively
docker run -it -v $PWD:/data archivebox/archivebox add --depth=1 'https://example.com/some/rss/feed.xml'
```

### Accessing the data

The `-v /path/on/host:/path/inside/container` flag specifies where your data dir lives on the host.

```bash
# Example: use a folder on an external USB drive
docker run -it -v /media/USB-DRIVE/archivebox/data:/data archivebox/archivebox ...

# Start the web UI
docker run -it -v /media/USB_DRIVE/archivebox/data:/data -p 8000:8000 archivebox/archivebox
# then open https://127.0.0.1:8000
```

### Configuration

```bash
# Set persistent config for the collection
docker run -it -v $PWD:/data archivebox/archivebox config --set MEDIA_TIMEOUT=120
# OR
echo 'MEDIA_TIMEOUT=120' >> ./ArchiveBox.conf

# Apply config to a single run (without persisting)
docker run -it -v $PWD:/data -e FETCH_SCREENSHOT=False archivebox/archivebox add 'https://example.com'
# OR
echo 'FETCH_SCREENSHOT=False' >> ./.env
docker run ... --env-file=./.env archivebox/archivebox ...
```
