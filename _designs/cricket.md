---
layout: default
title: Cricket PC Setup
---

# Cricket PC Setup

This document tracks the setup of my new AI development machine, "cricket".

## Software Installed

### ComfyUI

- Installed `python3`, `python3-pip`, and `python3-venv`.
- Cloned the ComfyUI repository to `/home/cshabsin/proj/ComfyUI`.
- Copied over the `cvdl` alias from the old Windows PC to download models from Civitai with an API key automatically.
- Downloaded models into various `ComfyUI/models` subdirectories.
- Experimented with workflows to generate images.

To run:

```
$ . proj/venv/bin/activate
$ cd proj/ComfyUI
$ python main.py --listen
```

### Gemini CLI

- Installed `nvm` (Node Version Manager) using the `curl | bash` method in WSL.
- Used `nvm` to install the Gemini CLI.

### KoboldCpp and SillyTavern

Installed `koboldcpp` and `SillyTavern`. `koboldcpp` is a downloaded binary in `proj/koboldcpp`, and `SillyTavern` is a git clone in `proj/SillyTavern`.

To run:

1. Run `koboldcpp` from its directory and pick a `.gguf` file to load.
2. Run SillyTavern by running `./start.sh --listen` in the `SillyTavern` directory.
3. In the SillyTavern website, go to **Connections**, pick API "Text Completion" and API Type "KoboldCpp", with the URL "http://localhost:5001", then click **Connect**.

The firewall is set up to allow port 8000 through to Tailscale, and it can be accessed with `http://cricket.dog-garibaldi.ts.net:8000` from within the Tailscale private network.

### Development Environment

- Installed Visual Studio Code for Windows.
- Installed the "Remote - WSL" extension to connect VS Code to the WSL environment.

#### Node.js Version Management

There is a known conflict between the Node.js version used for the Gemini CLI and the version required for the `conjunew` project.

- **Gemini CLI:** Installed and runs under Node.js v24 (`nvm use 24`).
- **`conjunew` project:** Requires Node.js v22 due to Firebase Functions compatibility (`nvm use 22`).

Use `nvm` to switch between these versions when working on the respective projects.

### Networking

- Installed Tailscale on the new PC (cricket), the old PC, a laptop, and a DigitalOcean droplet.
- Registered all machines with Tailscale.

## To-Do

- Debug flaky Tailscale connection, particularly for SSH and the ComfyUI web port. Investigate why "MagicDNS" seems to be unreliable.
- Copy over `GEMINI.md` files from other systems and synthesize the ideas.
- Set up the `ssh-agent` for improved SSH key management.
