# Install

ArchiveBox is primarily distributed as a Python package via `pip`, but it also depends on some system packages that can be installed manually or automatically with Docker. It usually takes less than ~10min to get ArchiveBox set up and running.

- _[Supported Systems](#supported-systems)_
- Install Instructions
  - **[Option A. Docker / Docker Compose ⭐️](#option-a-docker--docker-compose-setup)**
  - [Option B. Automatic Setup Script](#option-b-automatic-setup-script)
  - [Option C. Bare Metal Setup](#option-c-bare-metal-setup)
    - _[Upgrading ArchiveBox to a new version](#upgrading-archivebox-to-a-new-version)_
- _[Next Steps](#next-steps)_

## Supported Systems

**CPU Architectures:** `amd64` (`x86_64`), `arm64` (`aarch64`), `arm7`  
_(Including 64-bit Intel/AMD, M1/M2/etc. Macs, Raspberry Pi >= 3)_

- **macOS:** >=10.12 (with `brew`)
- **Linux:** Ubuntu (>= 18.04), Debian (>= 10), etc. (with `apt`)
- **BSD:** FreeBSD, OpenBSD, NetBSD etc (with `pkg`)

Other systems are not officially supported but may work with degraded functionality:

- **Windows:** Via [Docker](Docker.md), Docker in WSL2, or WSL2 without Docker (not recommended)
- [Other UNIX systems:](https://github.com/ArchiveBox/ArchiveBox#-package-manager-setup) Arch, Nix, Guix, Fedora, SUSE, Arch, CentOS, etc.

Note: On `arm7` the `playwright` package is not available, so `chromium` must be installed manually if needed.

You will also need at least 500MB of RAM (bare minimum), 2GB or greater is recommended. You may be able to reduce the RAM requirements if you disable all the chrome-based archiving methods with `USE_CHROME=False`.

---

## Option A. Docker / Docker Compose Setup ⭐️

_Docker Compose is the recommended way to get ArchiveBox, as it includes all the extras out-of-the-box and provides the best security and upgrade UX._

1. If you don't already have docker installed, follow the official instructions to get Docker on Linux, macOS, or Windows:  
   https://docs.docker.com/install/#supported-platforms ➡️

2. Then follow the [Quickstart](Quickstart.md) guide and read the [Docker](Docker.md) wiki page for next steps. ➡️

> You can also run Dockerized ArchiveBox using [UNRAID/TrueNAS/Proxmox/etc.](https://github.com/ArchiveBox/ArchiveBox#-other-options) or [Kubernetes](https://github.com/ArchiveBox/docker-archivebox/blob/master/archivebox.yml).

**More info:**

- [`Dockerfile`](https://github.com/ArchiveBox/ArchiveBox/blob/dev/Dockerfile)
- [`docker-compose.yml`](https://github.com/ArchiveBox/ArchiveBox/blob/dev/docker-compose.yml)
- [`archivebox-kubernetes.yml`](https://github.com/ArchiveBox/docker-archivebox/blob/master/archivebox.yml)
- [ArchiveBox Docker Quickstart](https://github.com/ArchiveBox/ArchiveBox#quickstart) + [Usage](Docker.md) + [Configuration](Docker.md#configuration) + [Upgrading](Upgrading-or-Merging-Archives.md) documentation

---

## Option B. Automatic Setup Script

If you're on Linux with `apt`, FreeBSD with `pkg`, or macOS with `brew` there is an optional auto-setup script provided.

_(or scroll further down for manual install instructions)_

```bash
curl -fsSL 'https://get.archivebox.io' | bash
# shortcut to run https://raw.githubusercontent.com/ArchiveBox/ArchiveBox/stable/bin/setup.sh
```

The script explains what it installs beforehand, and will prompt for user confirmation before making any changes to your system. The script uses Docker if already installed, but you can decline and it will attempt to auto-install everything using `apt`/`brew`/`pkg` + `pip` instead.

After running the setup script, continue with the [Quickstart](Quickstart.md) guide... ➡️

---

## Option C. Bare Metal Setup

If you'd rather not use [Docker](Docker.md) or our [auto-install script](#option-b-automatic-setup-script), you can follow these manual setup instructions to install ArchiveBox and its dependencies using `pip` & your system package manager of choice (e.g. `apt`, `brew`, `pkg`, `nix`, etc.).

See our [Dependencies](https://github.com/ArchiveBox/ArchiveBox#dependencies) documentation to see the full list of dependencies and how they're used. Not all the dependencies are required for all modes.

### 1. Install base system dependencies needed for your OS

#### macOS

Make sure you have [Homebrew](https://brew.sh/) installed first.

```bash
# Install ArchiveBox's dependencies manually (instead of using the all-in-one brew package)
brew install python3 node git wget curl ffmpeg yt-dlp ripgrep sonic
pip install archivebox
archivebox install
```

#### Ubuntu/Debian-based Systems

Make sure `apt` and `dpkg` are available on your system.

```bash
# add the nodejs sources to your apt lists (optional, otherwise may use older node)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install base system dependencies manually (check ArchiveBox/Dockerfile for more if needed)
sudo apt install python3 python3-pip python3-minimal nodejs libatomic1 zlib1g-dev libssl-dev \
    libldap2-dev libsasl2-dev python3-ldap python3-msgpack python3-mutagen python3-regex \
    python3-pycryptodome procps dnsutils wget curl git yt-dlp ffmpeg ripgrep
sudo apt install python3-setuptools  # or: python3-distutils on older systems
```

#### FreeBSD

```bash
sudo pkg install python git wget curl youtube_dl ripgrep py311-pip py311-sqlite3 npm ffmpeg
sudo pkg install chromium
```

#### OpenBSD

```bash
sudo pkg_add python3 node wget git curl yt-dlp ffmpeg ripgrep chromium
```

#### Arch Linux / Nix / Guix / etc.

See the [Quickstart](https://github.com/ArchiveBox/ArchiveBox#-package-manager-setup) instructions for other operating systems and release channels. ➡️

### 2. Install the Python dependencies using `pip`

```bash
# get the latest version of archivebox from PyPI
pip install --upgrade --ignore-installed archivebox[ldap,sonic]
```

### 3. Install the JS dependencies using `archivebox setup`

```bash
# create a new empty folder anywhere to hold your collection, and cd into it
mkdir -p ~/archivebox/data && cd ~/archivebox/data

# instantiate the directory as an archivebox collection dir
archivebox init

# auto-install all the runtime JS dependencies inside ./node_modules
archivebox setup

# ✅ see a final detailed breakdown of all the installed dependencies and commands available
archivebox version
archivebox help
```

### Troubleshooting

Make sure the `pip`-installed version of `archivebox` is available in your `$PATH`.

```bash
pip show archivebox      # show info about the pip-installed version of archivebox

echo $PATH               # show the directories your system is searching for binaries
which -a archivebox      # show all installed archivebox binaries available
which archivebox         # show which archivebox binary is being called

cd ~/archivebox/data
archivebox version       # ⭐️ show lots of useful info about installed dependencies and more
archivebox status
archivebox help
```

Make sure to run `archivebox` **as an unprivileged user** (i.e. without `sudo` / not logged in as `root`).  
Make sure to run all commands, including `archivebox version`, `archivebox help`, etc. **inside a data directory** (or a new empty dir that will become a data dir).

If you have issues getting Chromium / Google Chrome or other dependencies working with ArchiveBox, see the [Chromium Install](Chromium-Install.md) and [Troubleshooting](Troubleshooting.md) pages for more detailed instructions.

### Next Steps

For guides on how to import URLs from different sources into ArchiveBox, check out [Input Formats](https://github.com/ArchiveBox/ArchiveBox#input-formats) and [Preparing URLs](Quickstart.md#2-get-your-list-of-urls-to-archive). ➡️

```bash
cd ~/archivebox/data

# feed in your URLs to start archiving!
archivebox add --help
archivebox add < ~/Downloads/bookmarks_export.html

# inspect the newly added Snapshots via the CLI
archivebox list
archivebox status

# OR start the webserver and view them in the Web UI
archivebox server 0.0.0.0:8000
open http://localhost:8000
```

### Upgrading ArchiveBox to a new version

Make sure all apt/brew/pkg/etc. dependencies from above are installed & up-to-date first.

```bash
# get the latest archivebox version from PyPI
pip install --upgrade --ignore-installed archivebox

# run init inside any data directories to migrate the index to the latest version
cd ~/archivebox/data
archivebox setup         # update runtime dependencies to latest versions
archivebox init          # update collection index & apply any migrations 
```

Check our more detailed [Upgrading](Upgrading-or-Merging-Archives.md) documentation and [Release Notes](https://github.com/ArchiveBox/ArchiveBox/releases) if you run into any problems. ➡️

---

### Further Reading

- Read [Usage](Usage.md) to learn how to use the ArchiveBox CLI and HTML output
- Read [Configuration](Configuration.md) to learn about the various archive method options
- Read [Scheduled Archiving](Scheduled-Archiving.md) to learn how to set up automatic daily archiving
- Read [Publishing Your Archive](Publishing-Your-Archive.md) if you want to host your archive for others to access online
- Read [Troubleshooting](Troubleshooting.md) if you encounter any problems
