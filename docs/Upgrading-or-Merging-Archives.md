# Upgrading or Merging Archives

This page covers how to upgrade ArchiveBox to a new version and how to merge multiple archives together.

## Upgrading with Docker Compose ⭐️

```bash
# cd into your project folder (where docker-compose.yml is)
cd ~/archivebox

# pull the latest docker image
docker compose pull archivebox

# migrate the collection to the latest version
docker compose run --rm archivebox init --setup

# restart services if running
docker compose down && docker compose up -d
```

## Upgrading with plain Docker

```bash
# pull the latest image
docker pull archivebox/archivebox:latest

# migrate the collection to the latest version
docker run -it -v $PWD:/data archivebox/archivebox init --setup
```

## Upgrading without Docker (pip install)

```bash
# upgrade pip package to latest
pip install --upgrade --ignore-installed archivebox

# apply migrations to your data directory
cd ~/archivebox/data
archivebox init --setup
```

---

## Merging Two Archives

To merge two archives together, you can import one into the other:

```bash
# export the list of URLs from the archive you want to merge in
cd /path/to/old/archive/data
archivebox list --json --with-headers > /tmp/old_archive_urls.json

# import them into the target archive
cd /path/to/target/archive/data
archivebox add < /tmp/old_archive_urls.json
```

Or to merge the full archive data (including files):

```bash
# option 1: manually copy archive folders into the target
cp -r /path/to/old/archive/data/archive/* /path/to/target/archive/data/archive/
cd /path/to/target/archive/data
archivebox init  # re-index the merged archive

# option 2: use the python API
archivebox shell
>>> from core.models import Snapshot
>>> # query and manipulate snapshots directly
```

---

## Database Troubleshooting

### Modify the ArchiveBox SQLite3 DB directly

```bash
cd ~/archivebox/data
sqlite3 index.sqlite3

# example queries:
SELECT count(*) FROM core_snapshot;
SELECT url, title FROM core_snapshot ORDER BY added DESC LIMIT 20;
SELECT * FROM core_tag;
```

### Example: Adding a new user with a hashed password

```bash
cd ~/archivebox/data
archivebox shell

>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.create_superuser('newadmin', 'admin@example.com', 'password123')
```

### Filesystem doesn't support FSYNC (e.g. network mounts)

The `index.sqlite3` file must be stored on a filesystem that supports FSYNC. See [Troubleshooting](Troubleshooting.md#filesystem-doesnt-support-fsync-eg-network-mounts) for more info.

### Backup and restore

```bash
# backup your entire archive
zip -r data.backup.$(date +%Y%m%d).zip ~/archivebox/data

# restore from backup
unzip data.backup.YYYYMMDD.zip -d ~/archivebox/data
cd ~/archivebox/data
archivebox init  # re-apply any missing migrations
```

---

## Release Notes

For version-specific upgrade notes, see the [GitHub Releases](https://github.com/ArchiveBox/ArchiveBox/releases) page.

- [v0.9.x Release Notes](https://github.com/ArchiveBox/ArchiveBox/releases/tag/dev)
- [v0.8.x PR](https://github.com/ArchiveBox/ArchiveBox/pull/1311)
- [v0.7.x PR](https://github.com/ArchiveBox/ArchiveBox/pull/721)
- [v0.6.x PR](https://github.com/ArchiveBox/ArchiveBox/pull/680)
- [v0.5.x PR](https://github.com/ArchiveBox/ArchiveBox/pull/552)
