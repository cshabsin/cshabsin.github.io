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