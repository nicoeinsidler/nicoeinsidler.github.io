---
title: "DNF Config"
date: 2021-11-25T19:07:18+01:00
draft: false
---

The DNF package manager posses a config file under `/etc/dnf/dnf.config`. A few interesting options are available and not set per default.

```toml
# force the usage of fastest mirror available
fastestmirror=True

# enable parallel downloads to speed up downloads
max_parallel_downloads=10

# enable colored output
color="always"
```