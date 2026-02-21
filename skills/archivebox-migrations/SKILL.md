---
name: archivebox-migrations
description: ArchiveBox database migration skill. Covers all schema versions from 0.4.x through 0.9.x, Django migration squashing, and the test-driven migration verification workflow. Use when generating, applying, debugging, or writing tests for Django migrations in this repository.
license: MIT
metadata:
  author: shelbeely
  version: "1.0"
compatibility: Designed for Claude Code, Cline, and compatible agents. Requires Python 3.13+, uv, sqlite3.
---

# ArchiveBox Database Migrations

## Schema Version History

| Version | Key changes |
|---------|-------------|
| **0.4.x** | First Django version. Tags stored as comma-separated string in `Snapshot`. No `ArchiveResult` model. |
| **0.7.x** | `Tag` model with M2M relationship, `ArchiveResult` model added, `AutoField` PKs. |
| **0.8.x** | `Crawl`/`Seed` models introduced, UUID PKs everywhere, `status` fields, `depth`/`retry_at` on Crawl. |
| **0.9.x** | `Seed` model removed; `seed_id` FK removed from `Crawl`. Crawls store URLs directly. |

## Generating and Applying Migrations

```bash
# Generate new migrations
cd archivebox
./manage.py makemigrations

# Apply to a test database
cd data/
archivebox init
```

## Testing Migration Paths

Every migration path must have a test that follows this exact pattern:

1. Build the source schema from `archivebox/tests/test_migrations_helpers.py`
2. Seed with realistic data using `seed_0_X_data()`
3. Run `archivebox init` via subprocess to trigger Django migrations
4. Query SQLite directly to verify **all** data was preserved (exact counts, not "at least one")
5. Verify CLI commands work post-migration: `status`, `list`, `add`

```python
def test_migration_preserves_snapshots(self):
    """Migration must preserve all snapshots without data loss."""
    result = run_archivebox(self.work_dir, ['init'], timeout=45)
    # Exit code must be exactly 0 — not in [0, 1]
    self.assertEqual(result.returncode, 0, f"Init failed:\n{result.stderr}")

    ok, msg = verify_snapshot_count(self.db_path, expected_count=5)
    self.assertTrue(ok, msg)
```

## Squashed Migrations (0.8.x dev branch)

The squashed migration that replaces 0023–0074 must list ALL replaced migrations in `replaces`:

```python
# In the squashed migration file:
replaces = [
    ('core', '0023_alter_archiveresult_options_archiveresult_abid_and_more'),
    ('core', '0024_auto_20240513_1143'),
    # ... every migration from 0023 through 0074 ...
    ('core', '0023_new_schema'),  # Also include the squashed migration itself
]
```

**Strategy**: squashed migrations for clean installs; individual migrations recorded for dev-branch upgrades.

## Debugging Migration State

```bash
# Which migrations have been applied?
sqlite3 /path/to/index.sqlite3 \
  "SELECT app, name FROM django_migrations WHERE app='core' ORDER BY id;"

# Inspect a table's columns
sqlite3 /path/to/index.sqlite3 "PRAGMA table_info(core_snapshot);"
sqlite3 /path/to/index.sqlite3 "PRAGMA table_info(core_crawl);"
```

## Common Gotchas

- **Circular FK references**: SQLite handles them with `IF NOT EXISTS`. Column order matters less than in Postgres.
- **testuser**: Tests run as non-root `testuser`. The `run_archivebox()` helper sets `DATA_DIR` automatically.
- **Extractors disabled**: Test env disables all extractors (`SAVE_TITLE=False`, etc.) for speed.
- **Timeouts**: Use 45s for `init`, 60s for general commands.
