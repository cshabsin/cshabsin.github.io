---
layout: post
title: Jekyll Docker Setup
---

This document outlines the process for setting up a local development environment for this Jekyll site using Docker. This approach encapsulates the Ruby dependency within a container, avoiding a system-wide installation.

## Goal

To run the Jekyll site locally for testing and development without installing Ruby and its dependencies directly on the host machine.

## Solution

We use Docker to create a containerized environment for the Jekyll site. A `Dockerfile` defines the environment, and a `docker-compose.yml` file makes it easy to manage the development server.

### 1. Dockerfile

This file instructs Docker on how to build the image. It starts with a Ruby base image, installs necessary packages, installs the gems specified in the `Gemfile`, and then sets the command to run the Jekyll server.

```dockerfile
# Use the official Ruby image.
FROM ruby:3.1-slim

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
RUN apt-get update && apt-get install -y build-essential

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy the rest of the application
COPY . .

# Expose the port Jekyll runs on
EXPOSE 4000

# Serve the site
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
```

### 2. Docker Compose

The `docker-compose.yml` file simplifies the process of running the container. It specifies the port mapping and mounts the current directory as a volume, which allows Jekyll's live-reloading feature to work.

```yaml
services:
  jekyll:
    build: .
    ports:
      - "4000:4000"
    volumes:
      - .:/usr/src/app
```

### 3. .dockerignore

A `.dockerignore` file was also added to prevent files like `.git`, the `_site` build directory, and the Docker files themselves from being unnecessarily copied into the build context, keeping the image smaller and build times faster.

## Usage

With Docker and Docker Compose installed, the local server can be started with a single command from the project root:

```bash
docker-compose up
```

The site will be available at `http://localhost:4000`.
