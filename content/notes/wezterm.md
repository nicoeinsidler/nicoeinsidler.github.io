---
title: "WezTerm"
date: 2022-01-23T15:14:57+01:00
draft: false
---

I found a new terminal: [WezTerm](https://wezfurlong.org/wezterm/). Not as fast as Alacritty it's still GPU accelerated and has some great features.

![WezTerm on Fedora with GNOME looks great. This picture shows both the dark and light Adwaita theme.](/img/wezterm/wezterm.png)

WezTerm combines two important aspects: Alacritties speed and iTerms/GNOME Terminals tabs. It sure isn't as fast as Alacritty, but in my daily usage, I hardly notice any differences.

Noteworthy features:

- GPU accelerated
- tabs
- good font support (it supports ligatures as well)
- easy theming
- simple configuration (via a `wezterm.lua` file in `$HOME/.config/wezterm` or just in `$HOME`.)

![Font ligatures specifically designed for code, make it easier for the programmer to work. WezTerm has fantastic support for ligatures and renders fonts beautifully.](/img/wezterm/ligatures.png)

WezTerm offers great defaults and I never ran into any issue that I might have needed to address in the config on Fedora. However using it on my work laptop on macOS, there were some things – like proper working keyboard shortcuts or copy/paste – that needed attention in the settings. Since about two releases, those few issues on macOS vanished as well leaving me here with no configuration to show off.
