---
title: "Podman All the Things"
date: 2021-12-05T01:33:10+01:00
draft: true
---

A few days ago while browsing [lobste.rs](https://lobste.rs/) I stumbled upon the article ["Dock Life: Using Docker for All The Things!"](https://nystudio107.com/blog/dock-life-using-docker-for-all-the-things) written by Andrew Welch. It had then gotten onto the upper half of the first page on lobste.rs and a few days ago even Chris Coyer from [CSS-Tricks.com wrote about it](https://css-tricks.com/dock-life-using-docker-for-all-the-things/).

Just coming from NixOS and Fedora Silverblue, I was immediately hooked. This is actually an amazing idea!

## Basic Idea

The basic idea behind Andrew Welch's article is simple: If you ever need to run a certain program, grab a container that already includes the desired program and remap the program name on your system to a `docker run` command.

So for example you want to use `ffmpeg`. You could then create an alias to automatically run it inside a container like so:

```bash
alias ffmpeg='docker run --rm -it -v `pwd`:/app jrottenberg/ffmpeg '
```

Of course I immediately tried aliasing some of the tools I work with on a daily basis as well:

```bash
alias python='docker run --rm -it -v `pwd`:/app python3 '
```

But there are two problems:

- containers are not persistent, so I cannot install anything that will last
- the trick uses docker and I am more of a podman fan

## Using Podman

So the journey continued and I started to create podman alternatives. This is fairly simple, because it already states on its homepage, that podman can be used pretty much as a drop-in replacement for docker, e.g. `alias docker=podman`. Here's an example with sqlite3:

```bash
[nicoeinsidler@fedora]$ podman run --rm -it -v 'pwd':/app nouchka/sqlite3
SQLite version 3.34.1 2021-01-20 14:10:07
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.
sqlite>
```

There are many advantages of podman over docker. But one that will be immediately visible when trying to pull an image for the first time is that it can do this from various sources. If you first try to run `podman run --rm -it -v 'pwd':/app nouchka/sqlite3` it will ask you where to get the image from. This will look like the following:

```bash
[nicoeinsidler@fedora]$ podman run --rm -it -v 'pwd':/app nouchka/sqlite3
? Please select an image:
  ▸ registry.fedoraproject.org/nouchka/sqlite3:latest
    registry.access.redhat.com/nouchka/sqlite3:latest
    docker.io/nouchka/sqlite3:latest
    quay.io/nouchka/sqlite3:latest
```


## Installing Shit

Moving on to the second before mentioned problem: Containers are created using an image and can not be altered. Once you kill the container, it's gone. After all this is what makes containers so convenient in the first place.

Therefore you always have to find exactly the right image to create a container from. Say you are working on a Jupyter Notebook within Jupyter Lab on a Qiskit project requiring several other Python packages to be installed. You won't probably find the exact matching image for that.

You now have basically two options:

- cram all installation and execution instructions into one line (very ugly and not handy)
- create your own image (using `Dockerfile`)

First option is just insane. The second option can be a good option for programs that are not yet packed into a container and made available through a public container registry. This is a great idea for containerizing – let's say – [`bat`](https://github.com/sharkdp/bat), but if you finding yourself installing dependencies, well, then it you don't need an alias and just store the `Dockerfile` in the project itself.

## Toolbox

Once I was already creating all kinds of different aliases to `podman run` commands, I was already borderline close to `toolbox`. [Toolbox](https://containertoolbx.org/) let's you create different containerized environments for all kinds of projects.

Let's say you want to write a program and run it on a Quantum Computer with Qiskit. You may create a toolbox by running `toolbox create qiskit`. The environment can now be entered via `toolboox enter qiskit`. This will take you in a container spun up in the background with podman.

```bash
[nicoeinsidler@fedora]$ toolbox create qiskit
Creating container qiskit: | Created container: qiskit
Enter with: toolbox enter qiskit

[nicoeinsidler@fedora docker-all-the-things]$ toolbox enter qiskit

⬢[nicoeinsidler@toolbox]$
```

Now you can install programs and set up your work environment without impacting the main underlying system. On Fedora the container is created from the fedora-toolbox image which has `dnf` installed.

Let us install Jupyter Lab by typing `python -m pip install  jupyterlab`. (Pip is not in the PATH, therefore I am using it in this way, but for this matter `pip = python -m pip`.)

Once the installation is done, we can use Jupyter Lab as if it where installed on our base operating system. And when you're finished working on your project, just type `exit` to exit the toolbox.

With `toolbox list` all toolbox containers can be viewed. Be aware, that even if you exit out of a toolbox (container) it won't stop running. You can pause the toolbox with `toolbox pause`. For more information, check out the man pages.

```bash
[nicoeinsidler@fedora]$ toolbox list
IMAGE ID      IMAGE NAME                                    CREATED
ab8bc106d4a7  registry.fedoraproject.org/fedora-toolbox:35  4 weeks ago
```

## Conclusio

The idea of using containerized programs, or even containerized sets of programs, or even containerized sets of programs with a custom configuration is an interesting idea. But as always, the right tools should be used for the right problems. Using Docker and aliases for single programs like `ffmpeg` or `gcc` is a great idea, but once you begin creating your own images, please consider those alternatives: 

- `nix-env`: tool to create environments in which programs can be installed, so the same program in different versions can co-exist
- `toolbox`: create persistent containers for installing specific tools (editors, SDKs, compilers, ...)
- `Dockerfile`: when you find yourself defining your own image, because no base Docker image fits, consider going the "traditional" approach: each project with its own Dockerfile

