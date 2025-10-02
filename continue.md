This is a summary of our session to be continued later.

**Goal:** Add a 'designs' collection to the Jekyll site and serve it locally for testing.

**Progress:**
1.  A 'designs' collection was created in `_config.yml`.
2.  A `_designs` directory was created with a sample `example-design.md` file.
3.  A `_layouts/design.html` layout was created.
4.  A `designs.markdown` page was created to list all design documents.
5.  A link to the new designs page was added to `index.markdown`.
6.  We decided to use Docker to serve the site locally to avoid installing Ruby directly.

**Next Steps:**
1.  You are currently installing Docker Desktop and rebooting.
2.  When you return, I will create a `Dockerfile` and `docker-compose.yml` in the project root.
3.  These files will allow you to run `docker-compose up` to build the Docker image and serve the site at `http://localhost:4000`.

**Note:** The changes made to the site for the 'designs' collection have not yet been committed to git.