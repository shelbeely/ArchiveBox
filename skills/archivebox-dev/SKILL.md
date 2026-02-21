---
name: archivebox-dev
description: ArchiveBox development skill. Provides project-specific conventions, stack knowledge, plugin architecture rules, naming standards, and commit message guidelines. Use when working on any ArchiveBox Python, Django, or JavaScript code in this repository.
license: MIT
metadata:
  author: shelbeely
  version: "1.0"
compatibility: Designed for Claude Code, Cline, and compatible agents. Requires Python 3.13+, uv, Node.js 20.
---

# ArchiveBox Development

ArchiveBox is a self-hosted internet archiving solution built on Python 3.13+ / Django 6 / Node.js 20. These guidelines apply to all development work in this repository.

## Environment Setup

```bash
# Install all dependencies (always use uv, never pip directly)
uv sync --dev --all-extras

# Activate virtual environment
source .venv/bin/activate

# Tests must run as non-root testuser
sudo -u testuser bash -c 'source .venv/bin/activate && python -m pytest archivebox/tests/ -v'
```

Fix file permissions if created as root:
```bash
chmod 644 archivebox/tests/test_*.py
```

## Naming Conventions

**Principle: fewest unique names, maximum grep-ability.**

Group related functions with a shared prefix:
```python
# ✅ All migration helpers share fs_ prefix
def fs_migration_needed() -> bool: ...
def fs_migrate() -> None: ...
def _fs_migrate_from_0_7_0_to_0_8_0() -> None: ...

# ✅ All logging helpers start with log_ or _log
def log_migration_start(snapshot_id: str) -> None: ...
def _log_error(message: str) -> None: ...
```

**Never invent new names** for existing concepts:
```python
# ❌ BAD — new unique name for the same data
class Binary(models.Model):
    custom_bin_cmds = models.JSONField(default=dict)

# ✅ GOOD — reuse the existing field name
class Binary(models.Model):
    overrides = models.JSONField(default=dict)
```

## Plugin Architecture

Plugins live in `archivebox/plugins/<name>/`. Hard rules:
- Plugins **cannot** import from `archivebox` or `django` directly
- Chrome-family plugins may only depend on:
  - `archivebox/plugins/chrome/chrome_utils.js` — source of truth for all chrome ops
  - `archivebox/plugins/chrome/tests/chrome_test_utils.py` — test utilities only
- Production output paths: `DATA_DIR/users/{username}/{crawls|snapshots}/YYYYMMDD/domain/{id}/{plugin}/`

Chrome-dependent plugins (always check before editing chrome-related code):
`chrome`, `dns`, `ssl`, `headers`, `redirects`, `staticfile`, `responses`, `consolelog`, `title`, `accessibility`, `seo`, `ublock`, `istilldontcareaboutcookies`, `twocaptcha`, `modalcloser`, `infiniscroll`, `dom`, `pdf`, `screenshot`, `singlefile`, `parse_dom_outlinks`

Find them with:
```bash
grep -ri "chrom" archivebox/plugins/*/on_*.* --include="*.*" 2>/dev/null | cut -d/ -f3 | sort -u
```

## Architecture (0.9.x)

- `Crawl` groups multiple `Snapshot`s created by one `add` command
- `Seed` model removed in 0.9.x — crawls store URLs directly
- `seed_id` FK removed from `Crawl`

## Commit Messages

Format: `type(scope): what changed`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

- Include the *why* in the body when not obvious
- Bad: `fix`, `updates`, `more changes`
- Good: `refactor(plugins): isolate chrome dep per plugin architecture rules`
- Good: `test(migrations): verify 0.8.x snapshot data preserved after init`

## Debugging

```bash
# Check migration state
sqlite3 /path/to/index.sqlite3 "SELECT app, name FROM django_migrations WHERE app='core' ORDER BY id;"

# Inspect table schema
sqlite3 /path/to/index.sqlite3 "PRAGMA table_info(core_snapshot);"

# Kill zombie chrome processes
./bin/kill_chrome.sh
```
