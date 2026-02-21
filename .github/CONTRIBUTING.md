# Contribution Process

1. Confirm your desired features fit into our bigger project goals [Roadmap](https://github.com/pirate/ArchiveBox/wiki/Roadmap).
2. Open an issue with your planned implementation to discuss
3. Check in with me before starting development to make sure your work wont conflict with or duplicate existing work
4. Setup your dev environment, make some changes, and test using the test input files
5. Commit, push, and submit a PR and wait for review feedback
6. Have patience, don't abandon your PR! We love contributors but we all have day jobs and don't always have time to respond to notifications instantly. If you want a faster response, ping @theSquashSH on twitter or Patreon.

---

## AI-Assisted Contributions

AI tools (Claude, GitHub Copilot, ChatGPT, etc.) are **welcome and accepted** — the maintainer uses them regularly to develop ArchiveBox. However, the same quality bar applies regardless of whether code was written by a human or an AI.

### Rules

- **Disclose AI usage** in your PR description (e.g. *"Written with Claude Code"*, *"Co-authored with Copilot"*). Add the `ai-assisted` label if available.
- **You are responsible** for everything you submit. Review AI-generated code carefully before committing — do not blindly paste output without understanding it.
- **All existing standards apply.** AI-generated code must pass the same linting, tests, and review process as any other contribution.
- **No AI-only PRs without human review.** PRs where the author has not read and understood the changes will be closed.
- **Security matters.** AI tools can introduce subtle vulnerabilities. Double-check any code that handles user input, file paths, authentication, or network requests.

### Tips for AI-assisted contributions

- Use `CLAUDE.md` at the repo root as context when working with Claude — it documents the project conventions.
- Run `./bin/lint.sh` and `./bin/test.sh` before submitting, even if the AI says the code is correct.
- Prefer smaller, focused PRs over large AI-generated rewrites — they are easier to review and more likely to be merged.

**Useful links:**

- https://github.com/ArchiveBox/ArchiveBox/issues
- https://github.com/ArchiveBox/ArchiveBox/pulls
- https://github.com/ArchiveBox/ArchiveBox/wiki/Roadmap
- https://github.com/ArchiveBox/ArchiveBox/wiki/Install#manual-setup

### Development Setup

```bash
git clone https://github.com/ArchiveBox/ArchiveBox
cd ArchiveBox
# Ideally do this in a virtualenv
pip install -e '.[dev]'  # or use: pipenv install --dev
```

### Running Tests

```bash
./bin/lint.sh
./bin/test.sh
./bin/build.sh
```

For more common tasks see the `Development` section at the bottom of the README.

### Getting Help

Open issues on Github or message me https://sweeting.me/#contact.
