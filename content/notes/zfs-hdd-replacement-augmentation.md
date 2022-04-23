---
title: "ZFS Disk Replacement & Pool Augmentation"
date: 2022-04-23T13:26:34+02:00
draft: true
---

My home server where I mainly store all my pictures and some [Vienna Sessions]({{< ref "/projects/vienna-sessions.md" >}} "Vienna Sessions") backups uses the [Zettabyte File System](https://en.wikipedia.org/wiki/ZFS) (ZFS). A few weeks back one of my weekly scrubs revealed a failing hard drive in one of the three mirror pools I have created.

As I recently upgraded from my beloved Canon 60D to a Fujifilm X-E3, file sizes will dramatically increase. So why not upgrade the disks while replacing them anyways. The steps to do this for a ZFS mirror pool are failry simple, first you replace the faulty disk, resilver the pool and then repeating this procedure with the second disk, here is a condensed protocol (**TL;DR**):

1. Get serial number of faulty disk.
2. Physically replace the faulty drive.
3. Start the resilvering process by using the command `sudo zpool replace -f POOLNAME 18311740819329882151 /dev/disk/by-id/ata-WDC_WD80EFAX-68LHPN0_7HJSWL7F`.
4. Wait untill resilvering process is finished.
5. Repeat disk replacement process for second drive as well.
6. Set `zpool autoexpand=on` and `sudo zpool online -e ...` to start another resilvering process and make the space on the disk available to the pool.

## Disk Replacement

Apparently my pool named "tresor1" is degraded and needs a disk replacement:

```bash
[nico@vsserver ~]$ zpool status tresor1
  pool: tresor1
 state: DEGRADED
status: One or more devices are faulted in response to persistent errors.
        Sufficient replicas exist for the pool to continue functioning in a
        degraded state.
action: Replace the faulted device, or use 'zpool clear' to mark the device
        repaired.
  scan: scrub repaired 0B in 07:20:05 with 0 errors on Mon Apr 18 07:20:39 2022
config:

        NAME                                          STATE     READ WRITE CKSUM
        tresor1                                       DEGRADED     0     0     0
          mirror-0                                    DEGRADED     0     0     0
            ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104  FAULTED     13     0     5  too many errors
            ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226  ONLINE       0     0     0
```

The disk in question is named `ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104`. Looking at the list of block devices present, we see that its name is `sdf` and its serial number is **`ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104`**.

```bash
[nico@vsserver ~]$ lsblk -I 8 -d -o NAME,SIZE,SERIAL
NAME  SIZE SERIAL
sda   3,6T WD-WCC7K6AKJKS1
sdb   3,6T WD-WCC7K1ZKZTPU
sdc   5,5T ZR10EEM3
sdd   5,5T ZR10EEJR
sde   2,7T WD-WMC4N2558226
sdf   2,7T WD-WMC4N1768104
```

Capturing all the devices present right now in order to be able to diff them later in the process:

```bash
[nico@vsserver ~]$ ls -1 /dev/disk/by-id/ | grep ata
ata-ST6000VN001-2BB186_ZR10EEJR
ata-ST6000VN001-2BB186_ZR10EEJR-part1
ata-ST6000VN001-2BB186_ZR10EEJR-part9
ata-ST6000VN001-2BB186_ZR10EEM3
ata-ST6000VN001-2BB186_ZR10EEM3-part1
ata-ST6000VN001-2BB186_ZR10EEM3-part9
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104-part1
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104-part9
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226-part1
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226-part9
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K1ZKZTPU
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K1ZKZTPU-part1
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K1ZKZTPU-part9
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K6AKJKS1
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K6AKJKS1-part1
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K6AKJKS1-part9
```

Autoexpand is off right now for every pool, which is the default behaviour. We will need to set this on later in the process.

```bash
[nico@vsserver ~]$ zpool get autoexpand
NAME     PROPERTY    VALUE   SOURCE
tresor1  autoexpand  off     default
tresor2  autoexpand  off     default
vspoolb  autoexpand  off     default
```

After physically replacing the old disk with the new one, you will be presented with something like this:

```bash
[nico@vsserver ~]$ zpool status tresor1
  pool: tresor1
 state: DEGRADED
status: One or more devices could not be used because the label is missing or
        invalid.  Sufficient replicas exist for the pool to continue
        functioning in a degraded state.
action: Replace the device using 'zpool replace'.
   see: https://openzfs.github.io/openzfs-docs/msg/ZFS-8000-4J
  scan: scrub repaired 0B in 07:20:05 with 0 errors on Mon Apr 18 07:20:39 2022
config:

        NAME                                          STATE     READ WRITE CKSUM
        tresor1                                       DEGRADED     0     0     0
          mirror-0                                    DEGRADED     0     0     0
            6544112441320430488                       UNAVAIL      0     0     0  was /dev/disk/by-id/ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104-part1
            ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226  ONLINE       0     0     0

errors: No known data errors
```

Now you may use `lsblk` and `grep` to list all devices again, write this to a text file and compare the two using `diff`:

```bash
[nico@vsserver ~]$ ls -1 /dev/disk/by-id/ | grep ata
ata-ST6000VN001-2BB186_ZR10EEJR
ata-ST6000VN001-2BB186_ZR10EEJR-part1
ata-ST6000VN001-2BB186_ZR10EEJR-part9
ata-ST6000VN001-2BB186_ZR10EEM3
ata-ST6000VN001-2BB186_ZR10EEM3-part1
ata-ST6000VN001-2BB186_ZR10EEM3-part9
ata-ST6000VX001-2BD186_ZR12E9YV
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226-part1
ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226-part9
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K1ZKZTPU
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K1ZKZTPU-part1
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K1ZKZTPU-part9
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K6AKJKS1
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K6AKJKS1-part1
ata-WDC_WD40EFRX-68N32N0_WD-WCC7K6AKJKS1-part9
[nico@vsserver ~]$ diff hdd-replace-before.txt hdd-replace-after.txt
7,9c7
< ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104
< ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104-part1
< ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104-part9
---
> ata-ST6000VX001-2BD186_ZR12E9YV
```

=> So the new one must be: `ata-ST6000VX001-2BD186_ZR12E9YV`. We can now use this info to start the resilvering process:

```bash
[nico@vsserver ~]$ sudo zpool replace -f tresor1 6544112441320430488 /dev/disk/by-id/ata-ST6000VX001-2BD186_ZR12E9YV
[sudo] Passwort für nico:
[nico@vsserver ~]$ zpool status tresor1
  pool: tresor1
 state: DEGRADED
status: One or more devices is currently being resilvered.  The pool will
        continue to function, possibly in a degraded state.
action: Wait for the resilver to complete.
  scan: resilver in progress since Tue Apr 19 00:58:45 2022
        2.67G scanned at 249M/s, 324K issued at 29.5K/s, 2.51T total
        0B resilvered, 0.00% done, no estimated completion time
config:

        NAME                                          STATE     READ WRITE CKSUM
        tresor1                                       DEGRADED     0     0     0
          mirror-0                                    DEGRADED     0     0     0
            replacing-0                               DEGRADED     0     0     0
              6544112441320430488                     UNAVAIL      0     0     0  was /dev/disk/by-id/ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N1768104-part1
              ata-ST6000VX001-2BD186_ZR12E9YV         ONLINE       0     0     0
            ata-WDC_WD30EFRX-68EUZN0_WD-WMC4N2558226  ONLINE       0     0     0

errors: No known data errors
```

After this process is completed, you should have a fully functioning pool again. In my case the whole process took about 8 hours.

## Disk Expansion

So now that we replaced the faulty disk with a larger one, we want to take advantage of the extra space left on it. As I am using a mirror pool, the second old disk has to be replaced with a larger one as well. After this has been done, we can set the autoexpand option to true and trigger a resilvering process to make use of the extra disk space.

After setting the auto expansion property via running `sudo zpool set autoexpand=on tresor1`, we see that there is space to expand to (`EXPANDSZ`):

```bash
[nico@vsserver ~]$ zpool list
NAME      SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP    HEALTH  ALTROOT
tresor1  2.72T  2.51T   212G        -     2.72T     0%    92%  1.00x    ONLINE  -
tresor2  3.62T  3.12T   521G        -         -     0%    85%  1.00x    ONLINE  -
vspoolb  5.45T  2.11T  3.35T        -         -     0%    38%  1.00x    ONLINE  -
```

In order to make use of the free (real estate) space, we can use `sudo zpool online -e tresor1 ata-ST6000VX001-2BD186_ZR12E9YV` and `sudo zpool online -e tresor1 ata-ST6000VX001-2BD186_ZR10ETZX` to finally trigger the expansion. After having done that we should now see more disk space available to us in the pool:

```bash
[nico@vsserver ~]$ zpool list
NAME      SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP    HEALTH  ALTROOT
tresor1  5.45T  2.51T  2.94T        -         -     0%    46%  1.00x    ONLINE  -
tresor2  3.62T  3.12T   521G        -         -     0%    85%  1.00x    ONLINE  -
vspoolb  5.45T  2.11T  3.35T        -         -     0%    38%  1.00x    ONLINE  -
```

## Usefull Commands

- `lsblk -I 8 -d -o NAME,SIZE,SERIAL`
- `zpool status`
- `ls -1 /dev/disk/by-id/ | grep ata`
- `sudo zpool replace -f storage 18311740819329882151 /dev/disk/by-id/ata-WDC_WD80EFAX-68LHPN0_7HJSWL7F` (command must be customized of course)
- `zpool set autoexpand=on POOLNAME`

## Usefull Articles

Of course I am not the first one to do this and write about it, so here is a list of articles I found very helpful:

- [ZFS Mirror Disk Replacement Process](https://jordanelver.co.uk/blog/2018/11/26/how-to-replace-a-failed-disk-in-a-zfs-mirror/) 2018
- [Replacing Disk with larger Disk](https://forums.freebsd.org/threads/replacing-devices-with-larger-capacity-in-mirrored-pool.55907/) 2016
- [Increasing Capacity of ZFS Mirror Pool by adding larger Disks](https://www.dan.me.uk/blog/2012/11/14/increase-capacity-of-freebsd-zfs-array-by-replacing-disks/) (2012)
