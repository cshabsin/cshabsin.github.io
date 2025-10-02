---
layout: post
title: Design for Auto-Syncing External Documents
---

This document outlines a method for automatically including documents from external repositories into this Jekyll site, ensuring they remain up-to-date without manual intervention.

## 1. Goal

The primary goal is to display content from other repositories (e.g., the design document from `github.com/cshabsin/conjunew`) as a design document on this site. This must be done automatically, eliminating the need to manually copy and paste the file, which is error-prone and leads to stale content.

## 2. Recommended Solution: Cross-Repository GitHub Action

The chosen solution is to create a GitHub Action workflow in the _source_ repository (e.g., `conjunew`) that triggers on a push, and pushes the updated file to this, the _target_, repository (`cshabsin.github.io`).

This provides real-time, push-based updates and is the most robust and modern approach.

### 2.1. Permission Model: Deploy Key

A workflow in one repository cannot push to another by default. The most secure way to grant this permission is with a **Deploy Key** scoped to the target repository.

### 2.2. Setup Steps

1.  **Generate SSH Key:** Create a dedicated SSH key pair for the action (`ssh-keygen -t ed25519 -f ./gh-action-key`).
2.  **Add Public Key to Target Repo:** Add the public key (`gh-action-key.pub`) as a "Deploy Key" in the `cshabsin.github.io` repository settings, ensuring **"Allow write access"** is enabled.
3.  **Add Private Key to Source Repo:** Add the private key (`gh-action-key`) as an Actions secret named `DEPLOY_KEY_FOR_GITHUB_IO` in the `cshabsin/conjunew` repository settings.

### 2.3. Workflow File

Finally, create a workflow file in the source repository (e.g., `conjunew/.github/workflows/sync.yml`) to execute the process.

```yaml
name: Sync Design Doc to github.io

on:
  push:
    branches:
      - main
    paths:
      - "notes/design_doc.md" # Triggers only when this file changes

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Check out source repo
        uses: actions/checkout@v3

      - name: Check out target repo (github.io)
        uses: actions/checkout@v3
        with:
          repository: cshabsin/cshabsin.github.io
          ssh-key: ${{ secrets.DEPLOY_KEY_FOR_GITHUB_IO }}
          path: cshabsin.github.io

      - name: Copy the file
        run: |
          mkdir -p cshabsin.github.io/_designs
          cp notes/design_doc.md cshabsin.github.io/_designs/conjunew.md

      - name: Commit and push changes
        run: |
          cd cshabsin.github.io
          git config --global user.name 'GitHub Action'
          git config --global user.email 'action@github.com'
          git add _designs/conjunew.md
          if ! git diff --staged --quiet; then
            git commit -m "docs: Sync design doc from cshabsin/conjunew"
            git push
          else
            echo "No changes to sync."
          fi
```

## 3. Alternatives Considered

Several other options were discussed and rejected in favor of the cross-repository action.

### 3.1. Scheduled Sync Action

A GitHub Action in the `cshabsin.github.io` repository could run on a schedule (e.g., daily) to pull the file from the source.

- **Reason for Rejection:** This is not real-time. Content updates would be delayed until the next scheduled run.

### 3.2. Git Submodules

The source repository could be included as a Git Submodule in this repository.

- **Reason for Rejection:** This is overly complex for a single file, as it includes the entire source repository. It also requires manual steps to keep the submodule updated and may not be seamlessly supported by the default GitHub Pages build process.

### 3.3. Client-Side Fetching

The page could use JavaScript to fetch the Markdown content from the source repository's raw URL and render it in the browser.

- **Reason for Rejection:** This method is poor for Search Engine Optimization (SEO), can cause a flash of un-rendered content, and relies on the end-user's browser to perform the work.
