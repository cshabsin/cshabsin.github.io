---
layout: default
title: Cricket PC Setup
---

# Cricket PC Setup

This document tracks the setup of my new AI development machine, "cricket".

## Software Installed

### ComfyUI

*   Installed `python3`, `python3-pip`, and `python3-venv`.
*   Cloned the ComfyUI repository to `/home/cshabsin/proj/ComfyUI`.
*   Copied over the `cvdl` alias from the old Windows PC to download models from Civitai with an API key automatically.
*   Downloaded models into various `ComfyUI/models` subdirectories.
*   Experimented with workflows to generate images.

### Gemini CLI

*   Installed `nvm` (Node Version Manager) using the `curl | bash` method in WSL.
*   Used `nvm` to install the Gemini CLI.

### Development Environment

*   Installed Visual Studio Code for Windows.
*   Installed the "Remote - WSL" extension to connect VS Code to the WSL environment.

#### Node.js Version Management

There is a known conflict between the Node.js version used for the Gemini CLI and the version required for the `conjunew` project.

*   **Gemini CLI:** Installed and runs under Node.js v24 (`nvm use 24`).
*   **`conjunew` project:** Requires Node.js v22 due to Firebase Functions compatibility (`nvm use 22`).

Use `nvm` to switch between these versions when working on the respective projects.

### Networking

*   Installed Tailscale on the new PC (cricket), the old PC, a laptop, and a DigitalOcean droplet.
*   Registered all machines with Tailscale.

## To-Do

*   Debug flaky Tailscale connection, particularly for SSH and the ComfyUI web port. Investigate why "MagicDNS" seems to be unreliable.
*   Copy over `GEMINI.md` files from other systems and synthesize the ideas.
*   Set up the `ssh-agent` for improved SSH key management.