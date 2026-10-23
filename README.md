# Luma Control Card

[![TikTok | Segui](assets/tiktok-segui.svg)](https://www.tiktok.com/@luigi.regolo)
[![License: GPL-3.0-only](https://img.shields.io/badge/license-GPL--3.0--only-blue?style=flat-square)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Repository-41BDF5?style=flat-square)](https://my.home-assistant.io/redirect/hacs_repository/?owner=luigi-regolo&repository=luma-control-card&category=plugin)
[![GitHub Stars](https://img.shields.io/github/stars/luigi-regolo/luma-control-card?style=flat-square)](https://github.com/luigi-regolo/luma-control-card/stargazers)

## Overview

**Luma Control Card** is a compact, Edera-inspired lighting control card for Home Assistant dashboards. It uses existing `light` and `switch` entities, with controls that depend on each device's reported capabilities.

## Features

- Responsive lighting grid with one or two items per row.
- On/off controls for `light.*` and `switch.*` entities.
- Brightness slider for compatible dimmable lights.
- RGB color selection and white color temperature controls when supported by the light.
- Optional link to an existing `automation.*` entity, with an enable/disable popup.
- Visual editor for selecting, reordering and removing devices, appearance and automation settings.
- Automatic, Edera Light and Graphite Dark visual styles; no Edera installation is required.
- No telemetry, paid API services or remote script dependencies.

An automation is not created or modified by this card. Enabling an automation does not run its actions immediately. Control permissions are enforced by Home Assistant.

## Installation

### HACS (custom repository)

Once the project files are published, open HACS, add `https://github.com/luigi-regolo/luma-control-card` under **Custom repositories**, selecting the **Dashboard** category, then download **Luma Control Card** and reload the dashboard. The repository must contain its distributable file at `dist/luma-control-card.js`.

### Manual installation

1. Download `dist/luma-control-card.js`.
2. Copy it to `<config>/www/luma-control-card.js` on your Home Assistant installation.
3. In **Settings → Dashboards → Resources**, add `/local/luma-control-card.js` as a **JavaScript module**.
4. Reload the dashboard and add **Luma Control Card** from the card picker.

If you have just created the `www` directory, a Home Assistant restart may be required before the file is served.

## Configuration and Usage

Use the visual card editor:

- **Dispositivi:** select `light` or `switch` entities, customize names and MDI icons, reorder or remove devices.
- **Aspetto:** customize the title, header, theme and grid layout.
- **Automazioni:** optionally select one existing `automation` entity and show its popup link.
- **Avanzate:** enable or disable the card's device and automation commands.

The card uses actual entity states and capabilities. Unavailable devices cannot be controlled. Brightness and color controls appear only when supported.

## Compatibility / Requirements

- A Home Assistant dashboard with support for custom JavaScript cards.
- Compatible `light.*`, `switch.*` and optional `automation.*` entities.
- No external packages or cloud services required by the card.

The first release and a minimum supported Home Assistant version have not yet been established through real-device testing.

## Copyright & License

Copyright © 2026 luigi-regolo.

Original project created and maintained by luigi-regolo. Licensed under the GNU General Public License version 3 only (**GPL-3.0-only**). See [LICENSE](LICENSE) for the full terms.