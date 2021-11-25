# DNF Config

The DNF package manager posses a config file under `/etc/dnf/dnf.config`. A few interesting options are available and not set per default.

```toml
# force the usage of fastest mirror available
fastestmirror=True

# enable parallel downloads to speed up downloads
max_parallel_downloads=10

# enable colored output
color="always"
```