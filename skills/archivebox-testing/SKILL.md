---
name: archivebox-testing
description: ArchiveBox testing skill. Enforces strict project standards: no mocks, no skips, non-root execution, exact assertions, plugin test isolation, and 80-90% coverage targets. Use when writing, reviewing, or debugging tests in this repository.
license: MIT
metadata:
  author: shelbeely
  version: "1.0"
compatibility: Designed for Claude Code, Cline, and compatible agents. Requires Python 3.13+, uv, Node.js 20, a non-root testuser account.
---

# ArchiveBox Testing

## Non-Negotiable Rules

### Rule 1: Never Run as Root

ArchiveBox has a hard root-check that refuses to run. ALL tests must execute as non-root `testuser`:

```bash
# Run all tests
sudo -u testuser bash -c 'source .venv/bin/activate && python -m pytest archivebox/tests/ -v'

# Run a specific file
sudo -u testuser bash -c 'source .venv/bin/activate && python -m pytest archivebox/tests/test_migrations_08_to_09.py -v'

# Run a single test with full output
sudo -u testuser bash -c 'source .venv/bin/activate && python -m pytest archivebox/tests/test_migrations_fresh.py::TestFreshInstall::test_init_creates_database -xvs'
```

If files are created by root, fix permissions first:
```bash
chmod 644 archivebox/tests/test_*.py
```

### Rule 2: No Mocks — Real Code Paths Only

Tests must use real infrastructure:
- Real SQLite databases (schema from `test_migrations_helpers.py`)
- Realistic seeded data (`seed_0_X_data()`)
- Real subprocess calls to `python -m archivebox`
- Direct SQLite queries to verify results

**If something is hard to test**: fix the implementation to make it testable. Never mock, stub, or simulate.

### Rule 3: No Skips

Never write `@skip`, `skipTest`, or `pytest.mark.skip`. If a test is difficult, fix the code or the test environment. Every test must run every time.

### Rule 4: Strict Assertions

- `init` exit code must be **exactly `0`** — not `in [0, 1]`
- Verify **every** record is preserved after migration, not "at least one"
- Use `==` (exact), never `>=` (loose)

## Test File Layout

```
archivebox/tests/
├── test_migrations_helpers.py    # Source schemas, seed helpers, verify_* functions
├── test_migrations_fresh.py      # Fresh install / first init
├── test_migrations_04_to_09.py   # 0.4.x → 0.9.x upgrade path
├── test_migrations_07_to_09.py   # 0.7.x → 0.9.x upgrade path
└── test_migrations_08_to_09.py   # 0.8.x → 0.9.x upgrade path
```

## Plugin Test Isolation

Plugin tests must be **completely isolated** from ArchiveBox. Replicate production directory structure in a temp dir:

```python
# Production paths:
# Crawl:    DATA_DIR/users/{username}/crawls/YYYYMMDD/example.com/{crawl-id}/{plugin}/
# Snapshot: DATA_DIR/users/{username}/snapshots/YYYYMMDD/example.com/{snapshot-uuid}/{plugin}/

with tempfile.TemporaryDirectory() as tmpdir:
    data_dir = Path(tmpdir)
    snapshot_dir = data_dir / 'users' / 'testuser' / 'snapshots' / '20240101' / 'example.com' / 'snap-456'
    screenshot_dir = snapshot_dir / 'screenshot'
    screenshot_dir.mkdir(parents=True)

    result = subprocess.run(
        ['node', str(SCREENSHOT_HOOK), '--url=https://example.com', '--snapshot-id=snap-456'],
        cwd=str(screenshot_dir),
        env=get_test_env(),
        capture_output=True,
        timeout=120,
    )
    assert result.returncode == 0, result.stderr.decode()
```

## Coverage Targets

Target: **80–90%** for critical plugins (`screenshot`, `chrome`, `singlefile`, `dom`).

JavaScript hooks have **two distinct execution paths** that must both be tested:
- Path A: connect to an existing Chrome session (~50% of code)
- Path B: launch a new Chrome instance (~30% of code)
- Shared code (~20%)

Testing only one path caps coverage at ~50%.

```bash
# Run plugin tests with coverage
bash bin/test_plugins.sh screenshot

# View coverage report
coverage report --show-missing --include='archivebox/plugins/*' --omit='*/tests/*'
```

## Performance Gotchas

Disable all extractors in the test environment to keep runs fast:

```python
env = os.environ.copy()
env['SAVE_TITLE'] = 'False'
env['SAVE_FAVICON'] = 'False'
env['SAVE_WGET'] = 'False'
env['SAVE_SINGLEFILE'] = 'False'
env['SAVE_SCREENSHOT'] = 'False'
# ... all extractors off
```

Timeouts: 45s for `init`, 60s for all other commands.

## Example Test Pattern

```python
class TestMigrationFrom08(unittest.TestCase):
    def setUp(self):
        self.work_dir = tempfile.mkdtemp()
        self.db_path = Path(self.work_dir) / 'index.sqlite3'
        create_0_8_schema(self.db_path)
        seed_0_8_data(self.db_path, snapshot_count=5)

    def tearDown(self):
        shutil.rmtree(self.work_dir, ignore_errors=True)

    def test_migration_preserves_all_snapshots(self):
        """0.8.x → 0.9.x must preserve every snapshot without data loss."""
        result = run_archivebox(self.work_dir, ['init'], timeout=45)
        self.assertEqual(result.returncode, 0, f"Init failed:\n{result.stderr}")

        ok, msg = verify_snapshot_count(self.db_path, expected_count=5)
        self.assertTrue(ok, msg)
```
